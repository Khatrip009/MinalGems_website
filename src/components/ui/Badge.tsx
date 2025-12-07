// components/ui/Badge.tsx
import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full 
        border border-rose-400/40 
        bg-gradient-to-r from-rose-50/80 via-white/40 to-amber-50/60
        backdrop-blur-sm
        px-3 py-1 
        text-[10px] font-semibold uppercase tracking-[0.22em]
        text-rose-600 shadow-sm shadow-rose-200/40
        ${className}
      `}
    >
      {children}
    </span>
  );
}
