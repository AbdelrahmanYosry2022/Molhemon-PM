// src/components/sections/ProjectDetailsForm.jsx
import React from 'react';
import { colors } from '../../utils/colors';

function ProjectDetailsForm({ project, updateProject, currency }) {
  return (
    <div className={`lg:col-span-2 bg-[${colors.background}] p-4 rounded-xl border border-[${colors.border}] shadow-sm`}>
      <h3 className="text-lg font-semibold mb-4">تفاصيل المشروع</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className={`text-sm font-medium text-[${colors.textSecondary}]`}>اسم المشروع</span>
          <input className={`w-full rounded-md border border-[${colors.border}] bg-white px-3 py-2 focus:border-[${colors.primary}] focus:ring-2 focus:ring-[${colors.primaryMuted}] outline-none`} value={project.name} onChange={(e) => updateProject({ name: e.target.value })} />
        </label>
        <label className="space-y-1">
          <span className={`text-sm font-medium text-[${colors.textSecondary}]`}>الميزانية الكلية ({currency})</span>
          <input type="number" className={`w-full rounded-md border border-[${colors.border}] bg-white px-3 py-2 focus:border-[${colors.primary}] focus:ring-2 focus:ring-[${colors.primaryMuted}] outline-none`} value={project.total} onChange={(e) => updateProject({ total: Number(e.target.value) })} />
        </label>
        <label className="space-y-1">
          <span className={`text-sm font-medium text-[${colors.textSecondary}]`}>تاريخ البداية</span>
          <input type="date" className={`w-full rounded-md border border-[${colors.border}] bg-white px-3 py-2 focus:border-[${colors.primary}] focus:ring-2 focus:ring-[${colors.primaryMuted}] outline-none`} value={project.start || ''} onChange={(e) => updateProject({ start: e.target.value })} />
        </label>
        <label className="space-y-1">
          <span className={`text-sm font-medium text-[${colors.textSecondary}]`}>تاريخ النهاية</span>
          <input type="date" className={`w-full rounded-md border border-[${colors.border}] bg-white px-3 py-2 focus:border-[${colors.primary}] focus:ring-2 focus:ring-[${colors.primaryMuted}] outline-none`} value={project.end || ''} onChange={(e) => updateProject({ end: e.target.value })} />
        </label>
      </div>
    </div>
  );
}

export default ProjectDetailsForm;