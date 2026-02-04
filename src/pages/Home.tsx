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
import { 
  ChevronRight, 
  Sparkles, 
  Gem, 
  Loader2, 
  Award,
  Heart,
  Eye,
  ShoppingBag,
  Clock,
  Truck,
  Shield
} from "lucide-react";

// Utility to check if URL is a 3D model
const is3DModel = (url: string | null): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.glb') || 
         lowerUrl.endsWith('.gltf') || 
         lowerUrl.includes('model3d') || 
         lowerUrl.includes('3d-model');
};

// Utility to get appropriate placeholder
const getImagePlaceholder = (product: any): string => {
  if (product?.primary_image) return product.primary_image;
  if (product?.images?.length > 0) return product.images[0];
  if (product?.model_3d_url) return "/images/placeholders/3d-placeholder.jpg";
  return "/images/placeholders/jewellery-placeholder.jpg";
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  // Load products + categories
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, categoriesRes] = await Promise.allSettled([
        getProducts(),
        fetchCategories(),
      ]);

      // Handle products response
      if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
        const productsData = productsRes.value.products || [];
        
        // Enhanced product normalization with 3D detection
        const normalizedProducts: Product[] = productsData.map((p: any) => {
          const model3dUrl = p.model_3d_url ?? null;
          const has3DModel = model3dUrl ? is3DModel(model3dUrl) : false;
          
          return {
            id: p.id,
            slug: p.slug,
            title: p.title,
            short_description: p.short_description ?? "",
            price: Number(p.price),
            currency: p.currency ?? "INR",
            primary_image: getImagePlaceholder(p),
            model_3d_url: model3dUrl,
            has_3d_model: has3DModel,
            category: p.category || null,
            tags: p.tags || [],
            images: p.images || [],
            sku: p.sku || "",
            stock_status: p.stock_status || "in_stock",
            rating: p.rating || 0,
            reviews_count: p.reviews_count || 0,
            is_featured: p.is_featured || false,
            is_best_seller: p.is_best_seller || false,
            weight: p.weight || null,
            dimensions: p.dimensions || null,
            metal_type: p.metal_type || null,
            stone_type: p.stone_type || null,
            created_at: p.created_at || new Date().toISOString(),
            updated_at: p.updated_at || new Date().toISOString()
          };
        });

        console.log("Loaded products:", normalizedProducts.length);
        setProducts(normalizedProducts);
      } else {
        console.error("Failed to load products:", productsRes);
        setProducts([]);
      }

      // Handle categories response
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value.ok) {
        setCategories(categoriesRes.value.categories || []);
      } else {
        console.error("Failed to load categories:", categoriesRes);
        setCategories([]);
      }
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load products");
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Enhanced category mapping with better fallbacks
  const getCategoryImage = useCallback((slug?: string | null, name?: string | null) => {
    const key = (slug || name || "").toLowerCase().trim();
    
    const imageMap: Record<string, string> = {
      "gold": "/images/categories/gold01.png",
      "gold-jewellery": "/images/categories/gold01.png",
      "diamond": "/images/categories/diamond.png",
      "diamonds": "/images/categories/diamond.png",
      "diamond-jewellery": "/images/categories/diamond.png",
      "bridal": "/images/categories/bridal.png",
      "bridal-jewellery": "/images/categories/bridal.png",
      "wedding": "/images/categories/bridal.png",
      "daily": "/images/categories/daily.png",
      "daily-wear": "/images/categories/daily.png",
      "casual": "/images/categories/daily.png",
      "earrings": "/images/categories/earrings.png",
      "necklaces": "/images/categories/necklace.png",
      "rings": "/images/categories/rings.png",
      "bracelets": "/images/categories/bracelet.png",
      "earring": "/images/categories/earrings.png",
      "necklace": "/images/categories/necklace.png",
      "ring": "/images/categories/rings.png",
      "bracelet": "/images/categories/bracelet.png"
    };

    for (const [pattern, image] of Object.entries(imageMap)) {
      if (key.includes(pattern) || pattern.includes(key)) {
        return image;
      }
    }

    if (key.includes("ring")) return "/images/categories/rings.png";
    if (key.includes("ear")) return "/images/categories/earrings.png";
    if (key.includes("neck")) return "/images/categories/necklace.png";
    if (key.includes("brace") || key.includes("bangle")) return "/images/categories/bracelet.png";

    return "/images/categories/gold01.png";
  }, []);

  const categoryItems = categories.length > 0
    ? categories.map((cat) => ({
        id: cat.id,
        label: cat.name,
        description: cat.description || `Explore our ${cat.name} collection`,
        img: getCategoryImage(cat.slug, cat.name),
        link: `/products?category=${encodeURIComponent(cat.slug || cat.id)}`,
        count: cat.product_count || 0
      }))
    : [
        {
          id: "1",
          label: "Gold Jewellery",
          description: "Pure 22K & 18K gold collections",
          img: "/images/categories/gold01.png",
          link: "/products?category=gold",
          count: 45
        },
        {
          id: "2",
          label: "Diamond Jewellery",
          description: "Certified diamond jewellery",
          img: "/images/categories/diamond.png",
          link: "/products?category=diamond",
          count: 32
        },
        {
          id: "3",
          label: "Bridal Collection",
          description: "Wedding & ceremonial collections",
          img: "/images/categories/bridal.png",
          link: "/products?category=bridal",
          count: 28
        },
        {
          id: "4",
          label: "Daily Wear",
          description: "Lightweight everyday pieces",
          img: "/images/categories/daily.png",
          link: "/products?category=daily",
          count: 36
        },
      ];

  // Featured products (first 8 or less) - filter out products without images
  const featuredProducts = products
    .filter(p => p.primary_image || p.images?.length > 0)
    .slice(0, 8);

  // Feature cards data
  const features = [
 
    {
      icon: Award,
      title: "Expert Craftsmanship",
      description: "Handcrafted by master artisans with 25+ years experience"
    },
    {
      icon: Clock,
      title: "Lifetime Service",
      description: "maintenance, and repair services [charges applicable]"
    },
    {
      icon: Truck,
      title: "Secure Delivery",
      description: "Insured shipping with real-time tracking"
    }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-amber-600 mx-auto" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-50/50 to-transparent blur-xl"></div>
          </div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Loading our exquisite collection...</p>
          <p className="mt-2 text-sm text-gray-500">Crafted with precision and care</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative inline-flex mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center shadow-lg">
              <Gem className="h-12 w-12 text-red-400" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-red-100/50 to-pink-100/50 rounded-full blur-xl"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h3>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={loadData} 
              variant="primary"
              className="rounded-full px-8"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="rounded-full px-8"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full overflow-x-hidden">
      {/* =========================================== */}
      {/* HERO SECTION */}
      {/* =========================================== */}
      <section className="relative min-h-[90vh] w-full overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/90 to-amber-900/80">
        {/* Animated background overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/patterns/diamond-pattern.svg')] opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
        </div>
        
        {/* Hero image with parallax effect */}
        <div className="absolute inset-0">
          <img
            src="/images/hero/hero1.jpg"
            alt="Luxury Diamond Jewellery Collection"
            className="h-full w-full object-cover object-center opacity-50"
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/placeholders/hero-placeholder.jpg";
            }}
          />
        </div>

        {/* Floating sparkles animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                opacity: Math.random() * 0.5 + 0.3,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 2 + 2}s`,
                filter: 'blur(1px)'
              }}
            />
          ))}
        </div>

        <Container className="relative z-20 flex h-full min-h-[90vh] flex-col items-center justify-center text-center px-4">
          <div className="max-w-5xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-sm border border-amber-400/30 px-6 py-3 mb-8">
              
             
            </div>

            {/* Main heading with gradient */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-['Playfair_Display'] font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-white bg-clip-text text-transparent">
                              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-amber-50 to-amber-100 bg-clip-text text-transparent">
                
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-8 max-w-2xl text-xl md:text-2xl text-white/90 leading-relaxed font-light">
              
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                className="group px-10 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => navigate("/products")}
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5" />
                  Explore Collections
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                </span>
              </Button>

              
            </div>

            {/* Trust indicators */}
            <div className="mt-16 pt-8 border-t border-white/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: "25+", label: "Years of Excellence" },
                  { value: "10K+", label: "Happy Customers" },
                  { value: "5000+", label: "Unique Designs" }
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-16 w-px bg-gradient-to-b from-amber-300 via-yellow-200 to-transparent"></div>
        </div>
      </section>

      {/* =========================================== */}
      {/* FEATURES SECTION */}
      {/* =========================================== */}
      <AnimatedSection className="py-16 md:py-20 bg-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('/images/patterns/grid.svg')]"></div>
        </div>

        <Container className="relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <SectionTitle 
              title="Why Choose Minal Gems" 
              subtitle="Excellence in every detail"
              align="center"
            />
          </div>

          <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">

            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-amber-200 hover:-translate-y-2">
                  {/* Icon background */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-500">
                      <feature.icon className="h-8 w-8 text-amber-600 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover line */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      {/* =========================================== */}
      {/* CATEGORIES SECTION */}
      {/* =========================================== */}
      <AnimatedSection className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <Container>
          <div className="text-center mb-12 md:mb-16">
            <SectionTitle 
              title="Browse by Category" 
              subtitle="Discover our curated collections"
              align="center"
            />
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Each category features handpicked pieces that embody our commitment to quality and design
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categoryItems.map((cat) => (
              <Link
                key={cat.id}
                to={cat.link}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image container */}
                <div className="relative h-56 md:h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={cat.img}
                    alt={cat.label}
                    className="h-full w-full object-contain p-6 transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/categories/gold01.png";
                    }}
                  />
                  
                  {/* 3D badge if applicable */}
                  {cat.label.toLowerCase().includes('diamond') && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 backdrop-blur-md shadow-lg">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                        <span className="text-xs font-semibold text-white">3D VIEW</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 md:p-7">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors duration-300">
                      {cat.label}
                    </h3>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                  <p className="text-gray-600 text-sm md:text-base mb-4">
                    {cat.description}
                  </p>
                  {cat.count > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-amber-700">
                          {cat.count} {cat.count === 1 ? 'piece' : 'pieces'}
                        </span>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors flex items-center gap-1">
                          Explore
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover effect line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
              </Link>
            ))}
          </div>

          {/* View all categories */}
          <div className="mt-12 md:mt-16 text-center">
            <Button
              variant="outline"
              className="group px-8 py-3.5 text-lg font-medium rounded-full border-2 border-gray-300 hover:border-amber-500 hover:bg-amber-50 text-gray-700 hover:text-amber-700 transition-all duration-300"
              onClick={() => navigate("/categories")}
            >
              <span className="flex items-center gap-3">
                View All Categories
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
              </span>
            </Button>
          </div>
        </Container>
      </AnimatedSection>

      {/* =========================================== */}
      {/* FEATURED PRODUCTS - IMPORTANT: USES ProductGrid */}
      {/* =========================================== */}
      <AnimatedSection className="py-16 md:py-24 bg-white">
        <Container>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 md:mb-16">
            <div className="lg:w-2/3">
              <SectionTitle 
                title="Featured Collections" 
                subtitle="Our most popular creations"
              />
              <p className="mt-3 text-gray-600 text-lg max-w-3xl">
                Discover handpicked pieces that showcase exceptional craftsmanship and timeless design
              </p>
            </div>
            <div className="lg:w-1/3 lg:text-right">
              <Button
                variant="primary"
                className="rounded-full px-8 py-3.5"
                onClick={() => navigate("/products")}
              >
                <span className="flex items-center gap-2">
                  Shop All
                  <ChevronRight className="h-5 w-5" />
                </span>
              </Button>
            </div>
          </div>

          <div className="mt-8">
            {featuredProducts.length > 0 ? (
              <ProductGrid
                products={featuredProducts}  // PRODUCTS PASSED TO GRID
                loading={false}
                onViewProduct={(slug) => navigate(`/products/${slug}`)}
                onAddToCart={(id) => console.log("Add to cart", id)}
                onToggleWishlist={(id) => console.log("Toggle wishlist", id)}
                show3DBadge={true}
                showCategory={true}
                imageLoading="lazy"
                layout="grid"  // FIXED: Changed from "responsive" to "grid"
                columns={4}
                itemsPerPage={8}
                title=""
                subtitle=""
              />
            ) : (
              <div className="text-center py-12 md:py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg mb-6">
                  <Gem className="h-12 w-12 text-amber-400" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-3">Coming Soon</h4>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  We're preparing our latest collection. Check back soon for exquisite new creations.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/collections")}
                  className="rounded-full px-8"
                >
                  Browse Collections
                </Button>
              </div>
            )}
          </div>
        </Container>
      </AnimatedSection>

      {/* =========================================== */}
      {/* 3D EXPERIENCE BANNER */}
      {/* =========================================== */}
      {products.some(p => p.has_3d_model) && (
        <AnimatedSection className="py-16 md:py-20 bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-3xl"
                style={{
                  width: `${Math.random() * 300 + 100}px`,
                  height: `${Math.random() * 300 + 100}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 20 + 10}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>

          <Container className="relative z-10">
            <div className="rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 lg:p-16">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
                <div className="lg:w-2/3">
                  <div className="inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 px-5 py-2.5 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white rounded-full blur-md"></div>
                      <Sparkles className="h-5 w-5 text-white relative" />
                    </div>
                    <span className="text-sm font-semibold text-white/90 tracking-wider">
                      INNOVATIVE SHOPPING
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                    Experience Jewellery in 360°
                  </h3>
                  <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
                    Rotate, zoom, and explore our diamond collection in stunning 3D detail.
                    See every facet and sparkle before making your choice.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="primary"
                      className="rounded-full px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 font-semibold text-lg shadow-2xl shadow-white/20"
                      onClick={() => navigate("/products?has3d=true")}
                    >
                      <span className="flex items-center gap-3">
                        <Eye className="h-6 w-6" />
                        Explore 3D Collection
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full px-8 py-4 border-2 border-white/30 bg-transparent text-white hover:bg-white/10 font-semibold text-lg"
                      onClick={() => navigate("/guide/3d-viewer")}
                    >
                      How It Works
                    </Button>
                  </div>
                </div>
                
                {/* 3D counter */}
                <div className="lg:w-1/3 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-2xl"></div>
                    <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                          {products.filter(p => p.has_3d_model).length}
                        </div>
                        <div className="text-white/80 text-lg">3D Models</div>
                        <div className="text-white/60 text-sm mt-2">Available Now</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </AnimatedSection>
      )}

      {/* =========================================== */}
      {/* ABOUT SECTION */}
      {/* =========================================== */}
      <AnimatedSection className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-amber-50/30">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image section */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/images/hero/feature.jpg"
                  alt="Master Artisan Crafting Jewellery"
                  className="w-full h-[500px] md:h-[600px] object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/placeholders/craftsmanship.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 border-4 border-amber-300/30 rounded-2xl -z-10"></div>
              <div className="absolute -bottom-4 -right-4 w-28 h-28 border-4 border-amber-400/20 rounded-2xl -z-10"></div>
              
              {/* Experience badge */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 min-w-[200px] text-center">
                <div className="text-3xl font-bold text-gray-900">25+</div>
                <div className="text-sm text-gray-600 mt-1">Years of Excellence</div>
              </div>
            </div>

            {/* Content section */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 px-5 py-2.5 mb-6">
                <Award className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">HERITAGE & CRAFTSMANSHIP</span>
              </div>
              
              <h3 className="font-['Playfair_Display'] text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                A Legacy of <span className="text-amber-600">Excellence</span>
              </h3>
              
              <p className="mt-6 text-lg text-gray-700 leading-relaxed">
                For over two decades, Minal Gems has been at the forefront of jewellery 
                craftsmanship, blending traditional techniques with modern innovation. 
                Each piece is a testament to our commitment to quality, beauty, and 
                timeless elegance.
              </p>
              
              <div className="mt-8 space-y-5">
                {[
                  "Traditional Kundan & Meenakari artistry",
                  "Modern CAD-assisted precision designs",
                  "Ethically sourced diamonds & precious gems",
                  "Lifetime craftsmanship guarantee"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center shadow-md">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <span className="text-gray-700 text-lg font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  className="px-8 py-4 text-lg rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-xl"
                  onClick={() => navigate("/about")}
                >
                  Discover Our Story
                </Button>
                
                
              </div>
            </div>
          </div>
        </Container>
      </AnimatedSection>

      {/* =========================================== */}
      {/* NEWSLETTER SECTION */}
      {/* =========================================== */}
      <AnimatedSection className="py-16 md:py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 shadow-2xl mb-8">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Be the First to Know
            </h3>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Subscribe to receive updates on new collections, exclusive offers, 
              and jewellery styling tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-6 py-4 rounded-full border-0 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Button
                type="submit"
                variant="primary"
                className="rounded-full px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              >
                Subscribe
              </Button>
            </form>
            <p className="mt-4 text-sm text-white/50">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </Container>
      </AnimatedSection>

      {/* Floating action button for smaller screens */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <Button
          variant="primary"
          className="rounded-full p-4 shadow-2xl shadow-amber-500/30"
          onClick={() => navigate("/products")}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Shop</span>
          </span>
        </Button>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </main>
  );
}