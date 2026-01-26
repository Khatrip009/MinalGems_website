// src/components/product/ProductGrid.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import type { Product } from "../../api/types";
import Skeleton from "../ui/Skeleton";
import Button from "../ui/Button";
import {
  Grid,
  List,
  Filter,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Gem,
  Eye,
  ShoppingBag,
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
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
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
      damping: 15,
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
}: ProductGridProps) {
  const [currentLayout, setCurrentLayout] = useState<"grid" | "list">(
    layout === "auto" ? "grid" : layout
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sortBy, setSortBy] = useState<"featured" | "price_low" | "price_high" | "newest" | "popular">("featured");

  // Handle responsive columns
  const getGridColumns = () => {
    if (currentLayout === "list") return "grid-cols-1";
    
    switch (columns) {
      case 2: return "grid-cols-2";
      case 3: return "grid-cols-2 md:grid-cols-3";
      case 4: return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case 5: return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      default: return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  // Sort products
  useEffect(() => {
    let sorted = [...products];
    
    switch (sortBy) {
      case "price_low":
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price_high":
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "newest":
        sorted.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case "popular":
        // Sort by popularity (assuming views or purchases property)
        sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        // Featured: keep original order or sort by featured flag
        break;
    }
    
    setFilteredProducts(sorted);
    setCurrentPage(1);
  }, [products, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        {(title || subtitle) && (
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-3" />
            {subtitle && <Skeleton className="h-5 w-96" />}
          </div>
        )}
        
        {/* Grid skeleton */}
        <div className={`grid ${getGridColumns()} gap-6`}>
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <div key={i} className="space-y-4">
              {/* Image skeleton */}
              <Skeleton className="aspect-[3/4] w-full rounded-3xl" />
              
              {/* Content skeleton */}
              <div className="space-y-3 p-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto max-w-md">
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-amber-100 to-amber-50">
            <Gem className="h-12 w-12 text-amber-500" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No Jewellery Found
          </h3>
          
          <p className="text-gray-600 mb-8">
            We couldn't find any pieces matching your criteria. Try adjusting your filters or explore our collections.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8"
              onClick={() => window.location.href = '/products'}
              icon={<Sparkles className="h-4 w-4" />}
            >
              Browse Collections
            </Button>
            
            <Button
              variant="outline"
              className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={() => window.location.reload()}
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      {(title || subtitle || showLayoutToggle) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            )}
            {subtitle && (
              <p className="text-gray-600">{subtitle}</p>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Layout Toggle */}
            {showLayoutToggle && (
              <div className="flex items-center gap-2 rounded-full bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setCurrentLayout("grid")}
                  className={`px-3 py-2 rounded-full transition ${
                    currentLayout === "grid"
                      ? "bg-white shadow text-amber-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentLayout("list")}
                  className={`px-3 py-2 rounded-full transition ${
                    currentLayout === "list"
                      ? "bg-white shadow text-amber-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="List View"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            )}
            
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none rounded-full border border-gray-200 bg-white pl-4 pr-10 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="featured">Featured</option>
                <option value="newest">New Arrivals</option>
                <option value="popular">Most Popular</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Results count */}
            <div className="hidden sm:block text-sm text-gray-500">
              Showing <span className="font-semibold text-amber-600">{paginatedProducts.length}</span> of{" "}
              <span className="font-semibold text-gray-900">{filteredProducts.length}</span> designs
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
          className={`grid ${getGridColumns()} gap-6 lg:gap-8`}
        >
          {paginatedProducts.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
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
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Page <span className="font-semibold text-gray-900">{currentPage}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalPages}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-full border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="hidden sm:flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`h-10 w-10 rounded-full text-sm font-medium transition ${
                        currentPage === pageNumber
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      className={`h-10 w-10 rounded-full text-sm font-medium transition ${
                        currentPage === totalPages
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                className="rounded-full border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next
              </Button>
            </div>
            
            {/* Items per page selector */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const newItemsPerPage = parseInt(e.target.value);
                  setCurrentPage(1);
                  // If you have a callback for items per page change, add it here
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
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

      {/* Quick Actions Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <div className="flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl px-4 py-3">
          <button
            type="button"
            onClick={() => {
              const firstProduct = paginatedProducts[0];
              if (firstProduct && onViewProduct) {
                onViewProduct(firstProduct.slug);
              }
            }}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-white text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            Quick View
          </button>
          
          <button
            type="button"
            onClick={() => {
              const firstProduct = paginatedProducts[0];
              if (firstProduct && onAddToCart) {
                onAddToCart(firstProduct.id);
              }
            }}
            className="flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-amber-700 text-sm font-medium hover:bg-amber-50"
          >
            <ShoppingBag className="h-4 w-4" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="pt-8 mt-8 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Designs", value: filteredProducts.length },
            { label: "Price Range", value: `₹${Math.min(...filteredProducts.map(p => p.price || 0)).toLocaleString('en-IN')} - ₹${Math.max(...filteredProducts.map(p => p.price || 0)).toLocaleString('en-IN')}` },
            { label: "3D Models", value: filteredProducts.filter(p => p.model_3d_url).length },
            { label: "In Stock", value: filteredProducts.length }
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-2xl font-bold text-amber-700">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}