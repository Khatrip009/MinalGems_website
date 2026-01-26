// src/App.tsx
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import useVisitorTracking from "./hooks/useVisitorTracking";
import CookieConsentBanner from "./components/CookieConsentBanner";
import { startEventStream } from "./lib/events";
import { startRealtimeToasts } from "./lib/toastSSE";
 // if you have it

export default function App() {
  // ---------------------------
  // 🔥 Enable visitor tracking
  // ---------------------------
  useVisitorTracking();
  
   // ---------------------------
  // 🔝 FORCE scroll to top on refresh
  // ---------------------------
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  // ---------------------------
  // 🔔 Start SSE real-time listener
  // ---------------------------
  useEffect(() => {
    const toastStream = startRealtimeToasts?.(); // ensure optional fallback

    const sse = startEventStream((msg) => {
      console.log("🔔 SSE:", msg);

      // You can trigger toast or notifications here if needed
      // Example: toast(msg.message)
    });

    return () => {
      sse?.close();
      toastStream?.close?.();
    };
  }, []);

  return (
    <>
      {/* Scroll to top on route changes */}
      <ScrollToTop />

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
