// src/components/Header.tsx

import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import Container from "./layout/Container";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { attachAnonymousCart } from "../api/cart.api";
import { getWishlist } from "../api/wishlist.api";
import { 
  UserCircle, 
  Menu, 
  Heart, 
  ShoppingCart, 
  Search, 
  Sparkles, 
  Gem, 
  Crown,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  Bell,
  Star,
  X,
  MapPin,
  Phone,
  Clock,
  Shield,
  Truck,
  Home
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/products", label: "Diamond Jewellery", icon: Gem },
  { to: "/diamonds", label: "Diamonds", icon: Sparkles },
  
  
  { to: "/about", label: "Our Story", icon: Star },
];

// Mega menu categories
const shopCategories = [
  
  {
    title: "Diamond Jewellery",
    items: [
      { name: "Solitaire", href: "/products?category=solitaire" },
      { name: "Eternity Bands", href: "/products?category=eternity-bands" },
      { name: "Statement Pieces", href: "/products?category=statement-diamond" },
      { name: "Daily Wear Diamond", href: "/products?category=daily-diamond" },
    ]
  },
  {
    title: "Collections",
    items: [
      { name: "Bridal Collection", href: "/products?category=bridal" },
      { name: "Festive Collection", href: "/products?category=festive" },
      { name: "Modern Minimalist", href: "/products?category=minimalist" },
      { name: "Heritage Collection", href: "/products?category=heritage" },
    ]
  }
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useContext(AuthContext);
  const cartCtx = useContext(CartContext);

  const user = auth?.user || null;
  const isLoggedIn = !!auth?.isLoggedIn;
  const logout = auth?.logout || (async () => {});
  const cart = cartCtx?.cart;
  const refreshCart = cartCtx?.refreshCart || (async () => {});

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);

  const cartCount = cart?.item_count ?? 0;
  const cartTotal = cart?.grand_total ?? 0;

  const headerRef = useRef<HTMLElement>(null);
  const shopMenuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(event.target as Node)) {
        setShopMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('[data-search-trigger]')) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Attach anonymous cart after login
  useEffect(() => {
    async function handleAttach() {
      const anonId = localStorage.getItem("anon_cart_id");
      if (isLoggedIn && anonId) {
        try {
          await attachAnonymousCart(anonId);
          await refreshCart();
        } catch (e) {
          console.error("Attach cart failed:", e);
        }
        localStorage.removeItem("anon_cart_id");
      }
    }
    handleAttach();
  }, [isLoggedIn, refreshCart]);

  // Load wishlist count when logged in
  useEffect(() => {
    let cancelled = false;

    async function loadWishlistCount() {
      if (!isLoggedIn) {
        setWishlistCount(0);
        return;
      }

      try {
        const res = await getWishlist();
        if (!cancelled && (res as any)?.ok && (res as any).wishlist?.items) {
          setWishlistCount((res as any).wishlist.items.length);
        }
      } catch (err) {
        console.error("Header wishlist load error:", err);
      }
    }

    loadWishlistCount();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  // Listen to wishlist:updated events
  useEffect(() => {
    function handleWishlistEvent(
      ev: Event | CustomEvent<{ kind: string; count?: number; delta?: number }>
    ) {
      const e = ev as CustomEvent<{
        kind: "set" | "add" | "remove" | "clear";
        count?: number;
        delta?: number;
      }>;

      setWishlistCount((prev) => {
        switch (e.detail.kind) {
          case "set":
            return typeof e.detail.count === "number" ? e.detail.count : prev;
          case "add":
            return prev + (e.detail.delta ?? 1);
          case "remove":
            return Math.max(0, prev - (e.detail.delta ?? 1));
          case "clear":
            return 0;
          default:
            return prev;
        }
      });
    }

    if (typeof window !== "undefined") {
      window.addEventListener(
        "wishlist:updated",
        handleWishlistEvent as EventListener
      );
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "wishlist:updated",
          handleWishlistEvent as EventListener
        );
      }
    };
  }, []);

  // Scroll shadow / glass effect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Logout handler
  async function handleLogout() {
    setProfileOpen(false);
    try {
      await logout();
      await refreshCart();
      setWishlistCount(0);
    } catch (err) {
      console.error("Logout flow error:", err);
    } finally {
      navigate("/", { replace: true });
    }
  }

  // Handle cart click
  const handleCartClick = () => {
    if (cartCount > 0 && window.innerWidth >= 768) {
      setCartDropdownOpen(!cartDropdownOpen);
    } else {
      navigate("/cart");
    }
  };

  // Animation variants
  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      y: -10,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15
      }
    }
  };

  // Mobile responsive classes
  const responsiveClasses = {
    // Hide/show based on breakpoints
    hideOnMobile: "hidden sm:flex",
    hideOnTablet: "hidden md:flex",
    showOnMobile: "flex sm:hidden",
    showOnTablet: "flex md:hidden",
    
    // Text sizes
    textXs: "text-xs",
    textSm: "text-sm",
    textBase: "text-base",
    textLg: "text-lg",
    
    // Spacing
    gapSm: "gap-2",
    gapMd: "gap-4",
    gapLg: "gap-6",
    
    // Padding
    pXs: "px-2 py-1",
    pSm: "px-3 py-2",
    pMd: "px-4 py-3",
    pLg: "px-6 py-4",
  };

  return (
    <>
      

      {/* Main Header */}
      <motion.header
        ref={headerRef}
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          hasScrolled
            ? "bg-white/95 backdrop-blur-xl border-amber-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
            : "bg-white/90 backdrop-blur-lg border-transparent"
        }`}
      >
        <Container className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group flex-shrink-0">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="flex items-center h-10 w-32 md:h-14 md:w-[140px] overflow-hidden">
                  <img
                    src="/images/logo_minalgems.png"
                    alt="Minal Gems"
                    className="h-full w-full object-contain"
                    loading="eager"
                  />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              </motion.div>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => {
              const isShopLink = item.label === "Shop All";
              
              return isShopLink ? (
                <div key={item.to} className="relative" ref={shopMenuRef}>
                  <button
                    onMouseEnter={() => setShopMenuOpen(true)}
                    onMouseLeave={() => setShopMenuOpen(false)}
                    className={`group flex items-center gap-1 rounded-full px-4 md:px-5 py-2 md:py-2.5 text-sm font-semibold uppercase tracking-[0.12em] transition-all ${
                      location.pathname.startsWith('/products')
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                        : "text-gray-800 hover:bg-amber-50 hover:text-amber-700"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="xl:hidden inline">Shop</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      shopMenuOpen ? "rotate-180" : ""
                    }`} />
                  </button>

                  <AnimatePresence>
                    {shopMenuOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onMouseEnter={() => setShopMenuOpen(true)}
                        onMouseLeave={() => setShopMenuOpen(false)}
                        className="absolute left-0 top-full mt-2 w-[90vw] max-w-[800px] overflow-hidden rounded-2xl border border-amber-100 bg-white/95 shadow-2xl backdrop-blur-xl"
                      >
                        <div className="p-6 md:p-8">
                          <div className="mb-4 md:mb-6 flex items-center justify-between">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900">Shop Collections</h3>
                            <Link 
                              to="/products" 
                              className="text-amber-600 hover:text-amber-700 font-medium text-sm md:text-base"
                              onClick={() => setShopMenuOpen(false)}
                            >
                              View All →
                            </Link>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                            {shopCategories.map((category, idx) => (
                              <div key={idx}>
                                <h4 className="mb-2 md:mb-4 text-base md:text-lg font-semibold text-gray-900 border-b border-amber-100 pb-2">
                                  {category.title}
                                </h4>
                                <ul className="space-y-1 md:space-y-3">
                                  {category.items.map((subItem, subIdx) => (
                                    <li key={subIdx}>
                                      <Link
                                        to={subItem.href}
                                        onClick={() => setShopMenuOpen(false)}
                                        className="group flex items-center gap-2 text-sm md:text-base text-gray-600 hover:text-amber-700 transition-colors py-1"
                                      >
                                        <div className="h-1 w-1 rounded-full bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                        {subItem.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 md:mt-8 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 p-4 md:p-6 border border-amber-200">
                            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
                              <div className="rounded-full bg-white p-2 md:p-3 shadow-md">
                                <Crown className="h-5 md:h-6 w-5 md:w-6 text-amber-600" />
                              </div>
                              <div className="flex-1 text-center sm:text-left">
                                <h4 className="font-semibold text-gray-900 text-sm md:text-base">New Arrivals</h4>
                                <p className="text-xs md:text-sm text-gray-600">Discover our latest handcrafted pieces</p>
                              </div>
                              <Link
                                to="/products?sort=newest"
                                onClick={() => setShopMenuOpen(false)}
                                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 md:px-6 py-2 text-white font-medium hover:from-amber-600 hover:to-amber-700 transition-all text-sm md:text-base"
                              >
                                Explore
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-2 rounded-full px-4 md:px-5 py-2 md:py-2.5 text-sm font-semibold uppercase tracking-[0.12em] transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                        : "text-gray-800 hover:bg-amber-50 hover:text-amber-700"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden inline">
                    {item.label === "Craftsmanship" ? "Craft" : 
                     item.label === "Our Story" ? "Story" : 
                     item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search Button - Hidden on mobile, shown on tablet+ */}
            <button
              data-search-trigger
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden sm:flex items-center justify-center h-9 w-9 md:h-10 md:w-10 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            {/* Search Modal */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                  onClick={() => setSearchOpen(false)}
                >
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 w-[95vw] max-w-2xl px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <form onSubmit={handleSearch} className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for diamonds, gold, jewellery..."
                        autoFocus
                        className="w-full rounded-xl md:rounded-2xl border-2 border-amber-500 bg-white p-4 pl-12 md:p-5 md:pl-14 text-base md:text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/30"
                      />
                      <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-amber-500" />
                      <button
                        type="button"
                        onClick={() => setSearchOpen(false)}
                        className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5 md:h-6 md:w-6" />
                      </button>
                    </form>
                    <div className="mt-2 md:mt-4 rounded-xl md:rounded-2xl bg-white p-3 md:p-4 shadow-xl">
                      <p className="text-xs md:text-sm text-gray-500">
                        Try searching for: "diamond rings", "gold necklace", "bridal set"
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wishlist - Hidden on mobile, shown on tablet+ */}
            <Link
              to="/wishlist"
              className="hidden sm:flex relative items-center justify-center h-9 w-9 md:h-10 md:w-10 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors group"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4 md:h-5 md:w-5" />
              {wishlistCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-xs font-bold text-white shadow-md">
                    {wishlistCount}
                  </span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </Link>

            {/* Cart */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={handleCartClick}
                className="relative flex items-center justify-center h-9 w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 hover:from-amber-100 hover:to-amber-200 transition-all group focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                aria-label="Cart"
                title={cartCount > 0 ? `${cartCount} item${cartCount > 1 ? 's' : ''} in cart` : 'Cart is empty'}
              >
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />

                {/* Cart count badge – only shown when items exist */}
                {cartCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-bold text-black shadow-md ring-1 ring-white">
                      {cartCount}
                    </span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                )}

                {/* Optional subtle dot when cart is empty – remove if not wanted */}
                {cartCount === 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-gray-400 ring-2 ring-white" />
                )}
              </button>

              {/* Cart Dropdown (animated) */}
              <AnimatePresence>
                {cartDropdownOpen && cartCount > 0 && (
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: -10 },
                      visible: { opacity: 1, y: 0 },
                      exit: { opacity: 0, y: -10 }
                    }}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 top-full mt-2 w-[90vw] max-w-[320px] md:w-80 overflow-hidden rounded-2xl border border-amber-100 bg-white/95 shadow-2xl backdrop-blur-xl z-50"
                  >
                    <div className="p-3 md:p-4">
                      <div className="mb-2 md:mb-3 flex items-center justify-between">
                        <h4 className="font-semibold text-black text-sm md:text-base">Your Cart</h4>
                        <span className="text-xs md:text-sm text-black font-medium">
                          {cartCount} {cartCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {/* Subtotal */}
                      <div className="mb-3 md:mb-4">
                        <div className="flex items-center justify-between text-xs md:text-sm">
                          <span className="text-black">Subtotal</span>
                          <span className="font-semibold text-black">
                            ₹{cartTotal?.toLocaleString('en-IN') || 0}
                          </span>
                        </div>
                        
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Link
                          to="/cart"
                          onClick={() => setCartDropdownOpen(false)}
                          className="block w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 md:py-3 text-center font-medium text-white hover:from-amber-600 hover:to-amber-700 transition-all text-sm md:text-base"
                        >
                          View Cart
                        </Link>
                        <Link
                          to="/checkout"
                          onClick={() => setCartDropdownOpen(false)}
                          className="block w-full rounded-full border border-amber-500 bg-white py-2.5 md:py-3 text-center font-medium text-amber-600 hover:bg-amber-50 transition-colors text-sm md:text-base"
                        >
                          Checkout Now
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* User Profile */}
            <div className="relative" ref={profileRef}>
              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 md:px-6 py-2 md:py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:from-amber-600 hover:to-amber-700 transition-all"
                >
                  <UserCircle className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden lg:inline">Login</span>
                  <span className="lg:hidden inline">Sign In</span>
                </Link>
              ) : (
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 px-3 md:px-4 py-2 text-sm font-semibold text-amber-900 hover:from-amber-100 hover:to-amber-200 transition-all group"
                >
                  <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm">
                    {user?.full_name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden lg:inline max-w-[120px] truncate">
                    {user?.full_name || "User"}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`} />
                </button>
              )}

              <AnimatePresence>
                {profileOpen && isLoggedIn && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 top-full mt-2 w-[90vw] max-w-[280px] md:w-64 overflow-hidden rounded-2xl border border-amber-100 bg-white/95 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="p-3 md:p-4">
                      <div className="mb-3 md:mb-4 flex items-center gap-2 md:gap-3">
                        <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-base md:text-lg font-semibold">
                          {user?.full_name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">{user?.full_name || "User"}</h4>
                          <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-0.5 md:space-y-1">
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 md:gap-3 rounded-lg px-3 py-2 md:py-2.5 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm md:text-base"
                        >
                          <UserCircle className="h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 md:gap-3 rounded-lg px-3 py-2 md:py-2.5 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm md:text-base"
                        >
                          <Package className="h-4 w-4" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 md:gap-3 rounded-lg px-3 py-2 md:py-2.5 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm md:text-base"
                        >
                          <Heart className="h-4 w-4" />
                          <span>Wishlist</span>
                          {wishlistCount > 0 && (
                            <span className="ml-auto rounded-full bg-rose-500 px-1.5 md:px-2 py-0.5 text-xs text-white">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/notifications"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 md:gap-3 rounded-lg px-3 py-2 md:py-2.5 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm md:text-base"
                        >
                          <Bell className="h-4 w-4" />
                          <span>Notifications</span>
                        </Link>
                      </div>

                      <div className="my-2 md:my-3 h-px bg-amber-100" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 md:gap-3 rounded-lg px-3 py-2 md:py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm md:text-base"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpen(!open)}
              className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700 shadow-sm lg:hidden hover:bg-amber-100 transition-colors"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </Container>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-amber-100 bg-white/95 backdrop-blur-xl shadow-2xl lg:hidden overflow-hidden"
            >
              <Container className="py-4 md:py-6">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-4 md:mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search jewellery..."
                      className="w-full rounded-full border border-amber-200 bg-amber-50 py-2.5 md:py-3 pl-10 md:pl-12 pr-4 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm md:text-base"
                    />
                    <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                  </div>
                </form>

                {/* Mobile Nav Items */}
                <nav className="space-y-1 md:space-y-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 md:px-4 py-2.5 md:py-3.5 text-sm md:text-base font-medium transition ${
                          isActive
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-amber-50"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>

                {/* Mobile Shop Categories (Collapsible) */}
                <div className="mt-4 md:mt-6">
                  <div className="mb-2 text-sm md:text-base font-semibold text-gray-800 px-3">Shop by Category</div>
                  <div className="grid grid-cols-2 gap-2">
                    {shopCategories.slice(0, 2).map((category, idx) => (
                      <div key={idx} className="bg-amber-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 text-xs md:text-sm mb-1">{category.title}</h4>
                        <ul className="space-y-1">
                          {category.items.slice(0, 2).map((subItem, subIdx) => (
                            <li key={subIdx}>
                              <Link
                                to={subItem.href}
                                onClick={() => setOpen(false)}
                                className="text-xs md:text-sm text-gray-600 hover:text-amber-700 transition-colors"
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Quick Actions */}
                <div className="mt-4 md:mt-8 grid grid-cols-2 gap-2 md:gap-3">
                  <Link
                    to="/wishlist"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 md:py-3 px-3 md:px-4 text-rose-700 hover:bg-rose-100 transition-colors"
                  >
                    <Heart className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-sm md:text-base">Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="ml-auto rounded-full bg-rose-500 px-1.5 md:px-2 py-0.5 text-xs text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 py-2.5 md:py-3 px-3 md:px-4 text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-sm md:text-base">Cart</span>
                    {cartCount > 0 && (
                      <span className="ml-auto rounded-full bg-amber-500 px-1.5 md:px-2 py-0.5 text-xs text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Mobile Auth */}
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-amber-100">
                  {!isLoggedIn ? (
                    <div className="space-y-2 md:space-y-3">
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="block w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 md:py-3 text-center font-semibold text-white shadow-lg text-sm md:text-base"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setOpen(false)}
                        className="block w-full rounded-full border border-amber-500 py-2.5 md:py-3 text-center font-semibold text-amber-600 hover:bg-amber-50 transition-colors text-sm md:text-base"
                      >
                        Create Account
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3 md:p-4">
                        <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-sm md:text-base">
                          {user?.full_name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{user?.full_name || "User"}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to="/profile"
                          onClick={() => setOpen(false)}
                          className="rounded-full border border-amber-300 bg-white py-2 text-amber-600 font-medium hover:bg-amber-50 transition-colors text-center text-sm"
                        >
                          Profile
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setOpen(false)}
                          className="rounded-full border border-amber-300 bg-white py-2 text-amber-600 font-medium hover:bg-amber-50 transition-colors text-center text-sm"
                        >
                          Orders
                        </Link>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-full border border-red-300 bg-red-50 py-2.5 md:py-3 text-red-600 font-semibold hover:bg-red-100 transition-colors text-sm md:text-base"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>  
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}