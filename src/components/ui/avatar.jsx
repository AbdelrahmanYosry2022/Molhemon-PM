import React from 'react';

export function Avatar({ children, className = "", ...props }) {
  return (
    <div 
      className={`relative inline-block rounded-full overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt, className = "", ...props }) {
  return (
    <img 
      src={src} 
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      {...props}
    />
  );
}

export function AvatarFallback({ children, className = "", ...props }) {
  return (
    <div 
      className={`w-full h-full flex items-center justify-center bg-gray-200 text-gray-700 font-semibold ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
