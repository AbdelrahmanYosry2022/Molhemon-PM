import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { Pencil, Trash2, UserPlus, Copy } from 'lucide-react';
import { useProjectTeam } from '../../../contexts/ProjectTeamProvider';

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
  const meta = PROJECT_ROLE_META[value] || PROJECT_ROLE_META.member;
  return <span className={`px-2 py-1 text-xs rounded border ${meta.cls}`}>{meta.label}</span>;
}

export function ProjectStatusBadge({ value }) {
  const meta = PROJECT_STATUS_META[value] || PROJECT_STATUS_META.active;
  return <span className={`px-2 py-1 text-xs rounded border ${meta.cls}`}>{meta.label}</span>;
}

function ProjectTeamManager({ projectId, onUpdate }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchTeamMembers();
    }
  }, [projectId]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_team_members')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-500">جاري تحميل أعضاء الفريق...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500">خطأ في تحميل أعضاء الفريق: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">فريق المشروع</h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          <UserPlus size={16} />
          إضافة عضو
        </button>
      </div>

      {teamMembers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          لا يوجد أعضاء في الفريق حالياً
        </div>
      ) : (
        <div className="grid gap-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-4 border rounded-lg bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{member.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <ProjectRoleBadge value={member.project_role} />
                    <ProjectStatusBadge value={member.project_status} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-500 hover:text-blue-500">
                    <Pencil size={16} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectTeamManager;
