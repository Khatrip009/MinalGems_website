// src/api/notifications.api.ts
import { apiFetch } from "./client";

/**
 * GET /api/crm/notifications
 */
export async function getNotifications() {
  return apiFetch<{ ok: boolean; notifications: any[] }>("/crm/notifications");
}
