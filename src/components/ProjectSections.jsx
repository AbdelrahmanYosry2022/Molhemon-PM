// src/components/ProjectSections.jsx
import React, { useMemo, useState } from "react";

import PaymentsTable from "./PaymentsTable.jsx";
import MilestonesPanel from "./MilestonesPanel.jsx";
import DeliverablesPanel from "./DeliverablesPanel.jsx";
import TeamPanel from "./TeamPanel.jsx";
import FilesPanel from "./FilesPanel.jsx";
import OverviewPanel from "./OverviewPanel.jsx";
import SpendingOverTimeChart from "./charts/SpendingOverTimeChart.jsx";


import {
  LayoutDashboard,
  Receipt,
  Calendar,
  Users,
  FileText,
  CheckCircle2,
} from "lucide-react";

/**
 * تبويب لأقسام إدارة المشروع.
 * كل تبويب في كومبوننت منفصل لسهولة الصيانة.
 */
export default function ProjectSections({ projectId, language = "ar" }) {
  const isAr = language === "ar";
  const T = (ar, en) => (isAr ? ar : en);

  const tabs = [
    { id: "overview",    label: T("نظرة عامة", "Overview"), icon: LayoutDashboard },
    { id: "payments",    label: T("المدفوعات", "Payments"), icon: Receipt },
    { id: "milestones",  label: T("مراحل العمل", "Milestones & Timeline"), icon: Calendar },
    { id: "deliverables",label: T("المخرجات", "Deliverables"), icon: CheckCircle2 },
    { id: "team",        label: T("فريق العمل", "Team"), icon: Users },
    { id: "files",       label: T("الملفات والعقود", "Files & Contracts"), icon: FileText },
  ];

  const [active, setActive] = useState("overview");

  const TabButton = ({ id, label, Icon }) => (
    <button
      onClick={() => setActive(id)}
      className={`relative px-4 py-2 rounded-xl border text-sm font-medium transition-all
        ${active === id
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  const Card = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${className}`}>
      {title && <h3 className="text-base font-bold text-gray-800 mb-3">{title}</h3>}
      <div className="text-sm text-gray-600">{children}</div>
    </div>
  );

  // ===== Demo data مشتركة لتبويب المدفوعات (علشان الأرقام تبقى متسقة مع الجدول)
  const paymentsDemo = useMemo(
    () => [
      { id: "p1", date: "2025-08-15", category: "Production", note: "Camera rent", amount: 5500 },
      { id: "p2", date: "2025-08-14", category: "Editing",    note: "Freelancer",  amount: 3200 },
      { id: "p3", date: "2025-08-12", category: "Marketing",  note: "Ads",         amount: 1800 },
    ],
    []
  );

  // حسابات نظرة سريعة
  const paymentsSummary = useMemo(() => {
    const byCat = {};
    let total = 0;
    paymentsDemo.forEach(p => {
      total += Number(p.amount) || 0;
      const k = p.category || "—";
      byCat[k] = (byCat[k] || 0) + (Number(p.amount) || 0);
    });
    const byCatArr = Object.entries(byCat).map(([category, value]) => ({ category, value }));
    const latest = [...paymentsDemo]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 3);

    // حدود افتراضية للتنبيه (بدّلها لاحقًا بقيم من الداتا)
    const thresholds = { Production: 5000, Editing: 3000, Marketing: 2000 };
    const alerts = byCatArr
      .filter(x => thresholds[x.category] && x.value > thresholds[x.category])
      .map(x => ({
        category: x.category,
        value: x.value,
        limit: thresholds[x.category],
      }));

    return { total, byCatArr, latest, alerts };
  }, [paymentsDemo]);

  const fmtEGP = (n) => `${Number(n).toLocaleString("en-US")} EGP`;

  return (
    <section className="mt-6">
      {/* شريط التبويبات */}
      <div className={`flex gap-2 flex-wrap ${isAr ? "justify-start" : "justify-end"}`}>
        {tabs.map((t) => (
          <TabButton key={t.id} id={t.id} label={t.label} Icon={t.icon} />
        ))}
      </div>

      {/* محتوى التبويب */}
      <div className="mt-5">
        {/* ====== OVERVIEW ====== */}
        {active === "overview" && <OverviewPanel language={language} />}

        {/* ====== PAYMENTS ====== */}
        {active === "payments" && (
          <div className="grid grid-cols-1 gap-4">
            {/* نظرة سريعة (من غير "إجراءات سريعة") */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card title={T("نظرة سريعة", "Quick Overview")}>
                <div className="space-y-4">
                  {/* إجمالي المدفوعات */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">{T("إجمالي المدفوعات", "Total Spent")}</span>
                    <span className="text-lg font-semibold text-gray-800">{fmtEGP(paymentsSummary.total)}</span>
                  </div>

                  {/* تصنيف حسب البنود */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{T("حسب البنود", "By Category")}</div>
                    <ul className="space-y-1">
                      {paymentsSummary.byCatArr.map((row) => (
                        <li key={row.category} className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{row.category}</span>
                          <span className="text-gray-700">{fmtEGP(row.value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* تنبيهات عند تخطي حد بند */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{T("تنبيهات", "Alerts")}</div>
                    {paymentsSummary.alerts.length ? (
                      <ul className="space-y-1">
                        {paymentsSummary.alerts.map(a => (
                          <li key={a.category} className="text-sm text-red-600">
                            {T("تجاوز بند", "Exceeded in")} <span className="font-semibold">{a.category}</span> — {fmtEGP(a.value)} {T("أعلى من الحد", "over limit")} ({fmtEGP(a.limit)})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                        {T("لا توجد تجاوزات حالياً", "No category limits exceeded")}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* آخر المدفوعات */}
              <Card title={T("آخر المدفوعات", "Latest Payments")}>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-sm font-semibold text-gray-700 text-right">{T("التاريخ","Date")}</th>
                        <th className="px-3 py-2 text-sm font-semibold text-gray-700 text-right">{T("البند","Category")}</th>
                        <th className="px-3 py-2 text-sm font-semibold text-gray-700 text-right">{T("المبلغ","Amount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsSummary.latest.map(r => (
                        <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                          <td className="px-3 py-2 text-sm text-gray-700">{r.date}</td>
                          <td className="px-3 py-2 text-sm text-gray-700">{r.category}</td>
                          <td className="px-3 py-2 text-sm text-gray-700">{fmtEGP(r.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* جدول المدفوعات */}
            <PaymentsTable currency="EGP" payments={paymentsDemo} />

            {/* تحليلات سريعة (Placeholder) */}
            <Card title={T("تحليلات سريعة", "Quick Analytics")}>
  <SpendingOverTimeChart payments={paymentsDemo} currency="EGP" />
</Card>

          </div>
        )}

        {/* ====== MILESTONES ====== */}
        {active === "milestones" && <MilestonesPanel />}

        {/* ====== DELIVERABLES ====== */}
        {active === "deliverables" && <DeliverablesPanel />}

        {/* ====== TEAM ====== */}
        {active === "team" && <TeamPanel />}

        {/* ====== FILES ====== */}
        {active === "files" && <FilesPanel />}
      </div>
    </section>
  );
}
