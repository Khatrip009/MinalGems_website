// ================================================
// ACCOUNT API — Uses apiFetch() from client.ts
// ================================================
import { apiFetch } from "./client";

// Types (optional expand later)
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  dob: string | null;
  kyc_status: string | null;
  is_verified: boolean;
  metadata: any;
}

export interface AccountOverviewResponse {
  ok: true;
  user: UserProfile | null;
  cart: any | null;
  stats: {
    cart_item_count?: number;
    addresses_count: number;
    wishlist_count: number;
    orders_count: number;
    last_order_at: string | null;
    cart_subtotal: number;
    cart_grand_total: number;
  };
}

// ================================================
// GET /api/account/overview
// ================================================
export async function getAccountOverview() {
  return apiFetch<AccountOverviewResponse>("/account/overview", {
    method: "GET",
  });
}

// ================================================
// GET /api/account/profile
// ================================================
export async function getProfile() {
  return apiFetch<{ ok: true; user: UserProfile }>("/account/profile", {
    method: "GET",
  });
}

// ================================================
// PUT /api/account/profile
// body: { full_name?, phone?, dob?, metadata? }
// ================================================
export async function updateProfile(payload: {
  full_name?: string;
  phone?: string;
  dob?: string;
  metadata?: any;
}) {
  return apiFetch<{ ok: true; user: UserProfile }>("/account/profile", {
    method: "PUT",
    body: payload,
  });
}

// ================================================
// PUT /api/account/password
// body: { current_password, new_password }
// ================================================
export async function changePassword(payload: {
  current_password: string;
  new_password: string;
}) {
  return apiFetch<{ ok: true }>("/account/password", {
    method: "PUT",
    body: payload,
  });
}

// ================================================
// GET /api/account/orders/:id/timeline
// ================================================
export async function getOrderTimeline(orderId: string) {
  return apiFetch<{ ok: true; timeline: any[] }>(
    `/account/orders/${orderId}/timeline`,
    {
      method: "GET",
    }
  );
}
