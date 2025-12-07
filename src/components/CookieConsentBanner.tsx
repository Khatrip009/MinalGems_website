import { useState, useEffect } from "react";
import { apiFetch } from "../api/client";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie_consent");
    if (!accepted) setVisible(true);
  }, []);

  async function acceptAll() {
    const visitor_id = localStorage.getItem("visitor_id");

    if (visitor_id) {
      await apiFetch("/cookie-consent", {
        method: "POST",
        body: {
          visitor_id,
          consent: {
            analytics: true,
            marketing: true,
            personalization: true,
          },
        },
      });
    }

    localStorage.setItem("cookie_consent", "yes");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 w-full bg-black text-white p-4 flex justify-between items-center">
      <span>We use cookies to improve your experience.</span>
      <button
        onClick={acceptAll}
        className="bg-red-500 px-4 py-2 rounded"
      >
        Accept All
      </button>
    </div>
  );
}
