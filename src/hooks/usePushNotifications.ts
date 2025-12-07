// src/hooks/usePushNotifications.ts
import { useEffect } from "react";
import { getVapidPublicKey, registerPushForCurrentVisitor } from "../api/push.api";

export default function usePushNotifications() {
  useEffect(() => {
    async function setupPush() {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          return;
        }

        // Ensure service worker is installed
        await navigator.serviceWorker.register("/sw.js");

        // This handles full registration + sending subscription to backend
        await registerPushForCurrentVisitor();
      } catch (err) {
        console.error("Push notification setup failed:", err);
      }
    }

    setupPush();
  }, []);
}
