// src/components/PaymentsTable.jsx
import React, { useMemo, useState } from "react";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Download, 
  Paperclip, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle, 
  Clock, 
  XCircle,
  Search,
  Calendar
} from "lucide-react";
// lucide doesn't export some icon names in this version; use text/icon fallbacks
import { Copy } from "lucide-react";
import { fmtCurrency } from "../utils/helpers";

// --- Constants ---
const TRANSACTION_TYPES = {
  income: { label: "إيراد", color: "text-green-600", bg: "bg-green-50", icon: ArrowUp },
  expense: { label: "مصروف", color: "text-red-600", bg: "bg-red-50", icon: ArrowDown },
};

const PAYMENT_STATUSES = {
  paid: { label: "مدفوعة", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle },
  pending: { label: "فاتورة صادرة", color: "text-yellow-700", bg: "bg-yellow-100", icon: Clock },
  overdue: { label: "متأخرة", color: "text-red-700", bg: "bg-red-100", icon: XCircle },
};

const PAYMENT_METHODS = [
  { id: "", label: "" }, // placeholder empty
  { id: "bank_transfer", label: "تحويل بنكي" },
  { id: "credit_card", label: "بطاقة ائتمان" },
  { id: "paypal", label: "PayPal" },
  { id: "cash", label: "نقدًا" },
  { id: "instapay", label: "Instapay" },
  { id: "vodafone_cash", label: "Vodafone Cash" },
  { id: "unknown", label: "غير معروف" },
];

function PaymentMethodBadge({ method }) {
  const meta = {
    "": { label: "اختر طريقة الدفع", color: "#64748b", bg: "rgba(100,116,139,0.08)" },
    bank_transfer: { label: "تحويل بنكي", color: "#0ea5a4", bg: "rgba(14,165,164,0.08)" },
    credit_card: { label: "بطاقة ائتمان", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
    paypal: { label: "PayPal", color: "#0284c7", bg: "rgba(2,132,199,0.08)" },
    cash: { label: "نقدًا", color: "#16a34a", bg: "rgba(16,163,127,0.08)" },
    instapay: { label: "Instapay", color: "#f97316", bg: "rgba(249,115,22,0.08)" },
    vodafone_cash: { label: "Vodafone Cash", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
    unknown: { label: "غير معروف", color: "#64748b", bg: "rgba(100,116,139,0.08)" },
  };

  const m = meta[method] || meta.unknown;

  const Icon = () => {
    const stroke = m.color;
    switch (method) {
      case "bank_transfer":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10h18" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 10l-9-6-9 6" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "credit_card":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke={stroke} strokeWidth="1.5"/>
            <path d="M2 10h20" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        );
      case "paypal":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 7h7l-1 6H7z" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "cash":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke={stroke} strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="2" stroke={stroke} strokeWidth="1.5"/>
          </svg>
        );
      case "instapay":
      case "vodafone_cash":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3v18" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M5 8h14" stroke={stroke} strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        );
      case "unknown":
      default:
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 18h.01" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <span style={{ background: m.bg, color: m.color }} className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-full">
      <span className="inline-flex items-center justify-center"> <Icon /> </span>
      <span>{m.label}</span>
    </span>
  );
}

// --- Helper Functions ---
function toCSV(rows, currency) {
  const header = ["التاريخ", "النوع", "البند", "الحالة", "العملة", "المبلغ", "طريقة الدفع", "الملاحظة"];
  const body = rows.map(r => [
    r.date,
    TRANSACTION_TYPES[r.type]?.label || r.type,
    r.category || "",
    PAYMENT_STATUSES[r.status]?.label || r.status,
    r.currency || currency,
    fmtCurrency(r.amount ?? 0, r.currency || currency),
    PAYMENT_METHODS.find(m => m.id === r.payment_method)?.label || r.payment_method,
    r.note || "",
  ]);
  return [header, ...body].map(a => a.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
}

const StatCard = ({ title, value }) => (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        <div className="text-2xl font-extrabold text-emerald-700 mt-1">{value}</div>
    </div>
);

// --- Helper Components ---
const renderType = (type) => {
  const typeData = TRANSACTION_TYPES[type];
  if (!typeData) return <span className="text-gray-500">—</span>;
  const Icon = typeData.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${typeData.bg} ${typeData.color}`}>
      {Icon && <Icon size={14} />} {typeData.label}
    </span>
  );
};

const renderStatus = (status) => {
  const statusData = PAYMENT_STATUSES[status];
  if (!statusData) return <span className="text-gray-500">—</span>;
  const Icon = statusData.icon;
  // فقط الأخضر والأحمر
  let bg = status === 'paid' ? 'bg-green-100' : status === 'overdue' ? 'bg-red-100' : 'bg-gray-50';
  let color = status === 'paid' ? 'text-green-700' : status === 'overdue' ? 'text-red-700' : 'text-gray-700';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${bg} ${color}`}>
      {Icon && <Icon size={14} />} {statusData.label}
    </span>
  );
};

// NOTE: renderActions defined later with access to handlers in scope.

// --- Main Component ---
export default function PaymentsTable({
  payments = [],
  milestones = [], // To link payments with milestones
  currency = "EGP",
  onAdd, onUpdate, onRemove, onUploadAttachment,
}) {
  const exportCSV = () => {
    const csv = toCSV(filtered, currency);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  // --- State ---
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: "desc" });
  const [editing, setEditing] = useState(null);

  // --- Derived State & Calculations ---
  // عند إضافة حركة جديدة تظهر في أول الجدول
  const sortedPayments = useMemo(() => {
    // ترتيب حسب التاريخ أو id بحيث الأحدث أولاً
    return [...payments].sort((a, b) => {
      // لو فيه تاريخ استخدمه، لو مفيش استخدم id
      if (a.date && b.date) return b.date.localeCompare(a.date);
      if (a.date) return -1;
      if (b.date) return 1;
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [payments]);

  const filtered = useMemo(() => {
    let r = sortedPayments.filter(x =>
      (!q || (x.note + " " + (x.category || "")).toLowerCase().includes(q.toLowerCase())) &&
      (typeFilter === "all" || x.type === typeFilter) &&
      (statusFilter === "all" || x.status === statusFilter) &&
      (!from || x.date >= from) &&
      (!to || x.date <= to)
    );
    r.sort((a, b) => {
      const k = sort.key; const av = a[k] ?? ""; const bv = b[k] ?? "";
      const res = String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? res : -res;
    });
    return r;
  }, [sortedPayments, q, typeFilter, statusFilter, from, to, sort]);

  const summary = useMemo(() => {
    const stats = {
      revenue: 0,
      expenses: 0,
      due: 0,
    };
    filtered.forEach(p => {
      const amount = Number(p.amount) || 0;
      if (p.type === 'income') {
        stats.revenue += amount;
        if (p.status !== 'paid') {
          stats.due += amount;
        }
      } else if (p.type === 'expense') {
        stats.expenses += amount;
      }
    });
    stats.balance = stats.revenue - stats.expenses;
    return stats;
  }, [filtered]);

  const fmt = (n) => fmtCurrency(n ?? 0, currency);

  // --- Event Handlers ---
  const openAdd = () => setEditing({
    id: null,
    date: new Date().toISOString().slice(0, 10),
    type: "income",
    status: "paid",
    category: "",
    note: "",
    amount: "",
  payment_method: "",
  currency: "",
    milestone_id: "",
    attachment_url: null,
  });

  const openEdit = (row) => setEditing({
    ...row,
    milestone_id: row.milestone_id == null ? "" : row.milestone_id,
  });
  const closeEdit = () => setEditing(null);

  const saveEdit = () => {
    if (!editing) return;
    const isNew = !editing.id;
    const row = {
        ...editing, 
        amount: Number(editing.amount) || 0, 
        id: editing.id || crypto.randomUUID(),
        milestone_id: editing.milestone_id === "" ? null : editing.milestone_id,
    };
    isNew ? onAdd?.(row) : onUpdate?.(row.id, row);
    closeEdit();
  };
  
  const removeEdit = () => {
      if (!editing?.id) return;
      onRemove?.(editing.id);
      closeEdit();
  }

  const handleFileUpload = async (e) => {
    if (!editing || !onUploadAttachment) return;
    const file = e.target.files[0];
    if (!file) return;
    const url = await onUploadAttachment(file, editing.id || 'new');
    if (url) {
      setEditing(s => ({ ...s, attachment_url: url }));
    }
  };

  // --- Render ---
  const th = "px-3 py-2 text-sm font-semibold text-gray-700 text-right whitespace-nowrap";
  const td = "px-3 py-2 text-sm text-gray-700 text-right align-middle";

  // تحديث getRowClass ليقتصر التلوين على الإيراد والمصروف فقط
  const getRowClass = (row) => {
    if (row.type === 'expense') return 'bg-red-50/50';
    if (row.type === 'income') return 'bg-green-50/50';
    return '';
  };

  // Helper to render action buttons with icons and text
  const renderActions = (row) => (
    <div className="flex items-center gap-2 justify-start">
      {row.attachment_url && <a href={row.attachment_url} target="_blank" rel="noreferrer" title="عرض المرفق"><Paperclip size={14} /></a>}
      <button
        onClick={() => {
          // Duplicate the row and add via onAdd
          const copy = {
            ...row,
            id: crypto.randomUUID(),
            date: row.date,
            amount: Number(row.amount) || 0,
            milestone_id: row.milestone_id === "" ? null : row.milestone_id,
          };
          onAdd?.(copy);
        }}
        className="text-xs px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 inline-flex items-center gap-1"
        title="نسخ الدفعة"
      >
        <Copy size={14} /> تكرار
      </button>
      <button onClick={() => openEdit(row)} className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 inline-flex items-center gap-1">
        <Pencil size={14} /> تعديل
      </button>
      <button onClick={() => onRemove?.(row.id)} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 inline-flex items-center gap-1">
        <Trash2 size={14} /> حذف
      </button>
    </div>
  );

  // Define table headers with potential for inline filters
  const tableHeaders = [
    { key: "date", label: "التاريخ", filterType: "date" },
    { key: "type", label: "النوع", filterType: "select", options: Object.entries(TRANSACTION_TYPES).map(([id, { label }]) => ({ value: id, label })), },
    { key: "category", label: "البند", filterType: "text" }, // Category and Note are combined in search, but filter by category here
    { key: "status", label: "الحالة", filterType: "select", options: Object.entries(PAYMENT_STATUSES).map(([id, { label }]) => ({ value: id, label })), },
    { key: "amount", label: "المبلغ" },
    { key: "actions", label: "" } // For action buttons
  ];

  return (
    <>
      {/* شريط الأدوات */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4" dir="rtl">
        {/* العنوان */}
        <h2 className="text-xl font-semibold text-gray-800 mb-6">المدفوعات والإيرادات</h2>

        {/* صف الفلاتر والأزرار */}
        <div className="flex flex-wrap items-center gap-4">
          {/* البحث */}
          <div className="relative w-64">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="بحث في البند أو الملاحظات..."
              className="w-full pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>

          {/* فلتر النوع */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-w-[140px]"
          >
            <option value="all">جميع الأنواع</option>
            <option value="income">إيراد</option>
            <option value="expense">مصروف</option>
          </select>

          {/* فلتر الحالة */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-w-[140px]"
          >
            <option value="all">جميع الحالات</option>
            {Object.entries(PAYMENT_STATUSES).map(([id, { label }]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>

          {/* فلتر التاريخ */}
          <div className="flex gap-2 items-center">
            <div className="relative">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-36 pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative">
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-36 pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>

          {/* المسافة المرنة */}
          <div className="flex-grow"></div>

          {/* الأزرار */}
          <div className="flex gap-3">
            <button 
              onClick={exportCSV} 
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
            >
              <Download size={16} />
              تصدير CSV
            </button>
            <button 
              onClick={openAdd} 
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Plus size={16} />
              إضافة دفعة
            </button>
          </div>
        </div>
      </div>

      {/* الإحصائيات والجدول */}
      <div dir="rtl" className="bg-white rounded-2xl border border-gray-100 p-4">
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard title="إجمالي الإيرادات" value={fmt(summary.revenue)} />
          <StatCard title="إجمالي المصروفات" value={fmt(summary.expenses)} />
          <StatCard title="الرصيد الحالي" value={fmt(summary.balance)} />
          <StatCard title="المبلغ المستحق" value={fmt(summary.due)} />
        </div>

        {/* الجدول */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={th}>التاريخ</th>
                <th className={th}>النوع</th>
                <th className={th}>البند</th>
                <th className={th}>الحالة</th>
                <th className={th}>العملة</th>
                <th className={th}>المبلغ</th>
                <th className={th}>طريقة الدفع</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className={getRowClass(r)}>
                  <td className={td}>{r.date}</td>
                  <td className={td}>{renderType(r.type)}</td>
                  <td className={td}>
                    <div>{r.category}</div>
                    <div className="text-xs text-gray-500">{r.note}</div>
                  </td>
                  <td className={td}>{renderStatus(r.status)}</td>
                  <td className={td}>{r.currency || currency}</td>
                  <td className={`${td} font-medium ${TRANSACTION_TYPES[r.type]?.color}`}>{fmtCurrency(r.amount, r.currency || currency)}</td>
                  <td className={td}>
                    <PaymentMethodBadge method={r.payment_method} />
                  </td>
                  <td className={td}>{renderActions(r)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={8}>لا توجد نتائج.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={closeEdit}>
          <div dir="rtl" className="bg-white rounded-2xl w-full max-w-lg p-5 border border-gray-100" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editing.id ? "تعديل حركة" : "إضافة حركة"}</h3>
            
            <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">النوع</label>
                        <select value={editing.type ?? ''} onChange={e => setEditing(s => ({ ...s, type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right">
                            {Object.entries(TRANSACTION_TYPES).map(([id, { label }]) => <option key={id} value={id}>{label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">الحالة</label>
                        <select value={editing.status ?? ''} onChange={e => setEditing(s => ({ ...s, status: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right">
                            {Object.entries(PAYMENT_STATUSES).map(([id, { label }]) => <option key={id} value={id}>{label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">التاريخ</label>
                        <input type="date" value={editing.date || ""} onChange={e => setEditing(s => ({ ...s, date: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">المبلغ</label>
                        <input type="number" placeholder="0.00" value={editing.amount} onChange={e => setEditing(s => ({ ...s, amount: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-500 mb-1">البند/التصنيف</label>
                    <input type="text" placeholder="مثال: دفعة أولى" value={editing.category || ""} onChange={e => setEditing(s => ({ ...s, category: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">طريقة الدفع</label>
            <select value={editing.payment_method ?? ''} onChange={e => setEditing(s => ({ ...s, payment_method: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right">
              {PAYMENT_METHODS.map(({ id, label }) => (
                <option key={id} value={id}>{id === '' ? 'اختر طريقة الدفع' : label}</option>
              ))}
            </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">ربط بمرحلة (اختياري)</label>
                        <select value={editing.milestone_id ?? ""} onChange={e => setEditing(s => ({ ...s, milestone_id: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right">
                            <option value="">غير مرتبط</option>
                            {milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">العملة</label>
                    <select value={editing.currency ?? ''} onChange={e => setEditing(s => ({ ...s, currency: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right">
                      {/* Minimal currency list; expand as needed */}
                      <option value="">استخدام عملة المشروع</option>
                      <option value="EGP">EGP</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="SAR">SAR</option>
                    </select>
                  </div>
                  <div>
                    {/* placeholder for future extra field */}
                  </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-500 mb-1">ملاحظات</label>
                    <textarea placeholder="أي تفاصيل إضافية..." value={editing.note || ""} onChange={e => setEditing(s => ({ ...s, note: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right" rows={3}></textarea>
                </div>
            </div>
            
            {/* Attachment */}
            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-1">المرفقات</label>
              <div className="flex items-center gap-2">
                <label className="flex-grow">
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                  <div className="w-full text-sm text-center cursor-pointer p-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-dashed">
                    {editing.attachment_url ? "تغيير المرفق" : "رفع فاتورة أو إثبات"}
                  </div>
                </label>
                {editing.attachment_url && <a href={editing.attachment_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">عرض الحالي</a>}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-2 justify-start">
              <button onClick={saveEdit} className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">حفظ</button>
              {editing.id && (
                <button onClick={removeEdit} className="px-3 py-2 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100">
                  حذف
                </button>
              )}
              <button onClick={closeEdit} className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
