// src/api/products.api.ts
import { apiFetch } from "./client";
import type { Product, ProductAsset } from "./types";

export async function fetchProducts() {
  return apiFetch<{ ok: boolean; products: Product[] }>("/products");
}

export async function fetchProductBySlug(slug: string) {
  return apiFetch<{ ok: boolean; product: Product }>("/products/" + slug);
}


export async function getProducts(query: string = "") {
  return apiFetch<{ ok: boolean; products: Product[] }>(`/products${query}`);
}

export async function getProductBySlug(slug: string) {
  return apiFetch<{ ok: boolean; product: Product }>(`/products/${slug}`);
}

export async function getProductAssets(id: string) {
  return apiFetch<{ ok: boolean; assets: ProductAsset[] }>(
    `/products/${id}/assets`
  );
}
