// src/components/PaymentsTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Download } from "lucide-react";

function toCSV(rows) {
  const header = ["التاريخ", "البند", "الملاحظة", "المبلغ"];
  const body = rows.map(r => [r.date, r.category || "", r.note || "", r.amount ?? ""]);
  return [header, ...body].map(a => a.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
}

export default function PaymentsTable({
  // تقدر تبعت داتا حقيقية من الأب لاحقًا
  payments = [],
  categories = [], // [{id,name}] اختياري لملء القائمة
  currency = "EGP",
  onAdd, onUpdate, onRemove,
}) {
  // داتا تجريبية لو مفيش props
  const demo = useMemo(() => (
    payments.length ? payments : [
      { id: "p1", date: "2025-08-15", category: "Production", note: "Camera rent", amount: 5500 },
      { id: "p2", date: "2025-08-14", category: "Editing",    note: "Freelancer",  amount: 3200 },
      { id: "p3", date: "2025-08-12", category: "Marketing",  note: "Ads",         amount: 1800 },
    ]
  ), [payments]);

  const [rows, setRows] = useState(demo);
  useEffect(() => setRows(demo), [demo]);

  // فلاتر / بحث
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: "desc" });

  const filtered = useMemo(() => {
    let r = rows.filter(x =>
      (!q || (x.note + " " + (x.category||"")).toLowerCase().includes(q.toLowerCase())) &&
      (cat === "all" || x.category === cat) &&
      (!from || x.date >= from) &&
      (!to || x.date <= to)
    );
    r.sort((a,b) => {
      const k = sort.key; const av = a[k] ?? ""; const bv = b[k] ?? "";
      const res = String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? res : -res;
    });
    return r;
  }, [rows, q, cat, from, to, sort]);

  const total = filtered.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const fmt = (n) => `${Number(n).toLocaleString("en-US")} ${currency}`;

  // إضافة/تعديل
  const [editing, setEditing] = useState(null); // {id?, date, category, note, amount}
  const openAdd = () => setEditing({ id: null, date: new Date().toISOString().slice(0,10), category: "", note: "", amount: "" });
  const openEdit = (row) => setEditing({ ...row });
  const closeEdit = () => setEditing(null);
  const saveEdit = () => {
    if (!editing) return;
    const isNew = !editing.id;
    const row = { ...editing, amount: Number(editing.amount) || 0, id: editing.id || crypto.randomUUID() };
    setRows(prev => {
      const next = isNew ? [row, ...prev] : prev.map(r => r.id === row.id ? row : r);
      return next;
    });
    isNew ? onAdd?.(row) : onUpdate?.(row.id, row);
    closeEdit();
  };

  const removeRow = (id) => {
    setRows(prev => prev.filter(r => r.id !== id));
    onRemove?.(id);
  };

  const th = "px-3 py-2 text-sm font-semibold text-gray-700 text-right whitespace-nowrap";
  const td = "px-3 py-2 text-sm text-gray-700 text-right align-middle";

  return (
    <div dir="rtl" className="bg-white rounded-2xl border border-gray-100 p-4">
      {/* أدوات */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-end gap-2 justify-end">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="بحث في الملاحظة/البند…"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-60 text-right"
          />

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">البند</label>
            <select
              value={cat}
              onChange={e => setCat(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
            >
              <option value="all">الكل</option>
              {[...new Set((categories.length? categories.map(c=>c.name) : rows.map(r=>r.category)).filter(Boolean))].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">من</label>
            <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-sm" />
            <label className="text-xs text-gray-500">إلى</label>
            <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-sm" />
          </div>
        </div>

        <div className="flex gap-2 justify-start">
          <button
            onClick={() => {
              const csv = toCSV(filtered);
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "payments.csv"; a.click();
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <Download size={16} /> تصدير CSV
          </button>

          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Plus size={16} /> إضافة دفعة
          </button>
        </div>
      </div>

      {/* إجمالي */}
      <div className="mb-3 text-sm text-gray-700">
        إجمالي النتائج: <span className="font-semibold">{fmt(total)}</span>
      </div>

      {/* الجدول */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                { k: "date", label: "التاريخ" },
                { k: "category", label: "البند" },
                { k: "note", label: "الملاحظة" },
                { k: "amount", label: "المبلغ" },
                { k: "actions", label: "" },
              ].map(col => (
                <th key={col.k} className={th}>
                  {col.k !== "actions" ? (
                    <button
                      className="hover:underline"
                      onClick={() => setSort(s => ({ key: col.k, dir: s.key === col.k && s.dir === "asc" ? "desc" : "asc" }))}
                      title="ترتيب"
                    >
                      {col.label}{sort.key === col.k ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
                    </button>
                  ) : <span />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                <td className={td}>{r.date}</td>
                <td className={td}>{r.category || "-"}</td>
                <td className={td}>{r.note || "-"}</td>
                <td className={`${td} font-medium`}>{fmt(r.amount)}</td>
                <td className={td}>
                  <div className="flex items-center gap-2 justify-start">
                    <button
                      onClick={() => openEdit(r)}
                      className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 inline-flex items-center gap-1"
                      title="تعديل"
                    >
                      <Pencil size={14} /> تعديل
                    </button>
                    <button
                      onClick={() => removeRow(r.id)}
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
                <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={5}>
                  لا توجد نتائج مطابقة.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* مودال الإضافة/التعديل */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div dir="rtl" className="bg-white rounded-2xl w-full max-w-md p-5 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editing.id ? "تعديل دفعة" : "إضافة دفعة"}
            </h3>

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">التاريخ</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                    value={editing.date || ""}
                    onChange={e => setEditing(s => ({ ...s, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">البند</label>
                  <input
                    list="cats"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                    value={editing.category || ""}
                    onChange={e => setEditing(s => ({ ...s, category: e.target.value }))}
                    placeholder="Production / Editing…"
                  />
                  <datalist id="cats">
                    {[...new Set((categories.length? categories.map(c=>c.name) : rows.map(r=>r.category)).filter(Boolean))].map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">الملاحظة</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                  value={editing.note || ""}
                  onChange={e => setEditing(s => ({ ...s, note: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">المبلغ ({currency})</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                  value={editing.amount}
                  onChange={e => setEditing(s => ({ ...s, amount: e.target.value }))}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-start">
              <button
                onClick={saveEdit}
                className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                حفظ
              </button>
              <button
                onClick={() => setEditing(null)}
                className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
