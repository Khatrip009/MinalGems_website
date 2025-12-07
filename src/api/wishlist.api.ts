// src/api/wishlist.api.ts
import { apiFetch } from "./client";

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

/** Fire a browser event so Header (and others) can react in real-time */
function emitWishlistEvent(detail: WishlistEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<WishlistEventDetail>("wishlist:updated", { detail }));
}

/** GET /api/wishlist */
export async function getWishlist() {
  const res = await apiFetch<WishlistResponse>("/wishlist");

  if (res && (res as any).ok && (res as any).wishlist?.items) {
    const count = (res as any).wishlist.items.length;
    emitWishlistEvent({ kind: "set", count });
  }

  return res;
}

/** POST /api/wishlist/add  (body: { product_id }) */
export async function addToWishlist(product_id: string) {
  const res = await apiFetch<AddToWishlistResponse>("/wishlist/add", {
    method: "POST",
    body: { product_id },
  });

  if (res && res.ok && !res.already_exists) {
    // Assume +1 new item
    emitWishlistEvent({ kind: "add", delta: 1 });
  }

  return res;
}

/** DELETE /api/wishlist/remove/:item_id */
export async function removeFromWishlist(itemId: string) {
  const res = await apiFetch<RemoveFromWishlistResponse>(`/wishlist/remove/${itemId}`, {
    method: "DELETE",
  });

  if (res && res.ok) {
    emitWishlistEvent({ kind: "remove", delta: 1 });
  }

  return res;
}

/** DELETE /api/wishlist/clear */
export async function clearWishlist() {
  const res = await apiFetch<ClearWishlistResponse>("/wishlist/clear", {
    method: "DELETE",
  });

  if (res && res.ok) {
    emitWishlistEvent({ kind: "clear" });
  }

  return res;
}
