// src/components/product/PriceTag.tsx
import React, { useState } from "react";
import {
  Sparkles,
  Tag,
  TrendingUp,
  Award,
  Gem,
  PhoneCall,
  CalendarCheck,
} from "lucide-react";
import LeadForm from "../leads/LeadForm";          // <-- ADDED

type PricingMode = "public" | "on_request" | "private";

interface PriceTagProps {
  price?: number;
  currency?: string;
  per?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSymbol?: boolean;
  discount?: number;
  originalPrice?: number;
  showPerUnit?: boolean;
  color?: "default" | "amber" | "rose" | "emerald" | "purple";

  /** IMPORTANT */
  pricingMode?: PricingMode; // default: "on_request"

  /** NEW: product interest (e.g., product title) to pre‑fill in lead form */
  productInterest?: string;
}

const currencySymbolMap: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const sizeClasses = {
  sm: { price: "text-lg", currency: "text-sm", unit: "text-xs", discount: "text-xs" },
  md: { price: "text-xl", currency: "text-base", unit: "text-sm", discount: "text-sm" },
  lg: { price: "text-2xl", currency: "text-lg", unit: "text-base", discount: "text-sm" },
  xl: { price: "text-3xl", currency: "text-xl", unit: "text-lg", discount: "text-base" },
};

const colorClasses = {
  default: {
    price: "text-gray-900",
    currency: "text-gray-700",
    unit: "text-gray-500",
    discount: "text-rose-600 bg-rose-50",
    original: "text-gray-400",
  },
  amber: {
    price: "text-amber-700",
    currency: "text-amber-600",
    unit: "text-amber-500",
    discount: "text-emerald-600 bg-emerald-50",
    original: "text-amber-400",
  },
  rose: {
    price: "text-rose-700",
    currency: "text-rose-600",
    unit: "text-rose-500",
    discount: "text-emerald-600 bg-emerald-50",
    original: "text-rose-400",
  },
  emerald: {
    price: "text-emerald-700",
    currency: "text-emerald-600",
    unit: "text-emerald-500",
    discount: "text-rose-600 bg-rose-50",
    original: "text-emerald-400",
  },
  purple: {
    price: "text-purple-700",
    currency: "text-purple-600",
    unit: "text-purple-500",
    discount: "text-emerald-600 bg-emerald-50",
    original: "text-purple-400",
  },
};

export default function PriceTag({
  price = 0,
  currency = "INR",
  per = "piece",
  className = "",
  size = "md",
  showSymbol = true,
  discount,
  originalPrice,
  showPerUnit = true,
  color = "default",
  pricingMode = "on_request",
  productInterest = "",                              // <-- NEW prop
}: PriceTagProps) {
  const symbol = currencySymbolMap[currency] || currency;
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];

  // ADDED state for LeadForm modal
  const [showLeadForm, setShowLeadForm] = useState(false);

  // ADDED handler for Request Price button
  const handleRequestPrice = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering parent card click
    setShowLeadForm(true);
  };

  /* ======================================================
     🚫 PRICE HIDDEN MODE (JEWELLERY STANDARD)
  ====================================================== */
  if (pricingMode !== "public") {
    return (
      <>
        <div className={`space-y-4 ${className}`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-800">
              Price available on request
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRequestPrice}            // <-- MODIFIED
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-black text-sm font-semibold hover:bg-gray-900 transition"
            >
              <PhoneCall className="h-4 w-4" />
              Request Price
            </button>

            {/* You can add a second button here if needed */}
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Diamond prices vary based on carat, clarity, color, cut and
            certification. Our jewellery advisor will assist you with the best
            available options.
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Gem className="h-3 w-3 text-amber-500" />
            Certified diamonds • Transparent pricing • Best value assurance
          </div>
        </div>

        {/* ADDED LeadForm modal */}
        <LeadForm
          isOpen={showLeadForm}
          onClose={() => setShowLeadForm(false)}
          productInterest={productInterest}
          initialMessage={
            productInterest
              ? `I am interested in "${productInterest}". Please provide price details.`
              : "I would like to request pricing for this item."
          }
        />
      </>
    );
  }

  /* ======================================================
     ✅ PUBLIC PRICE MODE (ADMIN / GOLD RATE / B2B)
  ====================================================== */

  const formattedPrice = price.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

  const discountPercentage =
    discount ||
    (originalPrice
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined);

  return (
    <div className={`space-y-2 ${className}`}>
      {discountPercentage && discountPercentage > 0 && (
        <div className="inline-flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full font-medium ${sizeClass.discount} ${colorClass.discount}`}
          >
            {discountPercentage}% OFF
          </span>
          {originalPrice && (
            <span
              className={`line-through ${sizeClass.discount} ${colorClass.original}`}
            >
              {symbol}
              {originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        {showSymbol && (
          <span
            className={`font-medium ${sizeClass.currency} ${colorClass.currency}`}
          >
            {symbol}
          </span>
        )}

        <span
          className={`font-bold tracking-tight ${sizeClass.price} ${colorClass.price}`}
        >
          {formattedPrice}
        </span>

        {showPerUnit && (
          <span className={`ml-2 ${sizeClass.unit} ${colorClass.unit}`}>
            per {per}
          </span>
        )}
      </div>
    </div>
  );
}