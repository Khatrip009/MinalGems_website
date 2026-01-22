// src/components/Footer.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "./layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
import { MapPin, Phone, Mail, Instagram, Facebook, Star } from "lucide-react";
import { apiFetch } from "../api/client";

type VisitorsMetricsResponse = {
  ok: boolean;
  metrics?: {
    total_visitors?: number;
    visitors_today?: number;
    new_visitors_today?: number;
  };
};

type ReviewStatsResponse = {
  ok: boolean;
  stats?: {
    avg_rating?: number;
    total_reviews?: number;
  };
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const [totalVisitors, setTotalVisitors] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVisitors() {
      try {
        const data = await apiFetch<VisitorsMetricsResponse>(
          "/metrics/visitors/summary"
        );

        if (cancelled) return;

        const total = data.metrics?.total_visitors;
        setTotalVisitors(typeof total === "number" ? total : 0);
      } catch (err) {
        console.warn("Failed to load visitors summary", err);
      }
    }

    async function loadReviewStats() {
      try {
        const data = await apiFetch<ReviewStatsResponse>("/reviews/stats");

        if (cancelled) return;

        setAvgRating(data.stats?.avg_rating ?? null);
        setTotalReviews(data.stats?.total_reviews ?? null);
      } catch (err) {
        console.warn("Failed to load review stats", err);
      }
    }

    loadVisitors();
    loadReviewStats();

    const ivVisitors = setInterval(loadVisitors, 60000);
    const ivReviews = setInterval(loadReviewStats, 300000);

    return () => {
      cancelled = true;
      clearInterval(ivVisitors);
      clearInterval(ivReviews);
    };
  }, []);

  const renderStars = (avg: number | null) => {
    const value = avg ?? 0;
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    const arr: JSX.Element[] = [];

    for (let i = 0; i < 5; i++) {
      if (i < full) {
        arr.push(
          <Star
            key={i}
            className="h-4 w-4 text-yellow-400 fill-yellow-400"
          />
        );
      } else if (i === full && half) {
        arr.push(
          <Star
            key={i}
            className="h-4 w-4 text-yellow-300 fill-yellow-300 opacity-80"
          />
        );
      } else {
        arr.push(<Star key={i} className="h-4 w-4 text-slate-300/60" />);
      }
    }
    return <div className="flex items-center gap-1">{arr}</div>;
  };

  const WHATSAPP_NUMBER = "917069785900";
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <>
      {/* WhatsApp button */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-base sm:text-lg font-semibold text-white shadow-xl shadow-black/30 transition-transform hover:scale-105"
        aria-label="Chat on WhatsApp"
      >
        <span>Need help?</span>
      </a>

      <AnimatedSection>
        <footer className="mt-16 border-t border-pink-100/70 bg-gradient-to-r from-[#FFF7FB] via-[#FFF9F2] to-[#FFEFFC] text-slate-800">
          <Container className="py-8 md:py-10 text-base lg:text-lg">
            {/* Main footer */}
            <div className="grid gap-10 md:grid-cols-3 items-start">
              {/* Brand & metrics */}
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <img
                    src="/logo_minalgems.png"
                    alt="Minal Gems"
                    className="h-20 w-auto drop-shadow-sm"
                  />
                  
                </div>

                <p className="max-w-md text-lg leading-relaxed text-slate-700">
                  Fine diamond & gold jewellery crafted with precision.
                  Certified stones, ethical sourcing, and timeless designs to
                  celebrate every milestone.
                </p>

                <div className="flex flex-wrap gap-3 text-base">
                  <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm">
                    <span className="h-2.5 w-2.5 rounded-full bg-pink-500" />
                    <span className="font-semibold text-slate-900">
                      {totalVisitors !== null
                        ? totalVisitors.toLocaleString()
                        : "—"}
                    </span>
                    <span className="text-base text-slate-500">
                      visitors since launch
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm">
                    <span className="font-semibold text-slate-900">
                      {avgRating !== null ? avgRating.toFixed(1) : "—"}
                    </span>
                    {renderStars(avgRating)}
                    <span className="text-base text-slate-500">
                      {totalReviews ? `${totalReviews} reviews` : "No reviews"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <a className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 hover:bg-pink-500 hover:text-white shadow-sm cursor-pointer">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 hover:bg-pink-500 hover:text-white shadow-sm cursor-pointer">
                    <Facebook className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Quick Links & Policies */}
              <div className="space-y-8">
                <div>
                  <h6 className="text-2xl font-semibold uppercase tracking-[0.22em] text-slate-800">
                    Quick Links
                  </h6>
                  <ul className="mt-4 space-y-2 text-xl text-slate-700">
                    <li>
                      <Link to="/products" className="hover:text-pink-500">
                        Shop
                      </Link>
                    </li>
                    <li>
                      <Link to="/diamonds" className="hover:text-pink-500">
                        Diamonds
                      </Link>
                    </li>
                    <li>
                      <Link to="/gold" className="hover:text-pink-500">
                        Gold Jewellery
                      </Link>
                    </li>
                    <li>
                      <Link to="/process" className="hover:text-pink-500">
                        Our Process
                      </Link>
                    </li>
                    <li>
                      <Link to="/about" className="hover:text-pink-500">
                        About Us
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h6 className="text-2xl font-semibold uppercase tracking-[0.22em] text-slate-800">
                    Help & Policies
                  </h6>
                  <ul className="mt-4 space-y-2 text-xl text-slate-700">
                    <li>
                      <Link to="/shipping" className="hover:text-pink-500">
                        Shipping
                      </Link>
                    </li>
                    <li>
                      <Link to="/returns" className="hover:text-pink-500">
                        Returns
                      </Link>
                    </li>
                    <li>
                      <Link to="/privacy" className="hover:text-pink-500">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link to="/terms" className="hover:text-pink-500">
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link to="/contact" className="hover:text-pink-500">
                        Contact Support
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h6 className="text-2xl font-semibold uppercase tracking-[0.22em] text-slate-800">
                  Contact
                </h6>
                <div className="mt-4 space-y-4 text-lg text-slate-700">
                  

                  

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-pink-500" />
                    <a
                      href="mailto:info@minalgem.com"
                      className="hover:text-pink-500"
                    >
                      info@minalgem.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-6 border-pink-100/80" />

            <div className="flex flex-col items-center justify-between gap-3 text-lg text-slate-600 sm:flex-row">
              <div>© {currentYear} Minal Gems. All rights reserved.</div>
              <div>
                Designed & Managed by{" "}
                <span className="font-semibold text-pink-500">
                  EXOTECH DEVELOPERS for more details visit{" "}
                  <a href="https://www.exotech.co.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-600 transition"    >
                    www.exotech.co.in
                  </a>
                </span>
               
              </div>
            </div>
          </Container>
        </footer>
      </AnimatedSection>
    </>
  );
}
