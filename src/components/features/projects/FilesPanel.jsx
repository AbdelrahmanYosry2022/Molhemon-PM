// src/components/FilesPanel.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  FileText,
  ScrollText,
  Paperclip,
  Download,
  Pencil,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* ==================== Badges & Helpers ==================== */

const TYPE_META = {
  contract: { label: "عقد", icon: ScrollText, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  file: { label: "ملف", icon: FileText, cls: "bg-gray-50 text-gray-700 border-gray-200" },
};

const STATUS_META = {
  active: { label: "نشط", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  review: { label: "قيد المراجعة", icon: Eye, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  expired: { label: "منتهي", icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200" },
};

function TypeBadge({ value }) {
  const m = TYPE_META[value] || TYPE_META.file;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border ${m.cls}`}>
      <Icon size={14} /> {m.label}
    </span>
  );
}
function StatusBadge({ value }) {
  const m = STATUS_META[value] || STATUS_META.review;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border ${m.cls}`}>
      <Icon size={14} /> {m.label}
    </span>
  );
}

function toCSV(rows) {
  const header = ["العنوان", "النوع", "التاريخ", "المسؤول", "الحالة", "روابط/ملفات", "ملاحظات"];
  const body = rows.map((r) => [
    r.title,
    TYPE_META[r.type]?.label || r.type,
    r.date || "",
    r.owner || "",
    STATUS_META[r.status]?.label || r.status,
    (Array.isArray(r.links) ? r.links.join(" | ") : r.link || "") || "",
    r.note || "",
  ]);
  return [header, ...body]
    .map((a) => a.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function normalizeLinks(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === "string") {
    return v
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
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

/* ==================== Main Panel ==================== */

export default function FilesPanel({ items = [], onAdd, onUpdate, onRemove }) {
  // يبدأ دائماً ببيانات فارغة عند الإنشاء
  const demo = useMemo(() => items, [items]);

  // Filters
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: "desc" });

  const filtered = useMemo(() => {
    let r = demo.filter(
      (x) =>
        (!q ||
          (x.title + " " + (x.owner || "") + " " + (x.note || ""))
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (type === "all" || x.type === type) &&
        (status === "all" || x.status === status) &&
        (!from || (x.date && x.date >= from)) &&
        (!to || (x.date && x.date <= to))
    );
    r.sort((a, b) => {
      const k = sort.key;
      const aV = a[k] ?? "";
      const bV = b[k] ?? "";
      const cmp = String(aV).localeCompare(String(bV));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [demo, q, type, status, from, to, sort]);

  // Stats
  const stats = useMemo(() => {
    const contracts = filtered.filter((x) => x.type === "contract").length;
    const files = filtered.filter((x) => x.type === "file").length;
    const latest = [...filtered].sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];
    return {
      total: filtered.length,
      contracts,
      files,
      latestTitle: latest?.title || "—",
      latestDate: latest?.date || "—",
    };
  }, [filtered]);

  // Edit modal
  const [editing, setEditing] = useState(null); // {id?, title, type, date, owner, status, links[], note}
  const openAdd = () =>
    setEditing({
      id: null,
      title: "",
      type: "file",
      date: "",
      owner: "",
      status: "review",
      links: [],
      note: "",
    });
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
      if (e.key === "Enter") saveEdit();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [editing]);

  const exportCSV = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "files_contracts.csv";
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
              placeholder="بحث في العنوان/المسؤول/الملاحظات…"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">النوع</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-2 text-sm"
              >
                <option value="all">الكل</option>
                <option value="contract">عقد</option>
                <option value="file">ملف</option>
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
                <option value="review">قيد المراجعة</option>
                <option value="expired">منتهي</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">من</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
              />
              <label className="text-xs text-gray-500">إلى</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
              />
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
              onClick={openAdd}
              className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              رفع ملف/عقد
            </button>
          </div>
        </div>
      </div>

      {/* إحصائيات خضراء أسفل التبويب مباشرة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4" dir="rtl">
        <GreenStat label="إجمالي" value={stats.total} />
        <GreenStat label="العقود" value={stats.contracts} />
        <GreenStat label="الملفات" value={stats.files} />
        <GreenStat
          label="آخر ملف"
          value={stats.latestTitle}
          sub={stats.latestDate !== "—" ? `بتاريخ ${stats.latestDate}` : ""}
        />
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-2xl border border-gray-100 p-0 overflow-hidden" dir="rtl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { k: "title", label: "العنوان" },
                  { k: "type", label: "النوع" },
                  { k: "date", label: "التاريخ" },
                  { k: "owner", label: "المسؤول" },
                  { k: "status", label: "الحالة" },
                  { k: "links", label: "روابط/تحميل" },
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
                <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                  <td className={`${td} font-medium text-gray-800`}>{row.title}</td>
                  <td className={td}>
                    <TypeBadge value={row.type} />
                  </td>
                  <td className={td}>{row.date || "-"}</td>
                  <td className={td}>{row.owner || "-"}</td>
                  <td className={td}>
                    <StatusBadge value={row.status} />
                  </td>
                  <td className={td}>
                    {row.links?.length ? (
                      <div className="flex items-center gap-2 flex-wrap justify-start">
                        {row.links.map((u, i) => (
                          <a
                            key={i}
                            href={u}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline"
                          >
                            <Download size={14} /> تحميل {i + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
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

      {/* نافذة التعديل / الإضافة */}
      {editing && (
        <EditModal
          value={editing}
          onChange={setEditing}
          onCancel={closeEdit}
          onSave={saveEdit}
          onDelete={() => {
            if (editing.id) removeRow?.(editing.id);
            closeEdit();
          }}
        />
      )}
    </>
  );
}

/* ==================== Edit Modal ==================== */

function EditModal({ value, onChange, onCancel, onSave, onDelete }) {
  const v = value || {};
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div dir="rtl" className="bg-white rounded-2xl w-full max-w-lg p-5 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {v.id ? "تعديل ملف/عقد" : "رفع ملف/عقد"}
        </h3>

        <div className="grid gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">العنوان</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
              value={v.title || ""}
              onChange={(e) => onChange((s) => ({ ...s, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">النوع</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                value={v.type || "file"}
                onChange={(e) => onChange((s) => ({ ...s, type: e.target.value }))}
              >
                <option value="file">ملف</option>
                <option value="contract">عقد</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">التاريخ</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                value={v.date || ""}
                onChange={(e) => onChange((s) => ({ ...s, date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">المسؤول</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                value={v.owner || ""}
                onChange={(e) => onChange((s) => ({ ...s, owner: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الحالة</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                value={v.status || "review"}
                onChange={(e) => onChange((s) => ({ ...s, status: e.target.value }))}
              >
                <option value="review">قيد المراجعة</option>
                <option value="active">نشط</option>
                <option value="expired">منتهي</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              روابط/ملفات (سطر لكل رابط)
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
              value={Array.isArray(v.links) ? v.links.join("\n") : v.links || ""}
              onChange={(e) => onChange((s) => ({ ...s, links: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">ملاحظات</label>
            <textarea
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
              value={v.note || ""}
              onChange={(e) => onChange((s) => ({ ...s, note: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2 justify-start">
          <button
            onClick={onSave}
            className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            حفظ
          </button>
          {v.id && (
            <button
              onClick={onDelete}
              className="px-3 py-2 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
            >
              حذف
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
