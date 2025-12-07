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

export async function fetchCategories() {
  return apiFetch<{
    ok: boolean;
    categories: Category[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  }>("/categories?include_counts=true");
}
