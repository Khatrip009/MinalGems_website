// src/api/wishlist.api.ts
import { apiFetch } from "./client";

/* =====================================================
 * TYPES
 * ===================================================== */

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

export interface RemoveFromWishlistResponse {
  ok: boolean;
}

export interface ClearWishlistResponse {
  ok: boolean;
}

type WishlistEventKind = "set" | "add" | "remove" | "clear";

interface WishlistEventDetail {
  kind: WishlistEventKind;
  count?: number;
  delta?: number;
}

/* =====================================================
 * EVENTS
 * ===================================================== */

/** Fire a browser event so Header (and others) can react in real-time */
function emitWishlistEvent(detail: WishlistEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<WishlistEventDetail>("wishlist:updated", { detail })
  );
}

/* =====================================================
 * API CALLS
 * Base: /api/sales/wishlist
 * ===================================================== */

/**
 * GET /api/sales/wishlist
 */
export async function getWishlist() {
  const res = await apiFetch<WishlistResponse>("/sales/wishlist");

  if (res?.ok && res.wishlist?.items) {
    emitWishlistEvent({
      kind: "set",
      count: res.wishlist.items.length,
    });
  }

  return res;
}

/**
 * POST /api/sales/wishlist
 * body: { product_id }
 */
export async function addToWishlist(product_id: string) {
  if (!product_id) {
    throw new Error("product_id_required");
  }

  const res = await apiFetch<AddToWishlistResponse>("/sales/wishlist", {
    method: "POST",
    body: { product_id },
  });

  if (res.ok && !res.already_exists) {
    emitWishlistEvent({ kind: "add", delta: 1 });
  }

  return res;
}

/**
 * DELETE /api/sales/wishlist/:item_id
 */
export async function removeFromWishlist(itemId: string) {
  if (!itemId) {
    throw new Error("wishlist_item_id_required");
  }

  const res = await apiFetch<RemoveFromWishlistResponse>(
    `/sales/wishlist/${itemId}`,
    { method: "DELETE" }
  );

  if (res.ok) {
    emitWishlistEvent({ kind: "remove", delta: 1 });
  }

  return res;
}

/**
 * DELETE /api/sales/wishlist
 */
export async function clearWishlist() {
  const res = await apiFetch<ClearWishlistResponse>("/sales/wishlist", {
    method: "DELETE",
  });

  if (res.ok) {
    emitWishlistEvent({ kind: "clear" });
  }

  return res;
}
