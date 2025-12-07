// src/hooks/useVisitorTracking.ts
import { useEffect } from "react";
import { initVisitorTracking, trackVisitorEvent } from "../api/visitors.api";

export default function useVisitorTracking() {
  useEffect(() => {
    async function startTracking() {
      try {
        // Ensure visitor exists in DB and localStorage
        const visitorId = await initVisitorTracking({
          ua: navigator.userAgent,
          source: "web",
        });

        // Log page view event
        await trackVisitorEvent("page_view", {
          path: window.location.pathname,
          referrer: document.referrer,
        });
      } catch (err) {
        console.error("Visitor tracking failed:", err);
      }
    }

    startTracking();
  }, []);
}
