import React from "react";

interface PriceTagProps {
  price: number;
  currency?: string; // "INR", "₹", etc.
  per?: string; // "piece", "set", etc.
  className?: string;
}

const currencySymbolMap: Record<string, string> = {
  INR: "₹",
  USD: "$",
};

export default function PriceTag({
  price,
  currency = "INR",
  per = "piece",
  className = "",
}: PriceTagProps) {
  const symbol = currencySymbolMap[currency] || currency;

  return (
    <div className={`flex items-baseline justify-center gap-2 ${className}`}>
      <div className="text-lg font-semibold text-slate-900">
        {symbol}
        {price.toLocaleString("en-IN")}
      </div>
      {per && <span className="text-xs text-slate-500">/ {per}</span>}
    </div>
  );
}
