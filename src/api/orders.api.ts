// src/api/orders.api.ts
// ----------------------------------------------------
// Orders API wrapper — FIXED (matches app.js)
// ----------------------------------------------------

import { apiFetch } from "./client";

/* -----------------------------------------------
 * 1) Get all orders of the logged-in user
 * GET /api/sales/orders/my
 * --------------------------------------------- */
export async function getMyOrders() {
  return apiFetch<{ ok: boolean; orders: any[] }>("/sales/orders/my");
}

/* -----------------------------------------------
 * 2) Get single order with items
 * GET /api/sales/orders/:id
 * --------------------------------------------- */
export async function getOrder(id: string) {
  if (!id) throw new Error("order_id_required");
  return apiFetch<{ ok: boolean; order: any }>(`/sales/orders/${id}`);
}

/* -----------------------------------------------
 * 3) Get order timeline
 * GET /api/sales/orders/:id/timeline
 * --------------------------------------------- */
export async function getOrderTimeline(id: string) {
  if (!id) throw new Error("order_id_required");
  return apiFetch<{
    ok: boolean;
    timeline: any[];
  }>(`/sales/orders/${id}/timeline`);
}
