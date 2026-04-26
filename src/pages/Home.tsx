// src/pages/HomePage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
import SectionTitle from "../components/ui/SectionTitle";
import ProductGrid from "../components/product/ProductGrid";
import Button from "../components/ui/Button";
import { getProducts } from "../api/products.api";
import type { Product } from "../api/types";
import { fetchCategories, type Category } from "../api/categories.api";
import LeadForm from "../components/leads/LeadForm";
import {
  ChevronRight,
  Sparkles,
  Gem,
  Loader2,
  Award,
  Clock,
  Truck,
  Eye,
} from "lucide-react";

// ── Helper: category image with multiple keywords ──
function getCategoryImage(slug?: string | null, name?: string | null): string {
  const key = ((slug ?? "") + " " + (name ?? "")).toLowerCase();
  const imageMap: [string, string][] = [
    ["diamond", "diamond.png"],
    ["bridal", "bridal.png"],
    ["wedding", "bridal.png"],
    ["daily", "daily.png"],
    ["everyday", "daily.png"],
    ["earring", "earrings.png"],
    ["necklace", "necklace.png"],
    ["pendant", "pendant.png"],
    ["ring", "rings.png"],
    ["bracelet", "bracelet.png"],
    ["bangle", "bangle.png"],
    ["gold", "gold01.png"],
  ];
  for (const [keyword, file] of imageMap) {
    if (key.includes(keyword)) return `/images/categories/${file}`;
  }
  return "/images/categories/gold01.png";
}

// Fallback categories if API fails
const FALLBACK_CATEGORIES = [
  { id: "1", name: "Gold Jewellery", description: "Pure 22K & 18K gold", slug: "gold", product_count: 45 },
  { id: "2", name: "Diamond Jewellery", description: "Certified diamonds", slug: "diamond", product_count: 32 },
  { id: "3", name: "Bridal Collection", description: "Wedding & ceremonies", slug: "bridal", product_count: 28 },
  { id: "4", name: "Daily Wear", description: "Lightweight everyday pieces", slug: "daily", product_count: 36 },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsRes, categoriesRes] = await Promise.allSettled([
        getProducts(),
        fetchCategories(),
      ]);
      // Products
      if (productsRes.status === "fulfilled" && productsRes.value.ok) {
        const raw = productsRes.value.products || [];
        const normalized = raw.map((p: any) => ({
          ...p,
          price: Number(p.price ?? 0),
          currency: p.currency ?? "INR",
          primary_image: p.primary_image ?? null,
          model_3d_url: p.model_3d_url ?? null,
          rating: Number(p.rating ?? 0),
          reviews_count: Number(p.reviews_count ?? 0),
          is_featured: Boolean(p.is_featured),
          tags: Array.isArray(p.tags) ? p.tags : [],
        }));
        setProducts(normalized);
      } else {
        setProducts([]);
      }
      // Categories
      if (categoriesRes.status === "fulfilled" && categoriesRes.value.ok) {
        const cats = categoriesRes.value.categories || [];
        setCategories(cats.length ? cats : (FALLBACK_CATEGORIES as Category[]));
      } else {
        setCategories(FALLBACK_CATEGORIES as Category[]);
      }
    } catch (err: any) {
      setError(err.message);
      setCategories(FALLBACK_CATEGORIES as Category[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const categoryItems = categories.map((cat) => ({
    id: cat.id,
    label: cat.name,
    description: cat.description || `Explore our ${cat.name} collection`,
    img: getCategoryImage(cat.slug, cat.name),
    link: `/products?category=${encodeURIComponent(cat.slug || cat.id)}`,
    count: cat.product_count || 0,
  }));

  const featured = products.slice(0, 8);

  const features = [
    { icon: Award, title: "Expert Craftsmanship", description: "Handcrafted by master artisans with 25+ years experience" },
    { icon: Clock, title: "Lifetime Service", description: "Maintenance and repair services [charges applicable]" },
    { icon: Truck, title: "Secure Delivery", description: "Insured shipping with real-time tracking" },
  ];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
        <p className="ml-4 text-lg text-gray-600">Loading…</p>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-4">
        <Gem className="h-16 w-16 text-red-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Oops!</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={loadData} variant="primary" className="rounded-full px-8">Retry</Button>
      </div>
    );
  }

  return (
    <main className="w-full overflow-x-hidden">
      {/* ────── HERO ────── */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/90 to-amber-900/80 px-4">
        <img
          src="/images/hero/hero1.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          onError={(e) => (e.target.src = "/images/placeholders/hero-placeholder.jpg")}
        />
        <div className="relative z-10 text-center max-w-4xl mx-auto text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="text-xs font-semibold uppercase tracking-widest">Eternal Elegance</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-amber-200 to-white bg-clip-text text-transparent">Discover</span><br />
            <span className="bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">Timeless Beauty</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Handcrafted jewellery where heritage meets modern elegance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/products")} variant="primary" className="rounded-full px-8 py-4 font-semibold">
              Explore Collection <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button onClick={() => setIsLeadFormOpen(true)} variant="outline" className="rounded-full px-8 py-4 font-semibold border-white/40 text-white hover:bg-white/10">
              Inquire Now
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 text-center border-t border-white/10 pt-8">
            {[
              { value: "25+", label: "Years of Excellence" },
              { value: "10K+", label: "Happy Customers" },
              { value: "5000+", label: "Unique Designs" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── FEATURES ────── */}
      <AnimatedSection className="py-14 bg-white">
        <Container>
          <SectionTitle title="Why Choose Minal Gems" subtitle="Excellence in every detail" align="center" />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl"
              >
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <feat.icon className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-gray-600">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      {/* ────── CATEGORIES ────── */}
      <AnimatedSection className="py-14 bg-gradient-to-b from-gray-50 to-white">
        <Container>
          <SectionTitle title="Browse by Category" subtitle="Curated collections" align="center" />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryItems.map((cat) => (
              <Link
                key={cat.id}
                to={cat.link}
                className="group bg-white rounded-2xl shadow hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden border border-gray-100"
              >
                <div className="h-48 sm:h-56 bg-gray-50 flex items-center justify-center p-6">
                  <img
                    src={cat.img}
                    alt={cat.label}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => (e.target.src = "/images/categories/gold01.png")}
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors">{cat.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
                  {cat.count > 0 && (
                    <p className="text-xs text-amber-700 mt-2 font-medium">{cat.count} pieces</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      {/* ────── FEATURED PRODUCTS ────── */}
      <AnimatedSection className="py-14 bg-white">
        <Container>
          <SectionTitle title="Featured Collections" subtitle="Our most popular creations" align="center" />
          <div className="mt-10">
            <ProductGrid
              products={featured}
              onViewProduct={(slug) => navigate(`/products/${slug}`)}
              onAddToCart={(id) => console.log("Add to cart", id)}
              onToggleWishlist={(id) => console.log("Toggle wishlist", id)}
              show3DBadge={true}
              showCategory={true}
              emptyStateMessage="No featured products yet."
            />
          </div>
          <div className="text-center mt-8">
            <Button onClick={() => navigate("/products")} variant="outline" className="rounded-full px-6 py-3">
              View All Products <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Container>
      </AnimatedSection>

      {/* ────── 3D BANNER (conditional) ────── */}
      {products.some(p => p.model_3d_url) && (
        <AnimatedSection className="py-14 bg-gray-900 text-white">
          <Container className="text-center">
            <Eye className="h-10 w-10 mx-auto text-amber-400 mb-4" />
            <h3 className="text-3xl font-serif font-bold mb-4">Experience in 360°</h3>
            <p className="text-lg text-white/70 max-w-xl mx-auto mb-6">
              Rotate and zoom our diamond collection in stunning 3D.
            </p>
            <Button onClick={() => navigate("/products?has3d=true")} variant="primary" className="rounded-full px-8 py-4">
              Explore 3D Collection
            </Button>
          </Container>
        </AnimatedSection>
      )}

      {/* ────── ABOUT TEASER ────── */}
      <AnimatedSection className="py-14 bg-gray-50">
        <Container className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <img
              src="/images/hero/feature.jpg"
              alt="Craftsmanship"
              className="rounded-2xl shadow-xl"
              onError={(e) => (e.target.src = "/images/placeholders/craftsmanship.jpg")}
            />
          </div>
          <div>
            <Award className="h-8 w-8 text-amber-600 mb-4" />
            <h3 className="font-serif text-4xl font-bold text-gray-900 mb-4">
              A Legacy of <span className="text-amber-600">Excellence</span>
            </h3>
            <p className="text-gray-700 mb-6">
              For over two decades, Minal Gems has blended traditional artistry with modern design.
            </p>
            <Button onClick={() => navigate("/about")} variant="outline" className="rounded-full px-6 py-2">
              Our Story
            </Button>
          </div>
        </Container>
      </AnimatedSection>

      {/* ────── NEWSLETTER ────── */}
      <AnimatedSection className="py-14 bg-gray-800 text-white">
        <Container className="text-center max-w-xl">
          <Sparkles className="h-8 w-8 mx-auto text-amber-400 mb-4" />
          <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
          <p className="text-white/70 mb-6">Subscribe for exclusive offers and new arrivals.</p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 rounded-full px-5 py-3 text-gray-900"
            />
            <Button type="submit" variant="primary" className="rounded-full px-6 py-3">Subscribe</Button>
          </form>
        </Container>
      </AnimatedSection>

      {/* Mobile shop button */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40">
        <Button onClick={() => navigate("/products")} className="rounded-full p-4 shadow-xl">
          <Sparkles className="h-5 w-5" />
          <span className="ml-1 font-semibold">Shop</span>
        </Button>
      </div>

      <LeadForm isOpen={isLeadFormOpen} onClose={() => setIsLeadFormOpen(false)} />
    </main>
  );
}