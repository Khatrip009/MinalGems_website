// src/api/products.api.ts
import { apiFetch } from "./client";
import type { Product, ProductAsset } from "./types";

const BASE = "/masters/products";

// ───────────────────────────────────────
// PUBLIC (guest / optional auth)
// ───────────────────────────────────────

/**
 * Paginated list of published products.
 * Pass query string: ?category=uuid&search=text&page=1&limit=20
 */
export async function getProducts(query = "") {
  return apiFetch<{
    ok: boolean;
    products: Product[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>(`${BASE}${query}`);
}

/**
 * Legacy endpoint – all published products (max 100)
 */
export async function getAllProducts() {
  return apiFetch<{ ok: boolean; products: Product[] }>(`${BASE}/list/all`);
}

/**
 * Single published product by slug – includes `assets` array
 */
export async function getProductBySlug(slug: string) {
  if (!slug) throw new Error("product_slug_required");
  return apiFetch<{
    ok: boolean;
    product: Product & { assets: ProductAsset[] };
  }>(`${BASE}/${slug}`);
}

/**
 * Get assets for a product (works for public if product is published)
 */
export async function getProductAssets(productId: string) {
  if (!productId) throw new Error("product_id_required");
  return apiFetch<{ ok: boolean; assets: ProductAsset[] }>(
    `${BASE}/${productId}/assets`
  );
}

// ───────────────────────────────────────
// ADMIN (requires auth, role 1|2)
// ───────────────────────────────────────

/**
 * Admin list – includes unpublished, searchable & filterable.
 * Query: ?page=1&limit=50&q=ring&category_id=uuid&trade_type=import&is_published=true
 */
export async function adminGetProducts(query = "") {
  return apiFetch<{
    ok: boolean;
    products: Product[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  }>(`${BASE}/admin${query}`);
}

/**
 * Get a single product by ID (full fields)
 */
export async function adminGetProductById(id: string) {
  if (!id) throw new Error("product_id_required");
  return apiFetch<{ ok: boolean; product: Product }>(`${BASE}/admin/${id}`);
}

/**
 * Create a new product
 */
export async function createProduct(data: {
  title: string;
  slug: string;
  price: number;
  currency?: string;
  short_description?: string;
  description?: string;
  category_id?: string;
  trade_type?: "import" | "export" | "both";
  is_published?: boolean;
  sku?: string;
  available_qty?: number;
  moq?: number;
  diamond_pcs?: number;
  diamond_carat?: number;
  rate?: number;
  diamonds?: any[]; // will be JSON.stringify'd by server
  metal_type?: string;
  gold_carat?: number;
}) {
  return apiFetch<{ ok: boolean; product: Product }>(`${BASE}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing product (admin).
 * Provide only the fields you want to change.
 */
export async function updateProduct(
  id: string,
  data: Partial<{
    sku: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    short_description: string;
    description: string;
    category_id: string | null;
    trade_type: "import" | "export" | "both";
    is_published: boolean;
    available_qty: number;
    moq: number;
    metadata: any;
    diamond_pcs: number;
    diamond_carat: number;
    rate: number;
    diamonds: any[];
    metal_type: string;
    gold_carat: number;
  }>
) {
  if (!id) throw new Error("product_id_required");
  return apiFetch<{ ok: boolean; product: Product }>(`${BASE}/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a product (also removes its asset files)
 */
export async function deleteProduct(id: string) {
  if (!id) throw new Error("product_id_required");
  return apiFetch<{ ok: boolean }>(`${BASE}/admin/${id}`, {
    method: "DELETE",
  });
}

// ───────────────────────────────────────
// ASSET MANAGEMENT (admin)
// ───────────────────────────────────────

/**
 * Upload assets to a product.
 * @param productId - UUID of the product
 * @param formData - FormData with fields: files[], asset_type, is_primary, sort_order, metadata
 */
export async function uploadProductAssets(productId: string, formData: FormData) {
  return apiFetch<{ ok: boolean; assets: ProductAsset[] }>(
    `${BASE}/${productId}/assets`,
    {
      method: "POST",
      body: formData,
    }
  );
}

/**
 * Set an asset as primary (for its product)
 */
export async function setAssetPrimary(assetId: string) {
  if (!assetId) throw new Error("asset_id_required");
  return apiFetch<{ ok: boolean; asset: ProductAsset }>(
    `${BASE}/assets/${assetId}/set-primary`,
    { method: "PATCH" }
  );
}

/**
 * Delete an asset (removes file from disk)
 */
export async function deleteAsset(assetId: string) {
  if (!assetId) throw new Error("asset_id_required");
  return apiFetch<{ ok: boolean }>(`${BASE}/assets/${assetId}`, {
    method: "DELETE",
  });
}

// ───────────────────────────────────────
// IMPORT / EXPORT (admin)
// ───────────────────────────────────────

/**
 * Export products as JSON or CSV.
 * Pass query: ?format=csv&ids=id1,id2&category_id=uuid&is_published=true
 * Returns raw CSV or JSON object.
 */
export async function exportProducts(query = "") {
  return apiFetch<Blob | { ok: boolean; products: Product[] }>(
    `${BASE}/export${query}`
  );
}

/**
 * Import products from a CSV or JSON file.
 * @param formData - FormData containing the file field
 */
export async function importProducts(formData: FormData) {
  return apiFetch<{
    ok: boolean;
    summary: { inserted: number; updated: number; errors: number };
    errors?: { record: any; error: string }[];
  }>(`${BASE}/import`, {
    method: "POST",
    body: formData,
  });
}

// ───────────────────────────────────────
// Aliases for backward compatibility
// ───────────────────────────────────────
export const fetchProducts = getProducts;
export const fetchProductBySlug = getProductBySlug;
export const fetchProductAssets = getProductAssets;