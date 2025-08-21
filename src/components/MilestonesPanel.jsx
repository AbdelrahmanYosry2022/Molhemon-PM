// src/components/MilestonesPanel.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Calendar, CheckCircle2, AlertTriangle, Pencil, Trash2, X } from "lucide-react";

const STATUS_COLORS = {
  done: "text-green-700 bg-green-50 border-green-200",
  "in-progress": "text-amber-700 bg-amber-50 border-amber-200",
  "at-risk": "text-red-700 bg-red-50 border-red-200",
};

function StatusBadge({ value }) {
  const cls = STATUS_COLORS[value] || "text-gray-700 bg-gray-50 border-gray-200";
  const label = value === "done" ? "منجز" : value === "at-risk" ? "خطر" : "قيد التنفيذ";
  const Icon = value === "done" ? CheckCircle2 : value === "at-risk" ? AlertTriangle : Calendar;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-lg ${cls}`}>
      <Icon size={14} /> {label}
    </span>
  );
}

function toCSV(rows) {
  const header = ["العنوان", "التاريخ", "الحالة", "ملاحظة"];
  const body = rows.map((r) => [r.title, r.date || "", r.status, r.note || ""]);
  return [header, ...body]
    .map((a) => a.map((x) => `"${String(x ?? "").replace( /"/g, '""')}"`).join(","))
    .join("\n");
}

/* ---------- Charts (SVG) ---------- */

/** Donut chart لتوزيع الحالات */
function StatusDonutChart({ items = [] }) {
  const counts = useMemo(() => {
    const c = { done: 0, "in-progress": 0, "at-risk": 0 };
    items.forEach((m) => (c[m.status] = (c[m.status] || 0) + 1));
    const total = Math.max(1, items.length);
    return {
      data: [
        { k: "done", label: "منجز", v: c.done, color: "#10b981" },
        { k: "in-progress", label: "قيد التنفيذ", v: c["in-progress"], color: "#f59e0b" },
        { k: "at-risk", label: "خطر", v: c["at-risk"], color: "#ef4444" },
      ],
      total,
    };
  }, [items]);

  const size = 140;
  const r = 54;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  let start = 0;
  const segs = counts.data.map((s) => {
    const frac = s.v / counts.total;
    const len = frac * circ;
    const dasharray = `${len} ${circ - len}`;
    const seg = { ...s, dasharray, offset: start };
    start += len;
    return seg;
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        {segs.map((s) => (
          <circle
            key={s.k}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="12"
            strokeDasharray={s.dasharray}
            strokeDashoffset={-s.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="#334155">
          {items.length} عنصر
        </text>
      </svg>
      <div className="space-y-1 text-sm">
        {counts.data.map((s) => (
          <div key={s.k} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded" style={{ background: s.color }} />
            <span className="text-gray-800">{s.label}</span>
            <span className="text-gray-500">— {s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Burndown/Up: عدد المنجَز تراكميًا عبر الزمن مقابل الإجمالي */
function BurndownChart({ items = [] }) {
  const data = useMemo(() => {
    const rows = [...items]
      .filter((m) => m.date)
      .sort((a, b) => a.date.localeCompare(b.date));
    let done = 0;
    return rows.map((m) => {
      if (m.status === "done") done += 1;
      return { date: m.date, done };
    });
  }, [items]);

  if (!data.length) {
    return <div className="h-[120px] flex items-center justify-center text-gray-500">لا توجد بيانات</div>;
  }

  const W = 380,
    H = 160,
    pad = { t: 10, r: 12, b: 26, l: 26 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const minX = 0,
    maxX = Math.max(1, data.length - 1);
  const maxY = Math.max(1, data.at(-1).done);
  const x = (i) => pad.l + (iw * (i - minX)) / (maxX - minX);
  const y = (v) => pad.t + ih - (ih * v) / maxY;

  const path = data.map((d, i) => `${i ? "L" : "M"} ${x(i)} ${y(d.done)}`).join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect x="0" y="0" width={W} height={H} fill="#ffffff" />
      {Array.from({ length: 3 }).map((_, i) => {
        const v = Math.round((maxY * (i + 1)) / 3);
        const yy = y(v);
        return (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={yy} y2={yy} stroke="#eef2f7" />
            <text x={pad.l - 6} y={yy} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#64748b">
              {v}
            </text>
          </g>
        );
      })}
      <path d={`${path}`} stroke="#10b981" strokeWidth="2.5" fill="none" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.done)} r="3.5" fill="#10b981" />
          {i === 0 || i === data.length - 1 ? (
            <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#64748b">
              {d.date}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}


/**
 * Component for selecting deliverables.
 */
function DeliverableSelector({ allDeliverables, allMilestones, currentMilestone, onUpdate }) {
  const assignedDeliverableIds = useMemo(() => {
    const otherMilestones = allMilestones.filter(m => m.id !== currentMilestone?.id);
    const ids = new Set();
    otherMilestones.forEach(m => {
      (m.deliverable_ids || []).forEach(id => ids.add(id));
    });
    return ids;
  }, [allMilestones, currentMilestone]);

  const availableDeliverables = useMemo(() => {
    const currentIds = new Set(currentMilestone?.deliverable_ids || []);
    return allDeliverables
      .filter(d => !assignedDeliverableIds.has(d.id) || currentIds.has(d.id))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [allDeliverables, assignedDeliverableIds, currentMilestone]);

  const selectedDeliverables = useMemo(() => {
    const currentIds = new Set(currentMilestone?.deliverable_ids || []);
    return allDeliverables.filter(d => currentIds.has(d.id));
  }, [allDeliverables, currentMilestone]);

  const handleSelect = (e) => {
    const id = e.target.value;
    if (!id) return;
    const currentIds = currentMilestone?.deliverable_ids || [];
    onUpdate([...currentIds, id]);
  };

  const handleRemove = (id) => {
    const currentIds = currentMilestone?.deliverable_ids || [];
    onUpdate(currentIds.filter(dId => dId !== id));
  };

  return (
    <div>
      <select
        onChange={handleSelect}
        className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right mb-2"
        value=""
      >
        <option value="">-- اختر مخرج --</option>
        {availableDeliverables
          .filter(d => !(currentMilestone?.deliverable_ids || []).includes(d.id))
          .map(d => (
            <option key={d.id} value={d.id}>{d.title}</option>
          ))}
      </select>
      <div className="space-y-1">
        {selectedDeliverables.map(d => (
          <div key={d.id} className="flex items-center justify-between bg-gray-50 p-1 rounded">
            <span className="text-sm">{d.title}</span>
            <button onClick={() => handleRemove(d.id)} className="text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MilestoneStatCard({ label, value }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className="text-2xl font-extrabold text-emerald-700 mt-1">{value}</div>
    </div>
  );
}


/* ---------- Panel ---------- */

export default function MilestonesPanel({ items = [], deliverables = [], onAdd, onUpdate, onRemove }) {
  // يبدأ دائماً ببيانات فارغة عند الإنشاء
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: "asc" });

  const filtered = useMemo(() => {
    let r = items.filter(
      (x) =>
        (!q || (x.title + " " + (x.note || "")).toLowerCase().includes(q.toLowerCase())) &&
        (status === "all" || x.status === status) &&
        (!from || (x.date && x.date >= from)) &&
        (!to || (x.date && x.date <= to))
    );
    r.sort((a, b) => {
      const k = sort.key;
      const av = a[k] ?? "",
        bv = b[k] ?? "";
      const res = String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? res : -res;
    });
    return r;
  }, [items, q, status, from, to, sort]);

  const overdue = filtered.filter((x) => x.date && x.date < new Date().toISOString().slice(0, 10) && x.status !== "done")
    .length;
  const upcoming = filtered.filter((x) => x.date && x.date >= new Date().toISOString().slice(0, 10) && x.status !== "done")
    .length;
  const doneCnt = filtered.filter((x) => x.status === "done").length;

  const exportCSV = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "milestones.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const th = "px-3 py-2 text-right text-sm font-semibold text-gray-700";
  const td = "px-3 py-2 text-right text-sm text-gray-700";

  /* ==== مودال التعديل ==== */
  const [editing, setEditing] = useState(null); // {id,title,date,status,note}
  const openEdit = (row) => setEditing({ ...row });
  const closeEdit = () => setEditing(null);
  const saveEdit = () => {
    if (!editing) return;
    onUpdate?.(editing.id, { ...editing });
    closeEdit();
  };
  const deleteEdit = () => {
    if (!editing) return;
    onRemove?.(editing.id);
    closeEdit();
  };

  useEffect(() => {
    const h = (e) => {
      if (!editing) return;
      if (e.key === "Escape") closeEdit();
      if (e.key === "Enter") saveEdit();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [editing]);

  /* ==== مودال الإضافة ==== */
  const [isAdding, setIsAdding] = useState(false);
  const [newMilestone, setNewMilestone] = useState({});
  const openAdd = () => {
    setNewMilestone({ title: "", date: "", status: "in-progress", note: "", budget: 0, deliverable_ids: [] });
    setIsAdding(true);
  };
  const closeAdd = () => setIsAdding(false);
  const saveAdd = () => {
    onAdd?.(newMilestone);
    closeAdd();
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-4">
          <MilestoneStatCard label="متأخر" value={overdue} />
          <MilestoneStatCard label="قادمة" value={upcoming} />
          <MilestoneStatCard label="منجزة" value={doneCnt} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        {/* أدوات */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-end gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="بحث في العناوين/الملاحظات…"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-56"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">الحالة</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-2 text-sm"
              >
                <option value="all">الكل</option>
                <option value="in-progress">قيد التنفيذ</option>
                <option value="at-risk">خطر</option>
                <option value="done">منجز</option>
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
            <button onClick={exportCSV} className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200">
              تصدير CSV
            </button>
            <button
              onClick={openAdd}
              className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              إضافة مرحلة
            </button>
          </div>
        </div>

        {/* جدول */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[ 
                  { k: "title", label: "العنوان" },
                  { k: "date", label: "التاريخ" },
                  { k: "status", label: "الحالة" },
                  { k: "budget", label: "الميزانية" },
                  { k: "deliverables", label: "المخرجات" },
                  { k: "note", label: "ملاحظة" },
                ].map((col) => (
                  <th key={col.k} className={th}>
                    <button
                      className="inline-flex items-center gap-1 hover:underline"
                      onClick={() =>
                        setSort((s) => ({ key: col.k, dir: s.key === col.k && s.dir === "asc" ? "desc" : "asc" }))
                      }
                      title="ترتيب"
                    >
                      {col.label}
                      {sort.key === col.k ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
                    </button>
                  </th>
                ))}
                {/* عمود الإجراءات */}
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                  <td className={td}>{row.title}</td>
                  <td className={td}>{row.date || "-"}</td>
                  <td className={td}>
                    <StatusBadge value={row.status} />
                  </td>
                  <td className={td}>{row.budget ? `${row.budget.toLocaleString()} EGP` : "-"}</td>
                  <td className={td}>
                    {(row.deliverable_ids || []).map(d_id => {
                      const deliverable = deliverables.find(d => d.id === d_id);
                      return <div key={d_id}>{deliverable?.title || 'غير معروف'}</div>;
                    })}
                  </td>
                  <td className={td}>{row.note || "-"}</td>
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
                        onClick={() => onRemove?.(row.id)}
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


      {/* --------- أسفل الداشبورد: تشارتين ملخصين --------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-800 mb-3">توزيع الحالات</h3>
          <StatusDonutChart items={filtered} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-800 mb-3">منحنى الإنجاز عبر الزمن</h3>
          <BurndownChart items={filtered} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-base font-bold text-gray-800 mb-3">الخط الزمني</h3>
            <ol className="relative border-s border-gray-200 ps-4 space-y-4">
              {filtered.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <div className="absolute -start-1.5 mt-1.5 size-3 rounded-full bg-white border-2 border-emerald-400" />
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-800">{item.title}</div>
                    <span className="text-xs text-gray-500">{item.date || "-"}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge value={item.status} />
                    {item.note && <span className="text-xs text-gray-500">• {item.note}</span>}
                  </div>
                </li>
              ))}
              {filtered.length === 0 && <li className="text-sm text-gray-500">لا توجد عناصر لعرضها.</li>}
            </ol>
          </div>
      </div>

      {/* مودال الإضافة */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div dir="rtl" className="bg-white rounded-2xl w-full max-w-md p-5 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">إضافة مرحلة جديدة</h3>

            <div className="grid gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">العنوان</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                  value={newMilestone.title || ""}
                  onChange={(e) => setNewMilestone((s) => ({ ...s, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">التاريخ</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                    value={newMilestone.date || ""}
                    onChange={(e) => setNewMilestone((s) => ({ ...s, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">الحالة</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                    value={newMilestone.status || "in-progress"}
                    onChange={(e) => setNewMilestone((s) => ({ ...s, status: e.target.value }))}
                  >
                    <option value="in-progress">قيد التنفيذ</option>
                    <option value="at-risk">خطر</option>
                    <option value="done">منجز</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">الميزانية</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                  value={newMilestone.budget || ""}
                  onChange={(e) => setNewMilestone((s) => ({ ...s, budget: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">المخرجات المرتبطة</label>
                <DeliverableSelector
                  allDeliverables={deliverables}
                  allMilestones={items}
                  currentMilestone={newMilestone}
                  onUpdate={(ids) => setNewMilestone(s => ({ ...s, deliverable_ids: ids }))}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">ملاحظة</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                  value={newMilestone.note || ""}
                  onChange={(e) => setNewMilestone((s) => ({ ...s, note: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-start">
              <button
                onClick={saveAdd}
                className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                حفظ
              </button>
              <button
                onClick={closeAdd}
                className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال التعديل */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div dir="rtl" className="bg-white rounded-2xl w-full max-w-md p-5 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">تعديل المرحلة</h3>

            <div className="grid gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">العنوان</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                  value={editing.title || ""}
                  onChange={(e) => setEditing((s) => ({ ...s, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">التاريخ</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                    value={editing.date || ""}
                    onChange={(e) => setEditing((s) => ({ ...s, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">الحالة</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                    value={editing.status || "in-progress"}
                    onChange={(e) => setEditing((s) => ({ ...s, status: e.target.value }))}
                  >
                    <option value="in-progress">قيد التنفيذ</option>
                    <option value="at-risk">خطر</option>
                    <option value="done">منجز</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">الميزانية</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                  value={editing.budget || ""}
                  onChange={(e) => setEditing((s) => ({ ...s, budget: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">المخرجات المرتبطة</label>
                <DeliverableSelector
                  allDeliverables={deliverables}
                  allMilestones={items}
                  currentMilestone={editing}
                  onUpdate={(ids) => setEditing(s => ({ ...s, deliverable_ids: ids }))}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">ملاحظة</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                  value={editing.note || ""}
                  onChange={(e) => setEditing((s) => ({ ...s, note: e.target.value }))}
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
                onClick={deleteEdit}
                className="px-3 py-2 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
              >
                حذف
              </button>
              <button
                onClick={closeEdit}
                className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
