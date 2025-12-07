// src/api/visitors.api.ts
import { apiFetch } from "./client";

export const VISITOR_SESSION_KEY = "mg_visitor_session_id";
export const VISITOR_ID_KEY = "mg_visitor_id";

/** Always create a non-UUID-looking session id */
function createRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // Prefix breaks the UUID regex on the backend
    return "sess-" + crypto.randomUUID();
  }
  return `sess-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** Get or create a persistent anonymous session id */
export function getOrCreateVisitorSessionId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_SESSION_KEY);
    if (existing) return existing;

    const id = createRandomId();
    window.localStorage.setItem(VISITOR_SESSION_KEY, id);

    // Also drop a simple cookie (optional)
    try {
      const oneYear = 60 * 60 * 24 * 365;
      document.cookie = `mg_session=${id}; path=/; max-age=${oneYear}; SameSite=Lax`;
    } catch {
      /* ignore */
    }

    return id;
  } catch {
    // Fallback if localStorage fails
    return createRandomId();
  }
}

/** Read stored visitor UUID (set after /identify) */
export function getStoredVisitorId(): string | null {
  try {
    return window.localStorage.getItem(VISITOR_ID_KEY);
  } catch {
    return null;
  }
}

/**
 * POST /api/visitors/identify
 * Upserts the visitor row using session_id
 */
export async function identifyVisitor(meta?: Record<string, unknown>) {
  const session_id = getOrCreateVisitorSessionId();

  const payload: any = { session_id };
  if (meta) payload.meta = meta;

  const res = await apiFetch<{ visitor_id: string }>("/visitors/identify", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  try {
    window.localStorage.setItem(VISITOR_ID_KEY, res.visitor_id);
  } catch {
    /* ignore */
  }

  return res.visitor_id;
}

/**
 * Track an analytics event.
 * Uses visitor_id if known, otherwise session_id.
 */
export async function trackVisitorEvent(
  event_type: string,
  event_props?: Record<string, unknown>
) {
  const session_id = getOrCreateVisitorSessionId();
  const visitor_id = getStoredVisitorId() || undefined;

  return apiFetch<{
    ok: boolean;
    visitor_id: string;
    event_id: string | null;
  }>("/visitors/event", {
    method: "POST",
    body: JSON.stringify({
      visitor_id,
      session_id,
      event_type,
      event_props: event_props || {},
    }),
  });
}

/**
 * Convenience: ensure we have visitor_id in DB & localStorage.
 * Call once on app startup.
 */
export async function initVisitorTracking(meta?: Record<string, unknown>) {
  const visitorId = await identifyVisitor(meta);
  return visitorId;
}
