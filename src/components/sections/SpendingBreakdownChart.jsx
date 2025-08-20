// src/components/sections/SpendingBreakdownChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import { colors } from '../../utils/colors';
import { fmtCurrency } from '../../utils/helpers';

function SpendingBreakdownChart({ paid, remaining, paidPct, currency }) {
  return (
    <div className={`bg-[${colors.background}] p-4 rounded-xl border border-[${colors.border}] shadow-sm flex flex-col items-center justify-center`}>
      <h3 className="text-lg font-semibold mb-2">نسبة الإنفاق</h3>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{ name: "مدفوع", value: paid }, { name: "متبقي", value: remaining }]} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} stroke={colors.background} strokeWidth={4}>
                <Cell fill={colors.primary} />
                <Cell fill={colors.border} />
                <Label value={`${paidPct}%`} position="center" fontSize={28} fontWeight={700} fill={colors.textPrimary} />
            </Pie>
            <Tooltip formatter={(v) => [fmtCurrency(v, currency), ""]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SpendingBreakdownChart;