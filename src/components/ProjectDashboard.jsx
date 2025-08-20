// src/components/ProjectDashboard.jsx
import React from 'react';
import { colors } from '../utils/colors';

import ProjectSections from "./ProjectSections.jsx";

function ProjectDashboard({ 
  project, client, clients = [], currency
}) {
  return (
    <div className="space-y-6 p-6 w-full max-w-7xl mx-auto">
      {/* ===== HEADER ===== */}
      <header>
        <h1 className={`text-3xl font-bold text-[${colors.textPrimary}]`}>
          {project.name}
        </h1>
        {client && (
          <p className={`text-[${colors.textSecondary}] text-lg`}>
            العميل: {client.first_name} {client.last_name}
          </p>
        )}
        <p className={`text-[${colors.textSecondary}]`}>
          مرحباً بك، قم بإدارة ميزانية وجداول مشروعك من هنا.
        </p>
      </header>

      {/* ===== SECTIONS (TABS) ===== */}
      <ProjectSections
        projectId={project?.id}
        language="ar"
        project={project}
        client={client}
        clients={clients}
        currency={currency}
      />
    </div>
  );
}

export default ProjectDashboard;
