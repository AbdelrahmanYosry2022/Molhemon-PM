import React from 'react';

export function Badge({ children, variant = "default", className = "", ...props }) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    secondary: "bg-blue-100 text-blue-800",
    outline: "border border-gray-200 text-gray-700"
  };

  return (
    <span 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
