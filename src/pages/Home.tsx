// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
import SectionTitle from "../components/ui/SectionTitle";
import ProductGrid from "../components/product/ProductGrid";
import Button from "../components/ui/Button";
import { getProducts } from "../api/products.api";
import type { Product } from "../api/types";
import { fetchCategories, type Category } from "../api/categories.api";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);

  const navigate = useNavigate();

  // Load products + categories
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [productsRes, categoriesRes] = await Promise.all([
          getProducts(),
          fetchCategories(),
        ]);

        setProducts(productsRes.products || productsRes.items || []);
        setCategories(categoriesRes.categories || []);
      } catch (err) {
        console.error("Failed to load products or categories:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Map category slug/name to image path (fallbacks included)
  const getCategoryImage = (slug?: string | null, name?: string | null) => {
    const key = (slug || name || "").toLowerCase();

    switch (key) {
      case "gold":
        return "/images/categories/gold01.png";
      case "diamond":
      case "diamonds":
        return "/images/categories/diamond.png";
      case "bridal":
        return "/images/categories/bridal.png";
      case "daily":
      case "daily-wear":
        return "/images/categories/daily.png";
      default:
        // fallback image if new/unknown category is added
        return "/images/categories/gold01.png";
    }
  };

  // If no categories from API yet, use your original static list as fallback
  const categoryItems =
    categories.length > 0
      ? categories.map((cat) => ({
          label: cat.name,
          img: getCategoryImage(cat.slug, cat.name),
          link: `/products?cat=${encodeURIComponent(cat.slug || cat.id)}`,
        }))
      : [
          {
            label: "Gold",
            img: "/images/categories/gold01.png",
            link: "/products?cat=gold",
          },
          {
            label: "Diamonds",
            img: "/images/categories/diamond.png",
            link: "/products?cat=diamond",
          },
          {
            label: "Bridal",
            img: "/images/categories/bridal.png",
            link: "/products?cat=bridal",
          },
          {
            label: "Daily Wear",
            img: "/images/categories/daily.png",
            link: "/products?cat=daily",
          },
        ];

  return (
    <main className="w-full overflow-x-hidden">
      {/* ------------------------------------ */}
      {/* HERO SECTION */}
      {/* ------------------------------------ */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-black">
        <img
          src="/images/hero/hero1.jpg"
          alt="Luxury Jewellery Background"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20" />

        <Container className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
          <h1 className="font-['Playfair_Display'] text-5xl md:text-7xl font-semibold tracking-tight">
            Payal &amp; Minal Gems
          </h1>
          <p className="mt-5 max-w-2xl text-2xl text-slate-200">
            Luxury handcrafted jewellery — diamonds &amp; gold for every
            celebration.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              variant="primary"
              className="px-8 py-3 text-xl"
              onClick={() => navigate("/products")}
            >
              Shop New Arrivals
            </Button>

            <Button
              variant="outline"
              className="px-8 py-3 text-xl"
              onClick={() => navigate("/process")}
            >
              Our Craftsmanship
            </Button>
          </div>
        </Container>
      </section>

      {/* ------------------------------------ */}
      {/* SHOP BY CATEGORY */}
      {/* ------------------------------------ */}
      <AnimatedSection className="py-16">
        <Container>
          <SectionTitle title="Shop by Category" />

          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {categoryItems.map((cat) => (
              <Link
                key={cat.label}
                to={cat.link}
                className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-base lg:text-lg shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="h-32 w-auto object-contain transition-transform group-hover:scale-105"
                />
                <h4 className="mt-4 text-2xl font-semibold text-slate-900">
                  {cat.label}
                </h4>
                <p className="text-lg text-slate-500">Explore collection</p>
              </Link>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      {/* ------------------------------------ */}
      {/* NEW ARRIVALS */}
      {/* ------------------------------------ */}
      <AnimatedSection className="py-16 bg-white">
        <Container>
          <SectionTitle title="New Arrivals" />
          <div className="mt-6">
            <ProductGrid
              products={products}
              loading={loading}
              onViewProduct={(slug) => navigate(`/product/${slug}`)}
              onAddToCart={(id) => console.log("Add to cart", id)}
              onToggleWishlist={(id) => console.log("Toggle wishlist", id)}
            />
          </div>
        </Container>
      </AnimatedSection>

      {/* ------------------------------------ */}
      {/* ABOUT MINI SECTION */}
      {/* ------------------------------------ */}
      <AnimatedSection className="py-16 bg-[#FFF8F0]">
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-2">
            {/* Text */}
            <div>
              <h3 className="font-['Playfair_Display'] text-4xl md:text-5xl font-semibold text-slate-900">
                Handcrafted With Care
              </h3>
              <p className="mt-5 text-2xl leading-relaxed text-slate-700">
                We combine age-old craftsmanship with modern design to produce
                jewellery that lasts generations.
              </p>
              <Button
                variant="outline"
                className="mt-7 px-6 py-3 text-xl"
                onClick={() => navigate("/about")}
              >
                Read Our Story
              </Button>
            </div>

            {/* Image */}
            <div className="flex justify-center">
              <img
                src="/images/hero/feature.jpg"
                alt="Craftsmanship"
                className="max-h-96 w-full rounded-2xl object-cover shadow-md"
              />
            </div>
          </div>
        </Container>
      </AnimatedSection>
    </main>
  );
}
