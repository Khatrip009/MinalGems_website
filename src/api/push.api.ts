// src/api/push.api.ts
import { apiFetch } from "./client";
import { getStoredVisitorId, initVisitorTracking } from "./visitors.api";

interface VapidResponse {
  ok: boolean;
  publicKey: string;
}

type RegisterResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "ssr"
        | "unsupported"
        | "permission_denied"
        | "not_configured"
        | "error";
    };

/**
 * GET /api/push/vapid
 * Fetch public VAPID key
 */
export async function getVapidPublicKey(): Promise<string> {
  const res = await apiFetch<VapidResponse>("/push/vapid");

  if (!res || !res.publicKey) {
    throw new Error("not_configured");
  }

  return res.publicKey;
}

/** Convert base64 URL-safe string to Uint8Array */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Register browser push notifications for current visitor
 *
 * Uses:
 *   GET  /api/push/vapid
 *   POST /api/push/subscribe
 */
export async function registerPushForCurrentVisitor(): Promise<RegisterResult> {
  if (typeof window === "undefined") {
    return { ok: false, reason: "ssr" };
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, reason: "unsupported" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: "permission_denied" };
  }

  // Ensure visitor ID
  let visitorId = getStoredVisitorId();
  if (!visitorId) {
    visitorId = await initVisitorTracking();
  }

  let publicKey: string;
  try {
    publicKey = await getVapidPublicKey();
  } catch (err) {
    console.error("Failed to load VAPID key:", err);
    return { ok: false, reason: "not_configured" };
  }

  try {
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    const swReg = await navigator.serviceWorker.ready;

    const subscription = await swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    const browser = navigator.userAgent;

    await apiFetch<{ ok: boolean; id: string | null }>("/push/subscribe", {
      method: "POST",
      body: {
        visitor_id: visitorId,
        subscription,
        browser,
      },
    });

    return { ok: true };
  } catch (err) {
    console.error("Push subscription failed:", err);
    return { ok: false, reason: "error" };
  }
}
