// src/components/product/ProductGrid.tsx
import React, { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import type { Product } from "../../api/types";
import Skeleton from "../ui/Skeleton";
import Button from "../ui/Button";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gem,
  ShoppingBag,
  Heart,
} from "lucide-react";
import { getAssetUrl } from "../../utils/assetUrl";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onViewProduct?: (slug: string) => void;
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  wishlistMap?: Record<string, string>;
  showLayoutToggle?: boolean;
  show3DBadge?: boolean;
  showCategory?: boolean;
  itemsPerPage?: number;
  title?: string;
  subtitle?: string;
  emptyStateMessage?: string;
}

type SortOption = "featured" | "newest" | "popular";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ProductGrid({
  products,
  loading = false,
  onViewProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistMap,
  show3DBadge = true,
  showCategory = true,
  itemsPerPage = 12,
  title,
  subtitle,
  emptyStateMessage = "No jewellery designs found.",
}: ProductGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleSpotlightScroll = (direction: "left" | "right") => {
    if (spotlightRef.current) {
      const scrollAmount = 300;
      spotlightRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return list.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  }, [products, sortBy]);

  const heroProduct = useMemo(() => {
    if (sortedProducts.length === 0) return null;
    const featured = sortedProducts.find((p) => p.is_featured);
    return featured || sortedProducts[0];
  }, [sortedProducts]);

  const spotlightProducts = useMemo(() => {
    if (!heroProduct) return [];
    const others = sortedProducts.filter((p) => p.id !== heroProduct.id);
    return others.slice(0, 6);
  }, [sortedProducts, heroProduct]);

  const masonryProducts = useMemo(() => {
    if (!heroProduct) return sortedProducts;
    const remaining = sortedProducts.filter(
      (p) =>
        p.id !== heroProduct.id &&
        !spotlightProducts.some((s) => s.id === p.id)
    );
    return remaining;
  }, [sortedProducts, heroProduct, spotlightProducts]);

  // Safe image URL helper
  const getImage = (url: string | null | undefined) => {
    if (url) return getAssetUrl(url);
    return "/images/placeholders/jewellery-placeholder.jpg";
  };

  // ─── LOADING ────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-[4/5] lg:aspect-[3/4] rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-40 mt-6 rounded-full" />
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-48 sm:w-56 flex-shrink-0 space-y-3">
              <Skeleton className="aspect-[3/4] rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="break-inside-avoid space-y-3 mb-6">
              <Skeleton
                className={`rounded-2xl ${
                  i % 3 === 0
                    ? "aspect-[3/4]"
                    : i % 3 === 1
                    ? "aspect-[1/1]"
                    : "aspect-[4/5]"
                }`}
              />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── EMPTY ───────────────────────────────────
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-rose-100 rounded-full blur-3xl opacity-60" />
          <div className="relative h-32 w-32 rounded-full bg-white shadow-xl flex items-center justify-center">
            <Gem className="h-16 w-16 text-amber-500" />
          </div>
        </div>
        <h3 className="text-3xl font-serif font-bold text-gray-900 mb-3">
          Nothing to Show Yet
        </h3>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          {emptyStateMessage}
        </p>
        <Button
          variant="outline"
          className="mt-8 rounded-full border-gray-300 px-8 py-3 text-gray-700 hover:border-amber-500 hover:text-amber-600 transition-colors"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* ─── HEADER & CONTROLS ────────────────── */}
      {(title || subtitle) && (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            {title && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 tracking-tight leading-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 text-lg text-gray-500 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 self-end">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none rounded-full border border-gray-200 bg-white pl-5 pr-10 py-3 text-sm font-medium text-gray-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 hover:border-gray-300 transition-colors cursor-pointer shadow-sm"
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

      {/* ─── HERO (no price) ─────────────────── */}
      {heroProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-gradient-to-br from-amber-50/80 to-white rounded-3xl p-6 lg:p-10 shadow-lg shadow-amber-100/20 border border-amber-100/50"
        >
          <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={getImage(heroProduct.primary_image)}
              alt={heroProduct.title}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-40" />
            {heroProduct.is_featured && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-amber-800 shadow">
                <Sparkles className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                Featured Design
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 leading-tight">
              {heroProduct.title}
            </h3>
            {heroProduct.short_description && (
              <p className="text-gray-600 leading-relaxed text-lg">
                {heroProduct.short_description}
              </p>
            )}
            {/* Rating only, no price */}
            {heroProduct.rating && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span className="text-amber-500 font-semibold">
                  {heroProduct.rating.toFixed(1)}
                </span>
                <span className="text-gray-400">
                  ({heroProduct.reviews_count || 0} reviews)
                </span>
              </div>
            )}
            <div className="flex gap-4 pt-4">
              <Button
                variant="primary"
                className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-200/50 hover:from-amber-600 hover:to-amber-700 transition-all"
                onClick={() =>
                  onViewProduct &&
                  heroProduct.slug &&
                  onViewProduct(heroProduct.slug)
                }
                icon={<ShoppingBag className="h-5 w-5" />}
              >
                View Details
              </Button>
              {onToggleWishlist && (
                <Button
                  variant="outline"
                  className="rounded-full border-amber-200 px-6 py-3.5 text-amber-700 hover:bg-amber-50 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(heroProduct.id);
                  }}
                  icon={
                    <Heart
                      className={`h-5 w-5 ${
                        wishlistMap?.[heroProduct.id]
                          ? "fill-current text-rose-500"
                          : ""
                      }`}
                    />
                  }
                >
                  {wishlistMap?.[heroProduct.id] ? "Saved" : "Save"}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── SPOTLIGHT ───────────────────────────── */}
      {spotlightProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-gray-900">
              Spotlight on New Arrivals
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleSpotlightScroll("left")}
                className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleSpotlightScroll("right")}
                className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div
            ref={spotlightRef}
            className="flex gap-5 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x snap-mandatory"
          >
            {spotlightProducts.map((product) => (
              <div
                key={product.id}
                className="w-[65%] sm:w-[45%] lg:w-[30%] xl:w-[25%] flex-shrink-0 snap-center"
              >
                <ProductCard
                  product={product}
                  onView={onViewProduct}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={!!wishlistMap?.[product.id]}
                  layout="grid"
                  show3DBadge={show3DBadge}
                  showCategory={showCategory}
                  showPrice={false}          // ← NO PRICE
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── MASONRY ─────────────────────────────── */}
      {masonryProducts.length > 0 && (
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {(!heroProduct || spotlightProducts.length > 0) && (
            <h3 className="text-2xl font-serif font-bold text-gray-900">
              {heroProduct ? "Explore the Collection" : "All Designs"}
            </h3>
          )}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
            {masonryProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="break-inside-avoid"
              >
                <ProductCard
                  product={product}
                  onView={onViewProduct}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={!!wishlistMap?.[product.id]}
                  layout="grid"
                  show3DBadge={show3DBadge}
                  showCategory={showCategory}
                  showPrice={false}          // ← NO PRICE
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Expert help CTA */}
      <div className="text-center pt-8 border-t border-gray-100">
        <p className="text-gray-500 text-lg">
          Need help choosing the perfect piece?{" "}
          <a
            href="/contact"
            className="font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
          >
            Talk to our jewellery expert →
          </a>
        </p>
      </div>
    </div>
  );
}