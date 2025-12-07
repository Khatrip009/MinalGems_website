// src/lib/orders.api.ts
// ----------------------------------------------------
// Orders API wrapper (matches backend routes exactly)
// ----------------------------------------------------

import { apiFetch } from "./client";

// -----------------------------------------------
// 1) Get all orders of the logged-in user
// GET /api/orders/my
// -----------------------------------------------
export async function getMyOrders() {
  return apiFetch("/orders/my");
}

// -----------------------------------------------
// 2) Get single order with items
// GET /api/orders/:id
// -----------------------------------------------
export async function getOrder(id: string) {
  if (!id) throw new Error("order_id_required");
  return apiFetch(`/orders/${id}`);
}

// -----------------------------------------------
// 3) Get order timeline
// GET /api/account/orders/:id/timeline
// -----------------------------------------------
export async function getOrderTimeline(id: string) {
  if (!id) throw new Error("order_id_required");
  return apiFetch(`/account/orders/${id}/timeline`);
}
