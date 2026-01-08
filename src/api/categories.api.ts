// src/api/categories.api.ts
import { apiFetch } from "./client";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  trade_type?: string | null;
  product_count?: number;
}

// ------------------------------------
// GET CATEGORIES
// GET /api/masters/categories
// ------------------------------------
export async function fetchCategories(params?: {
  page?: number;
  limit?: number;
  include_counts?: boolean;
}) {
  const query = new URLSearchParams({
    ...(params?.page && { page: String(params.page) }),
    ...(params?.limit && { limit: String(params.limit) }),
    ...(params?.include_counts && { include_counts: "true" }),
  }).toString();

  return apiFetch<{
    ok: boolean;
    categories: Category[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  }>(`/masters/categories${query ? `?${query}` : ""}`);
}
