// src/components/modals/EditMemberModal.jsx
import React, { useEffect, useRef } from "react";
import { Shield, Trash2 } from "lucide-react";

/**
 * EditMemberModal
 * مودال تعديل/إضافة عضو فريق — قابل لإعادة الاستخدام.
 *
 * Props:
 * - value: { id?, name, role, status, joined, email, phone, avatar }
 * - onChange: (updater) => void  // نفس أسلوب setState
 * - onCancel: () => void
 * - onSave: () => void
 * - onDelete: () => void         // يظهر الزر فقط عند وجود id
 */
export default function EditMemberModal({ value, onChange, onCancel, onSave, onDelete, candidates = [] }) {
  const v = value || {};
  const dialogRef = useRef(null);

  // إغلاق بـ ESC / حفظ بـ Enter
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onCancel?.();
      if (e.key === "Enter") onSave?.();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel, onSave]);

  // إغلاق عند الضغط خارج الصندوق
  useEffect(() => {
    const onClickOutside = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        onCancel?.();
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div ref={dialogRef} dir="rtl" className="bg-white rounded-2xl w-full max-w-lg p-5 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {v.id ? "تعديل عضو" : "دعوة عضو جديد"}
        </h3>

        <div className="grid gap-3">
          {/* Avatar */}
          <div className="flex items-center justify-center relative mb-3">
            <img
              src={v.avatar_url || v.avatar || "https://i.pravatar.cc/96?img=1"}
              alt="avatar"
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-1 shadow"
              style={{ transform: 'translate(30%, 30%)' }}
              title="تغيير الصورة"
              onClick={() => document.getElementById('avatar-input-modal')?.click()}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
            </button>
            <input
              type="file"
              id="avatar-input-modal"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    // Always store the File object on state; parent will upload if needed
                    onChange((s) => ({ ...s, avatar: file }));
                  }
                }}
            />
          </div>

          {/* Candidate selector (optional) + Name */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">العضو (اختر من القاعدة أو أدخل اسمًا جديدًا)</label>
            {candidates && candidates.length > 0 ? (
              <select
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right mb-2"
                value={v._candidate_id || ""}
                onChange={(e) => {
                  const cid = e.target.value;
                  if (!cid) return onChange((s) => ({ ...s, _candidate_id: "", name: "", email: "", phone: "", avatar_url: "" }));
                  const sel = candidates.find(c => String(c.id) === String(cid));
                  if (sel) {
                    onChange((s) => ({ ...s, _candidate_id: cid, name: sel.name || (sel.first_name ? `${sel.first_name} ${sel.last_name||''}`.trim() : ''), email: sel.email || '', phone: sel.phone || '', avatar_url: sel.avatar_url || sel.avatar || '' }));
                  }
                }}
              >
                <option value="">-- اختر عضو من القائمة --</option>
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name ? `${c.first_name} ${c.last_name||''}`.trim() : c.name || c.email || c.id}</option>
                ))}
              </select>
            ) : null}

            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
              value={v.name || ""}
              onChange={(e) => onChange((s) => ({ ...s, name: e.target.value, _candidate_id: "" }))}
              placeholder="اسم العضو"
            />
          </div>

          {/* Role / Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">الدور</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                value={v.role || "member"}
                onChange={(e) => onChange((s) => ({ ...s, role: e.target.value }))}
              >
                <option value="manager">مدير</option>
                <option value="lead">قائد فريق</option>
                <option value="editor">محرر</option>
                <option value="designer">مصمم</option>
                <option value="member">عضو فريق</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الحالة</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                value={v.status || "active"}
                onChange={(e) => onChange((s) => ({ ...s, status: e.target.value }))}
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
          </div>

          {/* Joined / Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">تاريخ الانضمام</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                value={v.joined || ""}
                onChange={(e) => onChange((s) => ({ ...s, joined: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الهاتف</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                value={v.phone || ""}
                onChange={(e) => onChange((s) => ({ ...s, phone: e.target.value }))}
                placeholder="+2010…"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
              value={v.email || ""}
              onChange={(e) => onChange((s) => ({ ...s, email: e.target.value }))}
              placeholder="name@example.com"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2 justify-start">
          <button
            onClick={onSave}
            className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
          >
            <Shield size={16} /> حفظ
          </button>
          {v.id && (
            <button
              onClick={onDelete}
              className="px-3 py-2 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100 inline-flex items-center gap-1"
            >
              <Trash2 size={16} /> حذف
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
