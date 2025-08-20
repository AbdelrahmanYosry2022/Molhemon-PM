// src/components/charts/SpendingOverTimeChart.jsx
import React, { useMemo } from "react";

/**
 * رسم SVG بسيط للصرف التراكمي عبر الزمن.
 * props:
 *  - payments: [{id, date:'YYYY-MM-DD', amount:number}]
 *  - currency: 'EGP' | ...
 */
export default function SpendingOverTimeChart({ payments = [], currency = "EGP", height = 220 }) {
  // جهّز بيانات: نجمع حسب التاريخ، ونحسب تراكمي
  const data = useMemo(() => {
    if (!payments?.length) return [];
    // اجمع حسب اليوم
    const byDay = payments.reduce((acc, p) => {
      if (!p?.date) return acc;
      const d = String(p.date);
      acc[d] = (acc[d] || 0) + (Number(p.amount) || 0);
      return acc;
    }, {});
    // إلى مصفوفة مرتبة بالزمن
    const rows = Object.entries(byDay)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
    // تراكمي
    let cum = 0;
    return rows.map((r) => {
      cum += r.value;
      return { ...r, cumulative: cum };
    });
  }, [payments]);

  if (!data.length) {
    return (
      <div className="h-[180px] flex items-center justify-center text-gray-500">
        لا توجد بيانات كافية لعرض الرسم البياني.
      </div>
    );
  }

  // إعدادات الرسم
  const padding = { top: 14, right: 12, bottom: 26, left: 40 };
  const width = 720; // سيتمدّد داخل الكونتينر عبر viewBox
  const h = height;
  const innerW = width - padding.left - padding.right;
  const innerH = h - padding.top - padding.bottom;

  const dates = data.map((d) => d.date);
  const minX = 0;
  const maxX = data.length - 1;

  const maxY = Math.max(...data.map((d) => d.cumulative));
  const minY = 0;

  const x = (i) => padding.left + (innerW * (i - minX)) / Math.max(1, (maxX - minX));
  const y = (v) =>
    padding.top + innerH - (innerH * (v - minY)) / Math.max(1, (maxY - minY));

  // مسار الخط
  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.cumulative)}`)
    .join(" ");

  // تظليل أسفل الخط (area)
  const areaPath =
    `M ${x(0)} ${y(0)} ` +
    data.map((d, i) => `L ${x(i)} ${y(d.cumulative)}`).join(" ") +
    ` L ${x(maxX)} ${y(0)} Z`;

  const fmt = (n) => `${Number(n).toLocaleString("en-US")} ${currency}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${h}`} className="w-full h-[${height}px]">
        {/* خلفية خفيفة */}
        <rect x="0" y="0" width={width} height={h} fill="white" />

        {/* محاور مبسّطة (Y) */}
        {Array.from({ length: 4 }).map((_, i) => {
          const v = (maxY * i) / 3;
          const yy = y(v);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={yy}
                y2={yy}
                stroke="#eef2f7"
              />
              <text
                x={padding.left - 8}
                y={yy}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="10"
                fill="#64748b"
              >
                {fmt(Math.round(v))}
              </text>
            </g>
          );
        })}

        {/* محور X (تواريخ متباعدة) */}
        {data.map((d, i) =>
          i === 0 || i === maxX || i === Math.floor(maxX / 2) ? (
            <text
              key={d.date}
              x={x(i)}
              y={h - 6}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {d.date}
            </text>
          ) : null
        )}

        {/* الـ area */}
        <path d={areaPath} fill="rgba(16,185,129,0.12)" />

        {/* خط الصرف التراكمي */}
        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" />

        {/* نقاط */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.cumulative)} r="3.5" fill="#10b981" />
          </g>
        ))}
      </svg>

      {/* ملخص صغير تحت الرسم */}
      <div className="mt-2 text-xs text-gray-600 flex items-center justify-between" dir="rtl">
        <span>إجمالي الصرف: <strong className="text-gray-800">{fmt(data.at(-1).cumulative)}</strong></span>
        <span>الفترة: {dates[0]} → {dates.at(-1)}</span>
      </div>
    </div>
  );
}
