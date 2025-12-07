import React from "react";

interface RatingStarsProps {
  rating: number; // 0–5
  count?: number; // number of reviews
  className?: string;
}

export default function RatingStars({
  rating,
  count,
  className = "",
}: RatingStarsProps) {
  const fullStars = Math.round(rating);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < fullStars;
        return (
          <svg
            key={i}
            className={`h-4 w-4 ${
              filled ? "text-yellow-400" : "text-slate-300"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.09 3.355a1 1 0 00.95.69h3.523c.969 0 1.371 1.24.588 1.81l-2.852 2.073a1 1 0 00-.364 1.118l1.09 3.355c.3.921-.755 1.688-1.54 1.118L10 13.348l-2.936 2.009c-.784.57-1.838-.197-1.539-1.118l1.09-3.355a1 1 0 00-.364-1.118L3.399 8.782c-.783-.57-.38-1.81.588-1.81h3.523a1 1 0 00.95-.69l1.09-3.355z" />
          </svg>
        );
      })}
      {typeof count === "number" && (
        <span className="ml-1 text-xs text-slate-500">({count})</span>
      )}
    </div>
  );
}
