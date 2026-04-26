// src/pages/ProductDetailPage.tsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Heart,
  Bell,
  CheckCircle2,
  Package,
  Truck,
  Shield,
  Gem,
  Sparkles,
  Eye,
  Share2,
  ZoomIn,
  ShoppingBag,
  Calendar,
  MapPin,
  ChevronRight,
  Award,
  Clock
} from "lucide-react";

import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
import Button from "../components/ui/Button";
import SectionTitle from "../components/ui/SectionTitle";
import PriceTag from "../components/product/PriceTag";
import RatingStars from "../components/product/RatingStars";
import ProductGrid from "../components/product/ProductGrid";
import Skeleton from "../components/ui/Skeleton";
import Badge from "../components/ui/Badge";

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
import { toast } from "react-hot-toast";

import { getAssetUrl } from "@/utils/assetUrl";

/* ---------------- TYPES ---------------- */

type ProductWithStock = Product & {
  available_qty?: number | null;
  assets?: ProductAsset[];
  category_name?: string;
  tags?: string[];
  weight?: number;
  metal_type?: string;
  gold_carat?: number;
  diamond_pcs?: number;
  diamond_carat?: number;
  diamonds?: any[];
  gem_type?: string;
  estimated_delivery?: string;
  views?: number;
  purchases?: number;
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

/* ---------------- UTILS ---------------- */

const is3DModelUrl = (url: string, assetType?: string): boolean => {
  if (assetType === "3d") return true;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.endsWith(".glb") ||
    lowerUrl.endsWith(".gltf") ||
    lowerUrl.includes("model3d") ||
    lowerUrl.includes("3d-model") ||
    lowerUrl.endsWith(".usdz") ||
    lowerUrl.endsWith(".obj")
  );
};

const isVideoUrl = (url: string, assetType?: string): boolean => {
  if (assetType === "video") return true;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.endsWith(".mp4") ||
    lowerUrl.endsWith(".webm") ||
    lowerUrl.endsWith(".mov")
  );
};

const getPlaceholderFor = (is3d: boolean, isVideo: boolean) => {
  if (is3d) return "/images/placeholders/3d-placeholder.jpg";
  if (isVideo) return "/images/placeholders/video-placeholder.jpg";
  return "/images/placeholders/jewellery-placeholder.jpg";
};

/* ---------------- COMPONENT ---------------- */

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

  const [activeAssetIndex, setActiveAssetIndex] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const addCartItem = cartCtx?.addItem || (async () => {});
  const isLoggedIn = !!auth?.isLoggedIn;

  /* ---------------- LOAD PRODUCT ---------------- */

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const prodRes = await apiFetch<ProductResponse>(`/masters/products/${slug}`);
        if (!prodRes.ok || !prodRes.product) throw new Error("Product not found");
        if (cancelled) return;

        const currentProduct = prodRes.product;
        setProduct(currentProduct);

        // Load suggested products
        if (currentProduct.category_id) {
          const listRes = await apiFetch<ProductsListResponse>(
            `/masters/products?category=${encodeURIComponent(currentProduct.category_id)}`
          );
          if (listRes.ok && !cancelled) {
            setSuggested(listRes.products.filter((p) => p.slug !== slug).slice(0, 8));
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => { cancelled = true; };
  }, [slug]);

  /* ---------------- WISHLIST SYNC ---------------- */

  useEffect(() => {
    if (!product || !isLoggedIn) return;
    (async () => {
      try {
        const res = await getWishlist();
        if (!res.ok) return;
        const match = res.wishlist.items.find(
          (i: WishlistItemLite) => i.product_id === product.id
        );
        setWishlistItemId(match ? match.id : null);
      } catch {}
    })();
  }, [product, isLoggedIn]);

  /* ---------------- ASSETS PROCESSING ---------------- */

  const allAssets = useMemo(() => {
    if (!product?.assets) return [];
    return product.assets.map((asset) => {
      const absoluteUrl = getAssetUrl(asset.url);
      const is3d = is3DModelUrl(absoluteUrl, asset.asset_type);
      const isVideo = isVideoUrl(absoluteUrl, asset.asset_type);
      const thumbnail = is3d
        ? getPlaceholderFor(is3d, isVideo)
        : isVideo
        ? getPlaceholderFor(is3d, isVideo)
        : absoluteUrl;
      return {
        ...asset,
        url: absoluteUrl,
        is3d,
        isVideo,
        thumbnail,
      };
    });
  }, [product]);

  const activeAsset = allAssets[activeAssetIndex] || null;

  // Reset zoom when asset changes
  useEffect(() => {
    setZoomActive(false);
  }, [activeAssetIndex]);

  /* ---------------- STOCK ---------------- */

  const availableQty = product?.available_qty ?? null;
  const inStock = typeof availableQty === "number" ? availableQty > 0 : true;

  /* ---------------- ACTIONS ---------------- */

  async function handleAddToCart() {
    if (!product || !inStock) return;
    try {
      await addCartItem(product.id, 1);
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart");
    }
  }

  async function handleBuyNow() {
    if (!product || !inStock) return;
    try {
      await addCartItem(product.id, 1);
      navigate("/cart");
    } catch {
      toast.error("Could not process order");
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
        toast.success("Removed from wishlist");
      } else {
        const res = await addToWishlist(product.id);
        if (res.ok && res.id) {
          setWishlistItemId(res.id);
          toast.success("Added to wishlist");
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

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: `Check out this beautiful jewellery from Payal & Minal Gems`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  }

  /* ---------------- ZOOM HANDLER FOR IMAGES ---------------- */

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeAsset || activeAsset.is3d || activeAsset.isVideo) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
    setZoomActive(true);
  };

  const handleImageMouseLeave = () => {
    setZoomActive(false);
  };

  /* ---------------- LOADING / ERROR STATES ---------------- */

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Container className="py-8">
          <Skeleton className="h-4 w-16 mb-4" />
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="h-[500px] w-full rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !product) {
    return (
      <AnimatedSection className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-20">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <Gem className="h-16 w-16 text-rose-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 text-lg mb-8">The jewellery piece you're looking for might have been removed.</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/products")} className="rounded-full px-8">Browse Collection</Button>
              <Button onClick={() => navigate(-1)} variant="outline" className="rounded-full px-8">Go Back</Button>
            </div>
          </div>
        </Container>
      </AnimatedSection>
    );
  }

  /* ---------------- MAIN RENDER ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Floating Navigation */}
      <div className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <Container className="py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-amber-700">
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full"><Share2 className="h-5 w-5 text-gray-600" /></button>
            {isLoggedIn && (
              <button onClick={handleToggleWishlist} disabled={wishlistLoading} className="p-2 hover:bg-gray-100 rounded-full">
                <Heart className={`h-5 w-5 ${wishlistItemId ? "fill-rose-500 text-rose-500" : "text-gray-600"}`} />
              </button>
            )}
          </div>
        </Container>
      </div>

      <Container className="py-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* ============== GALLERY SECTION ============== */}
          <div className="space-y-6">
            {/* Main Viewer */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200">
              {activeAsset ? (
                <>
                  {/* IMAGE ASSET */}
                  {!activeAsset.is3d && !activeAsset.isVideo ? (
                    <div
                      className="relative w-full aspect-square overflow-hidden cursor-zoom-in"
                      onMouseMove={handleImageMouseMove}
                      onMouseLeave={handleImageMouseLeave}
                    >
                      <img
                        src={activeAsset.url}
                        alt={product.title}
                        className={`w-full h-full object-contain transition-transform duration-150 ${zoomActive ? "scale-150" : ""}`}
                        style={{
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getPlaceholderFor(false, false);
                        }}
                      />
                      {!zoomActive && (
                        <div className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow">
                          <ZoomIn className="h-5 w-5 text-gray-700" />
                        </div>
                      )}
                    </div>
                  ) : activeAsset.isVideo ? (
                    /* VIDEO ASSET */
                    <div className="aspect-square flex items-center justify-center bg-black rounded-3xl overflow-hidden">
                      <video
                        src={activeAsset.url}
                        controls
                        className="w-full h-full object-contain"
                        poster={activeAsset.thumbnail}
                        onError={(e) => {
                          // Fallback if video fails
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="flex items-center justify-center h-full"><p class="text-gray-500">Video unavailable</p></div>`;
                          }
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    /* 3D MODEL ASSET */
                    <div className="aspect-square w-full">
                      <model-viewer
                        src={activeAsset.url}
                        alt={product.title}
                        ar
                        ar-modes="webxr scene-viewer quick-look"
                        camera-controls
                        auto-rotate
                        shadow-intensity="1"
                        style={{ width: "100%", height: "100%", borderRadius: "1.5rem" }}
                        loading="lazy"
                        exposure="1"
                        environment-image="neutral"
                      >
                        {/* Fallback while loading */}
                        <div className="flex items-center justify-center h-full bg-gray-100">
                          <img src={activeAsset.thumbnail} alt={product.title} className="w-full h-full object-cover opacity-20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                          </div>
                        </div>
                      </model-viewer>
                    </div>
                  )}

                  {/* Asset Type Badge */}
                  {(activeAsset.is3d || activeAsset.isVideo) && (
                    <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1.5 text-white text-sm font-medium shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      <span>{activeAsset.is3d ? "3D VIEW" : "VIDEO"}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square flex items-center justify-center">
                  <Gem className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {allAssets.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 px-2">
                {allAssets.map((asset, index) => (
                  <button
                    key={asset.id}
                    onClick={() => setActiveAssetIndex(index)}
                    className={`relative flex-shrink-0 h-24 w-24 rounded-xl overflow-hidden border-2 transition-all ${
                      index === activeAssetIndex ? "border-amber-500 ring-2 ring-amber-200 shadow-lg" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={asset.thumbnail}
                      alt={`View ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/placeholders/jewellery-placeholder.jpg";
                      }}
                    />
                    {asset.is3d && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">3D</div>
                    )}
                    {asset.isVideo && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">▶</div>
                    )}
                    {index === activeAssetIndex && <div className="absolute inset-0 bg-amber-500/10" />}
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">BIS Hallmark</p>
                  <p className="text-xs text-gray-500">Certified Purity</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
                <Truck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Free Shipping*</p>
                  <p className="text-xs text-gray-500">Pan India</p>
                </div>
              </div>
            </div>
          </div>

          {/* ============== PRODUCT DETAILS ============== */}
          <div className="space-y-8">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500">
              <button onClick={() => navigate("/products")} className="hover:text-amber-700">Shop</button>
              <ChevronRight className="h-4 w-4 mx-2" />
              {product.category_name && (
                <>
                  <span>{product.category_name}</span>
                  <ChevronRight className="h-4 w-4 mx-2" />
                </>
              )}
              <span className="font-medium text-gray-900">{product.title}</span>
            </div>

            {/* Title & Badges */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {product.tags?.map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                {!inStock && <Badge variant="error" className="text-xs">Out of Stock</Badge>}
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">{product.title}</h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-6">{product.short_description}</p>
              <div className="flex items-center gap-4">
                <RatingStars rating={4.7} count={32} size="lg" />
                <span className="text-gray-500">•</span>
                <span className="text-gray-500 flex items-center gap-1"><Eye className="h-4 w-4" />{product.views || 124} views</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 p-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-sm text-amber-700 font-medium mb-1">Price</p>
                  <PriceTag price={product.price} currency={product.currency} per="piece" size="xl" showSymbol={true} />
                  <p className="text-sm text-amber-600 mt-2">Includes all taxes & duties</p>
                </div>
                {availableQty !== null && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Available Stock</p>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((availableQty / 10) * 100, 100)}%` }} />
                      </div>
                      <span className="font-semibold text-gray-900">{availableQty} pieces</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleBuyNow} disabled={!inStock} className="flex-1 rounded-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-500 to-amber-600">
                  <ShoppingBag className="mr-2 h-5 w-5" /> Buy Now
                </Button>
                <Button onClick={handleAddToCart} disabled={!inStock} variant="outline" className="flex-1 rounded-full h-14 text-lg border-amber-500 text-amber-600">
                  Add to Cart
                </Button>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleToggleWishlist} variant="ghost" className="flex-1 rounded-full border-gray-200">
                  <Heart className={`mr-2 h-5 w-5 ${wishlistItemId ? "fill-rose-500 text-rose-500" : "text-gray-600"}`} />
                  {wishlistItemId ? "In Wishlist" : "Add to Wishlist"}
                </Button>
                {!inStock && (
                  <Button onClick={handleNotifyMe} disabled={notifyLoading || notifySubscribed} variant="ghost" className="flex-1 rounded-full border-gray-200">
                    {notifySubscribed ? <><CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> Notifications On</> : <><Bell className="mr-2 h-5 w-5" /> Notify Me</>}
                  </Button>
                )}
              </div>
            </div>

            {/* Specifications (material data from DB) */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="h-6 w-6 text-amber-500" /> Specifications
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Metal Type</p>
                  <p className="font-semibold text-gray-900">{product.metal_type || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gold Purity</p>
                  <p className="font-semibold text-gray-900">{product.gold_carat ? `${product.gold_carat}K` : "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Diamond Pieces</p>
                  <p className="font-semibold text-gray-900">{product.diamond_pcs ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Diamond Carat</p>
                  <p className="font-semibold text-gray-900">{product.diamond_carat ? `${product.diamond_carat} ct` : "—"}</p>
                </div>
                {product.weight && (
                  <div>
                    <p className="text-sm text-gray-500">Approx. Weight</p>
                    <p className="font-semibold text-gray-900">{product.weight}g</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Estimated Delivery</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1"><Clock className="h-4 w-4" />{product.estimated_delivery || "7-10 business days"}</p>
                </div>
              </div>

              {/* Diamond Details Table */}
              {product.diamonds && Array.isArray(product.diamonds) && product.diamonds.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Gem className="h-5 w-5 text-amber-500" /> Diamond Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.diamonds.map((diamond: any, idx: number) => (
                      <div key={idx} className="rounded-xl border border-gray-200 bg-gradient-to-br from-amber-50/30 to-white p-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Diamond {idx + 1}</p>
                        {diamond.carat && <div className="flex justify-between text-sm"><span className="text-gray-500">Carat</span><span className="font-medium">{diamond.carat} ct</span></div>}
                        {diamond.clarity && <div className="flex justify-between text-sm"><span className="text-gray-500">Clarity</span><span className="font-medium">{diamond.clarity}</span></div>}
                        {diamond.color && <div className="flex justify-between text-sm"><span className="text-gray-500">Color</span><span className="font-medium">{diamond.color}</span></div>}
                        {diamond.shape && <div className="flex justify-between text-sm"><span className="text-gray-500">Shape</span><span className="font-medium">{diamond.shape}</span></div>}
                        {/* No price shown */}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Description */}
            {product.description && (
              <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Description</h3>
                <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">{product.description}</div>
              </div>
            )}

            {/* Shipping & Care */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Package className="h-6 w-6 text-amber-500" /> Shipping & Care</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Delivery Information</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3"><Truck className="h-5 w-5 text-green-500 mt-0.5" /><div><p className="font-medium">Free Insured Shipping*</p><p className="text-sm text-gray-600">Across India with tracking</p></div></li>
                    <li className="flex items-start gap-3"><Calendar className="h-5 w-5 text-blue-500 mt-0.5" /><div><p className="font-medium">Express Delivery</p><p className="text-sm text-gray-600">Available for major cities</p></div></li>
                    <li className="flex items-start gap-3"><MapPin className="h-5 w-5 text-purple-500 mt-0.5" /><div><p className="font-medium">International Shipping</p><p className="text-sm text-gray-600">Worldwide with customs clearance</p></div></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Care Instructions</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3"><Shield className="h-5 w-5 text-amber-500 mt-0.5" /><div><p className="font-medium">Lifetime Polish</p><p className="text-sm text-gray-600">Free with special service pack</p></div></li>
                    <li className="flex items-start gap-3"><Gem className="h-5 w-5 text-rose-500 mt-0.5" /><div><p className="font-medium">Storage Guide</p><p className="text-sm text-gray-600">Keep in original packaging</p></div></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" /><div><p className="font-medium">1 Year Warranty</p><p className="text-sm text-gray-600">Against manufacturing defects</p></div></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Suggested Products */}
      {suggested.length > 0 && (
        <AnimatedSection className="py-16 bg-gradient-to-b from-white to-gray-50">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <SectionTitle title="Complementary Pieces" subtitle="Complete your look" align="left" />
              <Button variant="ghost" className="text-amber-600" onClick={() => navigate(`/products?category=${product.category_id}`)}>View All <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
            <ProductGrid
              products={suggested}
              loading={false}
              onViewProduct={(slug) => navigate(`/products/${slug}`)}
              onAddToCart={(id) => addCartItem(id, 1).then(() => toast.success("Added to cart"))}
              onToggleWishlist={(id) => console.log("Toggle wishlist", id)}
              show3DBadge={true}
              showCategory={true}
            />
          </Container>
        </AnimatedSection>
      )}

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <Container className="py-4 flex items-center justify-between gap-4">
          <PriceTag price={product.price} currency={product.currency} size="lg" showSymbol={true} />
          <Button onClick={handleBuyNow} disabled={!inStock} className="flex-1 rounded-full h-12 bg-gradient-to-r from-amber-500 to-amber-600">
            {inStock ? "Buy Now" : "Out of Stock"}
          </Button>
        </Container>
      </div>
    </div>
  );
}