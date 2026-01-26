import { apiFetch } from "./client";

export const VISITOR_SESSION_KEY = "mg_visitor_session_id";
export const VISITOR_ID_KEY = "mg_visitor_id";

/* =====================================================
 * Helpers
 * ===================================================== */

/** Always create a non-UUID-looking session id */
function createRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
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

    // Optional cookie
    try {
      const oneYear = 60 * 60 * 24 * 365;
      document.cookie = `mg_session=${id}; path=/; max-age=${oneYear}; SameSite=Lax`;
    } catch {}

    return id;
  } catch {
    return createRandomId();
  }
}

/** Read stored visitor UUID */
export function getStoredVisitorId(): string | null {
  try {
    return window.localStorage.getItem(VISITOR_ID_KEY);
  } catch {
    return null;
  }
}

/* =====================================================
 * API Calls
 * ===================================================== */

/**
 * POST /api/analytics/visitors/identify
 * Always returns visitor_id
 */
export async function identifyVisitor(
  meta?: Record<string, unknown>
): Promise<string> {
  const session_id = getOrCreateVisitorSessionId();

  const res = await apiFetch<{
    ok: boolean;
    visitor_id: string;
  }>("/analytics/visitors/identify", {
    method: "POST",
    body: {
      session_id,
      ...(meta ? { meta } : {}),
    },
  });

  if (res.ok && res.visitor_id) {
    try {
      window.localStorage.setItem(VISITOR_ID_KEY, res.visitor_id);
    } catch {}
  }

  return res.visitor_id;
}

/**
 * POST /api/analytics/visitors/event
 * Track analytics event
 */
export async function trackVisitorEvent(
  event_type: string,
  event_props?: Record<string, unknown>
) {
  if (!event_type) {
    throw new Error("event_type_required");
  }

  const session_id = getOrCreateVisitorSessionId();
  const visitor_id = getStoredVisitorId() || undefined;

  return apiFetch<{
    ok: boolean;
  }>("/analytics/visitors/event", {
    method: "POST",
    body: {
      visitor_id,
      session_id,
      event_type,
      event_props: event_props || {},
    },
  });
}

/**
 * Convenience: call once on app startup
 */
export async function initVisitorTracking(
  meta?: Record<string, unknown>
) {
  return identifyVisitor(meta);
}
