// src/components/product/ProductCard.tsx
import React from "react";
import { motion } from "framer-motion";
import PriceTag from "./PriceTag";
import RatingStars from "./RatingStars";
import Button from "../ui/Button";
import type { Product } from "../../api/types";

interface ProductCardProps {
  product: Product;
  onView?: (slug: string) => void;
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  isWishlisted?: boolean;
}

export default function ProductCard({
  product,
  onView,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
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
  } = product;

  return (
    <motion.article
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-900/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      whileHover={{ y: -4 }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-50">
        {primary_image ? (
          <img
            src={primary_image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400">
            Image coming soon
          </div>
        )}

        {model_3d_url && (
          <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-amber-300">
            3D Preview
          </div>
        )}

        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(id);
            }}
            className={`absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition
              ${
                isWishlisted
                  ? "bg-pink-500 text-white"
                  : "bg-white/90 text-pink-500 hover:bg-white"
              }`}
          >
            <span
              className={`text-lg leading-none ${
                isWishlisted ? "scale-110" : ""
              }`}
            >
              ♥
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 font-['Playfair_Display']">
          {title}
        </h3>
        {short_description && (
          <p className="line-clamp-2 text-xs text-slate-500">
            {short_description}
          </p>
        )}

        {/* Fake rating for now – later connect with real reviews */}
        <RatingStars rating={4.7} count={32} className="mt-1" />

        <PriceTag
          price={price}
          currency={currency}
          per="piece"
          className="mt-1"
        />

        <div className="mt-3 flex gap-2">
          <Button
            variant="primary"
            className="flex-1 text-xs"
            onClick={() => onAddToCart && onAddToCart(id)}
          >
            Add to Cart
          </Button>
          <Button
            variant="outline"
            className="text-xs"
            onClick={() => onView && onView(slug)}
          >
            View
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
