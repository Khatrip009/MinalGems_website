import { getVisitorId } from "./visitor";

export async function initPushSubscription(visitorId) {
  if (!("serviceWorker" in navigator)) return;
  if (!("PushManager" in window)) return;

  const reg = await navigator.serviceWorker.register("/sw.js");

  const { publicKey } = await fetch("/api/push/public").then(r => r.json());

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitor_id: visitorId,
      subscription: sub,
      browser: navigator.userAgent,
    }),
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map(a => a.charCodeAt(0)));
}
