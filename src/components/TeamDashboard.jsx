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

      console.log('Loaded team members:', members);
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
      console.log('Adding member with data:', memberData);
      
      // تنظيف البيانات من المراجع الدائرية
      const cleanData = { ...memberData };
      
      // إزالة الكائنات التي تحتوي على مراجع دائرية
      delete cleanData.avatar;
      delete cleanData.avatar_file;
      
      // التأكد من وجود البيانات المطلوبة
      if (!cleanData.name || cleanData.name.trim() === '') {
        console.error('Missing name in data:', cleanData);
        throw new Error('اسم العضو مطلوب - يرجى إدخال اسم العضو');
      }
      
      // رفع الصورة إذا كانت موجودة
      let avatarUrl = null;
      if (memberData.avatar_file) {
        console.log('Uploading avatar file:', memberData.avatar_file.name);
        const fileExt = memberData.avatar_file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, memberData.avatar_file);

        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          throw uploadError;
        }
        // استخدام URL مباشر بدلاً من متغير البيئة
        avatarUrl = `https://zsshxpdgbnxfuszanaeo.supabase.co/storage/v1/object/public/avatars/${fileName}`;
        console.log('Avatar uploaded successfully:', avatarUrl);
      } else if (memberData.avatar_url && !memberData.avatar_url.startsWith('blob:')) {
        // إذا كان هناك avatar_url صحيح (ليس blob)، استخدمه
        avatarUrl = memberData.avatar_url;
        console.log('Using existing avatar URL:', avatarUrl);
      }

      // الحصول على أول مشروع موجود إذا لم يتم تحديد project_id
      if (!cleanData.project_id) {
        const { data: projects } = await supabase
          .from('projects')
          .select('id')
          .limit(1);
        
        if (projects && projects.length > 0) {
          cleanData.project_id = projects[0].id;
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
          cleanData.project_id = newProject.id;
        }
      }

      // إدراج العضو في جدول أعضاء الشركة
      const insertData = {
        name: cleanData.name,
        role: cleanData.role || 'member',
        status: cleanData.status || 'active',
        email: cleanData.email || null,
        phone: cleanData.phone || null,
        avatar_url: avatarUrl || null,
        joined: cleanData.joined || new Date().toISOString().slice(0, 10),
        project_id: cleanData.project_id || null
      };
      
      console.log('Inserting member data:', insertData);
      
      let { data, error } = await supabase
        .from('company_team_members')
        .insert([insertData])
        .select('*');

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Member added successfully:', data[0]);
      setTeamMembers(prev => [data[0], ...prev]);
      // لا نحتاج لإعادة تحميل البيانات لأننا أضفنا العضو مباشرة
      // loadTeamData(); // إعادة تحميل الإحصائيات
    } catch (error) {
      console.error('Error adding member:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
  };

  const handleUpdateMember = async (id, updates) => {
    try {
      console.log('Updating member with data:', updates);
      
      // تنظيف البيانات من المراجع الدائرية
      const cleanUpdates = { ...updates };
      
      // إزالة الكائنات التي تحتوي على مراجع دائرية
      delete cleanUpdates.avatar;
      // لا نحذف avatar_file لأننا نحتاجه لرفع الصورة
      
      // رفع الصورة إذا كانت موجودة
      let avatarUrl = null;
      console.log('Checking for avatar updates. avatar_file:', updates.avatar_file, 'avatar_url:', updates.avatar_url);
      
      if (updates.avatar_file) {
        console.log('Uploading new avatar file:', updates.avatar_file.name);
        const fileExt = updates.avatar_file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, updates.avatar_file);

        if (uploadError) throw uploadError;
        // استخدام URL مباشر بدلاً من متغير البيئة
        avatarUrl = `https://zsshxpdgbnxfuszanaeo.supabase.co/storage/v1/object/public/avatars/${fileName}`;
        console.log('Avatar updated successfully:', avatarUrl);
      } else if (updates.avatar_url && !updates.avatar_url.startsWith('blob:')) {
        // إذا كان هناك avatar_url صحيح (ليس blob)، استخدمه
        avatarUrl = updates.avatar_url;
        console.log('Using existing avatar URL for update:', avatarUrl);
      } else {
        console.log('No avatar file or valid URL found, keeping existing avatar');
      }
      
      // الآن نحذف avatar_file من cleanUpdates قبل الحفظ في قاعدة البيانات
      delete cleanUpdates.avatar_file;

      // إذا لم يتم تحديد avatarUrl جديد، لا نحدث avatar_url في قاعدة البيانات
      const updateData = { ...cleanUpdates };
      if (avatarUrl !== null) {
        updateData.avatar_url = avatarUrl;
      }

      console.log('Updating database with:', updateData);

      const { error } = await supabase
        .from('company_team_members')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setTeamMembers(prev => 
        prev.map(member => 
          member.id === id ? { 
            ...member, 
            ...cleanUpdates, 
            ...(avatarUrl !== null && { avatar_url: avatarUrl })
          } : member
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
