// src/components/ui/StatCard.jsx
import React from 'react';
import { colors } from '../../utils/colors';

const StatCard = ({ title, value, icon: Icon }) => (
    <div className={`bg-[${colors.surface}] p-4 rounded-xl border border-[${colors.border}]`}>
        <div className={`flex items-center gap-2 text-[${colors.textSecondary}] mb-1`}>
            <Icon size={16} style={{ color: colors.primary }} />
            <span className="text-sm font-medium">{title}</span>
        </div>
        <p className={`text-2xl font-bold text-[${colors.textPrimary}]`}>{value}</p>
    </div>
);

export default StatCard;