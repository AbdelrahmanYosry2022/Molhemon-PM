import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Pencil, Trash2, UserPlus, Copy } from 'lucide-react';
import EditMemberModal from './modals/EditMemberModal';

// Badges for project roles and statuses
export const PROJECT_ROLE_META = {
  project_manager: { label: "مدير المشروع", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  team_lead: { label: "قائد الفريق", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  designer: { label: "مصمم", cls: "bg-pink-50 text-pink-700 border-pink-200" },
  developer: { label: "مطور", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  editor: { label: "محرر", cls: "bg-red-50 text-red-700 border-red-200" },
  animator: { label: "رسام متحرك", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  video_editor: { label: "مونتير فيديو", cls: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  audio_engineer: { label: "مهندس صوت", cls: "bg-green-50 text-green-700 border-green-200" },
  copywriter: { label: "كاتب محتوى", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  researcher: { label: "باحث", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  tester: { label: "مختبر", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  member: { label: "عضو فريق", cls: "bg-gray-50 text-gray-700 border-gray-200" },
};

export const PROJECT_STATUS_META = {
  active: { label: "نشط", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  inactive: { label: "غير نشط", cls: "bg-red-50 text-red-700 border-red-200" },
  completed: { label: "مكتمل", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  on_leave: { label: "في إجازة", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  replaced: { label: "مستبدل", cls: "bg-gray-50 text-gray-700 border-gray-200" },
};

export function ProjectRoleBadge({ value }) {
  const m = PROJECT_ROLE_META[value] || PROJECT_ROLE_META.member;
  return <span className={`inline-flex items-center px-2 py-1 text-xs rounded-lg border ${m.cls}`}>{m.label}</span>;
}

export function ProjectStatusBadge({ value }) {
  const m = PROJECT_STATUS_META[value] || PROJECT_STATUS_META.active;
  return <span className={`inline-flex items-center px-2 py-1 text-xs rounded-lg border ${m.cls}`}>{m.label}</span>;
}

function ProjectTeamManager({ projectId, onUpdate }) {
  const [projectMembers, setProjectMembers] = useState([]);
  const [companyMembers, setCompanyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  // Load project team members
  const loadProjectTeam = async () => {
    try {
      setLoading(true);
      
      // Load project team members using the view
      const { data: members, error } = await supabase
        .from('project_team_view')
        .select('*')
        .eq('project_id', projectId)
        .order('joined_project_date', { ascending: false });

      if (error) throw error;
      setProjectMembers(members || []);

      // Load company members for dropdown
      const { data: companyMembersData, error: companyError } = await supabase
        .from('company_team_members')
        .select('*')
        .order('name');

      if (companyError) throw companyError;
      setCompanyMembers(companyMembersData || []);

    } catch (error) {
      console.error('Error loading project team:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProjectTeam();
    }
  }, [projectId]);

  // Add new project member
  const handleAddMember = async (memberData) => {
    try {
      const { data, error } = await supabase
        .from('project_team_members')
        .insert([{
          project_id: projectId,
          company_member_id: memberData._candidate_id,
          project_role: memberData.project_role || 'member',
          project_status: memberData.project_status || 'active',
          joined_project_date: memberData.joined_project_date || new Date().toISOString().slice(0, 10),
          project_notes: memberData.project_notes,
          project_hourly_rate: memberData.project_hourly_rate,
          allocated_hours: memberData.allocated_hours
        }])
        .select('*')
        .single();

      if (error) throw error;

      setProjectMembers(prev => [data, ...prev]);
      onUpdate?.();
    } catch (error) {
      console.error('Error adding project member:', error);
      throw error;
    }
  };

  // Update project member
  const handleUpdateMember = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('project_team_members')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setProjectMembers(prev => 
        prev.map(member => 
          member.id === id ? { ...member, ...updates } : member
        )
      );
      onUpdate?.();
    } catch (error) {
      console.error('Error updating project member:', error);
      throw error;
    }
  };

  // Remove project member
  const handleRemoveMember = async (id) => {
    try {
      const { error } = await supabase
        .from('project_team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjectMembers(prev => prev.filter(member => member.id !== id));
      onUpdate?.();
    } catch (error) {
      console.error('Error removing project member:', error);
      throw error;
    }
  };

  const openEdit = (member) => {
    setEditing({
      id: member.id,
      _candidate_id: member.company_member_id,
      name: member.member_name,
      email: member.member_email,
      phone: member.member_phone,
      avatar_url: member.member_avatar_url,
      project_role: member.project_role,
      project_status: member.project_status,
      joined_project_date: member.joined_project_date,
      project_notes: member.project_notes,
      project_hourly_rate: member.project_hourly_rate,
      allocated_hours: member.allocated_hours
    });
  };

  const closeEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;

    try {
      if (editing.id) {
        // Update existing member
        await handleUpdateMember(editing.id, {
          project_role: editing.project_role,
          project_status: editing.project_status,
          joined_project_date: editing.joined_project_date,
          project_notes: editing.project_notes,
          project_hourly_rate: editing.project_hourly_rate,
          allocated_hours: editing.allocated_hours
        });
      } else {
        // Add new member
        await handleAddMember(editing);
      }
      closeEdit();
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">فريق المشروع</h3>
        <button
          onClick={() => setEditing({
            id: null,
            _candidate_id: '',
            name: '',
            email: '',
            phone: '',
            avatar_url: '',
            project_role: 'member',
            project_status: 'active',
            joined_project_date: new Date().toISOString().slice(0, 10),
            project_notes: '',
            project_hourly_rate: 0,
            allocated_hours: 0
          })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <UserPlus size={16} />
          إضافة عضو
        </button>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العضو</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">دور في المشروع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">حالة في المشروع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانضمام</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">معدل الساعة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الساعات المخصصة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projectMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {member.member_avatar_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={member.member_avatar_url}
                            alt={member.member_name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {member.member_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">{member.member_name}</div>
                        <div className="text-sm text-gray-500">{member.member_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ProjectRoleBadge value={member.project_role} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ProjectStatusBadge value={member.project_status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.joined_project_date || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.project_hourly_rate ? `${member.project_hourly_rate} ج.م` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.allocated_hours || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const copy = { ...member };
                          if (copy.id) delete copy.id;
                          handleAddMember(copy);
                        }}
                        className="text-xs px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 inline-flex items-center gap-1"
                        title="تكرار"
                      >
                        <Copy size={14} /> تكرار
                      </button>
                      <button
                        onClick={() => openEdit(member)}
                        className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 inline-flex items-center gap-1"
                        title="تعديل"
                      >
                        <Pencil size={14} /> تعديل
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 inline-flex items-center gap-1"
                        title="حذف"
                      >
                        <Trash2 size={14} /> حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {projectMembers.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">
                    لا يوجد أعضاء في هذا المشروع بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditMemberModal
          value={editing}
          onChange={setEditing}
          onCancel={closeEdit}
          onSave={saveEdit}
          onDelete={() => {
            if (editing.id) handleRemoveMember(editing.id);
            closeEdit();
          }}
          candidates={companyMembers}
          isProjectMember={true}
        />
      )}
    </div>
  );
}

export default ProjectTeamManager;
