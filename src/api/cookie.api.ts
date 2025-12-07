// =======================================
// COOKIE CONSENT API
// =======================================

import { apiFetch } from "./client";

/**
 * Save cookie consent for a visitor
 */
export async function submitCookieConsent(visitor_id: string, consent: any) {
  return apiFetch("/cookie-consent", {
    method: "POST",
    body: { visitor_id, consent }, // DO NOT JSON.stringify — client.ts handles this
  });
}
