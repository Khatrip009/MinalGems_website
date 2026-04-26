// src/components/product/ProductCard.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import PriceTag from "./PriceTag";
import RatingStars from "./RatingStars";
import Button from "../ui/Button";
import type { Product } from "../../api/types";
import {
  Heart,
  Eye,
  ShoppingBag,
  Sparkles,
  Crown,
  CheckCircle,
  ChevronRight,
  Star,
} from "lucide-react";
import { getAssetUrl } from "@/utils/assetUrl";

interface ProductCardProps {
  product: Product;
  onView?: (slug: string) => void;
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  isWishlisted?: boolean;
  show3DBadge?: boolean;
  showCategory?: boolean;
  layout?: "grid" | "list";
}

// Quick 3D URL check
const is3DModel = (url: string | null): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".glb") ||
    lower.endsWith(".gltf") ||
    lower.includes("model3d") ||
    lower.includes("3d-model")
  );
};

export default function ProductCard({
  product,
  onView,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  show3DBadge = true,
  showCategory = false,
  layout = "grid",
}: ProductCardProps) {
  const {
    id,
    slug,
    title,
    short_description,
    price,
    currency,
    primary_image,
    model_3d_url,
    category,
    tags,
    rating,
    reviews_count,
  } = product;

  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [wishlistAnimating, setWishlistAnimating] = useState(false);

  const has3D = model_3d_url ? is3DModel(model_3d_url) : false;
  const isPremium = price > 250000;
  const isNew = tags?.includes("new") || false;
  const isBestSeller = tags?.includes("bestseller") || false;

  // Handlers
  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      setWishlistAnimating(true);
      onToggleWishlist(id);
      setTimeout(() => setWishlistAnimating(false), 300);
    }
  };

  const addToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(id);
  };

  const quickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) onView(slug);
  };

  // Image URL (safe fallback)
  const imageUrl = primary_image
    ? getAssetUrl(primary_image)
    : has3D
      ? "/images/placeholders/3d-placeholder.jpg"
      : "/images/placeholders/jewellery-placeholder.jpg";

  // ───────── GRID LAYOUT (mobile‑first) ─────────
  if (layout === "grid") {
    return (
      <motion.article
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:shadow-amber-100/30 transition-shadow duration-300"
        whileHover={{ y: -4 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onView && onView(slug)}
      >
        {/* Image */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-amber-50/20 to-white">
          <img
            src={imageUrl}
            alt={title}
            className={`h-full w-full object-cover transition duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } group-hover:scale-105`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-100" />
          )}

          {/* Badges (top‑left) */}
          <div className="absolute left-2 top-2 z-20 flex flex-col gap-1 sm:left-3 sm:top-3">
            {isPremium && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 px-2 py-0.5 text-[0.65rem] font-bold text-white shadow">
                <Crown className="h-3 w-3" /> Premium
              </span>
            )}
            {isNew && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 px-2 py-0.5 text-[0.65rem] font-bold text-white shadow">
                <Sparkles className="h-3 w-3" /> New
              </span>
            )}
            {isBestSeller && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-2 py-0.5 text-[0.65rem] font-bold text-white shadow">
                <Star className="h-3 w-3 fill-white" /> Bestseller
              </span>
            )}
            {show3DBadge && has3D && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-0.5 text-[0.65rem] font-bold text-white shadow">
                3D
              </span>
            )}
          </div>

          {/* Wishlist button (top‑right) – large touch target */}
          {onToggleWishlist && (
            <motion.button
              onClick={toggleWishlist}
              className={`absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm shadow transition ${
                isWishlisted
                  ? "border-rose-300 bg-rose-50 text-rose-600"
                  : "border-white/60 bg-white/30 text-gray-700 hover:bg-white hover:text-rose-500"
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart
                className={`h-5 w-5 ${
                  isWishlisted ? "fill-current scale-110" : ""
                } ${wishlistAnimating ? "animate-ping" : ""}`}
              />
            </motion.button>
          )}

          {/* Category badge (bottom‑left) */}
          {showCategory && category && (
            <div className="absolute bottom-2 left-2 z-20">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-700 backdrop-blur shadow">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-3 sm:p-4">
          {/* Title */}
          <h3 className="font-serif text-base font-bold leading-snug text-gray-900 line-clamp-1 group-hover:text-amber-700 transition-colors sm:text-lg">
            {title}
          </h3>

          {/* Short description */}
          {short_description && (
            <p className="mt-1 line-clamp-2 text-xs text-gray-500 sm:text-sm">
              {short_description}
            </p>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[0.65rem] font-medium text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Rating */}
          <div className="mt-2">
            <RatingStars
              rating={rating || 0}
              count={reviews_count || 0}
              size="sm"
              showCount={true}
            />
          </div>

          {/* Spacer */}
          <div className="mt-auto" />

          {/* Price & Add to Cart */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-[0.65rem] uppercase tracking-wider text-gray-400">Price</span>
              <PriceTag
                price={price}
                currency={currency}
                per="piece"
                size="lg"
                color="amber"
                showSymbol={true}
              />
            </div>
            <Button
              variant="primary"
              className="w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-200/50 hover:from-amber-600 hover:to-amber-700 active:scale-95 sm:w-auto sm:py-2"
              onClick={addToCart}
              icon={<ShoppingBag className="h-4 w-4" />}
            >
              Add
            </Button>
          </div>

          {/* View Details (subtle) */}
          <div className="mt-3 border-t border-gray-100 pt-3 text-center">
            <button
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-amber-600 transition-colors"
              onClick={quickView}
            >
              View Details
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom animated line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 transition-transform duration-500 group-hover:scale-x-100" />
      </motion.article>
    );
  }

  // ───────── LIST LAYOUT (horizontal) ─────────
  return (
    <motion.article
      className="group relative flex overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:shadow-amber-100/30 transition-shadow duration-300"
      whileHover={{ x: 4 }}
      onClick={() => onView && onView(slug)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image (40% on mobile, 1/3 on larger) */}
      <div className="relative w-[40%] flex-shrink-0 overflow-hidden bg-gradient-to-br from-amber-50/20 to-white sm:w-1/3">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:opacity-0 transition" />

        {/* Badges */}
        <div className="absolute left-1 top-1 z-20 flex flex-col gap-0.5 sm:left-2 sm:top-2">
          {isNew && (
            <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[0.6rem] font-bold text-white shadow">
              NEW
            </span>
          )}
          {show3DBadge && has3D && (
            <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[0.6rem] font-bold text-white shadow">
              3D
            </span>
          )}
        </div>

        {/* Wishlist */}
        {onToggleWishlist && (
          <motion.button
            onClick={toggleWishlist}
            className={`absolute right-1 top-1 z-20 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-sm shadow transition sm:right-2 sm:top-2 sm:h-9 sm:w-9 ${
              isWishlisted
                ? "border-rose-300 bg-rose-50 text-rose-500"
                : "border-gray-200/50 bg-white/60 text-gray-600 hover:text-rose-500"
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""} ${wishlistAnimating ? "animate-ping" : ""}`} />
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-5">
        <div>
          {showCategory && category && (
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 sm:mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {category}
            </span>
          )}
          <h3 className="font-serif text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-amber-700 transition-colors sm:text-lg">
            {title}
          </h3>
          {short_description && (
            <p className="mt-1 line-clamp-2 text-xs text-gray-500 sm:text-sm">
              {short_description}
            </p>
          )}
          {tags && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[0.6rem] font-medium text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-[0.65rem] text-gray-500 sm:text-xs">
            {has3D && (
              <span className="inline-flex items-center gap-1 text-blue-600">
                <Sparkles className="h-3 w-3" /> 3D Available
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle className="h-3 w-3" /> Hallmarked
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <RatingStars
              rating={rating || 0}
              count={reviews_count || 0}
              size="sm"
              showCount={true}
            />
            <PriceTag
              price={price}
              currency={currency}
              per="piece"
              size="lg"
              color="amber"
              showSymbol={true}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-full border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 active:scale-95 sm:px-4 sm:text-sm"
              onClick={quickView}
              icon={<Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
            >
              Details
            </Button>
            <Button
              variant="primary"
              className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-amber-200/50 hover:from-amber-600 hover:to-amber-700 active:scale-95 sm:px-4 sm:text-sm"
              onClick={addToCart}
              icon={<ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Right‑edge arrow (desktop only) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:block">
        <div className="rounded-l-full bg-gradient-to-r from-amber-400 to-amber-500 p-2 text-white shadow-lg">
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </motion.article>
  );
}