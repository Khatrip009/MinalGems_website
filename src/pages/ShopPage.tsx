// src/pages/ShopPage.tsx
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
  Eye,
} from "lucide-react";

import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
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
const DEFAULT_PRICE_RANGE: [number, number] = [0, 500000];

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
  const [sort, setSort] = useState<SortKey>("latest");
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [wishlistMap, setWishlistMap] = useState<Record<string, string>>({});

  const activeCategory = selectedCategoryId === "all" ? null : categories.find((c) => c.id === selectedCategoryId) ?? null;

  // Load categories
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCategories(true);
        const res = await fetchCategories();
        if (!cancelled && res.ok) setCategories(res.categories || []);
      } catch (err) {
        console.error("Categories error", err);
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Sync category from URL
  useEffect(() => {
    if (!categories.length) return;
    const catFromUrl = searchParams.get("cat");
    if (!catFromUrl) {
      setSelectedCategoryId("all");
      return;
    }
    const matched = categories.find((c) => c.slug === catFromUrl);
    if (matched) setSelectedCategoryId(matched.id);
  }, [searchParams, categories]);

  // Load ALL products (paginated, no category filter)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingProducts(true);
        setError(null);
        let page = 1;
        let all: Product[] = [];
        let hasMore = true;
        while (hasMore && !cancelled) {
          const query = `?page=${page}&limit=100`;
          const res = await fetchProducts(query);
          if (!res.ok) throw new Error("Fetch failed");
          const items = res.products || [];
          all = all.concat(items);
          hasMore = items.length === 100;
          page++;
        }
        if (!cancelled) setAllProducts(all);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Unable to load products");
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Category counts from actual products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  // Wishlist
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getWishlist();
        if (!res.ok || !res.wishlist || cancelled) return;
        const map: Record<string, string> = {};
        for (const item of res.wishlist.items || []) {
          map[item.product_id] = item.id;
        }
        if (!cancelled) setWishlistMap(map);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  // Filtered & sorted products
  const visibleProducts = useMemo(() => {
    let list = [...allProducts];
    if (selectedCategoryId !== "all") {
      list = list.filter((p) => p.category_id === selectedCategoryId);
    }
    const s = search.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(s) ||
          p.short_description?.toLowerCase().includes(s) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(s))
      );
    }
    list = list.filter((p) => {
      const price = p.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    switch (sort) {
      case "price_low_high":
        list.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price_high_low":
        list.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name_az":
        list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "popular":
        list.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
    return list;
  }, [allProducts, selectedCategoryId, search, priceRange, sort]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  const handleSelectCategory = (cat: Category | "all") => {
    if (cat === "all") {
      setSelectedCategoryId("all");
      navigate("/products");
    } else {
      setSelectedCategoryId(cat.id);
      navigate(`/products?cat=${cat.slug}`);
    }
    setShowMobileFilters(false);
  };
  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value as SortKey);
  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategoryId("all");
    setSort("latest");
    setPriceRange(DEFAULT_PRICE_RANGE);
    navigate("/products");
    toast.success("Filters cleared");
  };
  const handleViewProduct = (slug: string) => navigate(`/products/${slug}`);
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
      const existing = wishlistMap[productId];
      if (existing) {
        await removeFromWishlist(existing);
        setWishlistMap((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
        toast.success("Removed from wishlist");
      } else {
        const res = await addToWishlist(productId);
        if (res.ok && res.id) {
          setWishlistMap((prev) => ({ ...prev, [productId]: res.id }));
          toast.success("Added to wishlist");
        }
      }
    } catch {
      toast.error("Wishlist error");
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const totalVisible = visibleProducts.length;
  const totalAll = allProducts.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-rose-50/20">
      {/* ────── Hero Header ────── */}
      <AnimatedSection className="relative overflow-hidden border-b border-amber-200/30 bg-gradient-to-br from-amber-900 via-rose-900 to-purple-900">
        <div className="absolute inset-0 bg-[url('/images/patterns/diamond-grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <Container className="relative py-12 md:py-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-300" />
                <span className="text-xs sm:text-sm font-medium text-white">Premium Collection</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Discover <span className="text-yellow-300">Exquisite</span> Jewellery
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed">
                Explore our curated collection of handcrafted diamond and gold jewellery.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                {[
                  { label: "Designs", value: totalAll },
                  { label: "Categories", value: categories.length },
                  { label: "Craftsmanship", value: "25+ Years" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-yellow-300">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/3 w-full">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 sm:p-8 shadow-2xl">
                <h3 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-semibold text-white">Find Your Perfect Piece</h3>
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-300" />
                  <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search designs..."
                    className="w-full rounded-full border border-white/30 bg-white/10 pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 text-white placeholder:text-white/60 focus:border-amber-300 focus:outline-none text-sm sm:text-base"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                      <XCircle className="h-5 w-5 text-white/60 hover:text-white" />
                    </button>
                  )}
                </div>
                <div className="mt-5 border-t border-white/10 pt-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-white">{totalVisible} of {totalAll} designs</p>
                      <p className="text-xs sm:text-sm text-white/60">
                        {activeCategory ? `In ${activeCategory.name}` : "Across all categories"}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-sm"
                      onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      <Eye className="mr-1.5 h-4 w-4" /> View Designs
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
        {/* Scroll down indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="h-10 w-px bg-gradient-to-b from-amber-300 to-transparent" />
        </div>
      </AnimatedSection>

      {/* ────── Mobile Filter Toggle ────── */}
      <div className="sticky top-0 z-40 border-b border-amber-100 bg-white/95 backdrop-blur-sm lg:hidden">
        <Container className="py-2 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-amber-200 text-amber-700 text-sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="mr-1.5 h-4 w-4" />
            Filters
            <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showMobileFilters ? "rotate-180" : ""}`} />
          </Button>
          <span className="text-xs text-gray-600">{totalVisible} designs</span>
          <select
            value={sort}
            onChange={handleSortChange}
            className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs sm:text-sm"
          >
            <option value="latest">Newest</option>
            <option value="popular">Popular</option>
            <option value="price_low_high">Price: Low-High</option>
            <option value="price_high_low">Price: High-Low</option>
            <option value="name_az">Name: A-Z</option>
          </select>
        </Container>
      </div>

      <Container className="py-6 md:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* ────── Desktop Sidebar ────── */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6 rounded-3xl border border-amber-100 bg-white/80 p-6 shadow-lg shadow-amber-900/5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 p-2">
                    <SlidersHorizontal className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Refine Selection</h3>
                    <p className="text-xs text-gray-500">Find your perfect match</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-amber-700" onClick={handleClearFilters}>
                  Clear All
                </Button>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">Categories</h4>
                {loadingCategories ? (
                  <div className="space-y-2">
                    {[1,2,3,4].map(i => <Skeleton key={i} className="h-9 w-full rounded-full" />)}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button
                      onClick={() => handleSelectCategory("all")}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                        selectedCategoryId === "all" ? "bg-amber-50 border border-amber-200 text-amber-700" : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-medium">All Designs</span>
                      <span className="text-xs font-medium text-gray-500">{totalAll}</span>
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                          selectedCategoryId === cat.id ? "bg-rose-50 border border-rose-200 text-rose-700" : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-xs font-medium text-gray-500">{categoryCounts[cat.id] ?? 0}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">Price Range</h4>
                <div className="flex items-center justify-between text-xs">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
                <input
                  type="range" min={0} max={500000} step={1000}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                  className="w-full accent-amber-500 h-1"
                />
                <input
                  type="range" min={0} max={500000} step={1000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                  className="w-full accent-amber-500 h-1"
                />
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Under 50K", range: [0, 50000] },
                    { label: "50K-1L", range: [50000, 100000] },
                    { label: "1L-2L", range: [100000, 200000] },
                    { label: "Over 2L", range: [200000, 500000] },
                  ].map((f) => (
                    <button
                      key={f.label}
                      onClick={() => setPriceRange(f.range as [number, number])}
                      className={`rounded-full px-3 py-1 text-xs ${
                        priceRange[0] === f.range[0] && priceRange[1] === f.range[1] ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900 text-sm">Sort By</h4>
                {(
                  [
                    { value: "latest", label: "Newest First", icon: Clock },
                    { value: "popular", label: "Most Popular", icon: TrendingUp },
                    { value: "price_low_high", label: "Price: Low-High", icon: TrendingUp },
                    { value: "price_high_low", label: "Price: High-Low", icon: TrendingUp },
                    { value: "name_az", label: "Name: A-Z", icon: Award },
                  ] as { value: SortKey; label: string; icon: React.ElementType }[]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                      sort === opt.value ? "bg-amber-50 border border-amber-200 text-amber-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <opt.icon className="h-3.5 w-3.5" />
                    <span className="font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* Trust badges */}
              <div className="rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 p-4 border border-amber-200">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Why Shop With Us</h4>
                <div className="space-y-2">
                  {[
                    "BIS Hallmark Certified",
                    "Free Shipping Pan India",
                    "30-Day Return Policy",
                    "Lifetime Maintenance",
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-gray-700">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ────── Mobile Filters Dropdown ────── */}
          {showMobileFilters && (
            <div className="lg:hidden rounded-2xl border border-amber-100 bg-white p-4 shadow-lg space-y-5">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSelectCategory("all")}
                    className={`rounded-full px-3 py-1.5 text-xs ${
                      selectedCategoryId === "all" ? "bg-amber-500 text-white" : "bg-gray-100"
                    }`}
                  >
                    All ({totalAll})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat)}
                      className={`rounded-full px-3 py-1.5 text-xs ${
                        selectedCategoryId === cat.id ? "bg-rose-500 text-white" : "bg-gray-100"
                      }`}
                    >
                      {cat.name} ({categoryCounts[cat.id] ?? 0})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Price Range</h4>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
                <input
                  type="range" min={0} max={500000} step={1000}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                  className="w-full accent-amber-500 h-1"
                />
                <input
                  type="range" min={0} max={500000} step={1000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                  className="w-full accent-amber-500 h-1 mt-2"
                />
              </div>

              <Button variant="primary" size="sm" className="w-full rounded-full" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}

          {/* ────── Main Content ────── */}
          <main className="flex-1 min-w-0" id="products-grid">
            <div className="mb-6 rounded-2xl bg-white/80 p-4 md:p-6 shadow-sm backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {activeCategory ? activeCategory.name : "All Jewellery"}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {totalVisible} of {totalAll} designs {search && `matching "${search}"`}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-gray-500">Sort by:</span>
                  <select
                    value={sort}
                    onChange={handleSortChange}
                    className="rounded-full border border-amber-200 bg-white px-4 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="latest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="price_low_high">Price: Low-High</option>
                    <option value="price_high_low">Price: High-Low</option>
                    <option value="name_az">Name: A-Z</option>
                  </select>
                </div>
              </div>

              {/* Active filter pills */}
              {(search || selectedCategoryId !== "all" || priceRange[0] > 0 || priceRange[1] < 500000) && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                  {search && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">
                      "{search}"
                      <button onClick={() => setSearch("")}><XCircle className="h-3 w-3" /></button>
                    </span>
                  )}
                  {activeCategory && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-800">
                      <Tag className="h-3 w-3" /> {activeCategory.name}
                      <button onClick={() => handleSelectCategory("all")}><XCircle className="h-3 w-3" /></button>
                    </span>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 500000) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-800">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                      <button onClick={() => setPriceRange(DEFAULT_PRICE_RANGE)}><XCircle className="h-3 w-3" /></button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 p-8 text-center mb-6">
                <XCircle className="h-10 w-10 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-rose-700">Unable to Load Products</h3>
                <p className="text-rose-600">{error}</p>
                <Button className="mt-4 rounded-full bg-rose-500" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            )}

            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : totalVisible === 0 ? (
              <div className="rounded-2xl bg-amber-50 p-8 sm:p-12 text-center">
                <Gem className="h-12 w-12 sm:h-16 sm:w-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Designs Found</h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">Try adjusting your filters.</p>
                <Button onClick={handleClearFilters} className="rounded-full bg-amber-500 text-white">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <ProductGrid
                products={visibleProducts}
                onViewProduct={handleViewProduct}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlistMap={wishlistMap}
                show3DBadge={true}
                showCategory={true}
                showPrice={false}       // ← NO PRICE on product cards
              />
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}