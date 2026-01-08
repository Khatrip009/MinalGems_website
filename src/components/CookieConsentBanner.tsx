import { useState, useEffect } from "react";
import { submitCookieConsent } from "../api/cookieConsent.api";
import { getStoredVisitorId, initVisitorTracking } from "../api/visitors.api";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const accepted = localStorage.getItem("cookie_consent");
    if (!accepted) setVisible(true);
  }, []);

  async function acceptAll() {
    if (saving) return;
    setSaving(true);

    try {
      // Ensure visitor is identified
      let visitorId = getStoredVisitorId();
      if (!visitorId) {
        visitorId = await initVisitorTracking();
      }

      if (visitorId) {
        await submitCookieConsent(visitorId, {
          necessary: true,
          analytics: true,
          marketing: true,
          preferences: true,
          version: "v1",
        });
      }

      localStorage.setItem("cookie_consent", "yes");
      setVisible(false);
    } catch (err) {
      console.error("Cookie consent save failed:", err);
      // Do NOT hide banner if API fails
    } finally {
      setSaving(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 z-50 w-full bg-black text-white px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm">
        We use cookies to improve your experience and analyze site traffic.
      </span>

      <button
        onClick={acceptAll}
        disabled={saving}
        className="bg-rose-500 hover:bg-rose-600 disabled:opacity-60 px-4 py-2 rounded text-sm font-medium"
      >
        {saving ? "Saving..." : "Accept All"}
      </button>
    </div>
  );
}
