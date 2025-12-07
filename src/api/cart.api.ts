// src/api/cart.api.ts
// =====================================================
// CART API — Fetch, Add, Update, Remove Cart Items
// =====================================================

import { apiFetch } from "./client";
import type { Cart } from "./types";

// ---------------------------
// GET CART
// ---------------------------
export async function getCart() {
  // backend returns: { ok: boolean, cart: Cart | null }
  return apiFetch<{ ok: boolean; cart: Cart | null }>("/cart");
}

// ---------------------------
// ADD TO CART
// ---------------------------
// backend expects body: { product_id, quantity }
export async function addToCart(product_id: string, quantity: number = 1) {
  return apiFetch<{ ok: boolean; cart: Cart }>("/cart/items", {
    method: "POST",
    body: { product_id, quantity }, // 👈 FIXED: quantity (not qty)
  });
}

// ---------------------------
// UPDATE CART ITEM
// ---------------------------
// backend route: PATCH /api/cart/items/:itemId
export async function updateCartItem(itemId: string, quantity: number) {
  return apiFetch<{ ok: boolean; cart: Cart }>("/cart/items/" + itemId, {
    method: "PATCH",                // 👈 FIXED: PATCH (not PUT)
    body: { quantity },             // 👈 quantity
  });
}

// ---------------------------
// REMOVE CART ITEM
// ---------------------------
// backend returns { ok, cart }
export async function removeCartItem(itemId: string) {
  return apiFetch<{ ok: boolean; cart: Cart }>("/cart/items/" + itemId, {
    method: "DELETE",
  });
}

// ---------------------------
// ATTACH ANONYMOUS CART TO USER
// ---------------------------
// backend cart-attach router is mounted as POST /api/cart/attach
export async function attachAnonymousCart(anonCartId: string) {
  return apiFetch<{ ok: boolean }>("/cart/attach", {
    method: "POST",
    body: { anon_cart_id: anonCartId }, // correct body key
  });
}
