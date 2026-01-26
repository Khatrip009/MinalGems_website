// src/api/wishlist.api.ts
// =====================================================
// WISHLIST API — EXACTLY MATCHES BACKEND ROUTES
// Backend: src/routes/sales/wishlist.routes.js
// Mounted at: /api/sales/wishlist
// =====================================================

import { apiFetch } from "./client";

/* =====================================================
   TYPES
===================================================== */

export interface WishlistItem {
  id: string;
  product_id: string;
  product_title?: string;
  product_slug?: string;
  price?: number;
  image?: string | null;
  added_at?: string;
}

export interface Wishlist {
  id: string;
  name: string;
  items: WishlistItem[];
}

export interface WishlistResponse {
  ok: boolean;
  wishlist: Wishlist;
}

export interface AddToWishlistResponse {
  ok: boolean;
  id?: string;
  already_exists?: boolean;
}

/* =====================================================
   EVENTS (OPTIONAL UI SYNC)
===================================================== */

type WishlistEventKind = "set" | "add" | "remove" | "clear";

function emitWishlistEvent(kind: WishlistEventKind, delta?: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("wishlist:updated", {
      detail: { kind, delta },
    })
  );
}

/* =====================================================
   API CALLS
===================================================== */

/**
 * GET /api/sales/wishlist
 */
export async function getWishlist() {
  const res = await apiFetch<WishlistResponse>("/sales/wishlist");

  if (res.ok && res.wishlist?.items) {
    emitWishlistEvent("set", res.wishlist.items.length);
  }

  return res;
}

/**
 * POST /api/sales/wishlist/add
 * body: { product_id }
 */
export async function addToWishlist(product_id: string) {
  if (!product_id) {
    throw new Error("product_id_required");
  }

  const res = await apiFetch<AddToWishlistResponse>(
    "/sales/wishlist/add",
    {
      method: "POST",
      body: { product_id },
    }
  );

  if (res.ok && !res.already_exists) {
    emitWishlistEvent("add", 1);
  }

  return res;
}

/**
 * DELETE /api/sales/wishlist/remove/:item_id
 */
export async function removeFromWishlist(itemId: string) {
  if (!itemId) {
    throw new Error("wishlist_item_id_required");
  }

  const res = await apiFetch<{ ok: boolean }>(
    `/sales/wishlist/remove/${itemId}`,
    { method: "DELETE" }
  );

  if (res.ok) {
    emitWishlistEvent("remove", 1);
  }

  return res;
}

/**
 * DELETE /api/sales/wishlist/clear
 */
export async function clearWishlist() {
  const res = await apiFetch<{ ok: boolean }>(
    "/sales/wishlist/clear",
    { method: "DELETE" }
  );

  if (res.ok) {
    emitWishlistEvent("clear");
  }

  return res;
}
