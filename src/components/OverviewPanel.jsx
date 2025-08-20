// src/components/OverviewPanel.jsx
import React, { useMemo } from "react";

/**
 * لوحة "نظرة عامة" — KPIs بخلفية خضراء + ملخصات سريعة.
 * حالياً بيانات تجريبية (Demo) لحد ما نربط بالداتا الحقيقية.
 */
export default function OverviewPanel({
  language = "ar",
  project,
  payments = [],
  milestones = [],
  categories = [],
  team = [],
  files = [],
}) {
  const isAr = language === "ar";
  const T = (ar, en) => (isAr ? ar : en);
  const fmt = (n) => Number(n).toLocaleString("en-US");

  // حساب القيم الحقيقية
  const budgetTotal = project?.total || 0;
  const spent = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const remaining = budgetTotal - spent;
  const utilization = budgetTotal > 0 ? Math.round((spent / budgetTotal) * 100) : 0;

  // آخر المدفوعات (أحدث 3)
  const lastPayments = [...payments]
    .sort((a, b) => String(b.pay_date).localeCompare(String(a.pay_date)))
    .slice(0, 3)
    .map(p => ({
      id: p.id,
      date: p.pay_date,
      category: categories.find(c => c.id === p.category_id)?.name || "-",
      note: p.note,
      amount: p.amount
    }));

  // المراحل القادمة (أقرب 2 حسب التاريخ)
  const nextMilestones = [...milestones]
    .filter(m => m.status !== "done")
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(0, 2);

  // الفريق والملفات: بيانات وهمية مؤقتاً حتى يتم ربطها
  // يمكنك لاحقاً تمرير بيانات حقيقية من الداشبورد
  const deliverables = [];

  // ...existing code...

  const Card = ({ title, children }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      {title && <h3 className="text-base font-bold text-gray-800 mb-3">{title}</h3>}
      <div className="text-sm text-gray-600">{children}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* KPIs بخلفية خضراء */}
      <div className="xl:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-xl shadow">
          <p className="text-sm/5 opacity-90">{T("الميزانية الكلية", "Total Budget")}</p>
          <h3 className="text-2xl font-bold mt-1">{fmt(budgetTotal)} EGP</h3>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-xl shadow">
          <p className="text-sm/5 opacity-90">{T("المدفوع", "Spent")}</p>
          <h3 className="text-2xl font-bold mt-1">{fmt(spent)} EGP</h3>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-xl shadow">
          <p className="text-sm/5 opacity-90">{T("المتبقي", "Remaining")}</p>
          <h3 className="text-2xl font-bold mt-1">{fmt(remaining)} EGP</h3>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-xl shadow">
          <p className="text-sm/5 opacity-90">{T("نسبة الاستهلاك", "Utilization")}</p>
          <h3 className="text-2xl font-bold mt-1">{utilization}%</h3>
        </div>
      </div>

      {/* آخر المدفوعات */}
      <Card title={T("آخر المدفوعات", "Latest Payments")}> 
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-sm font-semibold text-gray-700 text-right">{T("التاريخ","Date")}</th>
                <th className="px-3 py-2 text-sm font-semibold text-gray-700 text-right">{T("البند","Category")}</th>
                <th className="px-3 py-2 text-sm font-semibold text-gray-700 text-right">{T("الملاحظة","Note")}</th>
                <th className="px-3 py-2 text-sm font-semibold text-gray-700 text-right">{T("المبلغ","Amount")}</th>
              </tr>
            </thead>
            <tbody>
              {lastPayments.map(r => (
                <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-700">{r.date}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{r.category}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{r.note || "-"}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{fmt(r.amount)} EGP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* المراحل القادمة */}
      <Card title={T("المراحل القادمة", "Upcoming Milestones")}> 
        <ul className="space-y-2">
          {nextMilestones.map(m => (
            <li key={m.id} className="flex items-center justify-between">
              <div className="font-medium text-gray-800">{m.title}</div>
              <div className="text-xs text-gray-500">{m.date}</div>
            </li>
          ))}
        </ul>
      </Card>

      {/* المخرجات */}
      <Card title={T("المخرجات", "Deliverables")}> 
        <ul className="space-y-2">
          {deliverables.map(d => (
            <li key={d.id} className="flex items-center justify-between">
              <div className="font-medium text-gray-800">{d.title}</div>
              <span className="text-xs text-gray-500">{d.due || "-"}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* الفريق */}
      <Card title={T("الفريق", "Team")}> 
        <ul className="space-y-2">
          {team.map(u => (
            <li key={u.id} className="flex items-center justify-between">
              <div className="font-medium text-gray-800">{u.name}</div>
              <span className="text-xs text-gray-500">{u.role}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* الملفات الأخيرة */}
      <Card title={T("الملفات الأخيرة", "Recent Files")}> 
        <ul className="space-y-2">
          {files.map(f => (
            <li key={f.id} className="flex items-center justify-between">
              <div className="font-medium text-gray-800">{f.title}</div>
              <span className="text-xs text-gray-500">
                {f.type === "contract" ? T("عقد","Contract")
                  : f.type === "invoice" ? T("فاتورة","Invoice")
                  : T("ملف","File")}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
