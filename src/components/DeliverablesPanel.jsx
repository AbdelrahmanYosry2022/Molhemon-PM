// src/components/DeliverablesPanel.jsx
import React, { useMemo, useState, useEffect } from "react";
import { CheckCircle2, Clock, XCircle, Eye, Paperclip, Pencil, Trash2 } from "lucide-react";

/** حالات المخرجات */
const STYLES = {
  "pending":     { label: "قيد الإعداد",   cls: "bg-gray-50 text-gray-700 border-gray-200", icon: Clock },
  "in-review":   { label: "قيد المراجعة",  cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Eye },
  "approved":    { label: "مقبول",         cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  "rejected":    { label: "مرفوض/للتعديل", cls: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

function StatusBadge({ value }) {
  const st = STYLES[value] || STYLES["pending"];
  const Icon = st.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border ${st.cls}`}>
      <Icon size={14} /> {st.label}
    </span>
  );
}

function toCSV(rows) {
  const header = ["العنوان","المسؤول","تاريخ التسليم","الحالة","روابط/مرفقات","ملاحظات"];
  const body = rows.map(r => [
    r.title,
    r.owner || "",
    r.due || "",
    STYLES[r.status]?.label || r.status,
    (r.links?.join(" | ")) || "",
    r.note || ""
  ]);
  return [header, ...body]
    .map(a => a.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export default function DeliverablesPanel({ items = [], onAdd, onUpdate, onRemove }) {
  // بيانات تجريبية لو مفيش props
  const demo = useMemo(() => (items.length ? items : [
    { id: "d1", title: "Episode 1 Draft", owner: "Mona Ali",  due: "2025-08-28", status: "in-review", links: ["https://files.example.com/ep1-draft.mp4"], note: "" },
    { id: "d2", title: "Final Episode 1", owner: "Ahmed Hassan", due: "2025-09-05", status: "pending", links: [], note: "" },
    { id: "d3", title: "Key Art v1",      owner: "Hady Nabil", due: "2025-08-26", status: "rejected", links: ["https://files.example.com/keyart.png"], note: "رجاء تعديل الألوان" },
    { id: "d4", title: "Trailer 30s",     owner: "Omar Youssef", due: "2025-08-31", status: "approved", links: ["https://files.example.com/trailer.mp4"], note: "OK" },
  ]), [items]);

  // فلاتر
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState({ key: "due", dir: "asc" });

  const filtered = useMemo(() => {
    let r = demo.filter(x =>
      (!q || (x.title + " " + (x.owner||"") + " " + (x.note||"")).toLowerCase().includes(q.toLowerCase())) &&
      (status === "all" || x.status === status) &&
      (!from || (x.due && x.due >= from)) &&
      (!to || (x.due && x.due <= to))
    );
    r.sort((a,b) => {
      const k = sort.key;
      const av = a[k] ?? "", bv = b[k] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [demo, q, status, from, to, sort]);

  // إحصائيات مبنية على النتائج الحالية (بعد الفلاتر)
  const stats = useMemo(() => ({
    total: filtered.length,
    pending: filtered.filter(x => x.status === "pending").length,
    inReview: filtered.filter(x => x.status === "in-review").length,
    approved: filtered.filter(x => x.status === "approved").length,
    rejected: filtered.filter(x => x.status === "rejected").length,
  }), [filtered]);

  // مودال تعديل/إضافة
  const [editing, setEditing] = useState(null); // {id,title,owner,due,status,links[],note}
  const openAdd = () => setEditing({ id: null, title: "", owner: "", due: "", status: "pending", links: [], note: "" });
  const openEdit = (row) => setEditing({ ...row });
  const closeEdit = () => setEditing(null);

  const saveEdit = () => {
    if (!editing) return;
    const payload = { ...editing, links: normalizeLinks(editing.links) };
    editing.id ? onUpdate?.(editing.id, payload) : onAdd?.(payload);
    closeEdit();
  };

  const removeRow = (id) => onRemove?.(id);

  useEffect(() => {
    const h = (e) => {
      if (!editing) return;
      if (e.key === "Escape") closeEdit();
      if (e.key === "Enter")  saveEdit();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [editing]);

  const exportCSV = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "deliverables.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const th = "px-3 py-2 text-right text-sm font-semibold text-gray-700 whitespace-nowrap";
  const td = "px-3 py-2 text-right text-sm text-gray-700 align-middle";

  return (
    <>
      {/* أدوات أعلى الجدول */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4" dir="rtl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="بحث في العنوان/المسؤول/الملاحظات…"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">الحالة</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-2 text-sm"
              >
                <option value="all">الكل</option>
                <option value="pending">قيد الإعداد</option>
                <option value="in-review">قيد المراجعة</option>
                <option value="approved">مقبول</option>
                <option value="rejected">مرفوض/للتعديل</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">من</label>
              <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)}
                     className="border border-gray-200 rounded-lg px-2 py-1 text-sm" />
              <label className="text-xs text-gray-500">إلى</label>
              <input type="date" value={to} onChange={(e)=>setTo(e.target.value)}
                     className="border border-gray-200 rounded-lg px-2 py-1 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200">
              تصدير CSV
            </button>
            <button onClick={openAdd} className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
              إضافة مخرج
            </button>
          </div>
        </div>
      </div>

      {/* ====== الإحصائيات — أخضر فاتح جداً وبإطار أخضر خفيف، وتحت التبويب مباشرة ====== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4" dir="rtl">
        <GreenStat label="إجمالي" value={stats.total} />
        <GreenStat label="قيد الإعداد" value={stats.pending} />
        <GreenStat label="قيد المراجعة" value={stats.inReview} />
        <GreenStat label="مقبول" value={stats.approved} />
        <GreenStat label="مرفوض/للتعديل" value={stats.rejected} />
      </div>

      {/* جدول */}
      <div className="bg-white rounded-2xl border border-gray-100 p-0 overflow-hidden" dir="rtl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { k:"title", label:"العنوان" },
                  { k:"owner", label:"المسؤول" },
                  { k:"due",   label:"تاريخ التسليم" },
                  { k:"status",label:"الحالة" },
                  { k:"links", label:"روابط/ملفات" },
                ].map(col => (
                  <th key={col.k} className={th}>
                    <button
                      className="inline-flex items-center gap-1 hover:underline"
                      onClick={() => setSort(s => ({ key: col.k, dir: s.key===col.k && s.dir==="asc" ? "desc":"asc" }))}
                      title="ترتيب"
                    >
                      {col.label}{sort.key===col.k ? (sort.dir==="asc" ? " ▲":" ▼") : ""}
                    </button>
                  </th>
                ))}
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                  <td className={`${td} font-medium text-gray-800`}>{row.title}</td>
                  <td className={td}>{row.owner || "-"}</td>
                  <td className={td}>{row.due || "-"}</td>
                  <td className={td}><StatusBadge value={row.status} /></td>
                  <td className={td}>
                    {row.links?.length ? (
                      <div className="flex items-center gap-2 flex-wrap justify-start">
                        {row.links.map((u, i) => (
                          <a key={i} href={u} target="_blank" rel="noreferrer"
                             className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline">
                            <Paperclip size={14} /> ملف {i+1}
                          </a>
                        ))}
                      </div>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-2 justify-start">
                      <button
                        onClick={() => openEdit(row)}
                        className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 inline-flex items-center gap-1"
                        title="تعديل"
                      >
                        <Pencil size={14} /> تعديل
                      </button>
                      <button
                        onClick={() => removeRow(row.id)}
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
                  <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={6}>
                    لا توجد نتائج مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال تحرير */}
      {editing && (
        <EditModal
          value={editing}
          onChange={setEditing}
          onCancel={closeEdit}
          onSave={saveEdit}
          onDelete={() => { removeRow(editing.id); closeEdit(); }}
        />
      )}
    </>
  );
}

/* ====== عناصر مساعدة ====== */
function GreenStat({ label, value }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className="text-2xl font-extrabold text-emerald-700 mt-1">{value}</div>
    </div>
  );
}

function normalizeLinks(links) {
  if (Array.isArray(links)) return links.filter(Boolean);
  if (typeof links === "string") {
    return links.split("\n").map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function EditModal({ value, onChange, onCancel, onSave, onDelete }) {
  const v = value || {};
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div dir="rtl" className="bg-white rounded-2xl w-full max-w-lg p-5 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {v.id ? "تعديل المخرج" : "إضافة مخرج"}
        </h3>

        <div className="grid gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">العنوان</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
              value={v.title || ""}
              onChange={(e) => onChange(s => ({ ...s, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">المسؤول</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                value={v.owner || ""}
                onChange={(e) => onChange(s => ({ ...s, owner: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">تاريخ التسليم</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                value={v.due || ""}
                onChange={(e) => onChange(s => ({ ...s, due: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">الحالة</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                value={v.status || "pending"}
                onChange={(e) => onChange(s => ({ ...s, status: e.target.value }))}
              >
                <option value="pending">قيد الإعداد</option>
                <option value="in-review">قيد المراجعة</option>
                <option value="approved">مقبول</option>
                <option value="rejected">مرفوض/للتعديل</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">روابط/ملفات (سطر لكل رابط)</label>
              <textarea
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                value={Array.isArray(v.links) ? v.links.join("\n") : (v.links || "")}
                onChange={(e) => onChange(s => ({ ...s, links: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">ملاحظات</label>
            <textarea
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
              value={v.note || ""}
              onChange={(e) => onChange(s => ({ ...s, note: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2 justify-start">
          <button onClick={onSave} className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
            حفظ
          </button>
          {v.id && (
            <button onClick={onDelete} className="px-3 py-2 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100">
              حذف
            </button>
          )}
          <button onClick={onCancel} className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
