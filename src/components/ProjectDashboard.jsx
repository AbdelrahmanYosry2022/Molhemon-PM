// src/components/ProjectDashboard.jsx
import React, { useState } from 'react';
import { colors } from '../utils/colors';
import ProjectSections from "./ProjectSections.jsx";
import { Pencil } from 'lucide-react';
import EditProjectModal from './EditProjectModal.jsx';

function ProjectDashboard({
  project,
  paid,
  remaining,
  paidPct,
  currency,
  updateProject,
  categories,
  addCategory,
  removeCategory,
  updateCategory,
  payments,
  addPayment,
  removePayment,
  updatePayment,
  milestones,
  addMilestone,
  removeMilestone,
  updateMilestone,
  addDeliverable,
  removeDeliverable,
  updateDeliverable,
  language,
  clients,
  deliverables,
  teamMembers,
  addTeamMember,
  updateTeamMember,
  removeTeamMember
}) {
  // دالة تحديث عضو الفريق (يمكن تمريرها كـ prop لاحقاً إذا لزم الأمر)
  // دوال إدارة أعضاء الفريق: إضافة / تحديث / إزالة
  const handleAddTeamMember = async (payload) => {
    const newMember = { ...payload };
    if (!newMember.id) newMember.id = crypto.randomUUID?.() || String(Date.now());
    const newTeam = [...(project?.team || []), newMember];
    await updateProject({ team: newTeam });
  };

  const handleUpdateTeamMember = async (id, patch) => {
    const existing = project?.team || [];
    const newTeam = existing.map((m) => (m.id === id ? { ...m, ...patch } : m));
    await updateProject({ team: newTeam });
  };

  const handleRemoveTeamMember = async (id) => {
    const existing = project?.team || [];
    const newTeam = existing.filter((m) => m.id !== id);
    await updateProject({ team: newTeam });
  };

  const team = project?.team || [];

  // ربط العميل الحقيقي
  const realClient = clients?.find(c => c.id === project.client_id) || null;

  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-3xl font-bold text-[${colors.textPrimary}]`}>
              {project.name}
            </h1>
            <button onClick={() => setEditing(true)} title="تعديل المشروع" className="p-2 rounded-full hover:bg-gray-100">
              <Pencil size={18} className="text-gray-600" />
            </button>
          </div>
          {realClient && (
            <p className={`text-[${colors.textSecondary}] text-lg mt-2`}>
              العميل: {realClient.first_name} {realClient.last_name}
            </p>
          )}
        </div>
      </header>

      {editing && (
        <EditProjectModal
          project={project}
          clients={clients}
          onClose={() => setEditing(false)}
          onProjectUpdated={(updated) => {
            setEditing(false);
            updateProject && updateProject(updated);
          }}
        />
      )}

      <ProjectSections
        projectId={project?.id}
        language={language || "ar"}
        project={project}
        client={realClient}
        clients={clients}
        categories={categories}
        milestones={milestones}
        payments={payments}
        deliverables={deliverables}
        team={team}
        currency={currency}
        onUpdateTeamMember={async (id, patch) => {
          if (typeof updateTeamMember === 'function') {
            const res = await updateTeamMember(id, patch);
            return res;
          }
          return handleUpdateTeamMember(id, patch);
        }}
        onAddTeamMember={async (member) => {
          if (typeof addTeamMember === 'function') {
            const created = await addTeamMember(member);
            return created;
          }
          return handleAddTeamMember(member);
        }}
        onRemoveTeamMember={async (id) => {
          if (typeof removeTeamMember === 'function') {
            const ok = await removeTeamMember(id);
            return ok;
          }
          return handleRemoveTeamMember(id);
        }}
        teamMembers={teamMembers}
        // تمرير دوال CRUD كـ props
        updateProject={updateProject}
        addCategory={addCategory}
        removeCategory={removeCategory}
        updateCategory={updateCategory}
        addPayment={addPayment}
        removePayment={removePayment}
        updatePayment={updatePayment}
        addMilestone={addMilestone}
        removeMilestone={removeMilestone}
        updateMilestone={updateMilestone}
        addDeliverable={addDeliverable}
        removeDeliverable={removeDeliverable}
        updateDeliverable={updateDeliverable}
      />
    </div>
  );
}

export default ProjectDashboard;
