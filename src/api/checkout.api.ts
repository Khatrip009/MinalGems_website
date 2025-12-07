// =======================================
// CHECKOUT API
// =======================================

import { apiFetch } from "./client";

// -------------------------------
// 1) Checkout Summary
// -------------------------------
export async function checkoutSummary(data: {
  cart_id: string;
  shipping_address_id?: string;
  billing_address_id?: string;
  coupon_code?: string;
  shipping_method?: string;
}) {
  return apiFetch("/checkout/summary", {
    method: "POST",
    body: data,
  });
}

// -------------------------------
// 2) Place Order
// -------------------------------
export async function placeOrder(data: {
  cart_id: string;
  shipping_address_id: string;
  billing_address_id: string;
  payment_method: string;
  notes?: string;
}) {
  return apiFetch("/checkout/place-order", {
    method: "POST",
    body: data,
  });
}

// -------------------------------
// 3) Pay for Order
// -------------------------------
export async function payOrder(data: {
  order_id: string;
  amount: number;
  currency: string;
  provider: string;
  provider_payment_id: string;
  status: string;
  meta?: any;
}) {
  return apiFetch("/checkout/pay", {
    method: "POST",
    body: data,
  });
}

// =======================================
// PROMO CODE API
// =======================================

// -------------------------------
// 4) Apply Promo Code
// -------------------------------
export async function applyPromoCode(promo_code: string, subtotal: number) {
  return apiFetch("/promo/apply", {
    method: "POST",
    body: {
      promo_code,
      subtotal,
    },
  });
}
