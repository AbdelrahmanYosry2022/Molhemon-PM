export default TeamPanel;
// src/components/TeamPanel.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  MailPlus,
  CheckCircle2,
  XCircle,
  Copy,
} from "lucide-react";
import EditMemberModal from "../../modals/EditMemberModal.jsx";
import TeamMemberCard from '../../ui/TeamMemberCard.jsx'; // Import the new card component
import { supabase } from '../../../supabaseClient.js';

/* ==================== Badges & Helpers ==================== */

export const ROLE_META = {
  manager: { label: "مدير",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  lead:    { label: "قائد فريق", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  editor:  { label: "محرر",   cls: "bg-purple-50 text-purple-700 border-purple-200" },
  designer:{ label: "مصمم",   cls: "bg-pink-50 text-pink-700 border-pink-200" },
  member:  { label: "عضو فريق", cls: "bg-gray-50 text-gray-700 border-gray-200" },
};

export const STATUS_META = {
  active:   { label: "نشط",     icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  inactive: { label: "غير نشط", icon: XCircle,      cls: "bg-red-50 text-red-700 border-red-200" },
};

export function RoleBadge({ value }) {
  const m = ROLE_META[value] || ROLE_META.member;
  return <span className={`inline-flex items-center px-2 py-1 text-xs rounded-lg border ${m.cls}`}>{m.label}</span>;
}
export function StatusBadge({ value }) {
  const m = STATUS_META[value] || STATUS_META.active;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border ${m.cls}`}>
      <Icon size={14} /> {m.label}
    </span>
  );
}

function GreenStat({ label, value, sub }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className="text-2xl font-extrabold text-emerald-700 mt-1">{value}</div>
      {sub ? <div className="text-xs text-gray-500 mt-1">{sub}</div> : null}
    </div>
  );
}

function toCSV(rows) {
  const header = ["الاسم", "الدور", "الحالة", "تاريخ الانضمام", "البريد", "الهاتف"];
  const body = rows.map((r) => [
    r.name,
    ROLE_META[r.role]?.label || r.role,
    STATUS_META[r.status]?.label || r.status,
    r.joined || "",
    r.email || "",
    r.phone || "",
  ]);
  return [header, ...body]
    .map((a) => a.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function TeamPanel({ items = [], onAdd, onUpdate, onRemove, candidates = [] }) {
  // إصلاح حقل الصورة ليكون دائمًا avatar_url حتى لو كان اسمه مختلف في الداتا الأصلية
  const fixedItems = useMemo(() => (items || []).map(m => ({
    ...m,
    avatar_url: m.avatar_url || m.avatar || m.photo || null,
  })), [items]);

  // استخدام الداتا الحقيقية بعد تصحيح حقول الصور
  const demo = useMemo(() => fixedItems, [fixedItems]);

  // Filters
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ key: "joined", dir: "desc" });

  const filtered = useMemo(() => {
    let r = demo.filter(
      (x) =>
        (!q ||
          (x.name + " " + (x.email || "") + " " + (x.phone || ""))
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (role === "all" || x.role === role) &&
        (status === "all" || x.status === status)
    );
    r.sort((a, b) => {
      const k = sort.key;
      const aV = a[k] ?? "";
      const bV = b[k] ?? "";
      const cmp = String(aV).localeCompare(String(bV));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [demo, q, role, status, sort]);

  // Stats
  const stats = useMemo(() => {
    const managers = filtered.filter((x) => x.role === "manager").length;
    const members = filtered.filter((x) => x.role !== "manager").length;
    const active = filtered.filter((x) => x.status === "active").length;
    return {
      total: filtered.length,
      managers,
      members,
      active,
    };
  }, [filtered]);

  // Edit modal state
  const [editing, setEditing] = useState(null); // {id?, name, role, status, joined, email, phone, avatar}
  const openInvite = () =>
    setEditing({
      id: null,
      name: "",
      role: "member",
      status: "active",
      joined: new Date().toISOString().slice(0, 10),
      email: "",
      phone: "",
      avatar: "",
    });
  const openEdit = (row) => setEditing({ ...row, avatar: null });

  // New handler for avatar change to pass to TeamMemberCard
  const handleAvatarChange = async (memberId, file) => {
    try {
      const url = await uploadTeamAvatar(file, memberId);
      onUpdate?.(memberId, { avatar_url: url });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar.");
    }
  };
  const closeEdit = () => setEditing(null);
  // رفع صورة العضو وربطها
  async function uploadTeamAvatar(file, memberId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${memberId}.${fileExt}`;
    const filePath = `team/${fileName}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { publicUrl } = supabase.storage.from('avatars').getPublicUrl(filePath).data;
    return publicUrl;
  }

  const saveEdit = async () => {
    if (!editing) return;
    let payload = { ...editing };
    // إذا تم اختيار صورة جديدة
    if (editing.avatar && editing.avatar instanceof File) {
      const url = await uploadTeamAvatar(editing.avatar, editing.id || crypto.randomUUID());
      payload.avatar_url = url;
    }
    // Remove UI-only temporary keys (prefixed with _)
    Object.keys(payload).forEach((k) => {
      if (k.startsWith('_')) delete payload[k];
    });
    // Remove any File objects (they shouldn't be sent directly)
    if (payload.avatar && payload.avatar instanceof File) delete payload.avatar;

    // Call provided handlers (log payload for debugging)
    console.debug('TeamPanel.saveEdit -> payload:', payload);
    if (editing.id) {
      console.debug('TeamPanel.saveEdit -> updating id', editing.id);
      onUpdate?.(editing.id, payload);
    } else {
      console.debug('TeamPanel.saveEdit -> adding new member');
      onAdd?.(payload);
    }
    closeEdit();
  };
  const removeRow = (id) => onRemove?.(id);

  // Keyboard shortcuts for modal handled inside modal, keep here to export CSV only
  const exportCSV = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const th = "px-3 py-2 text-right text-sm font-semibold text-gray-700 whitespace-nowrap";
  const td = "px-3 py-2 text-right text-sm text-gray-700 align-middle";

  return (
    <>
      {/* أدوات التبويب */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4" dir="rtl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="بحث في الاسم/البريد/الهاتف…"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">الدور</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-2 text-sm"
              >
                <option value="all">الكل</option>
                <option value="manager">مدير</option>
                <option value="lead">قائد فريق</option>
                <option value="editor">محرر</option>
                <option value="designer">مصمم</option>
                <option value="member">عضو فريق</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">الحالة</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-2 text-sm"
              >
                <option value="all">الكل</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 inline-flex items-center gap-1"
            >
              تصدير CSV
            </button>
            <button
              onClick={openInvite}
              className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
            >
              <MailPlus size={16} /> اضافة عضو
            </button>
            
          </div>
        </div>
      </div>

      {/* إحصائيات خضراء */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4" dir="rtl">
        <GreenStat label="إجمالي الأعضاء" value={stats.total} />
        <GreenStat label="عدد المدراء" value={stats.managers} />
        <GreenStat label="أعضاء الفريق" value={stats.members} />
        <GreenStat label="نشطون" value={stats.active} />
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-2xl border border-gray-100 p-0 overflow-hidden" dir="rtl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { k: "name", label: "العضو" },
                  { k: "role", label: "الدور" },
                  { k: "status", label: "الحالة" },
                  { k: "joined", label: "تاريخ الانضمام" },
                  { k: "email", label: "البريد" },
                  { k: "phone", label: "الهاتف" },
                ].map((col) => (
                  <th key={col.k} className={th}>
                    <button
                      className="inline-flex items-center gap-1 hover:underline"
                      onClick={() =>
                        setSort((s) => ({
                          key: col.k,
                          dir: s.key === col.k && s.dir === "asc" ? "desc" : "asc",
                        }))
                      }
                      title="ترتيب"
                    >
                      {col.label}
                      {sort.key === col.k ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
                    </button>
                  </th>
                ))}
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className={`${td} font-medium`}>
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        {row.avatar_url ? (
                          <img
                            src={row.avatar_url}
                            alt={row.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                            {row.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                          </div>
                        )}
                        {handleAvatarChange && (
                          <>
                            <button
                              type="button"
                              className="absolute -bottom-1 -right-1 bg-white border border-gray-300 rounded-full p-1 shadow"
                              title="تغيير الصورة"
                              onClick={() => document.getElementById(`avatar-input-${row.id}`)?.click()}
                            >
                              <Pencil size={10} />
                            </button>
                            <input
                              type="file"
                              id={`avatar-input-${row.id}`}
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleAvatarChange(row.id, file);
                                }
                              }}
                            />
                          </>
                        )}
                      </div>
                      <span>{row.name}</span>
                    </div>
                  </td>
                  <td className={td}>
                    <RoleBadge value={row.role} />
                  </td>
                  <td className={td}>
                    <StatusBadge value={row.status} />
                  </td>
                  <td className={td}>{row.joined || '-'}</td>
                  <td className={td}>{row.email || '-'}</td>
                  <td className={td}>{row.phone || '-'}</td>
                  <td className={td}>
                    <div className="flex items-center gap-2 justify-start">
                      <button
                        onClick={() => {
                          const copy = { ...row };
                          if (copy.id) delete copy.id;
                          onAdd?.(copy);
                        }}
                        className="text-xs px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 inline-flex items-center gap-1"
                        title="تكرار"
                      >
                        <Copy size={14} /> تكرار
                      </button>

                      <button
                        onClick={() => openEdit(row)}
                        className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 inline-flex items-center gap-1"
                        title="تعديل"
                      >
                        <Pencil size={14} /> تعديل
                      </button>

                      <button
                        onClick={() => removeRow?.(row.id)}
                        className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 inline-flex items-center gap-1"
                        title="حذف"
                      >
                        <Trash2 size={14} /> حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={7}>
                    لا توجد نتائج مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال التعديل / الدعوة (خارجي قابل لإعادة الاستخدام) */}
      {editing && (
        <EditMemberModal
          value={editing}
          onChange={setEditing}
          onCancel={closeEdit}
          onSave={saveEdit}
          onDelete={() => {
            if (editing.id) removeRow?.(editing.id);
            closeEdit();
          }}
          candidates={candidates}
        />
      )}
    </>
  );
}

