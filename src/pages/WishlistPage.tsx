// src/pages/WishlistPage.tsx

import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Trash2,
  Sparkles,
} from "lucide-react";

import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
import Badge from "../components/ui/Badge";
import SectionTitle from "../components/ui/SectionTitle";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import PriceTag from "../components/product/PriceTag";

import { CartContext } from "../context/CartContext";
import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../api/wishlist.api";

import { toast } from "react-hot-toast";

interface WishlistItem {
  id: string;
  product_id: string;
  product_title: string;
  product_slug: string;
  price: number;
  image?: string | null;
  added_at?: string;
}

interface WishlistResponse {
  ok: boolean;
  wishlist?: {
    id: string;
    name: string;
    items: WishlistItem[];
  };
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const cartCtx = useContext(CartContext);

  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCartItem = cartCtx?.addItem || (async () => {});

  /* ----------------------------------------
   * Load wishlist
   * -------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = (await getWishlist()) as WishlistResponse;
        if (!res.ok || !res.wishlist) {
          throw new Error("Unable to load wishlist");
        }
        if (cancelled) return;

        setWishlistId(res.wishlist.id);
        setItems(res.wishlist.items || []);
      } catch (err: any) {
        const status =
          err?.status || err?.response?.status || err?.response?.statusCode;

        if (status === 401) {
          navigate(`/login?next=${encodeURIComponent("/wishlist")}`);
          return;
        }

        if (!cancelled) {
          setError(err?.message || "Failed to load wishlist");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /* ----------------------------------------
   * Handlers
   * -------------------------------------- */
  const handleViewProduct = (slug: string) => {
    if (!slug) return;
    navigate(`/products/${slug}`);
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromWishlist(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    try {
      await addCartItem(item.product_id, 1);
      await removeFromWishlist(item.id);

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Moved to cart");
    } catch (err) {
      toast.error("Failed to move item");
    }
  };

  const handleClearWishlist = async () => {
    if (!wishlistId || items.length === 0) return;
    try {
      setClearing(true);
      await clearWishlist();
      setItems([]);
      toast.success("Wishlist cleared");
    } catch {
      toast.error("Unable to clear wishlist");
    } finally {
      setClearing(false);
    }
  };

  /* ----------------------------------------
   * Loading
   * -------------------------------------- */
  if (loading) {
    return (
      <AnimatedSection className="bg-slate-50/60 py-14 sm:py-24 text-[17px]">
        <Container>
          <div className="mb-10 flex items-center gap-3">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/5"
              >
                <Skeleton className="h-24 w-24 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-12 w-36 rounded-full" />
              </div>
            ))}
          </div>
        </Container>
      </AnimatedSection>
    );
  }

  /* ----------------------------------------
   * Error
   * -------------------------------------- */
  if (error) {
    return (
      <AnimatedSection className="bg-slate-50/60 py-14 sm:py-24 text-[17px]">
        <Container>
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center text-base font-medium text-slate-600 hover:text-rose-600"
          >
            <ArrowLeft className="mr-2 h-6 w-6" />
            Back
          </button>
          <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-8 py-12 text-center text-lg text-rose-700 shadow-sm">
            {error}
          </div>
        </Container>
      </AnimatedSection>
    );
  }

  const isEmpty = !items || items.length === 0;

  /* ----------------------------------------
   * Main Page (Font size increased)
   * -------------------------------------- */
  return (
    <AnimatedSection className="bg-slate-50/60 py-14 sm:py-24 text-[17px]">
      <Container>
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-600"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>

            <div>
              <Badge className="mb-2 text-[15px] px-4 py-1.5">Your Wishlist</Badge>
              <SectionTitle
                align="left"
                title="Saved for later"
                subtitle="All your favourite designs saved in one place."
                titleClass="text-4xl"
                subtitleClass="text-lg"
              />
            </div>
          </div>

          {!isEmpty && (
            <div className="flex flex-wrap items-center gap-4 text-[17px]">
              <span className="text-slate-600">
                {items.length} item{items.length === 1 ? "" : "s"}
              </span>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-base text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                disabled={clearing}
                onClick={handleClearWishlist}
              >
                <Trash2 className="h-5 w-5" />
                Clear wishlist
              </Button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-20 text-center shadow-sm shadow-slate-900/5">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/10 text-pink-500">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-slate-900">
              Your wishlist is empty
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-md">
              Start exploring our fine jewellery collection and tap the{" "}
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-pink-200 text-[13px] text-pink-500">
                <Heart className="h-4 w-4" />
              </span>{" "}
              icon to save favourites.
            </p>
            <Button
              variant="primary"
              className="mt-7 text-lg px-6 py-3"
              onClick={() => navigate("/Products")}
            >
              <Sparkles className="mr-2 h-6 w-6" />
              Browse collection
            </Button>
          </div>
        )}

        {/* Wishlist Items */}
        {!isEmpty && (
          <div className="space-y-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center"
              >
                {/* Image */}
                <button
                  type="button"
                  onClick={() => handleViewProduct(item.product_slug)}
                  className="flex-shrink-0 overflow-hidden rounded-3xl border border-slate-100 bg-slate-50"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.product_title}
                      className="h-32 w-32 object-cover sm:h-36 sm:w-36"
                    />
                  ) : (
                    <div className="flex h-36 w-36 items-center justify-center text-[12px] text-slate-400">
                      Image coming soon
                    </div>
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 space-y-3">
                  <button
                    type="button"
                    onClick={() => handleViewProduct(item.product_slug)}
                    className="text-left font-['Playfair_Display'] text-2xl font-semibold text-slate-900 hover:text-rose-600"
                  >
                    {item.product_title}
                  </button>

                  {item.added_at && (
                    <p className="text-[15px] text-slate-500">
                      Added on{" "}
                      {new Date(item.added_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}

                  <div className="mt-2">
                    <PriceTag price={item.price} currency="INR" per="piece" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-stretch gap-4 sm:w-60">
                  <Button
                    variant="primary"
                    className="flex items-center justify-center gap-3 text-lg py-3"
                    onClick={() => handleMoveToCart(item)}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    Move to cart
                  </Button>

                  <Button
                    variant="ghost"
                    className="flex items-center justify-center gap-2 text-base text-slate-600 hover:text-rose-600"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </AnimatedSection>
  );
}
