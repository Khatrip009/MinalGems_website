// src/api/stockAlerts.api.ts
import { apiFetch } from "./client";

/* =====================================================
 * STOCK ALERTS API
 * Base: /api/stock-alerts
 * ===================================================== */

export interface StockAlertResponse {
  ok: boolean;
  alert_id?: string;
  status?: string;
  already_exists?: boolean;
  product?: {
    id: string;
    title: string;
    slug: string;
  };
}

/**
 * POST /api/stock-alerts/register
 * Register a back-in-stock alert for a product
 */
export async function registerStockAlert(productId: string) {
  if (!productId) {
    throw new Error("product_id_required");
  }

  return apiFetch<StockAlertResponse>("/stock-alerts/register", {
    method: "POST",
    body: {
      product_id: productId,
    },
  });
}
