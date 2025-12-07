// src/api/visitorsMetrics.api.ts
import { apiFetch } from "./client";
import type { VisitorsMetrics } from "./types";

export async function getVisitorsMetrics(): Promise<VisitorsMetrics> {
  const res = await apiFetch<{ ok: boolean; metrics: VisitorsMetrics }>(
    "/metrics/visitors/summary"
  );
  return res.metrics;
}
