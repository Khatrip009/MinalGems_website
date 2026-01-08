// =======================================
// COOKIE CONSENT API — FIXED
// =======================================

import { apiFetch } from "./client";

/**
 * Save cookie consent for a visitor
 * POST /api/cookie-consents
 */
export async function submitCookieConsent(
  visitor_id: string,
  consent: any
) {
  return apiFetch<{ ok: boolean }>("/cookie-consents", {
    method: "POST",
    body: { visitor_id, consent },
  });
}
