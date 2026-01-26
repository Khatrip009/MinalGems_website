// src/components/Footer.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "./layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
import Button from "./ui/Button";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  Star, 
  Twitter, 
  Youtube, 
  Heart,
  Shield,
  Truck,
  Award,
  Gem,
  Sparkles,
  Clock,
  CheckCircle,
  Send,
  ChevronRight,
  CreditCard,
  Package,
  Headphones,
  ShieldCheck,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
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
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadVisitors() {
      try {
        const data = await apiFetch<VisitorsMetricsResponse>(
          "/analytics/visitors-metrics/summary"
        );

        if (cancelled) return;

        const raw = data.metrics?.total_visitors ?? 0;
        const DISPLAY_BASE = 10689;
        const DISPLAY_MULTIPLIER = 5;
        const displayTotal = DISPLAY_BASE + raw * DISPLAY_MULTIPLIER;

        setTotalVisitors(displayTotal);
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
    const arr: React.ReactNode[] = [];
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
            className="h-4 w-4 text-yellow-300 fill-yellow-300"
          />
        );
      } else {
        arr.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return <div className="flex items-center gap-1">{arr}</div>;
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      // In a real app, you would call your newsletter API here
      console.log("Subscribing email:", email);
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    } catch (error) {
      console.error("Subscription failed:", error);
    }
  };

  const WHATSAPP_NUMBER = "917069785900";
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <>
      {/* Enhanced WhatsApp Float Button */}
      <motion.a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-5 py-3 text-white shadow-2xl shadow-green-500/30 transition-all hover:scale-105 hover:shadow-green-500/50 group"
        aria-label="Chat on WhatsApp"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <div className="text-2xl">💎</div>
          </div>
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-medium">Need Help?</div>
          <div className="text-xs opacity-90">Chat with our experts</div>
        </div>
        <div className="ml-2 hidden lg:block text-sm font-semibold">
          Click to Chat →
        </div>
      </motion.a>

      {/* Trust Banner */}
      <div className="border-t border-b border-amber-100 bg-gradient-to-r from-amber-50 to-amber-100/50">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
            {[
              { icon: ShieldCheck, title: "Certified Quality", desc: "BIS Hallmark" },
              { icon: Truck, title: "Free Shipping", desc: "Across India" },
              { icon: CreditCard, title: "Secure Payments", desc: "SSL Encrypted" },
              { icon: Headphones, title: "24/7 Support", desc: "Expert Guidance" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 p-3">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <AnimatedSection>
        <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white">
          <Container className="py-12 lg:py-16">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Brand & About */}
              <div className="lg:col-span-1 space-y-6">
                <Link to="/" className="inline-block">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/logo_minalgems.png"
                      alt="Payal & Minal Gems"
                      className="h-20 w-auto"
                    />
                    
                  </div>
                </Link>

                <p className="text-gray-300 leading-relaxed">
                  Crafting timeless jewellery with passion and precision since 1995. 
                  Each piece is a testament to our commitment to quality, craftsmanship, 
                  and creating memories that last generations.
                </p>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="rounded-xl bg-gradient-to-r from-amber-900/50 to-amber-800/30 p-4 border border-amber-800/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-200">Trusted By</p>
                        <p className="text-2xl font-bold">
                          {totalVisitors !== null
                            ? (totalVisitors / 1000).toFixed(1) + "K+"
                            : "—"}
                        </p>
                        <p className="text-xs text-amber-300/70">Happy Customers</p>
                      </div>
                      <Users className="h-8 w-8 text-amber-400" />
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-r from-rose-900/50 to-rose-800/30 p-4 border border-rose-800/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-rose-200">Customer Rating</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">
                            {avgRating !== null ? avgRating.toFixed(1) : "—"}
                          </span>
                          {renderStars(avgRating)}
                        </div>
                        <p className="text-xs text-rose-300/70">
                          {totalReviews ? `${totalReviews} reviews` : "Based on reviews"}
                        </p>
                      </div>
                      <Award className="h-8 w-8 text-rose-400" />
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="pt-4">
                  <p className="mb-3 text-sm font-semibold text-gray-300">Follow Our Journey</p>
                  <div className="flex gap-3">
                    {[
                      { icon: Instagram, color: "from-purple-600 to-pink-600", href: "#" },
                      { icon: Facebook, color: "from-blue-600 to-blue-800", href: "#" },
                      { icon: Twitter, color: "from-sky-500 to-blue-500", href: "#" },
                      { icon: Youtube, color: "from-red-600 to-red-700", href: "#" }
                    ].map((social, idx) => (
                      <a
                        key={idx}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`h-10 w-10 rounded-full bg-gradient-to-r ${social.color} flex items-center justify-center text-white transition-transform hover:scale-110`}
                      >
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  Explore Collections
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-amber-400 font-semibold mb-4">Shop By Category</h4>
                    <ul className="space-y-3">
                      {[
                        "Diamond Jewellery",
                        "Gold Collections",
                        "Bridal Sets",
                        "Everyday Wear",
                        "Antique Designs",
                        "Custom Orders"
                      ].map((item, idx) => (
                        <li key={idx}>
                          <Link 
                            to={`/products?category=${item.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-gray-300 hover:text-amber-300 transition-colors flex items-center gap-2 group"
                          >
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-amber-400 font-semibold mb-4">Customer Services</h4>
                    <ul className="space-y-3">
                      {[
                        { name: "Order Tracking", path: "/track" },
                        { name: "Shipping Policy", path: "/shipping" },
                        { name: "Return & Exchange", path: "/returns" },
                        { name: "Size Guide", path: "/size-guide" },
                        { name: "Jewellery Care", path: "/care" },
                        { name: "FAQ", path: "/faq" }
                      ].map((item, idx) => (
                        <li key={idx}>
                          <Link 
                            to={item.path}
                            className="text-gray-300 hover:text-amber-300 transition-colors flex items-center gap-2 group"
                          >
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Policies & Info */}
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-400" />
                  Policies & Information
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-amber-400 font-semibold mb-4">Company</h4>
                    <ul className="space-y-3">
                      {[
                        { name: "About Us", path: "/about" },
                        { name: "Our Process", path: "/process" },
                        { name: "Blog & News", path: "/blog" },
                        { name: "Press & Media", path: "/press" },
                        { name: "Careers", path: "/careers" },
                        { name: "Store Locator", path: "/stores" }
                      ].map((item, idx) => (
                        <li key={idx}>
                          <Link 
                            to={item.path}
                            className="text-gray-300 hover:text-amber-300 transition-colors flex items-center gap-2 group"
                          >
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-amber-400 font-semibold mb-4">Legal</h4>
                    <ul className="space-y-3">
                      {[
                        { name: "Privacy Policy", path: "/privacy" },
                        { name: "Terms of Service", path: "/terms" },
                        { name: "Disclaimer", path: "/disclaimer" },
                        { name: "Cookie Policy", path: "/cookies" },
                        { name: "Payment Security", path: "/security" },
                        { name: "BIS Certification", path: "/certification" }
                      ].map((item, idx) => (
                        <li key={idx}>
                          <Link 
                            to={item.path}
                            className="text-gray-300 hover:text-amber-300 transition-colors flex items-center gap-2 group"
                          >
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Newsletter & Contact */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-amber-400" />
                    Stay Updated
                  </h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    Subscribe to receive updates on new collections, exclusive offers, 
                    and jewellery care tips.
                  </p>
                  
                  {subscribed ? (
                    <div className="rounded-xl bg-gradient-to-r from-emerald-900/50 to-emerald-800/30 p-4 border border-emerald-800/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        <div>
                          <p className="font-semibold text-white">Subscribed Successfully!</p>
                          <p className="text-sm text-emerald-300/70">
                            Thank you for joining our community.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="space-y-3">
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="w-full rounded-full border border-amber-800/50 bg-gray-800/50 py-3 pl-5 pr-12 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        />
                        <button
                          type="submit"
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 p-2 hover:from-amber-600 hover:to-amber-700 transition-all"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">
                        We respect your privacy. Unsubscribe at any time.
                      </p>
                    </form>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-amber-400" />
                    Contact Us
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="rounded-full bg-gradient-to-r from-amber-900/50 to-amber-800/30 p-2">
                          <MapPin className="h-4 w-4 text-amber-400" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-white">Visit Our Workshop</p>
                        <p className="text-sm text-gray-300">
                          Surat Diamond Hub, Gujarat, India - 395010
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="rounded-full bg-gradient-to-r from-rose-900/50 to-rose-800/30 p-2">
                          <Mail className="h-4 w-4 text-rose-400" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-white">Email Support</p>
                        <a 
                          href="mailto:info@minalgem.com" 
                          className="text-sm text-rose-300 hover:text-rose-200 transition-colors"
                        >
                          info@minalgem.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="rounded-full bg-gradient-to-r from-blue-900/50 to-blue-800/30 p-2">
                          <Clock className="h-4 w-4 text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-white">Business Hours</p>
                        <p className="text-sm text-gray-300">
                          Mon-Sat: 10AM - 8PM IST
                          <br />
                          Sunday: 11AM - 6PM IST
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="my-12 h-px bg-gradient-to-r from-transparent via-amber-800/50 to-transparent" />

            {/* Bottom Footer */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-sm">
                  © {currentYear} Payal & Minal Gems. All rights reserved.
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Crafted with <Heart className="inline h-3 w-3 text-rose-500" /> in India
                </p>
              </div>

              <div className="text-center">
                <p className="text-amber-300 text-sm font-medium">
                  <Gem className="inline h-4 w-4 mr-2" />
                  Certified BIS Hallmark Jewellery
                </p>
              </div>

              <div className="text-center md:text-right">
                <p className="text-gray-400 text-sm">
                  Designed & Developed by{" "}
                  <a 
                    href="https://www.exotech.co.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 transition-colors font-semibold"
                  >
                    Exotech Developers
                  </a>
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Premium Web Solutions for Luxury Brands
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-center text-gray-400 text-sm mb-4">
                We Accept
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {["Visa", "Mastercard", "RuPay", "UPI", "NetBanking", "EMI"].map((method, idx) => (
                  <div 
                    key={idx}
                    className="px-4 py-2 rounded-lg bg-gray-800/50 text-gray-300 text-sm font-medium"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </footer>
      </AnimatedSection>
    </>
  );
}