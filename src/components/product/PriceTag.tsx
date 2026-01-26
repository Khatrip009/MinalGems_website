import React from "react";
import { Sparkles, Tag, TrendingUp, Award, Gem } from "lucide-react";

interface PriceTagProps {
  price: number;
  currency?: string; // "INR", "₹", etc.
  per?: string; // "piece", "set", etc.
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSymbol?: boolean;
  discount?: number;
  originalPrice?: number;
  showPerUnit?: boolean;
  color?: "default" | "amber" | "rose" | "emerald" | "purple";
}

const currencySymbolMap: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const sizeClasses = {
  sm: {
    price: "text-lg md:text-xl",
    currency: "text-sm",
    unit: "text-xs",
    discount: "text-xs",
  },
  md: {
    price: "text-xl md:text-2xl",
    currency: "text-base",
    unit: "text-sm",
    discount: "text-sm",
  },
  lg: {
    price: "text-2xl md:text-3xl",
    currency: "text-lg",
    unit: "text-base",
    discount: "text-sm",
  },
  xl: {
    price: "text-3xl md:text-4xl",
    currency: "text-xl",
    unit: "text-lg",
    discount: "text-base",
  },
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
  price,
  currency = "INR",
  per = "piece",
  className = "",
  size = "md",
  showSymbol = true,
  discount,
  originalPrice,
  showPerUnit = true,
  color = "default",
}: PriceTagProps) {
  const symbol = currencySymbolMap[currency] || currency;
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];

  // Format price with Indian number system
  const formattedPrice = price.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  // Calculate discount percentage if not provided but originalPrice is
  const discountPercentage = discount || (originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : undefined
  );

  // Check if it's a special price (new arrival, trending, etc.)
  const isSpecialPrice = price > 50000;
  const isTrending = price > 100000;
  const isPremium = price > 250000;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Discount Badge */}
      {discountPercentage && discountPercentage > 0 && (
        <div className="inline-flex items-center gap-1.5">
          <div className={`px-2 py-1 rounded-full font-medium ${sizeClass.discount} ${colorClass.discount}`}>
            {discountPercentage}% OFF
          </div>
          {originalPrice && (
            <span className={`line-through ${sizeClass.discount} ${colorClass.original}`}>
              {symbol}{originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      )}

      {/* Main Price Display */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-2">
        <div className="flex items-baseline gap-2">
          {/* Special Price Badge */}
          {isPremium ? (
            <div className="flex items-center gap-1.5 mr-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500">
                <Award className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                Premium
              </span>
            </div>
          ) : isTrending ? (
            <div className="flex items-center gap-1.5 mr-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-rose-400 to-pink-500">
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">
                Trending
              </span>
            </div>
          ) : isSpecialPrice ? (
            <div className="flex items-center gap-1.5 mr-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-green-500">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                Special
              </span>
            </div>
          ) : null}

          {/* Currency Symbol */}
          {showSymbol && (
            <span className={`font-medium ${sizeClass.currency} ${colorClass.currency}`}>
              {symbol}
            </span>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className={`font-bold tracking-tight ${sizeClass.price} ${colorClass.price}`}>
              {formattedPrice}
            </span>
            
            {/* Decimal if needed */}
            {price % 1 !== 0 && (
              <span className={`font-medium ${sizeClass.currency} ${colorClass.currency}`}>
                .{(price % 1).toFixed(2).slice(2)}
              </span>
            )}
          </div>
        </div>

        {/* Per Unit & Currency Code */}
        <div className="flex items-center gap-2">
          {showPerUnit && per && (
            <div className="flex items-center gap-1">
              <div className="h-0.5 w-2 bg-gray-300" />
              <span className={`font-medium ${sizeClass.unit} ${colorClass.unit}`}>
                per {per}
              </span>
            </div>
          )}
          
          {/* Currency Code */}
          <div className={`px-2 py-1 rounded-lg bg-gray-100 ${sizeClass.unit} text-gray-600`}>
            {currency}
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      {price > 10000 && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-1">Payment Options</div>
          <div className="flex flex-wrap gap-2">
            {/* EMI Calculator */}
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
              <span className="text-xs font-medium text-blue-700">EMI from</span>
              <span className="text-xs font-bold text-blue-900">
                {symbol}{Math.round(price / 12).toLocaleString("en-IN")}/mo
              </span>
            </div>
            
            {/* Cash Discount */}
            {discountPercentage && (
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg">
                <Tag className="h-3 w-3 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">
                  Save {symbol}{((originalPrice || price) * (discountPercentage / 100)).toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tax Info */}
      <div className="mt-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Gem className="h-3 w-3 text-amber-500" />
            <span>Includes making charges</span>
          </div>
        </div>
        
        {/* Price Comparison (for high-value items) */}
        {price > 50000 && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-800">Market Value</p>
                <p className="text-sm font-semibold text-amber-900">
                  {symbol}{(price * 1.15).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-emerald-800">You Save</p>
                <p className="text-sm font-semibold text-emerald-900">
                  {symbol}{(price * 0.15).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Price Guarantee */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 flex items-center justify-center">
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Best Price Guarantee</p>
            <p className="text-xs text-gray-500">
              Found a lower price elsewhere? We'll match it and give you an extra 5% off.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}