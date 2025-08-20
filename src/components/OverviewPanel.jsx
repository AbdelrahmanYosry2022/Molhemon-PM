// src/components/OverviewPanel.jsx
import React, { useMemo } from "react";

/**
 * لوحة "نظرة عامة" — KPIs بخلفية خضراء + ملخصات سريعة.
 * حالياً بيانات تجريبية (Demo) لحد ما نربط بالداتا الحقيقية.
 */
export default function OverviewPanel({ language = "ar" }) {
  const isAr = language === "ar";
  const T = (ar, en) => (isAr ? ar : en);
  const fmt = (n) => Number(n).toLocaleString("en-US");

  // بيانات تجريبية مؤقتاً
  const demo = useMemo(
    () => ({
      budgetTotal: 150000,
      spent: 10500,
      remaining: 139500,
      utilization: 7,
      lastPayments: [
        { id: "p1", date: "2025-08-15", category: "Production", note: "Camera rent", amount: 5500 },
        { id: "p2", date: "2025-08-14", category: "Editing",    note: "Freelancer",  amount: 3200 },
        { id: "p3", date: "2025-08-12", category: "Marketing",  note: "Ads",         amount: 1800 },
      ],
      nextMilestones: [
        { id: "m2", title: "مونتاج الحلقة 1", date: "2025-08-22", status: "in-progress" },
        { id: "m3", title: "حملة الإطلاق",   date: "2025-09-01", status: "at-risk" },
      ],
      deliverables: [
        { id: "d2", title: "Episode 1 Draft", due: "2025-08-28", status: "revision" },
        { id: "d4", title: "Final Episode 1", due: "2025-09-05", status: "approved" },
      ],
      team: [
        { id: "u1", name: "Ahmed Hassan", role: "owner" },
        { id: "u2", name: "Mona Ali",     role: "manager" },
        { id: "u3", name: "Omar Youssef", role: "accountant" },
      ],
      files: [
        { id: "f1", title: "Contract_v1.pdf", type: "contract" },
        { id: "f4", title: "Invoice_12.pdf",  type: "invoice" },
      ],
    }),
    []
  );

  const Card = ({ title, children }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      {title && <h3 className="text-base font-bold text-gray-800 mb-3">{title}</h3>}
      <div className="text-sm text-gray-600">{children}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* KPIs بخلفية خضراء — البطاقات القديمة لكن داخل التبويب */}
      <div className="xl:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-xl shadow">
          <p className="text-sm/5 opacity-90">{T("الميزانية الكلية", "Total Budget")}</p>
          <h3 className="text-2xl font-bold mt-1">{fmt(demo.budgetTotal)} EGP</h3>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-xl shadow">
          <p className="text-sm/5 opacity-90">{T("المدفوع", "Spent")}</p>
          <h3 className="text-2xl font-bold mt-1">{fmt(demo.spent)} EGP</h3>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-xl shadow">
          <p className="text-sm/5 opacity-90">{T("المتبقي", "Remaining")}</p>
          <h3 className="text-2xl font-bold mt-1">{fmt(demo.remaining)} EGP</h3>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-xl shadow">
          <p className="text-sm/5 opacity-90">{T("نسبة الاستهلاك", "Utilization")}</p>
          <h3 className="text-2xl font-bold mt-1">{demo.utilization}%</h3>
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
              {demo.lastPayments.map(r => (
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
          {demo.nextMilestones.map(m => (
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
          {demo.deliverables.map(d => (
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
          {demo.team.map(u => (
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
          {demo.files.map(f => (
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
