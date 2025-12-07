import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, Search, XCircle } from "lucide-react";

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

// ⭐ Final Toast Import (useToast removed)
import { toast } from "react-hot-toast";

type SortKey = "latest" | "price_low_high" | "price_high_low";

export default function ShopPage() {
  const navigate = useNavigate();
  const cartCtx = useContext(CartContext);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">(
    "all"
  );
  const [sort, setSort] = useState<SortKey>("latest");

  // Wishlist state: product_id -> wishlist_item_id
  const [wishlistMap, setWishlistMap] = useState<Record<string, string>>({});
  const [wishlistLoading, setWishlistLoading] = useState(false);

  /* ----------------------------------------
   * Fetch products + categories
   * -------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoadingProducts(true);
        const res = await fetchProducts();
        if (!cancelled && (res as any).ok) {
          setAllProducts((res as any).products || []);
        }
      } catch (err) {
        if (!cancelled) setError("Unable to load products right now.");
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }

    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const res = await fetchCategories();
        if (!cancelled && (res as any).ok) {
          setCategories((res as any).categories || []);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    }

    loadProducts();
    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

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
      } catch (err) {
        console.warn("Wishlist load failed (maybe not logged in)");
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
   * Derived: filtered & sorted products
   * -------------------------------------- */
  const visibleProducts = useMemo(() => {
    let list = [...allProducts];

    if (selectedCategoryId !== "all") {
      list = list.filter((p: any) => p.category_id === selectedCategoryId);
    }

    const s = search.trim().toLowerCase();
    if (s) {
      list = list.filter((p) => {
        return (
          p.title?.toLowerCase().includes(s) ||
          (p as any).short_description?.toLowerCase().includes(s)
        );
      });
    }

    if (sort === "price_low_high") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price_high_low") {
      list.sort((a, b) => b.price - a.price);
    } else {
      list.sort((a, b) => {
        const da = (a as any).created_at
          ? new Date((a as any).created_at).getTime()
          : 0;
        const db = (b as any).created_at
          ? new Date((b as any).created_at).getTime()
          : 0;
        return db - da;
      });
    }

    return list;
  }, [allProducts, search, selectedCategoryId, sort]);

  /* ----------------------------------------
   * Handlers
   * -------------------------------------- */
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSelectCategory = (id: string | "all") => {
    setSelectedCategoryId(id);
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as SortKey);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategoryId("all");
    setSort("latest");
    toast.success("Filters reset");
  };

  const handleViewProduct = (slug: string) => {
    navigate(`/products/${slug}`);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await cartCtx?.addItem?.(productId, 1);
      toast.success("Added to cart");
    } catch (err) {
      toast.error("Failed to add product");
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    try {
      const existingId = wishlistMap[productId];

      if (existingId) {
        await removeFromWishlist(existingId);
        setWishlistMap((prev) => {
          const copy = { ...prev };
          delete copy[productId];
          return copy;
        });
        toast("Removed from wishlist", { icon: "💔" });
      } else {
        const res = await addToWishlist(productId);
        if (res.ok && (res as any).id) {
          setWishlistMap((prev) => ({
            ...prev,
            [productId]: (res as any).id,
          }));
          toast.success("Saved to wishlist ❤️");
        }
      }
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 401) {
        toast.error("Please login to use wishlist");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const activeCategory = useMemo(() => {
    if (selectedCategoryId === "all") return null;
    return categories.find((c) => c.id === selectedCategoryId) || null;
  }, [selectedCategoryId, categories]);

  const totalVisible = visibleProducts.length;

  /* ----------------------------------------
   * Render
   * -------------------------------------- */
  return (
    <div className="bg-slate-50">
      <AnimatedSection className="border-b border-slate-200/60 bg-gradient-to-b from-white to-slate-50">
        <Container className="py-12 md:py-16">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-4">
              <Badge>Curated Collection</Badge>
              <SectionTitle
                align="left"
                title="Discover Fine Diamond & Gold Jewellery"
                subtitle="Explore our handpicked designs crafted with precision, perfect for your special moments."
              />
            </div>

            <div className="mt-4 w-full max-w-md md:mt-0">
              <label className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm focus-within:border-pink-500 focus-within:ring-1 focus-within:ring-pink-500">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search by design, style, occasion..."
                  className="flex-1 border-none bg-transparent text-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                )}
              </label>
              <p className="mt-3 text-lg text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {totalVisible}
                </span>{" "}
                design{totalVisible === 1 ? "" : "s"}{" "}
                {activeCategory ? (
                  <>
                    in{" "}
                    <span className="font-semibold text-slate-900">
                      {activeCategory.name}
                    </span>
                  </>
                ) : (
                  "across all categories"
                )}
              </p>
            </div>
          </div>
        </Container>
      </AnimatedSection>

      <Container className="py-10 md:py-12">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5 lg:sticky lg:top-24 lg:h-fit lg:w-72">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-pink-500/10 text-pink-500">
                  <SlidersHorizontal className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Filters
                  </p>
                  <p className="text-lg text-slate-400">Refine your selection</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="px-3 py-1 text-base text-slate-500 hover:bg-slate-50"
                onClick={handleClearFilters}
              >
                Reset
              </Button>
            </div>

            {/* Categories */}
            <div className="mt-2 space-y-4">
              <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-slate-500">
                Categories
              </h3>

              {loadingCategories ? (
                <div className="space-y-3">
                  <Skeleton className="h-7 w-full rounded-full" />
                  <Skeleton className="h-7 w-[80%] rounded-full" />
                  <Skeleton className="h-7 w-[60%] rounded-full" />
                </div>
              ) : (
                <ul className="space-y-2 text-xl">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleSelectCategory("all")}
                      className={`flex w-full items-center justify-between rounded-full px-4 py-2 text-left transition ${
                        selectedCategoryId === "all"
                          ? "bg-pink-500/10 text-pink-600"
                          : "text-slate-700 hover:bg-slate-100/70"
                      }`}
                    >
                      <span>All Designs</span>
                      <span className="text-lg text-slate-400">
                        {allProducts.length}
                      </span>
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`flex w-full items-center justify-between rounded-full px-4 py-2 text-left transition ${
                          selectedCategoryId === cat.id
                            ? "bg-pink-500/10 text-pink-600"
                            : "text-slate-700 hover:bg-slate-100/70"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {typeof cat.product_count === "number" && (
                          <span className="text-lg text-slate-400">
                            {cat.product_count}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sort */}
            <div className="mt-7 space-y-3">
              <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-slate-500">
                Sort by
              </h3>
              <div className="relative">
                <select
                  value={sort}
                  onChange={handleSortChange}
                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-lg text-slate-700 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                >
                  <option value="latest">Newest first</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <main className="flex-1">
            {error && (
              <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xl text-rose-700">
                {error}
              </div>
            )}

            <ProductGrid
              products={visibleProducts}
              loading={loadingProducts || wishlistLoading}
              onViewProduct={handleViewProduct}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlistMap={wishlistMap}
            />
          </main>
        </div>
      </Container>
    </div>
  );
}
