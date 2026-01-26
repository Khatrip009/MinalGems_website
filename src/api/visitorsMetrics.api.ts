import { apiFetch } from "./client";

export interface VisitorsMetrics {
  total_visitors: number;
  visitors_today: number;
  page_views_today: number;
  new_visitors_today: number;
}

/**
 * GET /api/analytics/visitors-metrics/summary
 */
export async function getVisitorsMetrics(): Promise<VisitorsMetrics> {
  const res = await apiFetch<{
    ok: boolean;
    metrics: VisitorsMetrics;
  }>("/analytics/visitors-metrics/summary");

  return res.metrics;
}
