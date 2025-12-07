// src/api/notifications.api.ts
import { apiFetch } from "./client";

export async function getNotifications() {
  return apiFetch("/notifications");
}
