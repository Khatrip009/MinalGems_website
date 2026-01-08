// =======================================
// COOKIE CONSENT API — FIXED
// =======================================

import { apiFetch } from "./client";

export interface CookieConsent {
  necessary: boolean;
  analytics?: boolean;
  marketing?: boolean;
  preferences?: boolean;
  version?: string;
  [key: string]: unknown;
}

/**
 * POST /api/cookie-consents
 * Save cookie consent for a visitor.
 */
export async function submitCookieConsent(
  visitorId: string,
  consent: CookieConsent
) {
  return apiFetch<{ ok: boolean; id: string }>("/cookie-consents", {
    method: "POST",
    body: {
      visitor_id: visitorId,
      consent,
    },
  });
}
