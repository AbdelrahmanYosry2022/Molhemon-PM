// src/components/ui/Pill.jsx
import React from 'react';
import { colors } from '../../utils/colors';

const Pill = ({ icon: Icon, children, className = "" }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-[${colors.infoMuted}] text-[${colors.info}] ${className}`}>
    {Icon && <Icon size={14} />}{children}
  </span>
);

export default Pill;