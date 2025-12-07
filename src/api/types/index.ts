// src/api/types/index.ts

export interface User {
  id: string;
  full_name: string;
  email: string;
  role_id: number;
}

/* ---------------- CART ---------------- */

export interface CartItem {
  id: string;
  product_id: string;
  qty: number;
  unit_price: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

/* ---------------- WISHLIST ---------------- */

export interface WishlistItem {
  id: string;
  product_id: string;
  added_at: string;

  // Optional enriched fields returned from backend
  product_title?: string;
  product_slug?: string;
  price?: number;
  image?: string | null;
}

export interface Wishlist {
  id: string;
  name?: string;
  items: WishlistItem[];
}

/* ---------------- PRODUCTS ---------------- */

export interface ProductAsset {
  id: string;
  asset_type: "image" | "3d" | "video" | "other";
  url: string;
  filename: string;
  file_type: string | null;
  width?: number | null;
  height?: number | null;
  filesize?: number | null;
  is_primary: boolean;
  sort_order: number;
  metadata?: Record<string, unknown>;
}

// src/api/types/index.ts

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  short_description?: string;
  description?: string;
  category_id?: string | null;        // 👈 add this
  trade_type?: string;
  is_published: boolean;
  created_at: string;
  primary_image?: string | null;
  model_3d_url?: string | null;
  assets?: ProductAsset[];

  available_qty?: number | null;      // 👈 add this (for stock)
}


/* ---------------- VISITORS METRICS ---------------- */

export interface VisitorsMetrics {
  total_visitors: number;
  visitors_today: number | null;
  new_visitors_today: number | null;
}
