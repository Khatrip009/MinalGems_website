// src/api/cookieConsent.api.ts
import { apiFetch } from "./client";

/* =====================================================
 * COOKIE CONSENT API
 * Base: /api/cookie-consents
 * ===================================================== */

export interface CookieConsent {
  necessary: boolean;
  analytics?: boolean;
  marketing?: boolean;
  preferences?: boolean;
  version?: string;
  [key: string]: unknown;
}

export interface CookieConsentResponse {
  ok: boolean;
  id: string;
}

/**
 * POST /api/cookie-consents
 * Save cookie consent for a visitor
 */
export async function submitCookieConsent(
  visitorId: string,
  consent: CookieConsent
): Promise<CookieConsentResponse> {
  if (!visitorId) {
    throw new Error("visitor_id_required");
  }

  return apiFetch<CookieConsentResponse>("/cookie-consents", {
    method: "POST",
    body: {
      visitor_id: visitorId,
      consent,
    },
  });
}
