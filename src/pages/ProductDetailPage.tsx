// src/pages/ProductDetailPage.tsx

import React, { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ChevronLeft,
  Heart,
  HeartOff,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Package,
} from "lucide-react";

import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import SectionTitle from "../components/ui/SectionTitle";
import PriceTag from "../components/product/PriceTag";
import RatingStars from "../components/product/RatingStars";
import ProductGrid from "../components/product/ProductGrid";
import Skeleton from "../components/ui/Skeleton";

import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

import { apiFetch } from "../api/client";
import type { Product, ProductAsset } from "../api/types";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../api/wishlist.api";

import { registerPushForCurrentVisitor } from "../api/push.api";
import { registerStockAlert } from "../api/stockAlerts.api";

// ⭐ TOAST ADDED
import { toast } from "react-hot-toast";

// Extend Product type locally
type ProductWithStock = Product & {
  available_qty?: number | null;
};

interface ProductResponse {
  ok: boolean;
  product: ProductWithStock;
}

interface ProductsListResponse {
  ok: boolean;
  products: Product[];
}

interface WishlistItemLite {
  id: string;
  product_id: string;
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const cartCtx = useContext(CartContext);
  const auth = useContext(AuthContext);

  const [product, setProduct] = useState<ProductWithStock | null>(null);
  const [suggested, setSuggested] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [notifySubscribed, setNotifySubscribed] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  const addCartItem = cartCtx?.addItem || (async () => {});
  const isLoggedIn = !!auth?.isLoggedIn;

  // -------------------------------
  // Load product
  // -------------------------------
  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const prodRes = await apiFetch<ProductResponse>(`/products/${slug}`);
        if (!prodRes.ok || !prodRes.product) throw new Error("Product not found");
        if (!cancelled) setProduct(prodRes.product);

        // Suggested products
        const listRes = await apiFetch<ProductsListResponse>("/products");
        if (listRes.ok && !cancelled) {
          const suggestions = listRes.products
            .filter((p) => p.slug !== slug)
            .slice(0, 8);
          setSuggested(suggestions);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // -------------------------------
  // Wishlist sync
  // -------------------------------
  useEffect(() => {
    if (!product || !isLoggedIn) return;

    async function loadWishlist() {
      try {
        const res = await getWishlist();
        if (!res.ok) return;

        const match = res.wishlist.items.find(
          (i: WishlistItemLite) => i.product_id === product.id
        );
        setWishlistItemId(match ? match.id : null);
      } catch {}
    }

    loadWishlist();
  }, [product, isLoggedIn]);

  // -------------------------------
  // Gallery
  // -------------------------------
  const imageAssets: ProductAsset[] = useMemo(() => {
    return product?.assets?.filter((a) => a.asset_type === "image") || [];
  }, [product]);

  const primaryImage = useMemo(() => {
    return (
      imageAssets.find((a) => a.is_primary) ||
      imageAssets[0] ||
      null
    );
  }, [imageAssets]);

  const [activeImageId, setActiveImageId] = useState<string | null>(null);

  useEffect(() => {
    if (primaryImage) setActiveImageId(primaryImage.id);
  }, [primaryImage?.id]);

  const activeImage = useMemo(() => {
    return (
      imageAssets.find((a) => a.id === activeImageId) ||
      primaryImage ||
      null
    );
  }, [imageAssets, activeImageId, primaryImage]);

  // -------------------------------
  // Stock helpers
  // -------------------------------
  const availableQty = product?.available_qty ?? null;
  const inStock = typeof availableQty === "number" ? availableQty > 0 : true;

  // -------------------------------
  // Handlers
  // -------------------------------
  async function handleAddToCart() {
    if (!product || !inStock) return;

    try {
      await addCartItem(product.id, 1);
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart");
    }
  }

  async function handleToggleWishlist() {
    if (!product) return;

    if (!isLoggedIn) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }

    try {
      setWishlistLoading(true);

      if (wishlistItemId) {
        await removeFromWishlist(wishlistItemId);
        setWishlistItemId(null);
        toast("Removed from wishlist 💔");
      } else {
        const res = await addToWishlist(product.id);
        if (res.ok && res.id) {
          setWishlistItemId(res.id);
          toast.success("Saved to wishlist ❤️");
        }
      }
    } catch {
      toast.error("Could not update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  }

  async function handleNotifyMe() {
    if (!product) return;

    try {
      setNotifyLoading(true);
      await registerPushForCurrentVisitor();

      await apiFetch("/stock-alerts/register", {
        method: "POST",
        body: { product_id: product.id },
      });

      setNotifySubscribed(true);
      toast.success("We'll notify you when it's back in stock");
    } catch {
      toast.error("Notification setup failed");
    } finally {
      setNotifyLoading(false);
    }
  }

  // -------------------------------
  // RENDER
  // -------------------------------

  if (loading && !product) {
    return (
      <AnimatedSection className="py-16 bg-slate-50">
        <Container>
          <Skeleton className="h-10 w-40" />
        </Container>
      </AnimatedSection>
    );
  }

  if (error || !product) {
    return (
      <AnimatedSection className="py-16 bg-slate-50">
        <Container>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-rose-500"
          >
            <ChevronLeft className="inline h-4 w-4 mr-1" /> Back
          </button>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-base text-slate-600 shadow">
            {error || "Product not found"}
          </div>
        </Container>
      </AnimatedSection>
    );
  }

  return (
    <>
      {/* ---------------- MAIN SECTION ---------------- */}
      <AnimatedSection className="bg-slate-50 py-12">
        <Container>
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-rose-500"
          >
            <ChevronLeft className="inline h-4 w-4 mr-1" />
            Back to shop
          </button>

          <div className="grid gap-12 mt-8 lg:grid-cols-2">
            {/* ---------------- LEFT: GALLERY ---------------- */}
            <div>
              <div className="rounded-2xl overflow-hidden shadow border border-slate-200">
                {activeImage ? (
                  <img
                    src={activeImage.url}
                    alt={product.title}
                    className="w-full aspect-[4/5] object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full aspect-[4/5] text-slate-400 text-lg">
                    No image
                  </div>
                )}
              </div>

              {imageAssets.length > 1 && (
                <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
                  {imageAssets.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImageId(img.id)}
                      className={`h-20 w-20 rounded-xl overflow-hidden border ${
                        img.id === activeImageId
                          ? "border-rose-500 ring-2 ring-rose-300"
                          : "border-slate-300"
                      }`}
                    >
                      <img
                        src={img.url}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ---------------- RIGHT: DETAILS ---------------- */}
            <div className="space-y-5">
              <h1 className="font-['Playfair_Display'] text-4xl font-semibold text-slate-900">
                {product.title}
              </h1>

              {product.short_description && (
                <p className="text-base text-slate-600">
                  {product.short_description}
                </p>
              )}

              <RatingStars rating={4.7} count={32} />

              <PriceTag
                price={product.price}
                currency={product.currency}
                per="piece"
              />

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 mt-4">
                <Button
                  variant="primary"
                  className="text-sm px-6 py-3"
                  disabled={!inStock}
                  onClick={handleAddToCart}
                >
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-sm px-5 py-3"
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                >
                  {wishlistItemId ? (
                    <>
                      <Heart className="h-5 w-5 fill-pink-500 text-pink-500" />
                      In Wishlist
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5" />
                      Add to Wishlist
                    </>
                  )}
                </Button>

                {!inStock && (
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-sm px-5 py-3"
                    onClick={handleNotifyMe}
                    disabled={notifyLoading || notifySubscribed}
                  >
                    {notifySubscribed ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        We'll notify you
                      </>
                    ) : (
                      <>
                        <Bell className="h-5 w-5" />
                        Notify me
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Description & meta */}
              <div className="rounded-xl border bg-white shadow p-5 space-y-4 text-base text-slate-700">
                {product.description && (
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                      Description
                    </div>
                    <p className="mt-1 whitespace-pre-line">{product.description}</p>
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                      Product Details
                    </div>
                    <ul className="mt-1 space-y-1">
                      <li>SKU: {product.id.slice(0, 8).toUpperCase()}</li>
                      {availableQty !== null && (
                        <li>Available Qty: {Math.max(availableQty, 0)}</li>
                      )}
                      {product.trade_type && (
                        <li>Trade: {product.trade_type.toUpperCase()}</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                      Shipping & Care
                    </div>
                    <ul className="mt-1 space-y-1">
                      <li className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-slate-400" />
                        Insured worldwide shipping
                      </li>
                      <li>Secure payments & certification</li>
                      <li>Dedicated concierge support</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-[12px] text-slate-500">
                Note: Images are for representation only.
              </p>
            </div>
          </div>
        </Container>
      </AnimatedSection>

      {/* ---------------- SUGGESTED ---------------- */}
      <AnimatedSection className="py-14 bg-white">
        <Container>
          <SectionTitle
            title="You may also like"
            subtitle="Discover more fine jewellery curated for you."
            align="left"
          />

          <ProductGrid
            products={suggested}
            loading={false}
            onViewProduct={(slug) => navigate(`/products/${slug}`)}
            onAddToCart={(id) =>
              addCartItem(id, 1).then(() => toast.success("Added to cart"))
            }
          />
        </Container>
      </AnimatedSection>
    </>
  );
}
