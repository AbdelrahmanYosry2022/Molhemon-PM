// src/components/sections/BudgetCategoriesSection.jsx
import React from 'react';
import { Plus, Trash2, FolderPlus } from 'lucide-react';
import { colors } from '../../utils/colors';

function BudgetCategoriesSection({ categories, addCategory, removeCategory, updateCategory }) {
  return (
    <div className={`bg-[${colors.background}] p-4 rounded-xl border border-[${colors.border}] shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">بنود الميزانية</h3>
          <button onClick={addCategory} className={`px-4 py-2 rounded-md bg-white text-[${colors.primary}] border border-[${colors.border}] hover:bg-[${colors.primaryMuted}] inline-flex items-center gap-2`}><FolderPlus size={16} /> إضافة بند</button>
      </div>
      <div className="space-y-3">
          {categories.map((c) => (
              <div key={c.id} className={`rounded-lg border border-[${colors.border}] p-3 bg-[${colors.surface}]`}>
              <div className="grid grid-cols-12 gap-3 items-center">
                  <input className={`col-span-3 rounded-md border border-[${colors.border}] bg-white px-3 py-2`} value={c.name} onChange={(e) => updateCategory(c.id, { name: e.target.value })} />
                  <input type="number" className={`col-span-3 rounded-md border border-[${colors.border}] bg-white px-3 py-2`} value={c.budget} onChange={(e) => updateCategory(c.id, { budget: Number(e.target.value) })} />
                  <div className="col-span-5"></div>
                  <button onClick={() => removeCategory(c.id)} className={`col-span-1 justify-self-end p-1 rounded-md text-[${colors.textSecondary}] hover:bg-[${colors.destructiveMuted}] hover:text-[${colors.destructive}]`}><Trash2 size={18} /></button>
              </div>
              </div>
          ))}
      </div>
    </div>
  );
}

export default BudgetCategoriesSection;