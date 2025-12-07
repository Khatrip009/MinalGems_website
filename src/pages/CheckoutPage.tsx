// src/pages/CheckoutPage.tsx
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  MouseEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CartContext } from "../context/CartContext";
import { apiFetch } from "../api/client";
import { applyPromoCode } from "../api/checkout.api";

import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";

import {
  MapPin,
  Shield,
  CreditCard,
  CheckCircle2,
  ShoppingBag,
  IndianRupee,
  Loader2,
  Sparkles,
  Percent,
  Truck,
} from "lucide-react";

type StepId = 1 | 2 | 3 | 4;

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
}

interface CheckoutItem {
  id: string;
  product_id: string;
  quantity: number;
  title?: string;
  slug?: string;
  price: number;
  currency?: string;
}

interface CheckoutAmounts {
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  grand_total: number;
}

interface Promo {
  id: string;
  code: string;
  type: "percent" | "fixed" | "free_shipping" | string;
  value: number;
  description?: string | null;
  min_order_value?: number | null;
}

type EffectiveAmounts = CheckoutAmounts & {
  promo_discount: number;
  promo_code: string | null;
  promo_type: string | null;
};

interface CheckoutSummaryResponse {
  ok: boolean;
  cart_id: string;
  items: CheckoutItem[];
  amounts: CheckoutAmounts;
  applied_coupon?: any;
  available_promos?: Promo[];
}

interface ApplyPromoResponse {
  ok: boolean;
  promo?: Promo;
  discount?: number;
  type?: string;
  error?: string;
}

const stepLabels: { id: StepId; label: string }[] = [
  { id: 1, label: "Address" },
  { id: 2, label: "Review" },
  { id: 3, label: "Payment" },
  { id: 4, label: "Done" },
];

// ---------- helpers for promo engine ----------
function computePromoDiscount(
  promo: Promo,
  subtotal: number,
  shipping: number
): { discount: number; freeShipping: boolean } {
  let discount = 0;
  let freeShipping = false;

  if (promo.type === "percent") {
    discount = (subtotal * Number(promo.value || 0)) / 100;
  } else if (promo.type === "fixed") {
    discount = Number(promo.value || 0);
  } else if (promo.type === "free_shipping") {
    freeShipping = true;
    discount = Math.max(0, Number(shipping || 0)); // treat shipping waived as discount for ranking
  }

  if (discount > subtotal) discount = subtotal;
  return { discount, freeShipping };
}

function pickBestPromo(
  promos: Promo[],
  subtotal: number,
  shipping: number
): Promo | null {
  if (!promos || promos.length === 0 || subtotal <= 0) return null;

  const eligible = promos.filter((p) => {
    if (p.min_order_value != null) {
      return subtotal >= Number(p.min_order_value);
    }
    return true;
  });
  if (eligible.length === 0) return null;

  const typePriority: Record<string, number> = {
    percent: 3,
    fixed: 2,
    free_shipping: 1,
  };

  let best: { promo: Promo; discount: number; freeShipping: boolean } | null =
    null;

  for (const p of eligible) {
    const { discount, freeShipping } = computePromoDiscount(
      p,
      subtotal,
      shipping
    );
    const priority = typePriority[p.type] ?? 0;
    if (!best) {
      best = { promo: p, discount, freeShipping };
      continue;
    }
    const bestPriority = typePriority[best.promo.type] ?? 0;
    if (priority > bestPriority) {
      best = { promo: p, discount, freeShipping };
    } else if (priority === bestPriority && discount > best.discount) {
      best = { promo: p, discount, freeShipping };
    }
  }

  return best ? best.promo : null;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cartCtx = useContext(CartContext);
  const cart = cartCtx?.cart as any;
  const refreshCart = cartCtx?.refreshCart || (async () => {});

  const [step, setStep] = useState<StepId>(1);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const [summary, setSummary] = useState<CheckoutSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paying, setPaying] = useState(false);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "test" | "cod" | "card"
  >("test");
  const [note, setNote] = useState("");

  const [error, setError] = useState<string | null>(null);

  // promo states
  const [availablePromos, setAvailablePromos] = useState<Promo[]>([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState<string | null>(
    null
  );
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoAuto, setPromoAuto] = useState(false);
  const [promoLockedByUser, setPromoLockedByUser] = useState(false);
  const [promoApplying, setPromoApplying] = useState(false);

  const activeAddress: Address | null = useMemo(() => {
    if (!selectedAddressId) return null;
    return addresses.find((a) => a.id === selectedAddressId) || null;
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        setInitialLoading(true);
        setError(null);
        await refreshCart();

        const addrRes = await apiFetch<{ ok: boolean; addresses: Address[] }>(
          "/customer/addresses",
          { method: "GET" }
        );
        if (!cancelled && addrRes.ok) {
          const list = addrRes.addresses || [];
          setAddresses(list);
          setAddressesLoaded(true);
          const def =
            list.find((a) => a.is_default_shipping) || list[0] || null;
          if (def) setSelectedAddressId(def.id);
        } else if (!cancelled) {
          setAddressesLoaded(true);
        }
      } catch (e) {
        console.error("[Checkout] init error:", e);
        if (!cancelled) {
          setError("Unable to load your checkout details. Please try again.");
          setAddressesLoaded(true);
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cart?.id || !addressesLoaded) return;
    const addr =
      activeAddress ||
      addresses.find((a) => a.is_default_shipping) ||
      addresses[0] ||
      null;
    if (!addr) return;
    if (!selectedAddressId) setSelectedAddressId(addr.id);
    loadSummary(cart.id, addr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.id, addressesLoaded]);

  async function loadSummary(cartId: string, addr: Address | null) {
    try {
      setSummaryLoading(true);
      setError(null);
      const body: any = { cart_id: cartId };
      if (addr) {
        body.shipping_address = {
          full_name: addr.full_name,
          phone: addr.phone,
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          postal_code: addr.postal_code,
          country: addr.country,
        };
      }
      const res = await apiFetch<CheckoutSummaryResponse>("/checkout/summary", {
        method: "POST",
        body,
      });
      if (!res.ok) {
        throw new Error((res as any).error || "summary_error");
      }
      setSummary(res);

      const promos = res.available_promos || [];
      setAvailablePromos(promos);

      if (!promoLockedByUser && promos.length > 0) {
        const base = res.amounts;
        const best = pickBestPromo(promos, base.subtotal, base.shipping_total);
        if (best) {
          setSelectedPromoCode(best.code);
          setPromoAuto(true);
          setPromoError(null);
        } else {
          setSelectedPromoCode(null);
          setPromoAuto(false);
        }
      }
    } catch (e) {
      console.error("[Checkout] summary error:", e);
      setError("Unable to load order summary. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  }

  function handleAddressSelect(id: string) {
    setSelectedAddressId(id);
    if (cart?.id) {
      const addr = addresses.find((a) => a.id === id) || null;
      loadSummary(cart.id, addr);
    }
  }

  async function handleNextFromAddress() {
    if (!activeAddress) {
      alert("Please select a shipping address to continue.");
      return;
    }
    if (!summary && cart?.id) {
      await loadSummary(cart.id, activeAddress);
    }
    setStep(2);
  }

  async function handlePlaceOrder() {
    if (!cart?.id) {
      alert("Your cart is empty or missing. Please reload the page.");
      return;
    }
    if (!activeAddress) {
      alert("Please select a shipping address.");
      return;
    }
    try {
      setPlacingOrder(true);
      setError(null);
      const fullAddr = {
        full_name: activeAddress.full_name,
        phone: activeAddress.phone,
        line1: activeAddress.line1,
        line2: activeAddress.line2,
        city: activeAddress.city,
        state: activeAddress.state,
        postal_code: activeAddress.postal_code,
        country: activeAddress.country,
      };
      const res = await apiFetch<{
        ok: boolean;
        order: { id: string };
      }>("/checkout/place-order", {
        method: "POST",
        body: {
          cart_id: cart.id,
          shipping_address: fullAddr,
          billing_address: fullAddr,
          notes: note || null,
          promo_code: selectedPromoCode || null,
        },
      });
      if (!res.ok || !res.order?.id) {
        throw new Error((res as any).error || "order_failed");
      }
      setOrderId(res.order.id);
      setStep(3);
    } catch (e) {
      console.error("[Checkout] place order error:", e);
      setError("We couldn’t place your order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }

  const appliedPromo: Promo | null = useMemo(() => {
    if (!selectedPromoCode) return null;
    return (
      availablePromos.find(
        (p) => p.code.toUpperCase() === selectedPromoCode.toUpperCase()
      ) || null
    );
  }, [availablePromos, selectedPromoCode]);

  const effectiveAmounts: EffectiveAmounts | null = useMemo(() => {
    if (!summary) return null;
    const base = summary.amounts;
    const subtotal = base.subtotal;
    const baseDiscount = base.discount_total || 0;
    const baseShipping = base.shipping_total || 0;
    const tax = base.tax_total || 0;

    let promoDiscount = 0;
    let shipping = baseShipping;

    if (appliedPromo) {
      const { discount, freeShipping } = computePromoDiscount(
        appliedPromo,
        subtotal,
        baseShipping
      );
      promoDiscount = discount;
      if (freeShipping) shipping = 0;
    }

    const totalDiscount = Number((baseDiscount + promoDiscount).toFixed(2));
    const grand = Number(
      (subtotal - totalDiscount + shipping + tax).toFixed(2)
    );

    return {
      ...base,
      discount_total: totalDiscount,
      shipping_total: shipping,
      grand_total: grand,
      promo_discount: Number(promoDiscount.toFixed(2)),
      promo_code: appliedPromo?.code || null,
      promo_type: appliedPromo?.type || null,
    };
  }, [summary, appliedPromo]);

  const bestSuggestedPromo: Promo | null = useMemo(() => {
    if (!summary || !availablePromos.length) return null;
    const base = summary.amounts;
    return pickBestPromo(availablePromos, base.subtotal, base.shipping_total);
  }, [summary, availablePromos]);

  async function handlePay() {
    if (!orderId || !summary) {
      alert("Order is not ready for payment. Please retry.");
      return;
    }
    try {
      setPaying(true);
      setError(null);
      const amountToPay =
        effectiveAmounts?.grand_total ?? summary.amounts.grand_total;

      const res = await apiFetch<{ ok: boolean }>("/checkout/pay", {
        method: "POST",
        body: {
          order_id: orderId,
          payment_method: "test_manual",
          amount: amountToPay,
        },
      });
      if (!res.ok) {
        throw new Error((res as any).error || "payment_failed");
      }
      await refreshCart();
      setStep(4);
      setTimeout(() => {
        navigate(`/order-success/${orderId}`);
      }, 800);
    } catch (e) {
      console.error("[Checkout] payment error:", e);
      setError("Payment simulation failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  function mapPromoErrorCode(code: string | undefined): string {
    switch (code) {
      case "invalid_or_expired":
        return "This promo code is invalid or has expired.";
      case "order_value_too_low":
        return "Your order value is too low for this promo.";
      case "max_global_uses_reached":
        return "This promo has reached its maximum usage limit.";
      case "max_user_uses_reached":
        return "You have already used this promo the maximum number of times.";
      default:
        return "This promo is not valid for your current order.";
    }
  }

  async function handleApplyPromo(
    forcedCode?: string | MouseEvent<HTMLButtonElement>
  ) {
    const raw =
      typeof forcedCode === "string" ? forcedCode : promoCodeInput || "";
    const code = raw.trim().toUpperCase();

    if (!code) {
      setPromoError("Please enter a promo code.");
      return;
    }
    if (!summary) {
      setPromoError("Order summary is not ready yet. Please wait a moment.");
      return;
    }

    try {
      setPromoApplying(true);
      setPromoError(null);

      const res = (await applyPromoCode(
        code,
        summary.amounts.subtotal
      )) as ApplyPromoResponse;

      if (!res.ok || !res.promo) {
        const msg = mapPromoErrorCode(res.error);
        setSelectedPromoCode(null);
        setPromoLockedByUser(true);
        setPromoAuto(false);
        setPromoError(msg);
        return;
      }

      const promo = res.promo as Promo;

      setAvailablePromos((prev) => {
        const exists = prev.find(
          (p) => p.code.toUpperCase() === promo.code.toUpperCase()
        );
        if (exists) return prev;
        return [...prev, promo];
      });

      setSelectedPromoCode(promo.code);
      setPromoLockedByUser(true);
      setPromoAuto(false);
      setPromoError(null);
    } catch (err) {
      console.error("[Checkout] apply promo error:", err);
      setSelectedPromoCode(null);
      setPromoLockedByUser(true);
      setPromoAuto(false);
      setPromoError("Unable to apply this promo at the moment.");
    } finally {
      setPromoApplying(false);
    }
  }

  function handleClearPromo() {
    setSelectedPromoCode(null);
    setPromoLockedByUser(true);
    setPromoAuto(false);
    setPromoError(null);
    setPromoCodeInput("");
  }

  const items = summary?.items || [];
  const amounts = effectiveAmounts;

  if (initialLoading) {
    return (
      <AnimatedSection className="bg-[radial-gradient(circle_at_top,_#ffffff,_#fdf2ff,_#eef2ff)] py-16 text-base">
        <Container>
          <div className="space-y-8">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        </Container>
      </AnimatedSection>
    );
  }

  if (!cart || !cart.id || (items.length === 0 && !summaryLoading)) {
    return (
      <AnimatedSection className="bg-[radial-gradient(circle_at_top,_#ffffff,_#fdf2ff,_#eef2ff)] py-16 text-base">
        <Container>
          <div className="mx-auto max-w-xl rounded-2xl bg-white/80 p-10 text-center shadow-sm shadow-slate-200">
            <h1 className="font-['Playfair_Display'] text-3xl font-semibold text-slate-900">
              Your cart looks a little light
            </h1>
            <p className="mt-4 text-xl text-slate-500">
              Add some exquisite pieces to your cart before checking out.
            </p>
            <div className="mt-8 flex justify-center">
              <Button onClick={() => navigate("/products")} className="text-xl">
                <ShoppingBag className="mr-2 h-6 w-6" />
                Browse Jewellery
              </Button>
            </div>
          </div>
        </Container>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection className="bg-[radial-gradient(circle_at_top,_#ffffff,_#fdf2ff,_#eef2ff)] py-14 sm:py-20 text-base">
      <Container>
        <div className="mb-8 flex flex-col gap-4">
          <Badge className="text-lg px-4 py-2">MINAL GEMS SECURE CHECKOUT</Badge>
          <h1 className="font-['Playfair_Display'] text-5xl font-semibold tracking-tight text-slate-900">
            Complete your Minal Gems order
          </h1>
          <p className="max-w-2xl text-xl text-slate-500">
            A curated, secure and elegant checkout crafted for fine jewellery
            purchases.
          </p>
          <div className="mt-4 h-1.5 w-32 rounded-full bg-gradient-to-r from-[#FF1493] via-[#FF3CA0] to-[#FFD700]" />
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {stepLabels.map((s) => {
              const isDone = s.id < step;
              const isActive = s.id === step;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 rounded-full border px-5 py-2 text-lg transition ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : isDone
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-white/20 text-base">
                    {s.id}
                  </span>
                  <span className="font-medium">{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 text-base text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>100% secure & encrypted</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-base text-rose-700">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]"
          >
            <div>
              {step === 1 && (
                <AddressStep
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  onSelect={handleAddressSelect}
                />
              )}
              {step === 2 && (
                <ReviewStep
                  items={items}
                  amounts={amounts}
                  note={note}
                  onNoteChange={setNote}
                />
              )}
              {step === 3 && (
                <PaymentStep
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  amounts={amounts}
                />
              )}
              {step === 4 && (
                <DoneStep
                  orderId={orderId}
                  onViewOrder={() =>
                    orderId && navigate(`/order-success/${orderId}`)
                  }
                />
              )}
            </div>

            <div className="space-y-6">
              <OrderSummaryCard
                amounts={amounts}
                loading={summaryLoading}
                itemsCount={items.length}
                promoCodeInput={promoCodeInput}
                setPromoCodeInput={setPromoCodeInput}
                promoError={promoError}
                autoApplied={promoAuto}
                appliedPromo={appliedPromo}
                promoApplying={promoApplying}
                suggestedPromo={bestSuggestedPromo}
                onApplyPromo={() => handleApplyPromo()}
                onClearPromo={handleClearPromo}
                onApplySuggestedPromo={(code) => handleApplyPromo(code)}
              />

              {step === 1 && (
                <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 text-base text-slate-500 shadow-sm">
                  <p className="font-semibold text-slate-700 text-xl">
                    Why clients trust Minal Gems
                  </p>
                  <ul className="mt-3 space-y-2">
                    <li>• Certified stones and hallmarked gold</li>
                    <li>• Transparent pricing with no hidden charges</li>
                    <li>• Dedicated concierge support for every order</li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-3 text-base text-slate-500">
            <Truck className="h-5 w-5" />
            <span>
              All Minal Gems jewellery is shipped in tamper-proof packaging with
              full insurance coverage.
            </span>
          </div>
          <div className="flex gap-4">
            {step > 1 && step < 4 && (
              <Button
                type="button"
                variant="outline"
                className="text-xl px-6 py-3"
                onClick={() =>
                  setStep((prev) => (prev > 1 ? ((prev - 1) as StepId) : prev))
                }
              >
                Back
              </Button>
            )}
            {step === 1 && (
              <Button
                type="button"
                className="text-xl px-6 py-3"
                onClick={handleNextFromAddress}
              >
                Continue to Review
              </Button>
            )}
            {step === 2 && (
              <Button
                type="button"
                className="text-xl px-6 py-3"
                disabled={placingOrder}
                onClick={handlePlaceOrder}
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Placing order...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
            )}
            {step === 3 && (
              <Button
                type="button"
                className="text-xl px-6 py-3"
                disabled={paying}
                onClick={handlePay}
              >
                {paying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing payment...
                  </>
                ) : (
                  "Complete Payment (Test)"
                )}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </AnimatedSection>
  );
}

function AddressStep({
  addresses,
  selectedAddressId,
  onSelect,
}: {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm shadow-slate-200">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Shipping Address
            </p>
            <p className="text-xl text-slate-400">
              Choose where we should deliver your jewellery
            </p>
          </div>
        </div>
      </div>
      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 text-xl text-slate-500">
          You don’t have any saved addresses yet. Please add one in your
          account profile before checking out.
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              type="button"
              onClick={() => onSelect(addr.id)}
              className={`flex w-full items-start justify-between gap-4 rounded-2xl border p-5 text-left text-xl transition ${
                selectedAddressId === addr.id
                  ? "border-rose-500 bg-rose-50/70 shadow-sm"
                  : "border-slate-200 bg-white hover:border-rose-400/80"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                    selectedAddressId === addr.id
                      ? "border-rose-500 bg-rose-500"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selectedAddressId === addr.id && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-slate-900 text-xl">
                      {addr.label || "Home"}
                    </p>
                    {addr.is_default_shipping && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-base font-medium text-emerald-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xl text-slate-500">
                    {addr.full_name || "—"} • {addr.phone || "—"}
                  </p>
                  <p className="mt-2 text-xl text-slate-600">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                    {addr.state ? `, ${addr.state}` : ""} {addr.postal_code || ""}{" "}
                    {addr.country}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      <p className="mt-4 text-base text-slate-400">
        Address is used only for this order and shipping updates.
      </p>
    </div>
  );
}

function ReviewStep({
  items,
  amounts,
  note,
  onNoteChange,
}: {
  items: CheckoutItem[];
  amounts: EffectiveAmounts | null;
  note: string;
  onNoteChange: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-sm shadow-slate-200">
      <h2 className="mb-5 text-2xl font-semibold uppercase tracking-[0.18em] text-slate-500">
        Review your order
      </h2>
      {items.length === 0 ? (
        <div className="rounded-xl bg-slate-50 px-5 py-8 text-xl text-slate-500">
          Your order summary will appear here once we load your cart items.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/70">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between gap-4 px-5 py-4 text-xl"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {it.title || "Jewellery piece"}
                  </p>
                  <p className="text-xl text-slate-500">Qty: {it.quantity}</p>
                </div>
                <div className="text-right text-xl font-semibold text-slate-900">
                  <span className="inline-flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {((it.price || 0) * it.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-slate-100 bg-white px-5 py-4 text-xl text-slate-600">
            <label className="block text-xl font-semibold text-slate-500">
              Add a note for our jewellery concierge
            </label>
            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xl text-slate-800 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
              placeholder="Ring size, engraving text, delivery instructions..."
            />
          </div>

          {amounts && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-5 py-4 text-xl text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  <IndianRupee className="mr-1 inline h-4 w-4" />
                  {amounts.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Discount (incl. promos)</span>
                <span className="text-emerald-700">
                  -{" "}
                  <IndianRupee className="mr-1 inline h-4 w-4" />
                  {amounts.discount_total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  <IndianRupee className="mr-1 inline h-4 w-4" />
                  {amounts.shipping_total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>
                  <IndianRupee className="mr-1 inline h-4 w-4" />
                  {amounts.tax_total.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PaymentStep({
  paymentMethod,
  setPaymentMethod,
  amounts,
}: {
  paymentMethod: "test" | "cod" | "card";
  setPaymentMethod: (v: "test" | "cod" | "card") => void;
  amounts: EffectiveAmounts | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-sm shadow-slate-200">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold uppercase tracking-[0.18em] text-slate-500">
            Payment
          </p>
          <p className="text-xl text-slate-400">
            For now we’ll simulate a successful payment
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xl text-slate-700">
        <div className="space-y-3">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="radio"
              name="payment"
              className="h-4 w-4 text-rose-500"
              checked={paymentMethod === "test"}
              onChange={() => setPaymentMethod("test")}
            />
            <span className="flex flex-col">
              <span className="font-semibold">Test payment (recommended)</span>
              <span className="text-base text-slate-500">
                Instantly marks the order as paid for testing purposes.
              </span>
            </span>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 opacity-60">
            <input
              type="radio"
              name="payment"
              className="h-4 w-4 text-rose-500"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
              disabled
            />
            <span className="flex flex-col">
              <span className="font-semibold">Cards / UPI (coming soon)</span>
              <span className="text-base text-slate-500">
                We’ll integrate a live gateway here later.
              </span>
            </span>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 opacity-60">
            <input
              type="radio"
              name="payment"
              className="h-4 w-4 text-rose-500"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
              disabled
            />
            <span className="flex flex-col">
              <span className="font-semibold">
                Cash on delivery (coming soon)
              </span>
              <span className="text-base text-slate-500">
                Optionally enable COD later for selected orders.
              </span>
            </span>
          </label>
        </div>

        {amounts && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 px-5 py-4 text-xl text-slate-600">
            <div className="flex justify-between text-slate-700">
              <span>Amount to pay</span>
              <span className="font-semibold text-slate-900">
                <IndianRupee className="mr-1 inline h-4 w-4" />
                {amounts.grand_total.toFixed(2)}
              </span>
            </div>
            <p className="mt-3 text-base text-slate-500">
              This is a simulated payment. No real money will be charged, but
              the order will move to the <strong>Paid</strong> state.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DoneStep({
  orderId,
  onViewOrder,
}: {
  orderId: string | null;
  onViewOrder: () => void;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-8 text-center shadow-sm shadow-emerald-100">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-emerald-900">
        Your order is confirmed
      </h2>
      <p className="mt-3 text-xl text-emerald-800/90">
        We’ve received your order and sent a confirmation email. Our team will
        carefully prepare and dispatch your jewellery.
      </p>
      {orderId && (
        <p className="mt-3 text-xl text-emerald-900/80">
          Your order reference:{" "}
          <span className="font-semibold">{orderId}</span>
        </p>
      )}
      <div className="mt-6 flex justify-center gap-4">
        <Button variant="outline" className="text-xl px-6 py-3" onClick={onViewOrder}>
          View order details
        </Button>
        <Button
          className="text-xl px-6 py-3"
          onClick={() => {
            window.location.href = "/products";
          }}
        >
          Continue shopping
        </Button>
      </div>
    </div>
  );
}

function OrderSummaryCard({
  amounts,
  loading,
  itemsCount,
  promoCodeInput,
  setPromoCodeInput,
  promoError,
  autoApplied,
  appliedPromo,
  promoApplying,
  suggestedPromo,
  onApplyPromo,
  onClearPromo,
  onApplySuggestedPromo,
}: {
  amounts: EffectiveAmounts | null;
  loading: boolean;
  itemsCount: number;
  promoCodeInput: string;
  setPromoCodeInput: (v: string) => void;
  promoError: string | null;
  autoApplied: boolean;
  appliedPromo: Promo | null;
  promoApplying: boolean;
  suggestedPromo: Promo | null;
  onApplyPromo: () => void;
  onClearPromo: () => void;
  onApplySuggestedPromo: (code: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/90 p-6 text-xl text-slate-700 shadow-sm shadow-slate-200">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold uppercase tracking-[0.18em] text-slate-500">
            Order Summary
          </p>
          <p className="text-xl text-slate-400">
            {itemsCount} {itemsCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Promo UI */}
      <div className="mb-5 rounded-xl border border-dashed border-rose-200 bg-rose-50/60 px-4 py-4 text-xl text-slate-700">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
            <Percent className="h-4 w-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-2xl font-semibold uppercase tracking-[0.16em] text-slate-600">
              Promo & Offers
            </span>
            <span className="text-base text-slate-500">
              Priority:{" "}
              <span className="font-medium text-rose-600">
                Percent &gt; Fixed &gt; Free Shipping
              </span>
            </span>
          </div>
        </div>

        {suggestedPromo && !appliedPromo && !promoError && amounts && (
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-base font-semibold text-emerald-700 hover:bg-emerald-100"
            onClick={() => onApplySuggestedPromo(suggestedPromo.code)}
          >
            <Sparkles className="h-4 w-4" />
            Use {suggestedPromo.code.toUpperCase()} &amp; save{" "}
            {(() => {
              const { discount } = computePromoDiscount(
                suggestedPromo,
                amounts.subtotal,
                amounts.shipping_total
              );
              return `₹${discount.toFixed(2)}`;
            })()}
          </button>
        )}

        <div className="mt-3 flex items-center gap-3">
          <input
            type="text"
            value={promoCodeInput}
            onChange={(e) => {
              setPromoCodeInput(e.target.value);
            }}
            placeholder={
              appliedPromo ? appliedPromo.code.toUpperCase() : "Have a promo code?"
            }
            className="h-10 flex-1 rounded-full border border-slate-200 bg-white px-4 text-xl text-slate-800 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
          />
          <Button
            type="button"
            variant="primary"
            className="h-10 px-5 text-base"
            onClick={onApplyPromo}
            disabled={promoApplying}
          >
            {promoApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              "Apply"
            )}
          </Button>
          {appliedPromo && (
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4 text-base"
              onClick={onClearPromo}
              disabled={promoApplying}
            >
              Remove
            </Button>
          )}
        </div>

        {promoError && (
          <div className="mt-3 text-base text-rose-600">{promoError}</div>
        )}

        {appliedPromo && !promoError && (
          <div className="mt-3 flex items-center gap-2 text-base text-emerald-700">
            <Sparkles className="h-4 w-4" />
            {autoApplied ? (
              <span>
                Best offer{" "}
                <span className="font-semibold">
                  {appliedPromo.code.toUpperCase()}
                </span>{" "}
                automatically applied to your cart.
              </span>
            ) : (
              <span>
                Promo{" "}
                <span className="font-semibold">
                  {appliedPromo.code.toUpperCase()}
                </span>{" "}
                applied.
              </span>
            )}
          </div>
        )}
      </div>

      {loading || !amounts ? (
        <Skeleton className="h-28 rounded-xl" />
      ) : (
        <div className="space-y-3 text-xl">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              <IndianRupee className="mr-1 inline h-4 w-4" />
              {amounts.subtotal.toFixed(2)}
            </span>
          </div>

          {amounts.promo_discount > 0 && (
            <div className="flex justify-between">
              <span>
                Promotion{" "}
                {amounts.promo_code
                  ? `(${amounts.promo_code.toUpperCase()})`
                  : ""}
              </span>
              <span className="text-emerald-700">
                -{" "}
                <IndianRupee className="mr-1 inline h-4 w-4" />
                {amounts.promo_discount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Other discounts</span>
            <span className="text-emerald-700">
              -{" "}
              <IndianRupee className="mr-1 inline h-4 w-4" />
              {(amounts.discount_total - amounts.promo_discount)
                .toFixed(2)
                .toString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              <IndianRupee className="mr-1 inline h-4 w-4" />
              {amounts.shipping_total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Taxes</span>
            <span>
              <IndianRupee className="mr-1 inline h-4 w-4" />
              {amounts.tax_total.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-2xl font-semibold text-slate-900">
            <span>Total</span>
            <span>
              <IndianRupee className="mr-1 inline h-5 w-5" />
              {amounts.grand_total.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
