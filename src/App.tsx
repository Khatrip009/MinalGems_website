// src/App.tsx
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import useVisitorTracking from "./hooks/useVisitorTracking";
import CookieConsentBanner from "./components/CookieConsentBanner";
import { startEventStream } from "./lib/events";

export default function App() {
  // ---------------------------
  // 🔥 Enable visitor tracking
  // ---------------------------
  useVisitorTracking();

  // ---------------------------
  // 🔔 Start SSE real-time listener
  // ---------------------------
  useEffect(() => {
    const sse = startEventStream((msg) => {
      const stream = startRealtimeToasts();
  return () => stream.close();


      console.log("🔔 SSE:", msg);
      // You can trigger toast or notifications here if needed
    });

    return () => sse.close();
  }, []);

  return (
    <>
      {/* Cookie Consent Bar */}
      <CookieConsentBanner />

      {/* Header */}
      <Header />

      {/* Page Content Rendered by Router */}
      <main className="min-h-screen bg-white">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
