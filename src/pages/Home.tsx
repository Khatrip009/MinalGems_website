// src/pages/HomePage.tsx

import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
import SectionTitle from "../components/ui/SectionTitle";
import ProductGrid from "../components/product/ProductGrid";
import Button from "../components/ui/Button";
import { getProducts } from "../api/products.api";
import type { Product } from "../api/types";
import { fetchCategories, type Category } from "../api/categories.api";
import { ChevronRight, Sparkles, Gem, Shield, Truck, Loader2 } from "lucide-react";

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
  // First check if product has primary_image
  if (product?.primary_image) return product.primary_image;
  
  // Check if product has images array
  if (product?.images?.length > 0) return product.images[0];
  
  // Check for 3D model
  if (product?.model_3d_url) {
    return "/images/placeholders/3d-placeholder.jpg";
  }
  
  // Generic jewellery placeholder
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
    
    // Try exact matches first
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

    // Check for partial matches
    for (const [pattern, image] of Object.entries(imageMap)) {
      if (key.includes(pattern) || pattern.includes(key)) {
        return image;
      }
    }

    // Fallback based on name similarity
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
          label: "Gold",
          description: "Pure 22K & 18K gold collections",
          img: "/images/categories/gold01.png",
          link: "/products?category=gold",
          count: 45
        },
        {
          id: "2",
          label: "Diamonds",
          description: "Certified diamond jewellery",
          img: "/images/categories/diamond.png",
          link: "/products?category=diamond",
          count: 32
        },
        {
          id: "3",
          label: "Bridal",
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading beautiful jewellery...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Gem className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Products</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={loadData} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full overflow-x-hidden">
      {/* ------------------------------------ */}
      {/* ENHANCED HERO SECTION */}
      {/* ------------------------------------ */}
      <section className="relative min-h-[90vh] w-full overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-rose-900">
        {/* Animated background overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/patterns/diamond-pattern.svg')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        </div>
        
        {/* Hero image with parallax effect */}
        <div className="absolute inset-0">
          <img
            src="/images/hero/hero1.jpg"
            alt="Luxury Diamond Jewellery"
            className="h-full w-full object-cover object-center opacity-60"
            loading="eager"
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-[1px] w-[1px] rounded-full bg-white/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 2}s`,
                boxShadow: '0 0 20px 2px rgba(255, 255, 255, 0.5)'
              }}
            />
          ))}
        </div>

        <Container className="relative z-20 flex h-full min-h-[90vh] flex-col items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Since 1995</span>
            </div>

            {/* Main title with gradient */}
            <h1 className="font-['Playfair_Display'] text-5xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-white bg-clip-text text-transparent">
                Minal
              </span>
              <br />
              <span className="text-4xl md:text-6xl lg:text-7xl font-light text-white/90">
                Gems & Jewels
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-xl md:text-2xl text-white/80 leading-relaxed">
              Where timeless craftsmanship meets contemporary elegance. 
              Handcrafted luxury jewellery for life's most precious moments.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                className="group px-10 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300"
                onClick={() => navigate("/products")}
              >
                <span className="flex items-center gap-2">
                  Discover Collections
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>

              <Button
                variant="outline"
                className="px-10 py-4 text-lg font-medium rounded-full border-2 border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 text-white transition-all duration-300"
                onClick={() => navigate("/process")}
              >
                <span className="flex items-center gap-2">
                  <Gem className="h-5 w-5" />
                  Our Artistry
                </span>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { icon: Shield, text: "Certified Quality", sub: "BIS Hallmark" },
                { icon: Truck, text: "Free Shipping", sub: "Pan India" },
                { icon: Gem, text: "Lifetime Polish", sub: "Free Service" },
                { icon: Sparkles, text: "Custom Designs", sub: "Made to Order" }
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm mb-3">
                    <item.icon className="h-6 w-6 text-yellow-300" />
                  </div>
                  <p className="font-semibold text-white text-sm">{item.text}</p>
                  <p className="text-xs text-white/60">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="h-10 w-px bg-gradient-to-b from-yellow-300/80 to-transparent" />
        </div>
      </section>

      {/* ------------------------------------ */}
      {/* ENHANCED SHOP BY CATEGORY */}
      {/* ------------------------------------ */}
      <AnimatedSection className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
        <Container>
          <div className="text-center mb-12">
            <SectionTitle 
              title="Curated Collections" 
              subtitle="Browse our exquisite jewellery categories"
            />
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Each piece tells a story of craftsmanship and elegance
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categoryItems.map((cat) => (
              <Link
                key={cat.id}
                to={cat.link}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image container */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={cat.img}
                    alt={cat.label}
                    className="h-full w-full object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/categories/gold01.png";
                    }}
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* 3D badge if applicable */}
                  {cat.label.toLowerCase().includes('diamond') && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 backdrop-blur-sm">
                        <Sparkles className="h-3 w-3 text-yellow-300" />
                        <span className="text-xs font-medium text-white">3D View</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-yellow-700 transition-colors">
                      {cat.label}
                    </h3>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="mt-2 text-gray-600 text-sm">
                    {cat.description}
                  </p>
                  {cat.count > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm font-medium text-yellow-700">
                        {cat.count} {cat.count === 1 ? 'piece' : 'pieces'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover effect line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </Link>
            ))}
          </div>

          {/* View all categories */}
          <div className="mt-12 text-center">
            <Button
              variant="ghost"
              className="text-lg font-medium text-gray-700 hover:text-yellow-700"
              onClick={() => navigate("/categories")}
            >
              View All Categories
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Container>
      </AnimatedSection>

      {/* ------------------------------------ */}
      {/* ENHANCED NEW ARRIVALS */}
      {/* ------------------------------------ */}
      <AnimatedSection className="py-20 bg-white">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <SectionTitle 
                title="Latest Creations" 
                subtitle="Fresh from our workshop"
              />
              <p className="mt-3 text-gray-600 max-w-2xl">
                Discover our newest handcrafted pieces, featuring innovative designs 
                and exceptional craftsmanship
              </p>
            </div>
            <Button
              variant="outline"
              className="w-fit rounded-full border-gray-300 hover:border-yellow-600 hover:text-yellow-700"
              onClick={() => navigate("/products?sort=newest")}
            >
              View All New Arrivals
            </Button>
          </div>

          <div className="mt-8">
            {featuredProducts.length > 0 ? (
              <ProductGrid
                products={featuredProducts}
                loading={false}
                onViewProduct={(slug) => navigate(`/products/${slug}`)}
                onAddToCart={(id) => console.log("Add to cart", id)}
                onToggleWishlist={(id) => console.log("Toggle wishlist", id)}
                show3DBadge={true}
                showCategory={true}
                imageLoading="lazy"
                layout="responsive"
              />
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                  <Gem className="h-10 w-10 text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-700">No products available</h4>
                <p className="text-gray-500 mt-2 mb-6">Check back soon for our latest creations</p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/products")}
                  className="rounded-full"
                >
                  Browse All Collections
                </Button>
              </div>
            )}
          </div>
        </Container>
      </AnimatedSection>

      {/* ------------------------------------ */}
      {/* ENHANCED ABOUT SECTION */}
      {/* ------------------------------------ */}
      <AnimatedSection className="py-20 bg-gradient-to-br from-amber-50 via-white to-rose-50">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image with frame */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/images/hero/feature.jpg"
                  alt="Master Jeweller at Work"
                  className="w-full h-[500px] object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/placeholders/jewellery-placeholder.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 border-4 border-yellow-300/30 rounded-2xl -z-10" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-4 border-rose-300/30 rounded-2xl -z-10" />
              
              {/* Stats overlay */}
              <div className="absolute -bottom-6 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "25+", label: "Years Experience" },
                    { value: "10k+", label: "Happy Customers" },
                    { value: "100%", label: "Certified" }
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:pl-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Our Legacy</span>
              </div>
              
              <h3 className="font-['Playfair_Display'] text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Crafting Dreams Into Reality
              </h3>
              
              <p className="mt-6 text-lg text-gray-700 leading-relaxed">
                For over two decades, Minal Gems has been synonymous with 
                exceptional craftsmanship and timeless design. Each piece is 
                meticulously handcrafted by our master artisans, blending traditional 
                techniques with contemporary aesthetics.
              </p>
              
              <div className="mt-8 space-y-4">
                {[
                  "Traditional Kundan & Meenakari work",
                  "Modern CAD-assisted designs",
                  "Ethically sourced diamonds & gems",
                  "Lifetime maintenance guarantee"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  className="px-8 py-4 text-lg rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                  onClick={() => navigate("/about")}
                >
                  Our Heritage Story
                </Button>
                
                <Button
                  variant="outline"
                  className="px-8 py-4 text-lg rounded-full border-amber-600 text-amber-700 hover:bg-amber-50"
                  onClick={() => navigate("/process")}
                >
                  <Gem className="mr-2 h-5 w-5" />
                  Craftsmanship Tour
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </AnimatedSection>

      {/* ------------------------------------ */}
      {/* 3D EXPERIENCE BANNER */}
      {/* ------------------------------------ */}
      {products.some(p => p.has_3d_model) && (
        <AnimatedSection className="py-16 bg-gradient-to-r from-blue-900 via-purple-900 to-rose-900">
          <Container>
            <div className="rounded-3xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/20 p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="lg:w-2/3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-white/20">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                      Interactive Experience
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Explore in 3D Before You Buy
                  </h3>
                  <p className="text-lg text-white/80 mb-6">
                    Select pieces feature interactive 3D models. Rotate, zoom, and 
                    examine every detail from the comfort of your home.
                  </p>
                  <Button
                    variant="primary"
                    className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 py-3 font-semibold"
                    onClick={() => navigate("/products?has3d=true")}
                  >
                    View 3D Collection
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                
                <div className="lg:w-1/3 flex justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-300/30 to-purple-300/30 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-white mb-2">
                            {products.filter(p => p.has_3d_model).length}
                          </div>
                          <div className="text-white/80 text-sm">3D Models Available</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </AnimatedSection>
      )}

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