import React, { useContext, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  SlidersHorizontal, 
  Search, 
  XCircle, 
  Filter,
  ChevronDown,
  Sparkles,
  Tag,
  TrendingUp,
  Clock,
  Award,
  CheckCircle,
  Gem,
  Eye
} from "lucide-react";

import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
import Badge from "../components/ui/Badge";
import SectionTitle from "../components/ui/SectionTitle";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import ProductGrid from "../components/product/ProductGrid";

import { CartContext } from "../context/CartContext";
import { fetchProducts } from "../api/products.api";
import { fetchCategories } from "../api/categories.api";
import type { Category } from "../api/categories.api";
import type { Product } from "../api/types";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../api/wishlist.api";

import { toast } from "react-hot-toast";

type SortKey = "latest" | "price_low_high" | "price_high_low" | "popular" | "name_az";

export default function ShopPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const cartCtx = useContext(CartContext);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">("all");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | "all">("all");
  const [sort, setSort] = useState<SortKey>("latest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [wishlistMap, setWishlistMap] = useState<Record<string, string>>({});
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const activeCategory = selectedCategoryId === "all"
    ? null
    : categories.find((c) => c.id === selectedCategoryId) || null;

  /* ----------------------------------------
   * Load categories
   * -------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const res = await fetchCategories();
        if (!cancelled && res.ok) {
          setCategories(res.categories || []);
          
          // Set initial price range based on products if available
          if (res.categories?.length) {
            const maxPrice = Math.max(...res.categories.map(c => c.max_price || 0));
            setPriceRange([0, maxPrice || 500000]);
          }
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ----------------------------------------
   * Sync category from URL (?cat=)
   * -------------------------------------- */
  useEffect(() => {
    if (!categories.length) return;

    const catFromUrl = searchParams.get("cat");

    if (!catFromUrl) {
      setSelectedCategoryId("all");
      setSelectedCategorySlug("all");
      return;
    }

    const matched = categories.find(c => c.slug === catFromUrl);

    if (matched) {
      setSelectedCategoryId(matched.id);
      setSelectedCategorySlug(matched.slug);
    }
  }, [searchParams, categories]);

  /* ----------------------------------------
   * Load products (ALL + BY CATEGORY)
   * -------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoadingProducts(true);
        const query = selectedCategoryId === "all"
          ? ""
          : `?category=${encodeURIComponent(selectedCategoryId)}`;

        const res = await fetchProducts(query);

        if (!cancelled && res.ok) {
          const products = res.products ?? [];
          setAllProducts(products);
          
          // Update price range if products exist
          if (products.length > 0) {
            const prices = products.map(p => p.price || 0);
            const maxPrice = Math.max(...prices);
            setPriceRange(prev => [prev[0], Math.max(prev[1], maxPrice)]);
          }
        }
      } catch {
        if (!cancelled) setError("Unable to load products right now.");
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [selectedCategorySlug]);

  /* ----------------------------------------
   * Load wishlist
   * -------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadWishlist() {
      setWishlistLoading(true);
      try {
        const res = await getWishlist();
        if (!res.ok || !res.wishlist || cancelled) return;

        const map: Record<string, string> = {};
        for (const item of res.wishlist.items || []) {
          map[item.product_id] = item.id;
        }
        if (!cancelled) setWishlistMap(map);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setWishlistLoading(false);
      }
    }

    loadWishlist();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ----------------------------------------
   * Derived: search + sort + filters
   * -------------------------------------- */
  const visibleProducts = useMemo(() => {
    let list = [...allProducts];

    // Search filter
    const s = search.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(s) ||
          p.short_description?.toLowerCase().includes(s) ||
          p.tags?.some(tag => tag.toLowerCase().includes(s))
      );
    }

    // Price range filter
    list = list.filter(p => {
      const price = p.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    if (sort === "price_low_high") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === "price_high_low") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === "name_az") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sort === "popular") {
      // Sort by popularity (you can adjust this based on your metrics)
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      // latest
      list.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    }

    return list;
  }, [allProducts, search, sort, priceRange]);

  /* ----------------------------------------
   * Handlers
   * -------------------------------------- */
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);

  const handleSelectCategory = (cat: Category | "all") => {
    if (cat === "all") {
      setSelectedCategoryId("all");
      navigate("/products");
    } else {
      setSelectedCategoryId(cat.id);
      navigate(`/products?cat=${cat.slug}`);
    }
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setSort(e.target.value as SortKey);

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange([min, max]);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategoryId("all");
    setSelectedCategorySlug("all");
    setSort("latest");
    setPriceRange([0, 500000]);
    toast.success("All filters cleared");
  };

  const handleViewProduct = (slug: string) =>
    navigate(`/products/${slug}`);

  const handleAddToCart = async (productId: string) => {
    try {
      await cartCtx?.addItem?.(productId, 1);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add product");
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    try {
      const existingId = wishlistMap[productId];

      // REMOVE
      if (existingId) {
        await removeFromWishlist(existingId);

        setWishlistMap((prev) => {
          const next: Record<string, string> = { ...prev };
          delete next[productId];
          return next;
        });

        toast.success("Removed from wishlist");
        return;
      }

      // ADD
      const res = await addToWishlist(productId);

      if (!res.ok || !res.id) return;

      const wishlistId: string = res.id;

      setWishlistMap((prev) => {
        const next: Record<string, string> = { ...prev };
        next[productId] = wishlistId;
        return next;
      });

      toast.success("Added to wishlist");
    } catch {
      toast.error("Wishlist error");
    }
  };

  const totalVisible = visibleProducts.length;
  const totalProducts = allProducts.length;

  /* ----------------------------------------
   * Format price for display
   * -------------------------------------- */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-rose-50/20">
      {/* Hero Header */}
      <AnimatedSection className="relative overflow-hidden border-b border-amber-200/30 bg-gradient-to-br from-amber-900 via-rose-900 to-purple-900">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/patterns/diamond-grid.svg')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        <Container className="relative py-16 md:py-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Content */}
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium text-white">Premium Collection</span>
              </div>
              
              <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Discover <span className="text-yellow-300">Exquisite</span> Jewellery
              </h1>
              
              <p className="text-xl text-white/80 leading-relaxed">
                Explore our curated collection of handcrafted diamond and gold jewellery, 
                where traditional artistry meets contemporary design.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 pt-4">
                {[
                  { label: "Designs", value: totalProducts },
                  { label: "Categories", value: categories.length },
                  { label: "Craftsmanship", value: "25+ Years" },
                  { label: "Satisfaction", value: "100%" }
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-2xl font-bold text-yellow-300">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="lg:w-1/3">
              <div className="relative">
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 shadow-2xl">
                  <h3 className="mb-6 text-2xl font-semibold text-white">Find Your Perfect Piece</h3>
                  
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Search className="h-5 w-5 text-amber-300" />
                      </div>
                      <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search designs, occasions, styles..."
                        className="w-full rounded-full border border-white/30 bg-white/10 pl-12 pr-12 py-4 text-white placeholder:text-white/60 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                      />
                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="absolute inset-y-0 right-0 flex items-center pr-4"
                        >
                          <XCircle className="h-5 w-5 text-white/60 hover:text-white" />
                        </button>
                      )}
                    </div>

                    {/* Active filters summary */}
                    {(search || selectedCategoryId !== "all" || priceRange[0] > 0 || priceRange[1] < 500000) && (
                      <div className="rounded-lg bg-white/5 p-4">
                        <p className="text-sm font-medium text-white mb-2">Active Filters:</p>
                        <div className="flex flex-wrap gap-2">
                          {search && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-sm text-amber-200">
                              Search: "{search}"
                            </span>
                          )}
                          {selectedCategoryId !== "all" && activeCategory && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-3 py-1 text-sm text-rose-200">
                              <Tag className="h-3 w-3" />
                              {activeCategory.name}
                            </span>
                          )}
                          {(priceRange[0] > 0 || priceRange[1] < 500000) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-200">
                              Price: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Results summary */}
                    <div className="border-t border-white/10 pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">
                            {totalVisible} of {totalProducts} designs
                          </p>
                          <p className="text-sm text-white/60">
                            {activeCategory ? `In ${activeCategory.name}` : 'Across all categories'}
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                          onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Designs
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </AnimatedSection>

      {/* Mobile Filter Toggle */}
      <div className="sticky top-0 z-40 border-b border-amber-100 bg-white/95 backdrop-blur-sm lg:hidden">
        <Container className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters {showMobileFilters ? <ChevronDown className="ml-1 h-4 w-4 rotate-180" /> : <ChevronDown className="ml-1 h-4 w-4" />}
              </Button>
              <span className="text-sm text-gray-600">
                {totalVisible} designs
              </span>
            </div>
            <select
              value={sort}
              onChange={handleSortChange}
              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="latest">Newest</option>
              <option value="popular">Popular</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
              <option value="name_az">Name: A-Z</option>
            </select>
          </div>
        </Container>
      </div>

      <Container className="py-8 md:py-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-8 rounded-3xl border border-amber-100 bg-white/80 p-8 shadow-lg shadow-amber-900/5 backdrop-blur-sm">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 p-2">
                    <SlidersHorizontal className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Refine Selection</h3>
                    <p className="text-sm text-gray-500">Find your perfect match</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="text-sm text-gray-500 hover:text-amber-700 hover:bg-amber-50"
                  onClick={handleClearFilters}
                >
                  Clear All
                </Button>
              </div>

              {/* Categories */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Categories</h4>
                  <span className="text-sm text-gray-500">{categories.length}</span>
                </div>

                {loadingCategories ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-10 w-full rounded-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleSelectCategory("all")}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all ${
                        selectedCategoryId === "all"
                          ? "bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 text-amber-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-1.5 ${selectedCategoryId === "all" ? 'bg-amber-100' : 'bg-gray-100'}`}>
                          <Gem className="h-4 w-4" />
                        </div>
                        <span className="font-medium">All Designs</span>
                      </div>
                      <span className={`text-sm font-medium ${selectedCategoryId === "all" ? 'text-amber-600' : 'text-gray-400'}`}>
                        {totalProducts}
                      </span>
                    </button>

                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all ${
                          selectedCategoryId === cat.id
                            ? "bg-gradient-to-r from-rose-50 to-pink-100 border border-rose-200 text-rose-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`rounded-full p-1.5 ${selectedCategoryId === cat.id ? 'bg-rose-100' : 'bg-gray-100'}`}>
                            <Tag className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <span className="font-medium">{cat.name}</span>
                            <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${selectedCategoryId === cat.id ? 'text-rose-600' : 'text-gray-400'}`}>
                          {cat.product_count || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Price Range</h4>
                  <span className="text-sm text-gray-500">
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </span>
                </div>
                
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="1000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full accent-amber-500"
                  />
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-amber-500 mt-4"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Min Price</p>
                    <p className="font-semibold text-gray-900">{formatPrice(priceRange[0])}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Max Price</p>
                    <p className="font-semibold text-gray-900">{formatPrice(priceRange[1])}</p>
                  </div>
                </div>

                {/* Price quick filters */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Under 50K", range: [0, 50000] },
                    { label: "50K-1L", range: [50000, 100000] },
                    { label: "1L-2L", range: [100000, 200000] },
                    { label: "Over 2L", range: [200000, 500000] }
                  ].map((filter) => (
                    <button
                      key={filter.label}
                      type="button"
                      onClick={() => setPriceRange(filter.range as [number, number])}
                      className={`rounded-full px-3 py-1.5 text-sm transition ${
                        priceRange[0] === filter.range[0] && priceRange[1] === filter.range[1]
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Sort By</h4>
                <div className="space-y-2">
                  {[
                    { value: "latest", label: "Newest First", icon: Clock },
                    { value: "popular", label: "Most Popular", icon: TrendingUp },
                    { value: "price_low_high", label: "Price: Low to High", icon: TrendingUp },
                    { value: "price_high_low", label: "Price: High to Low", icon: TrendingUp },
                    { value: "name_az", label: "Name: A to Z", icon: Award }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSort(option.value as SortKey)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                        sort === option.value
                          ? "bg-amber-50 border border-amber-200 text-amber-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`rounded-full p-1.5 ${sort === option.value ? 'bg-amber-100' : 'bg-gray-100'}`}>
                        <option.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust badges */}
              <div className="rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 p-6 border border-amber-200">
                <h4 className="font-semibold text-gray-900 mb-3">Why Shop With Us</h4>
                <div className="space-y-3">
                  {[
                    { text: "BIS Hallmark Certified", icon: CheckCircle },
                    { text: "Free Shipping Pan India", icon: CheckCircle },
                    { text: "30-Day Return Policy", icon: CheckCircle },
                    { text: "Lifetime Maintenance", icon: CheckCircle }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="rounded-full bg-green-100 p-1">
                        <item.icon className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filters (Dropdown) */}
          {showMobileFilters && (
            <div className="lg:hidden">
              <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-lg">
                {/* Categories */}
                <div className="mb-8">
                  <h4 className="mb-4 font-semibold text-gray-900">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectCategory("all")}
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        selectedCategoryId === "all"
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All ({totalProducts})
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`rounded-full px-4 py-2 text-sm font-medium ${
                          selectedCategoryId === cat.id
                            ? "bg-rose-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {cat.name} ({cat.product_count || 0})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-8">
                  <h4 className="mb-4 font-semibold text-gray-900">Price Range</h4>
                  <div className="space-y-4">
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="500000"
                        step="1000"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full accent-amber-500"
                      />
                      <input
                        type="range"
                        min="0"
                        max="500000"
                        step="1000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full accent-amber-500 mt-4"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h4 className="mb-4 font-semibold text-gray-900">Sort By</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["latest", "popular", "price_low_high", "price_high_low", "name_az"].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSort(value as SortKey)}
                        className={`rounded-full px-4 py-2 text-sm font-medium ${
                          sort === value
                            ? "bg-amber-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {value === "latest" && "Newest"}
                        {value === "popular" && "Popular"}
                        {value === "price_low_high" && "Price: Low to High"}
                        {value === "price_high_low" && "Price: High to Low"}
                        {value === "name_az" && "Name: A-Z"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters Button */}
                <Button
                  variant="primary"
                  className="mt-8 w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1" id="products-grid">
            {/* Results Header */}
            <div className="mb-8 rounded-2xl bg-white/80 p-6 shadow-sm backdrop-blur-sm">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeCategory ? activeCategory.name : 'All Jewellery'}
                  </h2>
                  <p className="text-gray-600">
                    {totalVisible} of {totalProducts} designs
                    {search && ` matching "${search}"`}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <select
                      value={sort}
                      onChange={handleSortChange}
                      className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      <option value="latest">Newest First</option>
                      <option value="popular">Most Popular</option>
                      <option value="price_low_high">Price: Low to High</option>
                      <option value="price_high_low">Price: High to Low</option>
                      <option value="name_az">Name: A to Z</option>
                    </select>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-amber-600">{totalVisible}</span> results
                  </div>
                </div>
              </div>
              
              {/* Active filters pills */}
              {(search || selectedCategoryId !== "all" || priceRange[0] > 0 || priceRange[1] < 500000) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {search && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-sm text-amber-800">
                        Search: "{search}"
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="ml-1 hover:text-amber-900"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedCategoryId !== "all" && activeCategory && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1.5 text-sm text-rose-800">
                        <Tag className="h-3 w-3" />
                        {activeCategory.name}
                        <button
                          type="button"
                          onClick={() => handleSelectCategory("all")}
                          className="ml-1 hover:text-rose-900"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {(priceRange[0] > 0 || priceRange[1] < 500000) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-sm text-emerald-800">
                        Price: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                        <button
                          type="button"
                          onClick={() => setPriceRange([0, 500000])}
                          className="ml-1 hover:text-emerald-900"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                  <XCircle className="h-8 w-8 text-rose-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-rose-700">Unable to Load Products</h3>
                <p className="text-rose-600">{error}</p>
                <Button
                  variant="primary"
                  className="mt-4 rounded-full bg-rose-500 hover:bg-rose-600"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!loadingProducts && totalVisible === 0 && (
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 p-12 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white">
                  <Search className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">No Designs Found</h3>
                <p className="mb-8 text-gray-600 max-w-md mx-auto">
                  We couldn't find any jewellery matching your current filters. Try adjusting your search or filters.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="primary"
                    className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                    onClick={handleClearFilters}
                  >
                    Clear All Filters
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={() => navigate("/products")}
                  >
                    Browse All Designs
                  </Button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loadingProducts && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                    <Skeleton className="h-64 w-full" />
                    <div className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-8 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Product Grid */}
            {!loadingProducts && totalVisible > 0 && (
              <>
                <ProductGrid
                  products={visibleProducts}
                  loading={false}
                  onViewProduct={handleViewProduct}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  wishlistMap={wishlistMap}
                  show3DBadge={true}
                  showCategory={true}
                  imageLoading="lazy"
                  layout="responsive"
                />

                {/* Load More (if needed) */}
                {totalVisible < totalProducts && (
                  <div className="mt-12 text-center">
                    <Button
                      variant="outline"
                      className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50 px-8 py-3"
                      onClick={() => {
                        // Implement load more logic here
                        toast.success("Loading more designs...");
                      }}
                    >
                      Load More Designs
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Category Description (if available) */}
            {activeCategory && activeCategory.description && (
              <div className="mt-12 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100/50 p-8">
                <h3 className="mb-4 text-2xl font-bold text-gray-900">About {activeCategory.name}</h3>
                <p className="text-gray-700 leading-relaxed">{activeCategory.description}</p>
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}