// src/api/account.api.ts
// =======================================================
// SYSTEM & ACCOUNT API — aligned with backend routes
// Uses apiFetch() from client.ts
// =======================================================

import { apiFetch } from "./client";

/* ======================================================
   TYPES
====================================================== */

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  public_name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  social_links: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

/* ======================================================
   USERS (ADMIN ONLY)
====================================================== */

// GET /api/users
export function listUsers(params?: {
  q?: string;
  role_id?: number;
  is_active?: boolean;
  page?: number;
  limit?: number;
}) {
  return apiFetch<{
    ok: true;
    users: User[];
    total: number;
    page: number;
    limit: number;
  }>("/system/users", {
    method: "GET",
    params,
  });
}

// GET /api/users/:id
export function getUser(id: string) {
  return apiFetch<{ ok: true; user: User }>(`/system/users/${id}`, {
    method: "GET",
  });
}

// POST /api/users
export function createUser(payload: {
  email: string;
  password: string;
  full_name?: string;
  role_id: number;
}) {
  return apiFetch<{ ok: true; user: User }>("/system/users", {
    method: "POST",
    body: payload,
  });
}

// PUT /api/users/:id
export function updateUser(
  id: string,
  payload: {
    email?: string;
    full_name?: string;
    role_id?: number;
    is_active?: boolean;
    password?: string;
  }
) {
  return apiFetch<{ ok: true; user: User }>(`/system/users/${id}`, {
    method: "PUT",
    body: payload,
  });
}

// DELETE /api/users/:id
export function deleteUser(id: string) {
  return apiFetch<{ ok: true }>(`/system/users/${id}`, {
    method: "DELETE",
  });
}

/* ======================================================
   PROFILE
====================================================== */

// GET /api/profile/me
export function getMyProfile() {
  return apiFetch<{ ok: true; profile: Profile | null }>(
    "/system/profile/me",
    { method: "GET" }
  );
}

// GET /api/profile/:slug (public)
export function getPublicProfile(slug: string) {
  return apiFetch<{ ok: true; profile: Profile }>(
    `/system/profile/${slug}`,
    { method: "GET" }
  );
}

// PUT /api/profile (create/update)
export function upsertProfile(payload: {
  public_name: string;
  slug?: string;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  social_links?: Record<string, any>;
  metadata?: Record<string, any>;
}) {
  return apiFetch<{ ok: true; profile: Profile }>(
    "/system/profile",
    {
      method: "PUT",
      body: payload,
    }
  );
}

// POST /api/profile/avatar
export function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("avatar", file);

  return apiFetch<{ ok: true; avatar_url: string }>(
    "/system/profile/avatar",
    {
      method: "POST",
      body: form,
      isFormData: true,
    }
  );
}

/* ======================================================
   SECURITY
====================================================== */

// GET /api/security/logins
export function getLoginLogs() {
  return apiFetch<{
    ok: true;
    logs: {
      ip: string;
      device: string | null;
      user_agent: string;
      location: string | null;
      timestamp: string;
    }[];
  }>("/system/security/logins", { method: "GET" });
}

// GET /api/security/alerts
export function getSecurityAlerts() {
  return apiFetch<{
    ok: true;
    alerts: {
      id: string;
      message: string;
      level: string;
      resolved: boolean;
      timestamp: string;
    }[];
  }>("/system/security/alerts", { method: "GET" });
}

/* ======================================================
   EVENTS (SSE)
====================================================== */

// GET /api/events/sse
export function connectEventsSSE(params?: {
  topics?: string[];
}) {
  const qs = params?.topics?.length
    ? `?topics=${params.topics.join(",")}`
    : "";

  return new EventSource(`/api/events/sse${qs}`, {
    withCredentials: true,
  });
}

/* ======================================================
   AUDIT (ADMIN)
====================================================== */

// GET /api/audit
export function listAuditLogs(params?: {
  table_name?: string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  return apiFetch<{
    ok: true;
    items: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>("/system/audit", {
    method: "GET",
    params,
  });
}

/* ======================================================
   APPROVALS
====================================================== */

// GET /api/approvals
export function listApprovals(params?: {
  status?: "pending" | "approved" | "rejected";
  entity_type?: string;
  limit?: number;
  offset?: number;
}) {
  return apiFetch<{
    ok: true;
    total: number;
    approvals: any[];
  }>("/system/approvals", {
    method: "GET",
    params,
  });
}

// POST /api/approvals
export function raiseApproval(payload: {
  entity_type: string;
  entity_id: string;
  reason?: string;
  metadata?: any;
}) {
  return apiFetch<{ ok: true; approval_id: string }>(
    "/system/approvals",
    {
      method: "POST",
      body: payload,
    }
  );
}

// POST /api/approvals/:id/approve
export function approveApproval(id: string, note?: string) {
  return apiFetch<{ ok: true }>(
    `/system/approvals/${id}/approve`,
    {
      method: "POST",
      body: { note },
    }
  );
}

// POST /api/approvals/:id/reject
export function rejectApproval(
  id: string,
  payload?: { reason?: string; note?: string }
) {
  return apiFetch<{ ok: true }>(
    `/system/approvals/${id}/reject`,
    {
      method: "POST",
      body: payload,
    }
  );
}

/* ======================================================
   BARCODE / PDF
====================================================== */

// POST /api/barcode/packet-labels/pdf
export function generatePacketLabelsPDF(packets: any[]) {
  return apiFetch<Blob>("/system/barcode/packet-labels/pdf", {
    method: "POST",
    body: { packets },
    responseType: "blob",
  });
}
