// src/components/Header.tsx
import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Container from "./layout/Container";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { attachAnonymousCart } from "../api/cart.api";
import { getWishlist } from "../api/wishlist.api";
import { UserCircle, Menu, Heart, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/diamonds", label: "Diamonds" },
  { to: "/gold", label: "Gold" },
  { to: "/process", label: "Process" },
  { to: "/about", label: "About" },
];

export default function Header() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const cartCtx = useContext(CartContext);

  const user = auth?.user || null;
  const isLoggedIn = !!auth?.isLoggedIn;
  const logout = auth?.logout || (async () => {});
  const cart = cartCtx?.cart;
  const refreshCart = cartCtx?.refreshCart || (async () => {});

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const cartCount = cart?.item_count ?? 0;

  // Wishlist count for header badge
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  // ----------------------------------------
  // Attach anonymous cart after login
  // ----------------------------------------
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

  // ----------------------------------------
  // Load wishlist count when logged in
  // ----------------------------------------
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

  // ----------------------------------------
  // Listen to wishlist:updated events
  // ----------------------------------------
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

  // ----------------------------------------
  // Scroll shadow / glass effect
  // ----------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ----------------------------------------
  // Logout handler
  // ----------------------------------------
  async function handleLogout() {
    setProfileOpen(false);
    try {
      await logout(); // clears auth state + token
      await refreshCart(); // reloads cart as anonymous
      setWishlistCount(0);
    } catch (err) {
      console.error("Logout flow error:", err);
    } finally {
      navigate("/", { replace: true });
    }
  }

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={`sticky top-0 z-50 border-b border-slate-200/40 backdrop-blur-xl transition-all ${
        hasScrolled
          ? "bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
          : "bg-white/80"
      }`}
    >
      <Container className="flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <motion.img
            src="/logo_minalgems.png"
            alt="Minal Gems"
            className="h-16 w-auto"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.25 }}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group relative text-[0.9rem] font-semibold uppercase tracking-[0.12em] ${
                  isActive ? "text-rose-600" : "text-slate-700"
                } hover:text-rose-600 transition-colors`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  <span
                    className={`pointer-events-none absolute -bottom-1 left-0 h-[2px] w-full origin-center rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-400 transition-transform duration-300 ${
                      isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-4 py-2 text-[0.8rem] font-semibold tracking-wide text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-rose-500 hover:text-rose-500 hover:shadow-md"
          >
            <Heart className="h-4 w-4" />
            Wishlist
            {wishlistCount > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-semibold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-4 py-2 text-[0.8rem] font-semibold tracking-wide text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-rose-500 hover:text-rose-500 hover:shadow-md"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
            {cartCount > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {!isLoggedIn ? (
            <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
              <Link
                to="/login"
                className="rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 px-6 py-2 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(248,113,113,0.6)] transition hover:brightness-110"
              >
                Login
              </Link>
            </motion.div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-rose-500 hover:text-rose-600 hover:shadow-md"
              >
                <UserCircle className="h-5 w-5 text-rose-600" />
                <span className="max-w-[140px] truncate">
                  {user?.full_name || "Profile"}
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                  >
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/profile");
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/orders");
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      My Orders
                    </button>
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="rounded-full border border-slate-200 bg-white/70 p-2 shadow-sm md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="h-6 w-6 text-slate-800" />
        </button>
      </Container>

      {/* Mobile Nav */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="border-t border-slate-200 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.18)] md:hidden"
          >
            <Container className="flex flex-col gap-2 py-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-full px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-rose-50 text-rose-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-2 flex items-center justify-between gap-3">
                <Link
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  className="flex flex-1 items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm"
                >
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </span>
                  {wishlistCount > 0 && (
                    <span className="ml-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-semibold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="flex flex-1 items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm"
                >
                  <span className="inline-flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                  </span>
                  {cartCount > 0 && (
                    <span className="ml-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-semibold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {!isLoggedIn ? (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="mt-3 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 px-4 py-2 text-center text-sm font-semibold text-white shadow-[0_14px_30px_rgba(248,113,113,0.6)]"
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="mt-3 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-semibold text-red-600"
                >
                  Logout
                </button>
              )}
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
