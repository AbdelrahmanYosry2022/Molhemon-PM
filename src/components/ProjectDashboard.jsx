// src/components/ProjectDashboard.jsx
import React from 'react';
import { colors } from '../utils/colors';
import ProjectSections from "./ProjectSections.jsx";

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
  language,
  clients
}) {
  // دالة تحديث عضو الفريق (يمكن تمريرها كـ prop لاحقاً إذا لزم الأمر)
  const handleUpdateTeamMember = async (id, payload) => {
    // يمكن تنفيذ هذه الدالة لاحقاً حسب الحاجة
    console.log('Update team member:', id, payload);
  };

  // بيانات فارغة دائماً عند الإنشاء
  const deliverables = project?.deliverables || [];
  const team = project?.team || [];

  // ربط العميل الحقيقي
  const realClient = clients?.find(c => c.id === project.client_id) || null;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <header>
        <h1 className={`text-3xl font-bold text-[${colors.textPrimary}]`}>
          {project.name}
        </h1>
        {realClient && (
          <p className={`text-[${colors.textSecondary}] text-lg`}>
            العميل: {realClient.first_name} {realClient.last_name}
          </p>
        )}
        <p className={`text-[${colors.textSecondary}]`}>
          مرحباً بك، قم بإدارة ميزانية وجداول مشروعك من هنا.
        </p>
      </header>

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
        onUpdateTeamMember={handleUpdateTeamMember}
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
      />
    </div>
  );
}

export default ProjectDashboard;
