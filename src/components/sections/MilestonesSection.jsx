// src/components/sections/MilestonesSection.jsx
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { colors } from '../../utils/colors';

function MilestonesSection({ milestones, addMilestone, removeMilestone, updateMilestone }) {
  return (
    <div className={`bg-[${colors.background}] p-4 rounded-xl border border-[${colors.border}] shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">المعالم (Milestones)</h3>
          <button onClick={addMilestone} className={`px-4 py-2 rounded-md bg-white text-[${colors.primary}] border border-[${colors.border}] hover:bg-[${colors.primaryMuted}] inline-flex items-center gap-2`}><Plus size={16} /> إضافة معلم</button>
      </div>
      <div className="space-y-3">
          {milestones.map((m) => (
              <div key={m.id} className="grid grid-cols-12 gap-2 items-center">
              <input className={`col-span-5 rounded-md border border-[${colors.border}] bg-white px-3 py-2`} placeholder="العنوان" value={m.title} onChange={(e) => updateMilestone(m.id, { title: e.target.value })} />
              <input type="date" className={`col-span-4 rounded-md border border-[${colors.border}] bg-white px-3 py-2`} value={m.date || ''} onChange={(e) => updateMilestone(m.id, { date: e.target.value })} />
              <select className={`col-span-2 rounded-md border border-[${colors.border}] bg-white px-3 py-2`} value={m.status} onChange={(e) => updateMilestone(m.id, { status: e.target.value })}>
                  <option value="done">منجز</option>
                  <option value="in-progress">قيد التنفيذ</option>
                  <option value="at-risk">في خطر</option>
              </select>
              <button onClick={() => removeMilestone(m.id)} className={`justify-self-end p-1 rounded-md text-[${colors.textSecondary}] hover:bg-[${colors.destructiveMuted}] hover:text-[${colors.destructive}]`}><Trash2 size={18} /></button>
              </div>
          ))}
      </div>
    </div>
  );
}

export default MilestonesSection;