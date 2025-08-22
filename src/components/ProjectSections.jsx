// src/components/ProjectSections.jsx
import React, { useMemo, useState } from "react";
import { supabase } from "../supabaseClient"; // استيراد supabase

import PaymentsTable from "./PaymentsTable.jsx";
import MilestonesPanel from "./MilestonesPanel.jsx";
import DeliverablesPanel from "./DeliverablesPanel.jsx";
import TeamPanel from "./TeamPanel.jsx";
import FilesPanel from "./FilesPanel.jsx";
import OverviewPanel from "./OverviewPanel.jsx";

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
 */
export default function ProjectSections({
  projectId,
  language = "ar",
  project,
  clients = [],
  payments = project?.payments || [],
  milestones = project?.milestones || [],
  categories = project?.categories || [],
  deliverables,
  team = project?.team || [],
  files = project?.files || [],
  onUpdateTeamMember,
  onAddTeamMember,
  onRemoveTeamMember,
  teamMembers = [],
  addPayment,
  removePayment,
  updatePayment,
  addDeliverable,
  removeDeliverable,
  updateDeliverable,
  addMilestone,
  updateMilestone,
  removeMilestone,
}) {
  const isAr = language === "ar";
  const T = (ar, en) => (isAr ? ar : en);

  const [active, setActive] = useState("payments"); // Default to payments tab

  // --- دالة رفع المرفقات ---
  const handleUploadAttachment = async (file, paymentId) => {
    if (!file || !projectId) return null;
    const filePath = `public/${projectId}/${paymentId}-${file.name}`;
    try {
      const { error: uploadError } = await supabase.storage
        .from('payment-attachments')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { publicURL, error: urlError } = supabase.storage
        .from('payment-attachments')
        .getPublicUrl(filePath);

      if (urlError) {
        throw urlError;
      }

      return publicURL;
    } catch (error) {
      console.error("Error uploading file:", error.message);
      // يمكنك إضافة إشعار للمستخدم هنا
      return null;
    }
  };

  const tabs = [
    { id: "overview",    label: T("نظرة عامة", "Overview"), icon: LayoutDashboard },
    { id: "payments",    label: T("المدفوعات", "Payments"), icon: Receipt },
    { id: "milestones",  label: T("مراحل العمل", "Milestones & Timeline"), icon: Calendar },
    { id: "deliverables",label: T("المخرجات", "Deliverables"), icon: CheckCircle2 },
    { id: "team",        label: T("فريق العمل", "Team"), icon: Users },
    { id: "files",       label: T("الملفات والعقود", "Files & Contracts"), icon: FileText },
  ];

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

  return (
    <section className="mt-6">
      <div className={`flex gap-2 flex-wrap ${isAr ? "justify-start" : "justify-end"}`}>
        {tabs.map((t) => (
          <TabButton key={t.id} id={t.id} label={t.label} Icon={t.icon} />
        ))}
      </div>

      <div className="mt-5">
        {active === "overview" && (
          <OverviewPanel
            language={language}
            project={project}
            payments={payments}
            milestones={milestones}
            categories={categories}
            team={team}
            files={files}
          />
        )}

        {active === "payments" && (
          <PaymentsTable
            currency={project?.currency || "EGP"}
            payments={payments.map(p => ({
              ...p,
              date: p.pay_date || p.date,
            }))}
            milestones={milestones} // تمرير المراحل
            onAdd={addPayment}
            onUpdate={updatePayment}
            onRemove={removePayment}
            onUploadAttachment={handleUploadAttachment} // تمرير دالة الرفع
          />
        )}

        {active === "milestones" && (
          <MilestonesPanel
            items={milestones}
            onAdd={addMilestone}
            onUpdate={updateMilestone}
            onRemove={removeMilestone}
            deliverables={deliverables}
          />
        )}

        {active === "deliverables" && (
          <DeliverablesPanel 
            items={deliverables}
            onAdd={addDeliverable}
            onUpdate={updateDeliverable}
            onRemove={removeDeliverable}
            teamMembers={teamMembers}
          />
        )}

        {active === "team" && (
          <TeamPanel items={(teamMembers && teamMembers.length) ? teamMembers : team} onAdd={onAddTeamMember} onUpdate={onUpdateTeamMember} onRemove={onRemoveTeamMember} candidates={teamMembers || clients || []} />
        )}

        {active === "files" && <FilesPanel />}
      </div>
    </section>
  );
}
