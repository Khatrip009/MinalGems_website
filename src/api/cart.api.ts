// src/api/cart.api.ts
// =====================================================
// CART API — FULLY ALIGNED WITH BACKEND
// Backend routes: src/routes/sales/cart.routes.js
// =====================================================

import { apiFetch } from "./client";
import type { Cart } from "./types";

/* =====================================================
   GET CART
   GET /api/cart
===================================================== */
export async function getCart() {
  return apiFetch<{ ok: boolean; cart: Cart | null }>("/cart", {
    method: "GET",
  });
}

/* =====================================================
   ADD TO CART
   POST /api/cart/items
   body: { product_id, quantity }
===================================================== */
export async function addToCart(
  product_id: string,
  quantity: number = 1
) {
  return apiFetch<{ ok: boolean; cart: Cart }>("/cart/items", {
    method: "POST",
    body: { product_id, quantity },
  });
}

/* =====================================================
   UPDATE CART ITEM
   PATCH /api/cart/items/:itemId
   body: { quantity }
===================================================== */
export async function updateCartItem(
  itemId: string,
  quantity: number
) {
  return apiFetch<{ ok: boolean; cart: Cart }>(
    `/cart/items/${itemId}`,
    {
      method: "PATCH",
      body: { quantity },
    }
  );
}

/* =====================================================
   REMOVE CART ITEM
   DELETE /api/cart/items/:itemId
===================================================== */
export async function removeCartItem(itemId: string) {
  return apiFetch<{ ok: boolean; cart: Cart }>(
    `/cart/items/${itemId}`,
    {
      method: "DELETE",
    }
  );
}

/* =====================================================
   ATTACH ANONYMOUS CART AFTER LOGIN
   POST /api/cart/attach
   body: { anon_cart_id }
===================================================== */
export async function attachAnonymousCart(anonCartId: string) {
  return apiFetch<{ ok: boolean }>("/cart/attach", {
    method: "POST",
    body: { anon_cart_id: anonCartId },
  });
}
