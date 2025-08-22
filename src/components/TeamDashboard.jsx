// src/components/TeamDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  BarChart3, 
  Settings,
  ArrowLeft,
  Globe
} from 'lucide-react';
import TeamOverviewTab from './team/TeamOverviewTab';
import TeamMembersTab from './team/TeamMembersTab';
import TeamRolesTab from './team/TeamRolesTab';
import { supabase } from '../supabaseClient';

const TeamDashboard = ({ onBack, language }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    roles: 0,
    projects: 0
  });

  // الترجمة
  const t = language === 'ar' ? {
    title: 'إدارة فريق العمل',
    back: 'العودة',
    overview: 'نظرة عامة',
    members: 'أعضاء الفريق',
    roles: 'الأدوار والصلاحيات',
    loading: 'جاري التحميل...'
  } : {
    title: 'Team Management',
    back: 'Back',
    overview: 'Overview',
    members: 'Team Members',
    roles: 'Roles & Permissions',
    loading: 'Loading...'
  };

  // تحميل بيانات الفريق
  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      // تحميل أعضاء الشركة من الجدول الجديد
      let { data: members, error } = await supabase
        .from('company_team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTeamMembers(members || []);

      // حساب الإحصائيات
      const activeMembers = members?.filter(m => m.status === 'active') || [];
      const uniqueRoles = new Set(members?.map(m => m.role) || []);
      const uniqueProjects = new Set(members?.map(m => m.project_id) || []);

      setStats({
        total: members?.length || 0,
        active: activeMembers.length,
        roles: uniqueRoles.size,
        projects: uniqueProjects.size
      });

    } catch (error) {
      console.error('Error loading team data:', error);
      // تعيين بيانات فارغة في حالة الخطأ
      setTeamMembers([]);
      setStats({
        total: 0,
        active: 0,
        roles: 0,
        projects: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // معالجات إدارة الأعضاء
  const handleAddMember = async (memberData) => {
    try {
      // الحصول على أول مشروع موجود إذا لم يتم تحديد project_id
      if (!memberData.project_id) {
        const { data: projects } = await supabase
          .from('projects')
          .select('id')
          .limit(1);
        
        if (projects && projects.length > 0) {
          memberData.project_id = projects[0].id;
        } else {
          // إنشاء مشروع تجريبي إذا لم توجد مشاريع
          const { data: newProject, error: projectError } = await supabase
            .from('projects')
            .insert([{
              name: 'مشروع تجريبي',
              description: 'مشروع تجريبي للفريق',
              status: 'active'
            }])
            .select('id')
            .single();
          
          if (projectError) throw projectError;
          memberData.project_id = newProject.id;
        }
      }

      // إدراج العضو في جدول أعضاء الشركة
      let { data, error } = await supabase
        .from('company_team_members')
        .insert([memberData])
        .select('*');

      if (error) throw error;

      setTeamMembers(prev => [data[0], ...prev]);
      loadTeamData(); // إعادة تحميل الإحصائيات
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  };

  const handleUpdateMember = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('company_team_members')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setTeamMembers(prev => 
        prev.map(member => 
          member.id === id ? { ...member, ...updates } : member
        )
      );
      loadTeamData(); // إعادة تحميل الإحصائيات
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  };

  const handleRemoveMember = async (id) => {
    try {
      const { error } = await supabase
        .from('company_team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTeamMembers(prev => prev.filter(member => member.id !== id));
      loadTeamData(); // إعادة تحميل الإحصائيات
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  const tabs = [
    { 
      id: 'overview', 
      label: t.overview, 
      icon: BarChart3,
      component: (
        <TeamOverviewTab 
          stats={stats} 
          teamMembers={teamMembers}
          language={language}
        />
      )
    },
    { 
      id: 'members', 
      label: t.members, 
      icon: Users,
      component: (
        <TeamMembersTab 
          teamMembers={teamMembers}
          onAdd={handleAddMember}
          onUpdate={handleUpdateMember}
          onRemove={handleRemoveMember}
          language={language}
        />
      )
    },
    { 
      id: 'roles', 
      label: t.roles, 
      icon: Shield,
      component: (
        <TeamRolesTab 
          teamMembers={teamMembers}
          language={language}
        />
      )
    }
  ];

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={t.back}
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          </div>
          
          {/* Language Toggle */}
          <button 
            onClick={() => {/* سيتم إضافة تبديل اللغة هنا */}}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default TeamDashboard;
