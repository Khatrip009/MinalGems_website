// src/lib/events.ts

const API_BASE =
  import.meta.env.VITE_API_URL || "https://apiminalgems.exotech.co.in";

export function startEventStream(onMessage: (data: any) => void) {
  const topics = ["notifications", "orders", "new_arrivals"].join(",");

  const url = `${API_BASE}/api/system/events/sse?topics=${topics}`;

  console.log("🔗 Connecting to SSE:", url);

  const es = new EventSource(url, { withCredentials: true });

  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onMessage(data);
    } catch {
      console.log("SSE message:", e.data);
    }
  };

  es.addEventListener("connected", (e) => {
    console.log("🔥 SSE Connected:", e.data);
  });

  es.onerror = (err) => {
    console.warn("❌ SSE error", err);
  };

  return es;
}
