import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import type { Product } from "../../api/types";
import Skeleton from "../ui/Skeleton";
import Button from "../ui/Button";
import {
  Grid,
  List,
  ChevronDown,
  Sparkles,
  Gem,
} from "lucide-react";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onViewProduct?: (slug: string) => void;
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  wishlistMap?: Record<string, string>;
  layout?: "grid" | "list" | "auto";
  columns?: 2 | 3 | 4 | 5;
  showLayoutToggle?: boolean;
  show3DBadge?: boolean;
  showCategory?: boolean;
  itemsPerPage?: number;
  title?: string;
  subtitle?: string;
  emptyStateMessage?: string;
}

type SortOption = "featured" | "newest" | "popular";

export default function ProductGrid({
  products,
  loading = false,
  onViewProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistMap,
  layout = "auto",
  columns = 4,
  showLayoutToggle = true,
  show3DBadge = true,
  showCategory = true,
  itemsPerPage = 12,
  title,
  subtitle,
  emptyStateMessage = "No jewellery designs found.",
}: ProductGridProps) {
  const [currentLayout, setCurrentLayout] = useState<"grid" | "list">(
    layout === "auto" ? "grid" : layout
  );
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // Responsive grid columns (predictable, no overlap)
  const gridCols = useMemo(() => {
    if (currentLayout === "list") return "grid-cols-1";
    switch (columns) {
      case 2: return "grid-cols-2";
      case 3: return "grid-cols-2 sm:grid-cols-3";
      case 4: return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
      case 5: return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      default: return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
    }
  }, [currentLayout, columns]);

  // Sorting logic (jewellery‑friendly)
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === "newest") {
      return list.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    }
    if (sortBy === "popular") {
      return list.sort(
        (a, b) => (b.rating || 0) - (a.rating || 0)
      );
    }
    // featured: show featured first, then others (preserve original order)
    return list.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  }, [products, sortBy]);

  // Loading skeleton
  if (loading) {
    return (
      <div className={`grid ${gridCols} gap-6`}>
        {Array.from({ length: itemsPerPage }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state – clean and friendly
  if (!products || products.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 shadow-inner">
          <Gem className="h-10 w-10 text-gray-500" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          No Designs Found
        </h3>
        <p className="text-gray-600">{emptyStateMessage}</p>
        <Button
          variant="outline"
          className="mt-8 rounded-full border-gray-300 px-6 py-2 text-gray-700 hover:border-amber-500 hover:text-amber-600"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with title, subtitle, and controls */}
      {(title || subtitle || showLayoutToggle) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600 mt-1 text-lg">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
{/* Layout toggle (grid/list) */}
{showLayoutToggle && (
  <div className="inline-flex rounded-full bg-white p-1 shadow-inner">
    <button
      onClick={() => setCurrentLayout("grid")}
      className={`h-12 w-20 flex items-center justify-center rounded-full transition-all duration-200 ${
        currentLayout === "grid"
          ? "bg-white shadow text-amber-600"
          : "text-gray-700 hover:text-gray-900 hover:bg-gray-300"
      }`}
      aria-label="Grid view"
    >
      <Grid className="h-5 w-5" />
    </button>
    <button
      onClick={() => setCurrentLayout("list")}
      className={`h-12 w-20 flex items-center justify-center rounded-full transition-all duration-200 ${
        currentLayout === "list"
          ? "bg-white shadow text-amber-600"
          : "text-gray-700 hover:text-gray-900 hover:bg-gray-300"
      }`}
      aria-label="List view"
    >
      <List className="h-5 w-5" />
    </button>
  </div>
)}

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none rounded-full border border-gray-300 bg-white pl-5 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 hover:border-gray-400 transition-colors cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">New Arrivals</option>
                <option value="popular">Most Popular</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Product grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`grid ${gridCols} gap-6 lg:gap-8`}
      >
        {sortedProducts.slice(0, itemsPerPage).map((product) => (
          <div key={product.id} className="min-w-0">
            <ProductCard
              product={product}
              onView={onViewProduct}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={!!wishlistMap?.[product.id]}
              layout={currentLayout}
              show3DBadge={show3DBadge}
              showCategory={showCategory}
            />
          </div>
        ))}
      </motion.div>

      {/* Footer help – simple, visible */}
      <div className="text-center pt-6 text-base text-gray-600 border-t border-gray-100">
        Need help choosing the perfect piece?{" "}
        <a
          href="/contact"
          className="font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
        >
          Talk to our jewellery expert →
        </a>
      </div>
    </div>
  );
}