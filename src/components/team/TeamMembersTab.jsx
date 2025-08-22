import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Grid3X3, 
  List,
  Download,
  Mail
} from 'lucide-react';
import TeamMemberCard from '../TeamMemberCard';
import EditMemberModal from '../modals/EditMemberModal';
import { supabase } from '../../supabaseClient';

const TeamMembersTab = ({ teamMembers, onAdd, onUpdate, onRemove, language }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [editingMember, setEditingMember] = useState(null);

  const t = language === 'ar' ? {
    searchPlaceholder: 'البحث في الاسم أو البريد الإلكتروني...',
    allRoles: 'جميع الأدوار',
    allStatuses: 'جميع الحالات',
    addMember: 'إضافة عضو جديد',
    exportCSV: 'تصدير CSV',
    noResults: 'لا توجد نتائج مطابقة',
    totalMembers: 'إجمالي الأعضاء',
    activeMembers: 'أعضاء نشطون',
    manager: 'مدير',
    lead: 'قائد فريق',
    editor: 'محرر',
    designer: 'مصمم',
    member: 'عضو فريق',
    active: 'نشط',
    inactive: 'غير نشط',
    view: 'عرض',
    edit: 'تعديل',
    delete: 'حذف'
  } : {
    searchPlaceholder: 'Search by name or email...',
    allRoles: 'All Roles',
    allStatuses: 'All Statuses',
    addMember: 'Add New Member',
    exportCSV: 'Export CSV',
    noResults: 'No matching results',
    totalMembers: 'Total Members',
    activeMembers: 'Active Members',
    manager: 'Manager',
    lead: 'Team Lead',
    editor: 'Editor',
    designer: 'Designer',
    member: 'Team Member',
    active: 'Active',
    inactive: 'Inactive',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete'
  };

  // فلترة الأعضاء
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = !searchQuery || 
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone?.includes(searchQuery);
      
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [teamMembers, searchQuery, roleFilter, statusFilter]);

  // إحصائيات سريعة
  const stats = useMemo(() => {
    const total = filteredMembers.length;
    const active = filteredMembers.filter(m => m.status === 'active').length;
    return { total, active };
  }, [filteredMembers]);

  // تصدير CSV
  const exportToCSV = () => {
    const headers = ['الاسم', 'الدور', 'الحالة', 'البريد الإلكتروني', 'الهاتف', 'تاريخ الانضمام'];
    const csvData = filteredMembers.map(member => [
      member.name || '',
      member.role || '',
      member.status || '',
      member.email || '',
      member.phone || '',
      member.joined || member.created_at || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'team_members.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // فتح مودال إضافة عضو جديد
  const openAddModal = () => {
    setEditingMember({
      id: null,
      name: '',
      role: 'member',
      status: 'active',
      email: '',
      phone: '',
      joined: new Date().toISOString().slice(0, 10),
      avatar: null,
      project_id: null // سيتم تحديده تلقائياً في handleAddMember
    });
  };

  // فتح مودال تعديل عضو
  const openEditModal = (member) => {
    setEditingMember({ ...member });
  };

  // حفظ العضو
  const handleSaveMember = async (memberData) => {
    try {
      if (editingMember.id) {
        await onUpdate(editingMember.id, memberData);
      } else {
        await onAdd(memberData);
      }
      setEditingMember(null);
    } catch (error) {
      console.error('Error saving member:', error);
      alert('حدث خطأ أثناء حفظ العضو');
    }
  };

  // حذف العضو
  const handleDeleteMember = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا العضو؟')) {
      try {
        await onRemove(id);
        setEditingMember(null);
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('حدث خطأ أثناء حذف العضو');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* شريط الأدوات */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* البحث والفلترة */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* البحث */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* فلتر الدور */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">{t.allRoles}</option>
              <option value="manager">{t.manager}</option>
              <option value="lead">{t.lead}</option>
              <option value="editor">{t.editor}</option>
              <option value="designer">{t.designer}</option>
              <option value="member">{t.member}</option>
            </select>

            {/* فلتر الحالة */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">{t.allStatuses}</option>
              <option value="active">{t.active}</option>
              <option value="inactive">{t.inactive}</option>
            </select>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-2">
            {/* تبديل العرض */}
            <div className="flex border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="عرض شبكي"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="عرض قائمة"
              >
                <List size={16} />
              </button>
            </div>

            {/* تصدير CSV */}
            <button
              onClick={exportToCSV}
              className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 inline-flex items-center gap-1 transition-colors"
            >
              <Download size={16} />
              {t.exportCSV}
            </button>

            {/* إضافة عضو جديد */}
            <button
              onClick={openAddModal}
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1 transition-colors"
            >
              <UserPlus size={16} />
              {t.addMember}
            </button>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <span>{t.totalMembers}: <span className="font-semibold text-gray-900">{stats.total}</span></span>
          <span>{t.activeMembers}: <span className="font-semibold text-emerald-600">{stats.active}</span></span>
        </div>
      </div>

      {/* عرض الأعضاء */}
      {filteredMembers.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onView={() => openEditModal(member)}
              onEdit={() => openEditModal(member)}
              onDelete={() => handleDeleteMember(member.id)}
              language={language}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noResults}</h3>
          <p className="text-gray-500">
            جرب تغيير معايير البحث أو الفلترة
          </p>
        </div>
      )}

      {/* مودال تعديل/إضافة العضو */}
      {editingMember && (
        <EditMemberModal
          value={editingMember}
          onChange={setEditingMember}
          onCancel={() => setEditingMember(null)}
          onSave={handleSaveMember}
          onDelete={() => editingMember.id && handleDeleteMember(editingMember.id)}
          candidates={[]}
          isProjectMember={false}
        />
      )}
    </div>
  );
};

export default TeamMembersTab;
