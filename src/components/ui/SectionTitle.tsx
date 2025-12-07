// components/ui/SectionTitle.tsx
import React from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}

export default function SectionTitle({
  title,
  subtitle,
  align = "center",
}: SectionTitleProps) {
  const alignClass =
    align === "center"
      ? "items-center text-center"
      : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignClass} gap-2 mb-10`}>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 font-['Playfair_Display']">
        {title}
      </h2>

      {subtitle && (
        <p className="max-w-xl text-sm text-slate-500 leading-relaxed">
          {subtitle}
        </p>
      )}

      <div className="mt-2 h-1.5 w-28 rounded-full bg-gradient-to-r from-[#FF1493] via-[#FF3CA0] to-[#FFD700] shadow-sm shadow-rose-300/40" />
    </div>
  );
}
