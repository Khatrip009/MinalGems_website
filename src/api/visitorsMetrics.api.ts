// src/api/visitorsMetrics.api.ts
import { apiFetch } from "./client";
import type { VisitorsMetrics } from "./types";

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
