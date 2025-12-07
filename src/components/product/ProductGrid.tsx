// src/components/product/ProductGrid.tsx
import React from "react";
import ProductCard from "./ProductCard";
import type { Product } from "../../api/types";
import Skeleton from "../ui/Skeleton";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onViewProduct?: (slug: string) => void;
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  /** product_id -> wishlist_item_id */
  wishlistMap?: Record<string, string>;
}

export default function ProductGrid({
  products,
  loading = false,
  onViewProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistMap,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center text-sm text-slate-500">
        No products found. Please check back soon.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          onView={onViewProduct}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={!!wishlistMap?.[p.id]}
        />
      ))}
    </div>
  );
}
