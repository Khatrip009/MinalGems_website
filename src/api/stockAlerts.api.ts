// src/api/stockAlerts.api.ts
import { apiFetch } from "./client";

interface StockAlertResponse {
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

export async function registerStockAlert(productId: string) {
  return apiFetch<StockAlertResponse>("/stock-alerts/register", {
    method: "POST",
    body: {
      product_id: productId,
    },
  });
}
