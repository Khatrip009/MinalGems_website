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
  Star,
  Share2,
  RotateCw,
  ZoomIn,
  Download,
  ShoppingBag,
  Calendar,
  Tag,
  Award,
  Clock,
  MapPin,
  ChevronRight,
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

/* ---------------- TYPES ---------------- */

type ProductWithStock = Product & {
  available_qty?: number | null;
  assets?: ProductAsset[];
  category_name?: string;
  tags?: string[];
  weight?: number;
  metal_type?: string;
  gem_type?: string;
  certification?: string;
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

// Check if URL is a 3D model
const is3DModel = (url: string): boolean => {
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.glb') || 
         lowerUrl.endsWith('.gltf') || 
         lowerUrl.includes('model3d') || 
         lowerUrl.includes('3d-model') ||
         lowerUrl.includes('.usdz') ||
         lowerUrl.includes('.obj');
};

// Get appropriate image placeholder
const getAssetPlaceholder = (assetType: string): string => {
  switch (assetType) {
    case 'model_3d':
      return "/images/placeholders/3d-placeholder.jpg";
    case 'video':
      return "/images/placeholders/video-placeholder.jpg";
    default:
      return "/images/placeholders/jewellery-placeholder.jpg";
  }
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
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

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

        /* ---------------- PRODUCT DETAIL ---------------- */
        const prodRes = await apiFetch<ProductResponse>(
          `/masters/products/${slug}`
        );

        if (!prodRes.ok || !prodRes.product) {
          throw new Error("Product not found");
        }

        if (cancelled) return;

        const currentProduct = prodRes.product;
        setProduct(currentProduct);

        /* ---------------- SUGGESTED (SAME CATEGORY) ---------------- */
        if (currentProduct.category_id) {
          const listRes = await apiFetch<ProductsListResponse>(
            `/masters/products?category=${encodeURIComponent(
              currentProduct.category_id
            )}`
          );

          if (listRes.ok && !cancelled) {
            const suggestions = listRes.products
              .filter((p) => p.slug !== slug)
              .slice(0, 8);

            setSuggested(suggestions);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load product");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* ---------------- WISHLIST SYNC ---------------- */

  useEffect(() => {
    if (!product || !isLoggedIn) return;

    const currentProduct = product;

    async function syncWishlist() {
      try {
        const res = await getWishlist();
        if (!res.ok) return;

        const match = res.wishlist.items.find(
          (i: WishlistItemLite) => i.product_id === currentProduct.id
        );

        setWishlistItemId(match ? match.id : null);
      } catch {
        /* ignore */
      }
    }

    syncWishlist();
  }, [product, isLoggedIn]);

  /* ---------------- ASSETS MANAGEMENT ---------------- */

  const allAssets = useMemo(() => {
    if (!product?.assets) return [];
    
    return product.assets.map(asset => ({
      ...asset,
      is_3d: asset.asset_type === 'model_3d' || is3DModel(asset.url),
      is_video: asset.asset_type === 'video',
      thumbnail: asset.thumbnail_url || asset.url
    }));
  }, [product]);

  const activeAsset = allAssets[activeAssetIndex] || null;

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
      navigate('/cart');
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

  /* ---------------- ZOOM FUNCTIONALITY ---------------- */

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeAsset || activeAsset.is_3d || activeAsset.is_video) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  /* ---------------- RENDER LOADING ---------------- */

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Container className="py-8">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-8">
            <Skeleton className="h-4 w-16" />
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Gallery skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-[500px] w-full rounded-3xl" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-20 w-20 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Details skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-8 w-32" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  /* ---------------- RENDER ERROR ---------------- */

  if (error || !product) {
    return (
      <AnimatedSection className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-20">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 mb-6">
                <Gem className="h-10 w-10 text-rose-500" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
              <p className="text-gray-600 text-lg mb-8">
                The jewellery piece you're looking for might have been moved or is no longer available.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8"
                onClick={() => navigate('/products')}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse Collection
              </Button>
              
              <Button
                variant="outline"
                className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                Go Back
              </Button>
            </div>
            
            <div className="mt-16 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Assistance?</h3>
              <p className="text-gray-600 mb-6">
                Contact our jewellery consultants for personalized help.
              </p>
              <Button
                variant="ghost"
                className="text-amber-600 hover:text-amber-700"
                onClick={() => navigate('/contact')}
              >
                Contact Support →
              </Button>
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
        <Container className="py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Share"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
              
              {isLoggedIn && (
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title={wishlistItemId ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      wishlistItemId
                        ? "fill-rose-500 text-rose-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Product Main Section */}
      <Container className="py-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Gallery Section */}
          <div className="space-y-6">
            {/* Main Image/Asset Viewer */}
            <div 
              className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200"
              onMouseMove={handleImageMouseMove}
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
            >
              {activeAsset ? (
                <>
                  {activeAsset.is_3d ? (
                    <div className="relative aspect-square">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-8">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
                            <Eye className="h-10 w-10 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">3D Model Available</h3>
                          <p className="text-gray-600 mb-6">
                            This product has an interactive 3D view
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                              href={activeAsset.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
                            >
                              <Eye className="h-4 w-4" />
                              View 3D Model
                            </a>
                            <button
                              onClick={() => toast.success("Opening 3D viewer...")}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-500 bg-white px-6 py-3 text-blue-600 font-medium hover:bg-blue-50 transition-all"
                            >
                              <RotateCw className="h-4 w-4" />
                              Rotate View
                            </button>
                          </div>
                        </div>
                      </div>
                      <img
                        src={getAssetPlaceholder('model_3d')}
                        alt="3D Model Thumbnail"
                        className="w-full h-full object-cover opacity-20"
                      />
                    </div>
                  ) : activeAsset.is_video ? (
                    <div className="aspect-square flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-pink-500 mb-4">
                          <Eye className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Video Available</h3>
                        <p className="text-gray-600 mb-6">
                          Watch this jewellery piece in motion
                        </p>
                        <a
                          href={activeAsset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-6 py-3 text-white font-medium hover:from-red-600 hover:to-pink-600 transition-all"
                        >
                          <Eye className="h-4 w-4" />
                          Play Video
                        </a>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={activeAsset.url}
                        alt={product.title}
                        className="w-full h-full object-contain aspect-square"
                      />
                      
                      {/* Zoom Overlay */}
                      {showZoom && (
                        <div className="absolute inset-0 overflow-hidden">
                          <div 
                            className="absolute w-[200%] h-[200%] bg-cover bg-no-repeat"
                            style={{
                              backgroundImage: `url(${activeAsset.url})`,
                              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                              transform: 'scale(2)',
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
                        </div>
                      )}
                      
                      {/* Zoom Controls */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => toast.success("Zoom activated")}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                          title="Zoom"
                        >
                          <ZoomIn className="h-5 w-5 text-gray-700" />
                        </button>
                        <button
                          onClick={() => window.open(activeAsset.url, '_blank')}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                          title="View Full Size"
                        >
                          <Download className="h-5 w-5 text-gray-700" />
                        </button>
                      </div>
                    </>
                  )}
                  
                  {/* 3D/Vi3D Badge */}
                  {(activeAsset.is_3d || activeAsset.is_video) && (
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1.5 text-white text-sm font-medium shadow-lg">
                        <Sparkles className="h-3 w-3" />
                        <span>{activeAsset.is_3d ? '3D VIEW' : 'VIDEO'}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <Gem className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No image available</p>
                  </div>
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
                      index === activeAssetIndex
                        ? "border-amber-500 ring-2 ring-amber-200 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={asset.thumbnail}
                      alt={`${product.title} view ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    
                    {/* Asset Type Badge */}
                    {asset.is_3d && (
                      <div className="absolute top-1 right-1">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">3D</span>
                        </div>
                      </div>
                    )}
                    
                    {asset.is_video && (
                      <div className="absolute top-1 right-1">
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">▶</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Active Indicator */}
                    {index === activeAssetIndex && (
                      <div className="absolute inset-0 bg-amber-500/10" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">BIS Hallmark</p>
                  <p className="text-xs text-gray-500">Certified Purity</p>
                </div>
              </div>
              
              <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Free Shipping if offer is available</p>
                  <p className="text-xs text-gray-500">Pan India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-8">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500">
              <button
                onClick={() => navigate('/products')}
                className="hover:text-amber-700 transition-colors"
              >
                Shop
              </button>
              <ChevronRight className="h-4 w-4 mx-2" />
              {product.category_name ? (
                <>
                  <span>{product.category_name}</span>
                  <ChevronRight className="h-4 w-4 mx-2" />
                </>
              ) : null}
              <span className="font-medium text-gray-900">{product.title}</span>
            </div>

            {/* Product Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {product.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {!inStock && (
                  <Badge variant="error" className="text-xs">
                    Out of Stock
                  </Badge>
                )}
              </div>
              
              <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                {product.title}
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {product.short_description}
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <RatingStars rating={4.7} count={32} size="lg" />
                <span className="text-gray-500">•</span>
                <span className="text-gray-500 flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {product.views || 124} views
                </span>
              </div>
            </div>

            {/* Price Section */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 p-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-sm text-amber-700 font-medium mb-1">Price</p>
                  <PriceTag
                    price={product.price}
                    currency={product.currency}
                    per="piece"
                    size="xl"
                    showSymbol={true}
                  />
                  <p className="text-sm text-amber-600 mt-2">
                    Includes all taxes & duties
                  </p>
                </div>
                
                {availableQty !== null && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Available Stock</p>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min((availableQty / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900">{availableQty} pieces</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  className="flex-1 rounded-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25"
                  disabled={!inStock}
                  onClick={handleBuyNow}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
                
                <Button
                  variant="outline"
                  className="flex-1 rounded-full h-14 text-lg border-amber-500 text-amber-600 hover:bg-amber-50"
                  disabled={!inStock}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              </div>
              
              {/* Wishlist & Notify */}
              <div className="flex gap-3 mt-4">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-full border-gray-200 hover:bg-gray-50"
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                >
                  <Heart
                    className={`mr-2 h-5 w-5 ${
                      wishlistItemId
                        ? "fill-rose-500 text-rose-500"
                        : "text-gray-600"
                    }`}
                  />
                  {wishlistItemId ? "In Wishlist" : "Add to Wishlist"}
                </Button>
                
                {!inStock && (
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-full border-gray-200 hover:bg-gray-50"
                    onClick={handleNotifyMe}
                    disabled={notifyLoading || notifySubscribed}
                  >
                    {notifySubscribed ? (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        Notifications On
                      </>
                    ) : (
                      <>
                        <Bell className="mr-2 h-5 w-5" />
                        Notify Me
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Product Specifications */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="h-6 w-6 text-amber-500" />
                Specifications
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Metal Type</p>
                  <p className="font-semibold text-gray-900">
                    {product.metal_type || "18K Gold"}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Gem Type</p>
                  <p className="font-semibold text-gray-900">
                    {product.gem_type || "Diamond"}
                  </p>
                </div>
                
                {product.weight && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Approx. Weight</p>
                    <p className="font-semibold text-gray-900">
                      {product.weight}g
                    </p>
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">SKU</p>
                  <p className="font-semibold text-gray-900">
                    {product.sku || product.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Certification</p>
                  <p className="font-semibold text-gray-900">
                    {product.certification || "BIS Hallmark"}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Estimated Delivery</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {product.estimated_delivery || "7-10 business days"}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            {product.description && (
              <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Description</h3>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>
            )}

            {/* Shipping & Care */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="h-6 w-6 text-amber-500" />
                Shipping & Care
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Delivery Information</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Free Insured Shipping if offer available</p>
                        <p className="text-sm text-gray-600">Across India with tracking</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Express Delivery</p>
                        <p className="text-sm text-gray-600">Available for major cities</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">International Shipping</p>
                        <p className="text-sm text-gray-600">Worldwide with customs clearance</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Care Instructions</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Lifetime Polish</p>
                        <p className="text-sm text-gray-600">Free polishing service with special service pack</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Gem className="h-5 w-5 text-rose-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Storage Guide</p>
                        <p className="text-sm text-gray-600">Keep in original packaging</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">1 Year Warranty</p>
                        <p className="text-sm text-gray-600">Against manufacturing defects</p>
                      </div>
                    </li>
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
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <SectionTitle
                    title="Complementary Pieces"
                    subtitle="Complete your look with these matching designs"
                    align="left"
                  />
                </div>
                <Button
                  variant="ghost"
                  className="text-amber-600 hover:text-amber-700"
                  onClick={() => navigate(`/products?category=${product.category_id}`)}
                >
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <ProductGrid
              products={suggested}
              loading={false}
              onViewProduct={(slug) => navigate(`/products/${slug}`)}
              onAddToCart={(id) =>
                addCartItem(id, 1).then(() =>
                  toast.success("Added to cart")
                )
              }
              onToggleWishlist={(id) => console.log("Toggle wishlist", id)}
              show3DBadge={true}
              showCategory={true}
              layout="responsive"
            />
          </Container>
        </AnimatedSection>
      )}

      {/* Floating Action Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <Container className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <PriceTag
                price={product.price}
                currency={product.currency}
                size="lg"
                showSymbol={true}
              />
            </div>
            <div className="flex-1">
              <Button
                variant="primary"
                className="w-full rounded-full h-12 bg-gradient-to-r from-amber-500 to-amber-600"
                disabled={!inStock}
                onClick={handleBuyNow}
              >
                {inStock ? "Buy Now" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}