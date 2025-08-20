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
export default function EditMemberModal({ value, onChange, onCancel, onSave, onDelete }) {
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
          <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
            <div className="flex items-center justify-center">
              <img
                src={v.avatar || "https://i.pravatar.cc/96?img=1"}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">رابط صورة (اختياري)</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                value={v.avatar || ""}
                onChange={(e) => onChange((s) => ({ ...s, avatar: e.target.value }))}
                placeholder="https://…"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">الاسم</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
              value={v.name || ""}
              onChange={(e) => onChange((s) => ({ ...s, name: e.target.value }))}
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
