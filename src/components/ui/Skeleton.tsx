// components/ui/Skeleton.tsx
import React from "react";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`
        animate-pulse bg-gradient-to-r 
        from-slate-200/70 via-slate-100/60 to-slate-200/70
        rounded-xl shadow-inner ${className}
      `}
    />
  );
}
