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
  Gem,
  Tag,
  Zap,
  Crown,
  CheckCircle,
  Star,
  Share2,
  RotateCw,
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

// Utility to check if URL is a 3D model
const is3DModel = (url: string | null): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.glb') || 
         lowerUrl.endsWith('.gltf') || 
         lowerUrl.includes('model3d') || 
         lowerUrl.includes('3d-model');
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
  } = product;

  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false);

  const has3DModel = model_3d_url ? is3DModel(model_3d_url) : false;
  const isPremium = price > 250000;
  const isNew = tags?.includes('new') || false;
  const isBestSeller = tags?.includes('bestseller') || false;
  const isTrending = tags?.includes('trending') || false;

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

  // Get appropriate image placeholder
  const getImageUrl = () => {
    if (primary_image) return primary_image;
    if (has3DModel) return "/images/placeholders/3d-placeholder.jpg";
    return "/images/placeholders/jewellery-placeholder.jpg";
  };

  // Grid Layout (Default)
  if (layout === "grid") {
    return (
      <motion.article
        className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg shadow-gray-900/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
        whileHover={{ y: -8 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onView && onView(slug)}
      >
        {/* Premium Crown Badge */}
        {isPremium && (
          <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 px-3 py-1.5 text-white shadow-lg">
              <Crown className="h-3 w-3" />
              <span className="text-xs font-bold uppercase tracking-wider">Premium</span>
            </div>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
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

        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Main Image */}
          <img
            src={getImageUrl()}
            alt={title}
            className={`h-full w-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-110' : 'scale-100'}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300" />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Quick Action Overlay */}
          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <div className="flex gap-3">
              <Button
                variant="primary"
                className="rounded-full bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 font-semibold shadow-lg"
                onClick={handleAddToCart}
                icon={<ShoppingBag className="h-4 w-4" />}
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white text-white hover:bg-white/20 px-6 py-3 font-semibold"
                onClick={handleQuickView}
                icon={<Eye className="h-4 w-4" />}
              >
                Quick View
              </Button>
            </div>
          </div>

          {/* Wishlist Button */}
          {onToggleWishlist && (
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`absolute top-4 left-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white ${
                isWishlisted ? 'text-rose-500' : 'text-gray-600 hover:text-rose-500'
              }`}
            >
              <Heart
                className={`h-5 w-5 transition-all ${
                  isWishlisted ? 'fill-rose-500 scale-110' : ''
                } ${isWishlistAnimating ? 'animate-ping' : ''}`}
              />
            </button>
          )}

          {/* Category Badge */}
          {showCategory && category && (
            <div className="absolute bottom-4 left-4 z-20">
              <div className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 text-amber-600" />
                  <span className="text-xs font-medium text-gray-900">{category}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          {/* Title */}
          <h3 className="mb-2 line-clamp-1 font-['Playfair_Display'] text-xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
            {title}
          </h3>

          {/* Description */}
          {short_description && (
            <p className="mb-4 line-clamp-2 text-sm text-gray-600 leading-relaxed">
              {short_description}
            </p>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Rating */}
          <div className="mb-4">
            <RatingStars
              rating={4.7}
              count={32}
              size="sm"
              showCount={true}
            />
          </div>

          {/* Price & Action */}
          <div className="mt-auto">
            <div className="mb-4">
              <PriceTag
                price={price}
                currency={currency}
                per="piece"
                size="lg"
                color="amber"
                showSymbol={true}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25"
                onClick={handleAddToCart}
                icon={<ShoppingBag className="h-4 w-4" />}
              >
                Add to Cart
              </Button>
              <Button
                variant="ghost"
                className="rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-amber-700"
                onClick={() => onView && onView(slug)}
                icon={<ChevronRight className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>

        {/* Hover Effect Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      </motion.article>
    );
  }

  // List Layout
  return (
    <motion.article
      className="group relative flex overflow-hidden rounded-3xl bg-white shadow-lg shadow-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      whileHover={{ x: 4 }}
      onClick={() => onView && onView(slug)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative w-1/3 flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={getImageUrl()}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
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

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow transition ${
              isWishlisted ? 'text-rose-500' : 'text-gray-600 hover:text-rose-500'
            }`}
          >
            <Heart
              className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Category */}
            {showCategory && category && (
              <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1">
                <Tag className="h-3 w-3 text-amber-700" />
                <span className="text-xs font-medium text-amber-800">{category}</span>
              </div>
            )}

            {/* Title */}
            <h3 className="mb-2 font-['Playfair_Display'] text-2xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
              {title}
            </h3>

            {/* Description */}
            {short_description && (
              <p className="mb-4 text-gray-600 line-clamp-2">
                {short_description}
              </p>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Rating & Price */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <RatingStars rating={4.7} count={32} showCount={true} />
                <PriceTag
                  price={price}
                  currency={currency}
                  per="piece"
                  size="lg"
                  color="amber"
                />
              </div>

              {/* Features */}
              <div className="hidden md:flex flex-col gap-2">
                {has3DModel && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Sparkles className="h-4 w-4" />
                    <span>3D View Available</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>BIS Hallmarked</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="primary"
            className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6"
            onClick={handleAddToCart}
            icon={<ShoppingBag className="h-4 w-4" />}
          >
            Add to Cart
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50 px-6"
            onClick={handleQuickView}
            icon={<Eye className="h-4 w-4" />}
          >
            View Details
          </Button>
          {onToggleWishlist && (
            <Button
              variant="ghost"
              className={`rounded-full border-gray-200 ${
                isWishlisted ? 'text-rose-500 hover:bg-rose-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={handleToggleWishlist}
              icon={<Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />}
            />
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 transform opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="rounded-l-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2">
          <ChevronRight className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.article>
  );
}