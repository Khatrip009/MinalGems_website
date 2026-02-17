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
  Tag,
  Crown,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

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

// Check if URL points to a 3D model
const is3DModel = (url: string | null): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.endsWith(".glb") ||
    lowerUrl.endsWith(".gltf") ||
    lowerUrl.includes("model3d") ||
    lowerUrl.includes("3d-model")
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
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false);

  const has3DModel = model_3d_url ? is3DModel(model_3d_url) : false;
  const isPremium = price > 250000;
  const isNew = tags?.includes("new") || false;
  const isBestSeller = tags?.includes("bestseller") || false;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      setIsWishlistAnimating(true);
      onToggleWishlist(id);
      setTimeout(() => setIsWishlistAnimating(false), 300);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) onView(slug);
  };

  const getImageUrl = () => {
    if (primary_image) return primary_image;
    if (has3DModel) return "/images/placeholders/3d-placeholder.jpg";
    return "/images/placeholders/jewellery-placeholder.jpg";
  };

  // Grid layout (default)
  if (layout === "grid") {
    return (
      <motion.article
        className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg shadow-gray-900/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
        whileHover={{ y: -8 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onView && onView(slug)}
      >
        {/* Premium crown badge */}
        {isPremium && (
          <div className="absolute left-4 top-4 z-30">
            <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 px-3 py-1.5 text-white shadow-lg">
              <Crown className="h-3 w-3" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Premium
              </span>
            </div>
          </div>
        )}

        {/* Status badges (top right) */}
        <div className="absolute right-4 top-4 z-30 flex flex-col gap-2">
          {isNew && (
            <div className="rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              NEW
            </div>
          )}
          {isBestSeller && (
            <div className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              BESTSELLER
            </div>
          )}
          {show3DBadge && has3DModel && (
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              3D VIEW
            </div>
          )}
        </div>

        {/* Image container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={getImageUrl()}
            alt={title}
            className={`h-full w-full object-cover transition-all duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } ${isHovered ? "scale-110" : "scale-100"}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Image loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300" />
          )}

          {/* Dark gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Quick action overlay (appears on hover) */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-all duration-300 ${
              isHovered ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            
          </div>

        {/* Wishlist button – always visible, high contrast */}
{onToggleWishlist && (
  <button
    type="button"
    onClick={handleToggleWishlist}
    className={`
      absolute left-4 top-4 z-40 flex h-14 w-14 items-center justify-center
      rounded-full shadow-lg backdrop-blur-sm transition-all duration-300
      hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50
      ${
        isWishlisted
          ? "border border-rose-200 bg-rose-50/90 text-rose-500"
          : "border border-gray-200 bg-white/90 text-gray-800 hover:border-rose-200 hover:bg-white hover:text-rose-500"
      }
    `}
    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
  >
    <Heart
      className={`
        h-7 w-7 transition-all
        ${isWishlisted ? "scale-110 fill-rose-500" : "stroke-[1.5px]"}
        ${isWishlistAnimating ? "animate-ping" : ""}
      `}
    />
  </button>
)}

          {/* Category badge (optional) */}
          {showCategory && category && (
            <div className="absolute bottom-4 left-4 z-30">
              <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-sm">
                <Tag className="h-3 w-3 text-amber-600" />
                <span className="text-xs font-medium text-gray-900">{category}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="mb-2 line-clamp-1 font-['Playfair_Display'] text-xl font-bold text-gray-900 transition-colors group-hover:text-amber-700 md:text-2xl">
            {title}
          </h3>

          {short_description && (
            <p className="mb-3 line-clamp-2 text-sm text-gray-700 md:text-base">
              {short_description}
            </p>
          )}

          {tags && tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mb-3">
            <RatingStars
              rating={rating || 0}
              count={reviews_count || 0}
              size="sm"
              showCount={true}
            />
          </div>

          <div className="mt-auto">
            <div className="mb-3">
              <PriceTag
                price={price}
                currency={currency}
                per="piece"
                size="lg"
                color="amber"
                showSymbol={true}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 md:text-base"
                onClick={handleAddToCart}
                icon={<ShoppingBag className="h-4 w-4" />}
              >
                Add to Cart
              </Button>
              <Button
                variant="ghost"
                className="flex-1 rounded-full bg-grey py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/25  md:text-base"
                onClick={() => onView && onView(slug)}
                icon={<ChevronRight className="h-5 w-5" />}
                aria-label="View details"
              >
                View Details
                </Button>
            </div>
          </div>
        </div>

        {/* Bottom accent line on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-1 scale-x-0 bg-gradient-to-r from-amber-400 to-amber-600 transition-transform duration-500 group-hover:scale-x-100" />
      </motion.article>
    );
  }

  // List layout
  return (
    <motion.article
      className="group relative flex overflow-hidden rounded-3xl bg-white shadow-lg shadow-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      whileHover={{ x: 4 }}
      onClick={() => onView && onView(slug)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container (1/3 width) */}
      <div className="relative w-1/3 flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={getImageUrl()}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Status badges */}
        <div className="absolute left-3 top-3 z-20 flex flex-col gap-2">
          {isNew && (
            <div className="rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-white">
              NEW
            </div>
          )}
          {show3DBadge && has3DModel && (
            <div className="rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white">
              3D
            </div>
          )}
        </div>

        {/* Wishlist button */}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110 ${
              isWishlisted ? "text-rose-500" : "text-gray-700 hover:text-rose-500"
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
          </button>
        )}
      </div>

      {/* Content (2/3 width) */}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {showCategory && category && (
              <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1">
                <Tag className="h-3 w-3 text-amber-700" />
                <span className="text-xs font-medium text-amber-800">{category}</span>
              </div>
            )}

            <h3 className="mb-2 font-['Playfair_Display'] text-xl font-bold text-gray-900 transition-colors group-hover:text-amber-700 md:text-2xl">
              {title}
            </h3>

            {short_description && (
              <p className="mb-3 line-clamp-2 text-sm text-gray-700 md:text-base">
                {short_description}
              </p>
            )}

            {tags && tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <RatingStars
                  rating={rating || 0}
                  count={reviews_count || 0}
                  showCount={true}
                  size="sm"
                />
                <div className="mt-2">
                  <PriceTag
                    price={price}
                    currency={currency}
                    per="piece"
                    size="lg"
                    color="amber"
                    showSymbol={true}
                  />
                </div>
              </div>

              {/* Feature icons */}
              <div className="flex flex-col gap-1 text-sm">
                {has3DModel && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Sparkles className="h-4 w-4" />
                    <span>3D Available</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Hallmarked</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="primary"
            className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-sm font-semibold text-white hover:from-amber-600 hover:to-amber-700 md:px-6 md:text-base"
            onClick={handleAddToCart}
            icon={<ShoppingBag className="h-4 w-4" />}
          >
            Add to Cart
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-amber-200 px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 md:px-6 md:text-base"
            onClick={handleQuickView}
            icon={<Eye className="h-4 w-4" />}
          >
            View Details
          </Button>
          {onToggleWishlist && (
            <Button
              variant="ghost"
              className={`rounded-full border border-gray-200 px-3 py-2 ${
                isWishlisted
                  ? "text-rose-500 hover:bg-rose-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={handleToggleWishlist}
              icon={<Heart className={`h-4 w-4 ${isWishlisted ? "fill-rose-500" : ""}`} />}
            />
          )}
        </div>
      </div>

      {/* Hover arrow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="rounded-l-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2">
          <ChevronRight className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.article>
  );
}