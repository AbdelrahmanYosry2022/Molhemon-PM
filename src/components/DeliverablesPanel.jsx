// src/components/DeliverablesPanel.jsx
import React, { useMemo, useState, useEffect } from "react";
import { CheckCircle2, Clock, XCircle, Eye, Paperclip, Pencil, Trash2, Copy,
         Mic, Video, Film, BookOpen, Image, Layers, Globe, Star, Code, Type, Plus, Check, X, SlidersHorizontal } from "lucide-react";
import driveSvg from '../assets/google-drive.svg';

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

/** نوع المخرجات */
const TYPES = {
  "podcast":       { label: "حلقة بودكاست", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Mic },
  "short-video":   { label: "فيديو قصير",    cls: "bg-blue-50 text-blue-700 border-blue-200", icon: Video },
  "long-video":    { label: "فيديو طويل",    cls: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Film },
  "course":        { label: "كورس تعليمي",   cls: "bg-violet-50 text-violet-700 border-violet-200", icon: BookOpen },
  "cover":         { label: "تصميم غلاف",    cls: "bg-pink-50 text-pink-700 border-pink-200", icon: Image },
  "book":          { label: "تصميم كتاب",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: BookOpen },
  "branding":      { label: "هوية بصرية",    cls: "bg-teal-50 text-teal-700 border-teal-200", icon: Layers },
  "logo":          { label: "شعار",          cls: "bg-rose-50 text-rose-700 border-rose-200", icon: Star },
  "web":           { label: "موقع برمجي",    cls: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: Code },
  "wordpress":     { label: "موقع وردبريس",  cls: "bg-slate-50 text-slate-700 border-slate-200", icon: Globe },
  "typography":    { label: "تايبوجرافي",    cls: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Type },
};

function TypeBadge({ value }) {
  const t = TYPES[value] || { label: value || "—", cls: "bg-gray-50 text-gray-700 border-gray-200", icon: Paperclip };
  const Icon = t.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border ${t.cls}`}>
      {Icon ? <Icon size={14} /> : null} {t.label}
    </span>
  );
}

function toCSV(rows) {
  const header = ["العنوان","المسؤول","تاريخ التسليم","النوع","الحالة","التكلفة","العملة","روابط/مرفقات","ملاحظات"];
  const body = rows.map(r => [
    r.title,
    r.owner || "",
    r.due || "",
    TYPES[r.type]?.label || r.type || "",
    STYLES[r.status]?.label || r.status,
    r.cost != null ? Number(r.cost).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "",
  (typeof CURRENCY_LABELS !== 'undefined' && CURRENCY_LABELS[r.currency]) ? CURRENCY_LABELS[r.currency] : (r.currency || ""),
    (r.links?.join(" | ")) || "",
    r.note || ""
  ]);
  return [header, ...body]
    .map(a => a.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

// Currency labels in Arabic
const CURRENCY_LABELS = {
  EGP: 'جنية',
  USD: 'دولار',
  EUR: 'يورو',
  SAR: 'ريال سعودي'
};

export default function DeliverablesPanel({ items = [], onAdd, onUpdate, onRemove, teamMembers, moveDeliverableUp, moveDeliverableDown, onReorderDeliverables }) {
  // يبدأ دائماً ببيانات فارغة عند الإنشاء
  const demo = useMemo(() => items, [items]);
  console.log('DeliverablesPanel: items prop updated', items);

  // Drag state for visual feedback
  const [dragState, setDragState] = useState({ srcId: null, overId: null, position: null });

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
    // If no sort key is set (cleared filter), keep original order (no sorting)
    const k = sort?.key;
    if (k) {
      r.sort((a,b) => {
        const av = a[k] ?? "", bv = b[k] ?? "";
        const cmp = String(av).localeCompare(String(bv));
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    console.log('DeliverablesPanel: filtered items', r);
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
  const [editing, setEditing] = useState(null); // {id,title,owner,due,status,links[],note,currency}
  const openAdd = () => setEditing({ id: null, title: "", owner: "", due: "", type: "podcast", status: "pending", links: [], note: "", cost: null, currency: 'EGP' });
  const openEdit = (row) => {
    const prepared = { ...row, links: normalizeLinks(row.links) };
    // If the row has an owner name but no owner_id, try to resolve it from teamMembers so
    // the select control can display the selected option by value (owner_id).
    if (!prepared.owner_id && prepared.owner && Array.isArray(teamMembers) && teamMembers.length) {
      const match = teamMembers.find(m => {
        const name = (typeof m === 'string') ? m : (m.name || m.full_name || m.email || '');
        return name && name === prepared.owner;
      });
      if (match && typeof match === 'object' && match.id) prepared.owner_id = match.id;
    }
    setEditing(prepared);
  };
  const closeEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    const cleaned = { ...editing, links: normalizeLinks(editing.links) };
    Object.keys(cleaned).forEach(k => { if (k.startsWith('_')) delete cleaned[k]; });
    const payload = cleaned;
    try {
      if (editing.id) {
        await onUpdate?.(editing.id, payload);
      } else {
        await onAdd?.(payload);
      }
      closeEdit();
    } catch (err) {
      console.error('Save deliverable failed:', err);
      alert('حصل خطأ أثناء حفظ المخرج: ' + (err.message || String(err)));
    }
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

  const th = "px-4 py-2 text-right text-sm font-semibold text-gray-700 whitespace-nowrap";
  const td = "px-4 py-2 text-right text-sm text-gray-700";

  return (
    <>
      {/* أدوات أعلى الجدول */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4" dir="rtl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
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
            // Drag handle column (visual only) will be rendered as an extra th before title
            { k: "__drag", label: "" },
            { k:"title", label:"العنوان" },
                  { k:"owner", label:"المسؤول" },
                  { k:"due",   label:"تاريخ التسليم" },
                  { k:"type",  label:"النوع" },
                  { k:"status",label:"الحالة" },
                  { k:"cost", label:"التكلفة" },
                  { k:"currency", label: "العملة" },
                  { k:"links", label:"روابط/ملفات" },
                ].map(col => (
                  <th key={col.k} className={th}>
                    <button
                      className="w-full text-right hover:underline flex justify-start items-center"
                      onClick={() => setSort(s => ({ key: col.k, dir: s.key===col.k && s.dir==="asc" ? "desc":"asc" }))}
                      title="ترتيب"
                    >
                      <span>{col.label}</span>
                      <span className="mr-1">{sort.key===col.k ? (sort.dir==="asc" ? "▼":"▲") : ""}</span>
                    </button>
                  </th>
                ))}
                <th className={th}>
                  <div className="flex items-center justify-center">
                    {/** button shows active style when sort.key is set */}
                    <button
                      onClick={() => setSort({ key: null, dir: 'asc' })}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium ${sort?.key ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
                      title="مسح الفلتر"
                    >
                      <SlidersHorizontal size={14} />
                      <span>مسح الفلتر</span>
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => {
                const pos = (dragState.overId === row.id) ? dragState.position : null;
                const extraClass = pos === 'before' ? 'border-t-4 border-emerald-500' : (pos === 'after' ? 'border-b-4 border-emerald-500' : '');
                return (
                  <tr key={row.id} className={`odd:bg-white even:bg-gray-50 ${extraClass}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        const rect = e.currentTarget.getBoundingClientRect();
                        const mid = rect.top + rect.height / 2;
                        const position = (e.clientY < mid) ? 'before' : 'after';
                        setDragState(ds => ({ ...ds, overId: row.id, position }));
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const srcId = e.dataTransfer.getData('text/plain');
                        const destId = row.id;
                        const position = dragState.position || 'before';
                        if (typeof onReorderDeliverables === 'function') onReorderDeliverables(srcId, destId, position);
                        setDragState({ srcId: null, overId: null, position: null });
                      }}
                  >
                    <td className={td} style={{ width: 40 }}>
                      <div
                        className="flex items-center justify-center"
                        title="اسحب لتحريك الصف"
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          e.dataTransfer.setData('text/plain', String(row.id));
                          e.dataTransfer.effectAllowed = 'move';
                          try { e.dataTransfer.setDragImage(e.currentTarget, 10, 10); } catch (err) {}
                          setDragState(ds => ({ ...ds, srcId: row.id }));
                        }}
                        onDragEnd={() => setDragState({ srcId: null, overId: null, position: null })}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 cursor-grab" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7 4a1 1 0 100 2 1 1 0 000-2zM7 8a1 1 0 100 2 1 1 0 000-2zM7 12a1 1 0 100 2 1 1 0 000-2zM13 4a1 1 0 100 2 1 1 0 000-2zM13 8a1 1 0 100 2 1 1 0 000-2zM13 12a1 1 0 100 2 1 1 0 000-2z" />
                        </svg>
                      </div>
                    </td>
                    <td className={`${td} font-medium text-gray-800`}>{row.title}</td>
                    <td className={td}>
                      {/* show avatar next to owner name when available */}
                      {(() => {
                        const tm = Array.isArray(teamMembers) ? teamMembers : [];
                        // البحث في أعضاء المشروع أولاً
                        const projectMember = tm.find(m => 
                          (row.owner_id && m.company_member_id === row.owner_id) || 
                          (m.member_name && m.member_name === row.owner)
                        );
                        
                        // إذا لم نجد في أعضاء المشروع، نبحث في الأعضاء العاديين
                        const member = projectMember || tm.find(m => 
                          (row.owner_id && m.id === row.owner_id) || 
                          (m.name && m.name === row.owner)
                        );
                        
                        const avatar = (member && (member.member_avatar_url || member.avatar_url)) || row.avatar_url || null;
                        const displayName = row.owner || (member && (member.member_name || member.name || member.full_name)) || "-";
                        if (displayName === "-") return displayName;
                        return (
                          <div className="flex items-center justify-start gap-2">
                            {avatar ? (
                              <img src={avatar} alt={displayName} className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                {String(displayName).split(" ").map(s => s[0]).filter(Boolean).slice(0,2).join("")}
                              </div>
                            )}
                            <span>{displayName}</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className={td}>{row.due || "-"}</td>
                    <td className={td}><TypeBadge value={row.type} /></td>
                    <td className={td}><StatusBadge value={row.status} /></td>
                    <td className={td}>{row.cost != null ? (Number(row.cost).toLocaleString(undefined, { maximumFractionDigits: 0 })) : '-'}</td>
                    <td className={td}>{row.currency ? (CURRENCY_LABELS[row.currency] || row.currency) : '-'}</td>
                    <td className={td}>
                      {row.links?.length ? (
                        <div className="flex items-center gap-2 flex-wrap justify-start">
                          {row.links.map((u, i) => (
                            <a key={i} href={u} target="_blank" rel="noopener noreferrer"
                              title={u}
                              aria-label={`فتح الرابط: ${u}`}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border text-sm text-gray-700 bg-white hover:bg-gray-50">
                              <FaviconIcon url={u} size={16} />
                            </a>
                          ))}
                        </div>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-2 justify-start">
                        <button
                          onClick={() => {
                            const copy = { ...row };
                            if (copy.id) delete copy.id;
                            if (copy.links && !Array.isArray(copy.links)) copy.links = String(copy.links).split('\n').map(s => s.trim()).filter(Boolean);
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
                          onClick={() => removeRow(row.id)}
                          className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 inline-flex items-center gap-1"
                          title="حذف"
                        >
                          <Trash2 size={14} /> حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

        {filtered.length === 0 && (
                <tr>
          <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={9}>
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
          teamMembers={teamMembers}
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

// بسيط يكتشف نوع الرابط لعرض أيقونة مناسبة
function detectLinkType(url) {
  if (!url || typeof url !== 'string') return 'other';
  const u = url.toLowerCase();
  try {
    if (u.match(/\.pdf(\?|$)/)) return 'pdf';
    if (u.match(/\.(png|jpe?g|gif|webp)(\?|$)/)) return 'image';
    if (u.match(/youtube\.com|youtu\.be/)) return 'youtube';
    if (u.match(/github\.com|gitlab\.com|bitbucket\.org/)) return 'code';
    if (u.match(/\.(zip|rar|7z|tar|gz)(\?|$)/)) return 'archive';
    if (u.startsWith('http://') || u.startsWith('https://')) return 'website';
  } catch (e) {
    return 'other';
  }
  return 'other';
}

function LinkIcon({ url, size = 16 }) {
  const t = detectLinkType(url);
  if (t === 'youtube') return <Video size={size} />;
  if (t === 'pdf') return <BookOpen size={size} />;
  if (t === 'image') return <Image size={size} />;
  if (t === 'code' || t === 'archive') return <Code size={size} />;
  if (t === 'website') return <Globe size={size} />;
  return <Paperclip size={size} />;
}

function getDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch (e) {
    // fallback: try to extract via regex
    const m = String(url).match(/https?:\/\/([^\/]+)/i);
    return m ? m[1] : '';
  }
}

function FaviconIcon({ url, size = 16 }) {
  const [failed, setFailed] = React.useState(false);
  if (!url) return <Paperclip size={size} />;
  const domain = getDomain(url);
  // special-case Google Drive: use bundled SVG asset for consistent look
  if (domain && domain.includes('drive.google.com')) {
    return <img src={driveSvg} alt="Google Drive" style={{ width: size, height: size }} />;
  }
  if (!domain) return <LinkIcon url={url} size={size} />;
  const fav = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  if (failed) return <LinkIcon url={url} size={size} />;
  return (
    <img
      src={fav}
      alt={`favicon ${domain}`}
      width={size}
      height={size}
      className="block"
      onError={(e) => { setFailed(true); e.currentTarget.style.display = 'none'; }}
      style={{ width: size, height: size, borderRadius: 4 }}
    />
  );
}

// DriveIcon removed — using bundled asset instead

function EditModal({ value, onChange, onCancel, onSave, onDelete, teamMembers }) {
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
              {/* If teamMembers are provided render a dropdown, otherwise keep the free-text input */}
              {(Array.isArray(teamMembers) && teamMembers.length > 0) ? (
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                  value={v.owner_id || v.owner || ""}
                  onChange={(e) => {
                                         const val = e.target.value;
                     // البحث في أعضاء المشروع أولاً
                     const projectMember = teamMembers.find(m => 
                       (m && m.company_member_id && String(m.company_member_id) === String(val)) ||
                       (m && m.id && String(m.id) === String(val))
                     );
                     
                     // إذا لم نجد في أعضاء المشروع، نبحث في الأعضاء العاديين
                     const member = projectMember || teamMembers.find(m => 
                       (m && m.id && String(m.id) === String(val)) || 
                       (typeof m === 'string' && m === val)
                     );
                     
                     if (member && typeof member === 'object') {
                       const name = member.member_name || member.name || member.full_name || member.email || "";
                       const memberId = member.company_member_id || member.id;
                       onChange(s => ({ ...s, owner: name, owner_id: memberId }));
                     } else {
                       onChange(s => ({ ...s, owner: val, owner_id: undefined }));
                     }
                  }}
                >
                  <option value="">— اختر مسؤول —</option>
                                     {teamMembers.map((m, i) => {
                     const name = (typeof m === 'string') ? m : (m.member_name || m.name || m.full_name || m.email || `عضو ${i+1}`);
                     const key = (typeof m === 'string') ? name : (m.company_member_id || m.id || m.email || name + i);
                     const value = (typeof m === 'string') ? name : (m.company_member_id || m.id || name);
                     const role = m.project_role || m.role;
                     return <option key={key} value={value}>{name}{role ? ` — ${role}` : ''}</option>;
                   })}
                </select>
              ) : (
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                  value={v.owner || ""}
                  onChange={(e) => onChange(s => ({ ...s, owner: e.target.value }))}
                />
              )}
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
              <label className="block text-xs text-gray-500 mb-1">النوع</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                value={v.type || "podcast"}
                onChange={(e) => onChange(s => ({ ...s, type: e.target.value }))}
              >
                <option value="podcast">حلقة بودكاست</option>
                <option value="short-video">فيديو قصير</option>
                <option value="long-video">فيديو طويل</option>
                <option value="course">كورس تعليمي</option>
                <option value="cover">تصميم غلاف</option>
                <option value="book">تصميم كتاب</option>
                <option value="branding">هوية بصرية</option>
                <option value="logo">شعار</option>
                <option value="web">موقع برمجي</option>
                <option value="wordpress">موقع وردبريس</option>
                <option value="typography">تايبوجرافي</option>
              </select>
            </div>
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
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">روابط/ملفات</label>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {(Array.isArray(v.links) ? v.links : []).map((u, i) => (
                <div key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border bg-white">
                    <a href={u} target="_blank" rel="noopener noreferrer" title={u} aria-label={`فتح الرابط: ${u}`} className="inline-flex items-center justify-center w-6 h-6">
                    <FaviconIcon url={u} size={14} />
                  </a>
                  <button className="text-xs text-red-600 px-1" onClick={() => onChange(s => ({ ...s, links: s.links.filter((_, idx) => idx !== i) }))} title="حذف">
                    <X size={12} />
                  </button>
                </div>
              ))}

              <button
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300"
                onClick={() => onChange(s => ({ ...s, _showLinkInput: true }))}
                title="إضافة رابط جديد"
                aria-label="إضافة رابط جديد"
              >
                إضافة رابط
              </button>
            </div>

            {v._showLinkInput && (
              <div className="flex items-center gap-2 mb-2">
                <input
                  placeholder="ضع رابط هنا"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                  value={v._newLink || ""}
                  onChange={(e) => onChange(s => ({ ...s, _newLink: e.target.value }))}
                />
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white"
                  onClick={() => {
                    if (!v._newLink) return;
                    const next = Array.isArray(v.links) ? [...v.links, v._newLink] : [v._newLink];
                    onChange(s => ({ ...s, links: next, _newLink: "", _showLinkInput: false }));
                  }}
                  title="حفظ الرابط"
                >
                  <Check size={14} /> حفظ
                </button>
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100"
                  onClick={() => onChange(s => ({ ...s, _newLink: "", _showLinkInput: false }))}
                  title="إلغاء"
                >
                  إلغاء
                </button>
              </div>
            )}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">التكلفة</label>
              <input
                type="number"
                min="0"
                step="1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
                value={v.cost ?? ""}
                onChange={(e) => onChange(s => ({ ...s, cost: e.target.value === "" ? null : Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
        <div>
              <label className="block text-xs text-gray-500 mb-1">العملة</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
                value={v.currency || 'EGP'}
                onChange={(e) => onChange(s => ({ ...s, currency: e.target.value }))}
              >
                <option value="EGP">جنية</option>
                <option value="USD">دولار</option>
                <option value="EUR">يورو</option>
          <option value="SAR">ريال سعودي</option>
              </select>
            </div>
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
