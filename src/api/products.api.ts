// src/api/products.api.ts
import { apiFetch } from "./client";
import type { Product, ProductAsset } from "./types";

/* =====================================================
 * PRODUCTS
 * Base: /api/masters/products
 * ===================================================== */

/**
 * GET /api/masters/products
 * Supports optional query string (?q=, ?category=, etc.)
 */
export async function getProducts(query = "") {
  return apiFetch<{
    ok: boolean;
    products: Product[];
  }>(`/masters/products${query}`);
}

/**
 * GET /api/masters/products/:slug
 */
export async function getProductBySlug(slug: string) {
  if (!slug) throw new Error("product_slug_required");

  return apiFetch<{
    ok: boolean;
    product: Product;
  }>(`/masters/products/${slug}`);
}

/**
 * GET /api/masters/products/:id/assets
 */
export async function getProductAssets(id: string) {
  if (!id) throw new Error("product_id_required");

  return apiFetch<{
    ok: boolean;
    assets: ProductAsset[];
  }>(`/masters/products/${id}/assets`);
}

// Backward compatibility aliases
export const fetchProducts = getProducts;
export const fetchProductBySlug = getProductBySlug;
