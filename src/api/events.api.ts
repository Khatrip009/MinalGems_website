// src/api/events.api.ts
import { API_BASE_URL } from "./client";

export function connectEventsSource(topics?: string[]): EventSource {
  const base = API_BASE_URL || window.location.origin;

  const url = new URL("/events/sse", base);

  if (topics?.length) {
    url.searchParams.set("topics", topics.join(","));
  }

  return new EventSource(url.toString());
}
