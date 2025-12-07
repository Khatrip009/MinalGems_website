// src/pages/ProfilePage.tsx
import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  ChangeEvent,
  FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Shield,
  MapPin,
  Heart,
  ShoppingBag,
  Truck,
  KeyRound,
  PackageSearch,
  Globe2,
  Phone,
  Mail,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  Star,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import SectionTitle from "../components/ui/SectionTitle";
import Skeleton from "../components/ui/Skeleton";

import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { apiFetch, API_BASE } from "../api/client";
import { getWishlist, removeFromWishlist } from "../api/wishlist.api";
import {
  getAccountOverview,
  getProfile,
  updateProfile,
  changePassword,
  getOrderTimeline,
  type UserProfile,
  type AccountOverviewResponse,
} from "../api/account.api";

type TabId = "overview" | "profile" | "addresses" | "orders" | "wishlist";

interface Address {
  id: string;
  customer_id: string;
  label: string | null;
  full_name: string | null;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default_billing: boolean;
  is_default_shipping: boolean;
  metadata?: any;
}

interface AddressesResponse {
  ok: boolean;
  addresses: Address[];
}

interface OrdersListResponse {
  ok: boolean;
  orders: any[];
}

interface OrderTimelineEntry {
  id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_at: string;
}

interface WishlistItem {
  id: string;
  product_id: string;
  product_title?: string;
  product_slug?: string;
  product_primary_image?: string;
  product_price?: number;
  product_currency?: string;
  product?: any;
}

type TabDef = { id: TabId; label: string; icon: React.ReactNode };

const tabDefs: TabDef[] = [
  { id: "overview", label: "Overview", icon: <UserIcon className="h-4 w-4" /> },
  {
    id: "profile",
    label: "Profile & Security",
    icon: <Shield className="h-4 w-4" />,
  },
  { id: "addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
  { id: "orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { id: "wishlist", label: "Wishlist", icon: <Heart className="h-4 w-4" /> },
];

function formatDate(d?: string | null): string {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function humanStatus(status: string | null | undefined): string {
  if (!status) return "-";
  return status.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

/* =========================================================
 * Main Profile Page
 * ======================================================= */

export default function ProfilePage() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const cartCtx = useContext(CartContext);

  const isLoggedIn = !!auth?.isLoggedIn;
  const authLoading = !!auth?.isLoading;

  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const [overview, setOverview] = useState<AccountOverviewResponse | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [timelineByOrderId, setTimelineByOrderId] = useState<
    Record<string, OrderTimelineEntry[]>
  >({});
  const [timelineLoadingId, setTimelineLoadingId] = useState<string | null>(null);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    dob: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [addressEditingId, setAddressEditingId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    is_default_billing: false,
    is_default_shipping: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const refreshCart = cartCtx?.refreshCart || (async () => {});

  /* ---------- Redirect if not logged in ---------- */
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate(`/login?next=${encodeURIComponent("/profile")}`, {
        replace: true,
      });
    }
  }, [authLoading, isLoggedIn, navigate]);

  /* ---------- Initial load ---------- */
  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;

    async function loadAll() {
      try {
        setError(null);

        // Overview
        setLoadingOverview(true);
        const overviewRes = await getAccountOverview();
        if (!cancelled && overviewRes.ok) {
          setOverview(overviewRes);
        }

        // Profile (core account)
        setLoadingProfile(true);
        const profileRes = await getProfile();
        if (!cancelled && profileRes.ok) {
          setProfile(profileRes.user);
          setProfileForm({
            full_name: profileRes.user.full_name || "",
            phone: profileRes.user.phone || "",
            dob: profileRes.user.dob || "",
          });
        }

        // Public profile (for avatar, bio, etc.)
        try {
          const profileMe = await apiFetch<{ ok: boolean; profile: any }>(
            "/profile/me",
            { method: "GET" }
          );

          if (
            !cancelled &&
            profileMe.ok &&
            profileMe.profile &&
            profileMe.profile.avatar_url
          ) {
            setAvatarUrl(profileMe.profile.avatar_url);
          }
        } catch (e) {
          console.warn("[ProfilePage] /profile/me load failed:", e);
        }

        // Addresses
        setLoadingAddresses(true);
        const addrRes = await apiFetch<AddressesResponse>(
          "/customer/addresses",
          { method: "GET" }
        );
        if (!cancelled && addrRes.ok) {
          setAddresses(addrRes.addresses || []);
        }

        // Orders
        setLoadingOrders(true);
        const ordersRes = await apiFetch<OrdersListResponse>("/orders/my", {
          method: "GET",
        });
        if (!cancelled && ordersRes.ok) {
          setOrders(ordersRes.orders || []);
        }

        // Wishlist
        setLoadingWishlist(true);
        const wlRes = await getWishlist();
        if (
          !cancelled &&
          wlRes.ok &&
          wlRes.wishlist &&
          Array.isArray(wlRes.wishlist.items)
        ) {
          setWishlist(wlRes.wishlist.items as WishlistItem[]);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("[ProfilePage] load error:", err);
          setError("Something went wrong while loading your account.");
        }
      } finally {
        if (!cancelled) {
          setLoadingOverview(false);
          setLoadingProfile(false);
          setLoadingAddresses(false);
          setLoadingOrders(false);
          setLoadingWishlist(false);
        }
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  /* =========================================================
   * Avatar
   * ======================================================= */

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setAvatarUploading(true);

      // Use same token strategy as apiFetch
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${API_BASE}/profile/avatar`, {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              // DO NOT set Content-Type manually for FormData
            }
          : undefined,
        body: formData,
        credentials: "include",
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // non-JSON error body
        data = {};
      }

      if (!res.ok || !data.ok) {
        console.error("Avatar upload failed:", res.status, data);
        alert("Could not upload avatar. Please try again.");
        return;
      }

      if (data.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Could not upload avatar. Please try again.");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  }

  /* =========================================================
   * Profile
   * ======================================================= */

  function handleProfileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    try {
      setProfileSaving(true);
      const res = await updateProfile({
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        dob: profileForm.dob || undefined,
      });
      if (res.ok) {
        setProfile(res.user);
        const overviewRes = await getAccountOverview();
        if (overviewRes.ok) setOverview(overviewRes);
      }
    } catch (err) {
      console.error("Profile save error:", err);
    } finally {
      setProfileSaving(false);
    }
  }

  /* =========================================================
   * Password
   * ======================================================= */

  function handlePasswordInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handlePasswordSave(e: FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setPasswordError("New password should be at least 6 characters long.");
      return;
    }

    try {
      setPasswordSaving(true);
      const res: any = await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      if (!res.ok) {
        setPasswordError(
          res.error === "invalid_current_password"
            ? "Current password is incorrect."
            : "Unable to update password. Please try again."
        );
      } else {
        setPasswordMessage("Password updated successfully.");
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      }
    } catch (err) {
      console.error("Password update error:", err);
      setPasswordError("Unexpected error while updating password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  /* =========================================================
   * Addresses
   * ======================================================= */

  function startNewAddress() {
    setAddressEditingId(null);
    setAddressForm({
      label: "",
      full_name: profileForm.full_name || "",
      phone: profileForm.phone || "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      is_default_billing: false,
      is_default_shipping: false,
    });
    setAddressError(null);
  }

  function startEditAddress(addr: Address) {
    setAddressEditingId(addr.id);
    setAddressForm({
      label: addr.label || "",
      full_name: addr.full_name || "",
      phone: addr.phone || "",
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state || "",
      postal_code: addr.postal_code || "",
      country: addr.country,
      is_default_billing: addr.is_default_billing,
      is_default_shipping: addr.is_default_shipping,
    });
    setAddressError(null);
  }

  function handleAddressChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type, checked } = e.target as any;
    if (type === "checkbox") {
      setAddressForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setAddressForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleAddressSave(e: FormEvent) {
    e.preventDefault();
    setAddressError(null);

    if (!addressForm.line1 || !addressForm.city || !addressForm.country) {
      setAddressError("Address line, city, and country are required.");
      return;
    }

    try {
      setAddressSaving(true);

      const payload = {
        label: addressForm.label || null,
        full_name: addressForm.full_name || null,
        phone: addressForm.phone || null,
        line1: addressForm.line1,
        line2: addressForm.line2 || null,
        city: addressForm.city,
        state: addressForm.state || null,
        postal_code: addressForm.postal_code || null,
        country: addressForm.country,
        is_default_billing: addressForm.is_default_billing,
        is_default_shipping: addressForm.is_default_shipping,
      };

      if (addressEditingId) {
        const res = await apiFetch<{ ok: boolean; address: Address }>(
          `/customer/addresses/${addressEditingId}`,
          {
            method: "PUT",
            body: payload,
          }
        );
        if (res.ok) {
          setAddresses((prev) =>
            prev.map((a) => (a.id === res.address.id ? res.address : a))
          );
        }
      } else {
        const res = await apiFetch<{ ok: boolean; address: Address }>(
          "/customer/addresses",
          {
            method: "POST",
            body: payload,
          }
        );
        if (res.ok) {
          setAddresses((prev) => [res.address, ...prev]);
        }
      }

      startNewAddress();
    } catch (err) {
      console.error("Address save error:", err);
      setAddressError("Unable to save address right now.");
    } finally {
      setAddressSaving(false);
    }
  }

  async function handleAddressDelete(id: string) {
    if (!window.confirm("Delete this address?")) return;

    try {
      await apiFetch<{ ok: boolean }>(`/customer/addresses/${id}`, {
        method: "DELETE",
      });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (addressEditingId === id) {
        startNewAddress();
      }
    } catch (err) {
      console.error("Address delete error:", err);
      setAddressError("Unable to delete address.");
    }
  }

  async function handleSetDefaultShipping(id: string) {
    try {
      await apiFetch<{ ok: boolean }>(
        `/customer/addresses/${id}/default-shipping`,
        { method: "POST" }
      );
    } catch (err) {
      console.error("Set default shipping error:", err);
    }
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        is_default_shipping: a.id === id,
      }))
    );
  }

  async function handleSetDefaultBilling(id: string) {
    try {
      await apiFetch<{ ok: boolean }>(
        `/customer/addresses/${id}/default-billing`,
        { method: "POST" }
      );
    } catch (err) {
      console.error("Set default billing error:", err);
    }
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        is_default_billing: a.id === id,
      }))
    );
  }

  /* =========================================================
   * Orders
   * ======================================================= */

  async function handleToggleOrderTimeline(orderId: string) {
    const isOpen = openOrderId === orderId;
    if (isOpen) {
      setOpenOrderId(null);
      return;
    }

    if (!timelineByOrderId[orderId]) {
      try {
        setTimelineLoadingId(orderId);
        const res = await getOrderTimeline(orderId);
        if (res.ok) {
          setTimelineByOrderId((prev) => ({
            ...prev,
            [orderId]: res.timeline || [],
          }));
        }
      } catch (err) {
        console.error("Order timeline load error:", err);
      } finally {
        setTimelineLoadingId(null);
      }
    }

    setOpenOrderId(orderId);
  }

  /* =========================================================
   * Wishlist
   * ======================================================= */

  async function handleMoveWishlistToCart(item: WishlistItem) {
    try {
      const addItem = cartCtx?.addItem || (async () => {});
      await addItem(item.product_id, 1);
      await removeFromWishlist(item.id);
      setWishlist((prev) => prev.filter((w) => w.id !== item.id));
      await refreshCart();
    } catch (err) {
      console.error("Move to cart failed:", err);
    }
  }

  async function handleRemoveWishlistItem(id: string) {
    try {
      await removeFromWishlist(id);
      setWishlist((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error("Remove wishlist item error:", err);
    }
  }

  /* =========================================================
   * Derived
   * ======================================================= */

  const displayUser = useMemo<UserProfile | null>(() => {
    return profile || overview?.user || null;
  }, [profile, overview]);

  const displayAvatar =
    avatarUrl ||
    (displayUser && displayUser.metadata && displayUser.metadata.avatar_url);

  /* =========================================================
   * Renderers
   * ======================================================= */

  function renderOverview() {
    if (loadingOverview || !overview) {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      );
    }

    const stats = overview.stats;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Total Orders"
            value={stats.orders_count}
            hint={
              stats.last_order_at
                ? `Last on ${formatDate(stats.last_order_at)}`
                : "No orders yet"
            }
          />
          <StatCard
            icon={<Heart className="h-5 w-5" />}
            label="Wishlist"
            value={stats.wishlist_count}
            hint="Saved items you love"
          />
          <StatCard
            icon={<MapPin className="h-5 w-5" />}
            label="Saved Addresses"
            value={stats.addresses_count}
            hint="Shipping & billing"
          />
          <StatCard
            icon={<PackageSearch className="h-5 w-5" />}
            label="Cart Total"
            value={stats.cart_grand_total}
            isCurrency
            hint="Current cart value"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Account Details
                  </p>
                  <p className="text-[14px] text-slate-400">
                    Your core contact & identity
                  </p>
                </div>
              </div>
              {displayUser?.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Verified
                </span>
              )}
            </div>

            <div className="grid gap-4 text-[16px] text-slate-700 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  <UserIcon className="h-4 w-4" />
                  Name
                </p>
                <p>{displayUser?.full_name || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p>{displayUser?.email || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  <Phone className="h-4 w-4" />
                  Phone
                </p>
                <p>{displayUser?.phone || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </p>
                <p>{displayUser?.dob ? formatDate(displayUser.dob) : "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  <Shield className="h-4 w-4" />
                  KYC Status
                </p>
                <p>{humanStatus(displayUser?.kyc_status)}</p>
              </div>
            </div>

            <div className="mt-5 text-[14px] text-slate-400">
              You can update these from the{" "}
              <button
                type="button"
                className="font-medium text-rose-500 underline-offset-2 hover:underline"
                onClick={() => setActiveTab("profile")}
              >
                Profile &amp; Security
              </button>{" "}
              tab.
            </div>
          </div>

          {/* Experience / info */}
          <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-slate-50 shadow-sm shadow-slate-900/40">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                    Experience
                  </p>
                  <p className="text-[14px] text-slate-400">
                    Curated just for you
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[16px] text-slate-200 leading-relaxed">
              We’re continuously fine-tuning your recommendations based on your
              wishlist, cart and order history. Soon you’ll see{" "}
              <span className="font-semibold">personalized picks</span> and{" "}
              <span className="font-semibold">early access previews</span> here.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-[13px] text-slate-300">
              <span className="rounded-full bg-white/5 px-3 py-1">
                • Secure checkout
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1">
                • Certified jewellery
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1">
                • Dedicated support
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderProfileAndSecurity() {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
        {/* Profile form */}
        <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Profile
              </p>
              <p className="text-[14px] text-slate-400">
                Update your primary contact details
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 text-[16px]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[14px] font-medium text-slate-500">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={profileForm.full_name}
                  onChange={handleProfileInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-[14px] font-medium text-slate-500">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-[14px] font-medium text-slate-500">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={profileForm.dob}
                  onChange={handleProfileInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-[14px] font-medium text-slate-500">
                  Email (login)
                </label>
                <input
                  type="email"
                  value={displayUser?.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[16px] text-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-[14px] text-slate-400">
                These details are used for order updates and verification.
              </p>
              <Button
                type="submit"
                variant="primary"
                className="min-w-[140px] text-[14px]"
                disabled={profileSaving}
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Avatar + Password */}
        <div className="space-y-5">
          {/* Avatar */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Profile Image
                </p>
                <p className="text-[14px] text-slate-400">
                  Personalize your account avatar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-18 w-18 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt={displayUser?.full_name || "Avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[16px] font-medium text-slate-500">
                      {displayUser?.full_name
                        ? displayUser.full_name.charAt(0).toUpperCase()
                        : "MG"}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[14px] font-medium text-slate-700 shadow-sm hover:border-rose-500 hover:text-rose-500">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  {avatarUploading ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Edit3 className="mr-1.5 h-4 w-4" />
                      Change Avatar
                    </>
                  )}
                </label>
                <p className="text-[13px] text-slate-400">
                  PNG, JPG, WEBP up to 10MB.
                </p>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 text-slate-50">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Security
                  </p>
                  <p className="text-[14px] text-slate-400">
                    Change your account password
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSave} className="space-y-3 text-[16px]">
              <div>
                <label className="mb-1 block text-[14px] font-medium text-slate-500">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordForm.current_password}
                  onChange={handlePasswordInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[14px] font-medium text-slate-500">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[14px] font-medium text-slate-500">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                  <p>{passwordError}</p>
                </div>
              )}
              {passwordMessage && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  <p>{passwordMessage}</p>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-[13px] text-slate-400">
                  Use a strong password you haven’t used elsewhere.
                </p>
                <Button
                  type="submit"
                  variant="outline"
                  className="min-w-[150px] text-[14px]"
                  disabled={passwordSaving}
                >
                  {passwordSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  function renderAddresses() {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.3fr)]">
        {/* Address list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Saved Addresses
              </p>
              <p className="text-[14px] text-slate-400">
                Shipping and billing locations
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-2 text-[14px] text-slate-600 hover:bg-slate-50"
              onClick={startNewAddress}
            >
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>

          {loadingAddresses ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-26 rounded-2xl" />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-[14px] text-slate-500">
              You don’t have any saved addresses yet. Add one using the form on
              the right.
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="rounded-2xl border border-slate-100 bg-white p-5 text-[16px] text-slate-700 shadow-sm shadow-slate-900/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {addr.label || "Address"}
                        </p>
                        {addr.is_default_shipping && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[13px] font-medium text-emerald-700">
                            Default Shipping
                          </span>
                        )}
                        {addr.is_default_billing && (
                          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[13px] font-medium text-sky-700">
                            Default Billing
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[14px] text-slate-500">
                        {addr.full_name || "—"} &bull; {addr.phone || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-rose-500 hover:text-rose-500"
                        onClick={() => startEditAddress(addr)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-rose-500 hover:text-rose-500"
                        onClick={() => handleAddressDelete(addr.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                    {addr.state ? `, ${addr.state}` : ""},{" "}
                    {addr.postal_code || ""} {addr.country}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
                    {!addr.is_default_shipping && (
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 hover:border-rose-500 hover:text-rose-500"
                        onClick={() => handleSetDefaultShipping(addr.id)}
                      >
                        Set as Default Shipping
                      </button>
                    )}
                    {!addr.is_default_billing && (
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 hover:border-rose-500 hover:text-rose-500"
                        onClick={() => handleSetDefaultBilling(addr.id)}
                      >
                        Set as Default Billing
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Address form */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {addressEditingId ? "Edit Address" : "Add New Address"}
              </p>
              <p className="text-[14px] text-slate-400">
                These details are used for shipping & billing
              </p>
            </div>
          </div>

          {addressError && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <p>{addressError}</p>
            </div>
          )}

          <form onSubmit={handleAddressSave} className="space-y-3 text-[16px]">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[14px] font-medium text-slate-500">
                  Label
                </label>
                <input
                  type="text"
                  name="label"
                  value={addressForm.label}
                  onChange={handleAddressChange}
                  placeholder="Home, Office..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-[14px] font-medium text-slate-500">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={addressForm.full_name}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[14px] font-medium text-slate-500">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={addressForm.phone}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-[14px] font-medium text-slate-500">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={addressForm.country}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[14px] font-medium text-slate-500">
                Address Line 1
              </label>
              <input
                type="text"
                name="line1"
                value={addressForm.line1}
                onChange={handleAddressChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-[14px] font-medium text-slate-500">
                Address Line 2
              </label>
              <input
                type="text"
                name="line2"
                value={addressForm.line2}
                onChange={handleAddressChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[14px] font-medium text-slate-500">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-[14px] font-medium text-slate-500">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={addressForm.state}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-[14px] font-medium text-slate-500">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={addressForm.postal_code}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[16px] text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-1 text-[14px] text-slate-600">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_default_shipping"
                  checked={addressForm.is_default_shipping}
                  onChange={handleAddressChange}
                  className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                />
                Default shipping address
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_default_billing"
                  checked={addressForm.is_default_billing}
                  onChange={handleAddressChange}
                  className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                />
                Default billing address
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                className="min-w-[150px] text-[14px]"
                disabled={addressSaving}
              >
                {addressSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : addressEditingId ? (
                  "Update Address"
                ) : (
                  "Add Address"
                )}
              </Button>
              <p className="text-[13px] text-slate-400">
                You can manage defaults from the card actions.
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderOrders() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Order History
            </p>
            <p className="text-[14px] text-slate-400">
              Track your past orders and their current status
            </p>
          </div>
        </div>

        {loadingOrders ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-[14px] text-slate-500">
            You haven’t placed any orders yet. Once you do, they’ll appear here
            with detailed tracking.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 text-[16px] text-slate-700 shadow-sm shadow-slate-900/5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[13px] font-semibold tracking-[0.12em] text-slate-500">
                      ORDER #
                      {(order.order_number || order.id || "")
                        .toString()
                        .slice(0, 8)}
                    </p>
                    <p className="text-[14px] text-slate-400">
                      Placed on {formatDate(order.placed_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                      <p className="text-[14px] text-slate-500">Total</p>
                      <p className="text-[16px] font-semibold text-slate-900">
                        {order.currency || "INR"}{" "}
                        {Number(order.grand_total || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-[14px]">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[13px] font-medium text-slate-700">
                        {humanStatus(order.status || order.order_status)}
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[13px] font-medium text-rose-600 hover:text-rose-700"
                        onClick={() => handleToggleOrderTimeline(order.id)}
                      >
                        <Truck className="h-4 w-4" />
                        {openOrderId === order.id
                          ? "Hide tracking"
                          : "Track order"}
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {openOrderId === order.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 border-t border-dashed border-slate-200 pt-3"
                    >
                      {timelineLoadingId === order.id ? (
                        <div className="flex items-center gap-2 text-[13px] text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading timeline...
                        </div>
                      ) : (
                        <OrderTimeline
                          entries={timelineByOrderId[order.id] || []}
                          orderStatus={order.status || order.order_status}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderWishlist() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Wishlist
            </p>
            <p className="text-[14px] text-slate-400">
              Saved designs you’re considering
            </p>
          </div>
        </div>

        {loadingWishlist ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-[14px] text-slate-500">
            You haven’t added anything to your wishlist yet. Tap the{" "}
            <span className="font-semibold">♥</span> icon on any product to
            save it here.
          </div>
        ) : (
          <div className="space-y-3">
            {wishlist.map((item) => {
              const p = item.product || {};
              const title = item.product_title || p.title || "Untitled design";
              const slug = item.product_slug || p.slug;
              const image =
                item.product_primary_image || p.primary_image || p.image;
              const price = item.product_price ?? p.price ?? 0;
              const currency = item.product_currency || p.currency || "INR";

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-[16px] text-slate-700 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <div className="h-18 w-18 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[13px] text-slate-400">
                          Image
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[16px] font-medium text-slate-900">
                        {title}
                      </p>
                      {slug && (
                        <button
                          type="button"
                          onClick={() => navigate(`/products/${slug}`)}
                          className="inline-flex items-center gap-1 text-[13px] font-medium text-rose-600 hover:text-rose-700"
                        >
                          View details
                        </button>
                      )}
                      <p className="text-[14px] text-slate-500">
                        {currency} {Number(price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 sm:flex-col sm:items-end">
                    <Button
                      type="button"
                      variant="primary"
                      className="text-[14px]"
                      onClick={() => handleMoveWishlistToCart(item)}
                    >
                      Move to Cart
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleRemoveWishlistItem(item.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[13px] text-slate-600 hover:border-rose-500 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* =========================================================
   * Main render
   * ======================================================= */

  if (!isLoggedIn && !authLoading) {
    return null;
  }

  return (
    <AnimatedSection className="bg-slate-50/70 py-12 sm:py-20 text-[16px]">
      <Container>
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-18 w-18 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={displayUser?.full_name || "Avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[18px] font-medium text-slate-600">
                    {displayUser?.full_name
                      ? displayUser.full_name.charAt(0).toUpperCase()
                      : "MG"}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-['Playfair_Display'] text-4xl font-semibold tracking-tight text-slate-900">
                  My Account
                </h1>
                <Badge className="bg-rose-50 text-rose-600 text-[13px]">
                  MINAL GEMS CLIENT
                </Badge>
              </div>
              <p className="text-[15px] text-slate-500">
                Manage your profile, addresses, orders and wishlist — all in one
                place.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[14px] md:justify-end">
            <div className="flex items-center gap-1 text-slate-500">
              <Globe2 className="h-4 w-4" />
              Secure account area
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Shield className="h-4 w-4" />
              Encrypted &amp; private
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto pb-1">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm shadow-slate-900/5">
            {tabDefs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium transition ${
                  activeTab === t.id
                    ? "bg-slate-900 text-slate-50 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-[14px] text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {activeTab === "overview" && renderOverview()}
            {activeTab === "profile" && renderProfileAndSecurity()}
            {activeTab === "addresses" && renderAddresses()}
            {activeTab === "orders" && renderOrders()}
            {activeTab === "wishlist" && renderWishlist()}
          </motion.div>
        </AnimatePresence>
      </Container>
    </AnimatedSection>
  );
}

/* =========================================================
 * Small components
 * ======================================================= */

function StatCard({
  icon,
  label,
  value,
  hint,
  isCurrency,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
  isCurrency?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-900/5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        {icon}
      </div>
      <div className="flex flex-col">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
        <p className="text-2xl font-semibold text-slate-900">
          {isCurrency ? `₹ ${Number(value || 0).toFixed(2)}` : value || 0}
        </p>
        {hint && <p className="text-[13px] text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

function OrderTimeline({
  entries,
  orderStatus,
}: {
  entries: OrderTimelineEntry[];
  orderStatus: string;
}) {
  if (!entries.length) {
    return (
      <div className="text-[14px] text-slate-500">
        We’ll show a detailed timeline here once this order starts moving
        through our system.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((e, idx) => (
        <div key={e.id} className="flex items-start gap-3 text-[13px]">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                idx === entries.length - 1
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 bg-white text-slate-600"
              }`}
            >
              {idx + 1}
            </div>
            {idx < entries.length - 1 && (
              <div className="mt-0.5 h-6 w-px bg-slate-200" />
            )}
          </div>
          <div className="flex-1 space-y-0.5">
            <p className="font-medium text-slate-800">
              {humanStatus(e.to_status)}
            </p>
            <p className="text-[13px] text-slate-500">
              {formatDate(e.changed_at)}
            </p>
            {e.note && (
              <p className="text-[13px] text-slate-500">{e.note}</p>
            )}
          </div>
        </div>
      ))}

      <div className="mt-1 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-500">
        <Truck className="h-4 w-4 text-slate-400" />
        <span>
          Current status:{" "}
          <span className="font-medium">{humanStatus(orderStatus)}</span>
        </span>
      </div>
    </div>
  );
}
