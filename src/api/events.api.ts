// src/api/events.api.ts
import { API_BASE_URL } from "./client";

/**
 * Connect to Server-Sent Events (SSE)
 * Backend: /api/system/events/sse
 */
export function connectEventsSource(topics?: string[]): EventSource {
  const base = API_BASE_URL || window.location.origin;

  const url = new URL("/system/events/sse", base);

  if (topics?.length) {
    url.searchParams.set("topics", topics.join(","));
  }

  return new EventSource(url.toString(), {
    withCredentials: true,
  });
}
