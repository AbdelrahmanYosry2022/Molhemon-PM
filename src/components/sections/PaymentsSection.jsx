// src/components/sections/PaymentsSection.jsx
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { colors } from '../../utils/colors';

function PaymentsSection({ payments, categories, addPayment, removePayment, updatePayment }) {
  return (
    <div className={`bg-[${colors.background}] p-4 rounded-xl border border-[${colors.border}] shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">المدفوعات</h3>
          <button onClick={addPayment} className={`px-4 py-2 rounded-md bg-white text-[${colors.primary}] border border-[${colors.border}] hover:bg-[${colors.primaryMuted}] inline-flex items-center gap-2`}><Plus size={16} /> إضافة دفعة</button>
      </div>
      <div className="space-y-3">
          {payments.map((p) => (
              <div key={p.id} className="grid grid-cols-12 gap-2 items-center">
              <input type="number" className={`col-span-3 rounded-md border border-[${colors.border}] bg-white px-3 py-2`} placeholder="المبلغ" value={p.amount} onChange={(e) => updatePayment(p.id, { amount: Number(e.target.value) })} />
              <input type="date" className={`col-span-3 rounded-md border border-[${colors.border}] bg-white px-3 py-2`} value={p.date} onChange={(e) => updatePayment(p.id, { date: e.target.value })} />
              <select className={`col-span-2 rounded-md border border-[${colors.border}] bg-white px-3 py-2`} value={p.category} onChange={(e) => updatePayment(p.id, { category: e.target.value })}>
                  <option value="">--اختر--</option>
                  {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
              </select>
              <input className={`col-span-3 rounded-md border border-[${colors.border}] bg-white px-3 py-2`} placeholder="ملاحظة" value={p.note || ''} onChange={(e) => updatePayment(p.id, { note: e.target.value })} />
              <button onClick={() => removePayment(p.id)} className={`justify-self-end p-1 rounded-md text-[${colors.textSecondary}] hover:bg-[${colors.destructiveMuted}] hover:text-[${colors.destructive}]`}><Trash2 size={18} /></button>
              </div>
          ))}
      </div>
    </div>
  );
}

export default PaymentsSection;