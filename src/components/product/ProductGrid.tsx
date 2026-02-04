// src/components/product/ProductGrid.tsx
import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import type { Product } from "../../api/types";
import Skeleton from "../ui/Skeleton";
import Button from "../ui/Button";
import {
  Grid,
  List,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Gem,
  Eye,
  ShoppingBag,
  Filter,
  Grid3x3,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onViewProduct?: (slug: string) => void;
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  /** product_id -> wishlist_item_id */
  wishlistMap?: Record<string, string>;
  layout?: "grid" | "list" | "auto";
  columns?: 2 | 3 | 4 | 5;
  showLayoutToggle?: boolean;
  show3DBadge?: boolean;
  showCategory?: boolean;
  itemsPerPage?: number;
  title?: string;
  subtitle?: string;
  emptyStateMessage?: string;
  emptyStateAction?: () => void;
}

type SortOption = "featured" | "price_low" | "price_high" | "newest" | "popular";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function ProductGrid({
  products,
  loading = false,
  onViewProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistMap,
  layout = "auto",
  columns = 4,
  showLayoutToggle = true,
  show3DBadge = true,
  showCategory = true,
  itemsPerPage = 12,
  title,
  subtitle,
  emptyStateMessage = "No jewellery found matching your criteria.",
  emptyStateAction,
}: ProductGridProps) {
  const [currentLayout, setCurrentLayout] = useState<"grid" | "list">(
    layout === "auto" ? "grid" : layout
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Handle responsive columns
  const getGridColumns = useCallback(() => {
    if (currentLayout === "list") return "grid-cols-1";
    
    switch (columns) {
      case 2: return "grid-cols-2";
      case 3: return "grid-cols-2 sm:grid-cols-3";
      case 4: return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
      case 5: return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      default: return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
    }
  }, [currentLayout, columns]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const productsCopy = [...products];
    
    switch (sortBy) {
      case "price_low":
        return productsCopy.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price_high":
        return productsCopy.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "newest":
        return productsCopy.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      case "popular":
        return productsCopy.sort((a, b) => {
          const bScore = (b.rating || 0) * 10 + (b.reviews_count || 0);
          const aScore = (a.rating || 0) * 10 + (a.reviews_count || 0);
          return bScore - aScore;
        });
      default:
        // Featured: Show featured items first, then newest
        return productsCopy.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
    }
  }, [products, sortBy]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedProducts.length);
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset page when sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, itemsPerPage]);

  // Show quick actions on mobile after scroll
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024) {
        setShowQuickActions(window.scrollY > 300);
      } else {
        setShowQuickActions(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle view product
  const handleViewProduct = useCallback((slug: string) => {
    if (onViewProduct) {
      onViewProduct(slug);
    } else {
      window.location.href = `/products/${slug}`;
    }
  }, [onViewProduct]);

  // Handle add to cart
  const handleAddToCart = useCallback((id: string) => {
    if (onAddToCart) {
      onAddToCart(id);
    } else {
      console.log("Add to cart:", id);
      // Add your default add to cart logic here
    }
  }, [onAddToCart]);

  // Get sort option icon
  const getSortIcon = (option: SortOption) => {
    switch (option) {
      case 'featured': return <Sparkles className="h-4 w-4" />;
      case 'price_low': return <DollarSign className="h-4 w-4" />;
      case 'price_high': return <DollarSign className="h-4 w-4" />;
      case 'newest': return <Clock className="h-4 w-4" />;
      case 'popular': return <TrendingUp className="h-4 w-4" />;
      default: return null;
    }
  };

  // Get sort label
  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'featured': return 'Featured';
      case 'price_low': return 'Price: Low to High';
      case 'price_high': return 'Price: High to Low';
      case 'newest': return 'New Arrivals';
      case 'popular': return 'Most Popular';
      default: return 'Featured';
    }
  };

  // Loading skeleton
  if (loading) {
    const skeletonItems = Array.from({ length: itemsPerPage }).map((_, i) => (
      <div key={i} className="space-y-4">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
      </div>
    ));

    return (
      <div className="space-y-8 animate-pulse">
        {/* Header skeleton */}
        {(title || subtitle) && (
          <div className="space-y-4">
            {title && <Skeleton className="h-10 w-64" />}
            {subtitle && <Skeleton className="h-5 w-96" />}
          </div>
        )}

        {/* Controls skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className={`grid ${getGridColumns()} gap-6`}>
          {skeletonItems}
        </div>

        {/* Pagination skeleton */}
        <div className="flex justify-center">
          <Skeleton className="h-12 w-96" />
        </div>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="max-w-md mx-auto px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-yellow-100/50 blur-3xl" />
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg">
              <Gem className="h-12 w-12 text-amber-500" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No Jewellery Found
          </h3>
          
          <p className="text-gray-600 mb-8">
            {emptyStateMessage}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              className="rounded-full px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg"
              onClick={emptyStateAction || (() => window.location.href = '/products')}
              icon={<Sparkles className="h-4 w-4" />}
            >
              Browse Collections
            </Button>
            
            <Button
              variant="outline"
              className="rounded-full px-8 py-3 border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={() => window.location.reload()}
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate product stats
  const productStats = useMemo(() => {
    const prices = sortedProducts.map(p => p.price || 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const threeDCount = sortedProducts.filter(p => p.model_3d_url).length;
    const inStockCount = sortedProducts.filter(p => 
      p.stock_status === "in_stock" || p.stock_status === undefined
    ).length;

    return {
      total: sortedProducts.length,
      priceRange: `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`,
      threeDCount,
      inStockCount,
    };
  }, [sortedProducts]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      {(title || subtitle || showLayoutToggle) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Title Section */}
          <div className="flex-1">
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600 text-lg">
                {subtitle}
              </p>
            )}
            
            {/* Mobile stats */}
            <div className="mt-3 md:hidden text-sm text-gray-500">
              Showing {paginatedProducts.length} of {sortedProducts.length} designs
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Layout Toggle */}
            {showLayoutToggle && (
              <div className="inline-flex items-center rounded-full bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setCurrentLayout("grid")}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    currentLayout === "grid"
                      ? "bg-white shadow-md text-amber-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                  title="Grid View"
                  aria-label="Switch to grid view"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentLayout("list")}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    currentLayout === "list"
                      ? "bg-white shadow-md text-amber-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                  title="List View"
                  aria-label="Switch to list view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="relative">
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white pl-4 pr-3 py-2 hover:border-amber-300 transition-colors">
                <div className="text-gray-500">
                  {getSortIcon(sortBy)}
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-transparent pr-8 text-sm focus:outline-none cursor-pointer"
                  aria-label="Sort products"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">New Arrivals</option>
                  <option value="popular">Most Popular</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
                <ChevronDown className="h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Desktop results count */}
            <div className="hidden md:block text-sm text-gray-600 whitespace-nowrap">
              <span className="font-semibold text-amber-600">{paginatedProducts.length}</span> of{" "}
              <span className="font-semibold text-gray-900">{sortedProducts.length}</span> designs
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentLayout}-${sortBy}-${currentPage}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
          className={`grid ${getGridColumns()} gap-6 lg:gap-8`}
        >
          {paginatedProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              layout="position"
              className="w-full min-w-0"
            >

              <ProductCard
                product={product}
                onView={onViewProduct}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={!!wishlistMap?.[product.id]}
                layout={currentLayout}
                show3DBadge={show3DBadge}
                showCategory={showCategory}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-8 mt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Page info */}
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{startIndex + 1}-{endIndex}</span> of{" "}
              <span className="font-semibold text-gray-900">{sortedProducts.length}</span> products
            </div>

            {/* Page controls */}
            <div className="flex items-center gap-4">
              {/* Previous button */}
              <Button
                variant="outline"
                className="rounded-full border-gray-200 hover:border-amber-300 hover:bg-amber-50 px-6"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>

              {/* Page numbers */}
              <div className="hidden sm:flex items-center gap-2">
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  // First page
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        type="button"
                        onClick={() => setCurrentPage(1)}
                        className="h-10 w-10 rounded-full text-sm font-medium transition hover:bg-gray-100"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis1" className="text-gray-400">
                          ...
                        </span>
                      );
                    }
                  }

                  // Visible pages
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentPage(i)}
                        className={`h-10 w-10 rounded-full text-sm font-medium transition ${
                          currentPage === i
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Last page
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis2" className="text-gray-400">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        type="button"
                        onClick={() => setCurrentPage(totalPages)}
                        className="h-10 w-10 rounded-full text-sm font-medium transition hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}
              </div>

              {/* Next button */}
              <Button
                variant="outline"
                className="rounded-full border-gray-200 hover:border-amber-300 hover:bg-amber-50 px-6"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next
              </Button>
            </div>

            {/* Items per page selector */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-600">Show per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const newItemsPerPage = parseInt(e.target.value);
                  setCurrentPage(1);
                  // Note: In a real app, you might want to pass this up to parent
                  // or use a context/state management solution
                }}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                aria-label="Items per page"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={36}>36</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Quick Actions Bar */}
      {showQuickActions && paginatedProducts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl px-5 py-3">
            <button
              type="button"
              onClick={() => {
                const firstProduct = paginatedProducts[0];
                if (firstProduct) {
                  handleViewProduct(firstProduct.slug);
                }
              }}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-white text-sm font-semibold shadow-lg"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
              Quick View
            </button>
            
            <button
              type="button"
              onClick={() => {
                const firstProduct = paginatedProducts[0];
                if (firstProduct) {
                  handleAddToCart(firstProduct.id);
                }
              }}
              className="flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-amber-700 text-sm font-semibold hover:bg-amber-50 transition-colors"
              aria-label="Quick add to cart"
            >
              <ShoppingBag className="h-4 w-4" />
              Quick Add
            </button>
          </div>
        </div>
      )}

      {/* Product Stats */}
      <div className="pt-8 mt-8 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { 
              label: "Total Designs", 
              value: productStats.total,
              icon: <Grid3x3 className="h-5 w-5 text-amber-600" />
            },
            { 
              label: "Price Range", 
              value: productStats.priceRange,
              icon: <DollarSign className="h-5 w-5 text-amber-600" />
            },
            { 
              label: "3D Models", 
              value: productStats.threeDCount,
              icon: <Sparkles className="h-5 w-5 text-amber-600" />
            },
            { 
              label: "In Stock", 
              value: productStats.inStockCount,
              icon: <Filter className="h-5 w-5 text-amber-600" />
            }
          ].map((stat, idx) => (
            <div key={idx} className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-amber-50/50 to-yellow-50/50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm">
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Help Text */}
      <div className="text-center text-sm text-gray-500 pt-4">
        <p>
          Need help selecting the perfect piece?{" "}
          <button
            type="button"
            onClick={() => window.location.href = '/contact'}
            className="font-semibold text-amber-600 hover:text-amber-700 transition-colors"
          >
            Contact our jewellery experts →
          </button>
        </p>
      </div>
    </div>
  );
}