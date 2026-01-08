// src/api/leads.api.ts
// Frontend helpers for Leads & Lead Notes

import { apiFetch } from "./client";

/* -------------------- Types -------------------- */

export type LeadStatus = "new" | "contacted" | "qualified" | "lost" | string;

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  product_interest: string | null;
  message: string | null;
  status: LeadStatus;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  note: string;
  created_at: string;
  updated_at?: string;
}

export interface ListLeadsParams {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ListLeadsResponse {
  ok: boolean;
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface LeadDetailResponse {
  ok: boolean;
  lead: Lead;
}

export interface LeadNotesResponse {
  ok: boolean;
  notes: LeadNote[];
}

/* -------------------- Public create (contact form) -------------------- */
/* POST /api/crm/leads */

export interface CreateLeadPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  product_interest?: string;
  message?: string;
  source?: string; // e.g. "contact_form", "landing_page"
}

export async function createLeadPublic(
  payload: CreateLeadPayload
): Promise<{ ok: boolean; lead?: Lead; error?: string }> {
  return apiFetch("/crm/leads", {
    method: "POST",
    body: payload,
  });
}

/* -------------------- Admin / Manager APIs -------------------- */
/* Base: /api/crm/leads */

export async function listLeads(
  params: ListLeadsParams = {}
): Promise<ListLeadsResponse> {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.status) searchParams.set("status", params.status);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = query ? `/crm/leads?${query}` : "/crm/leads";

  return apiFetch<ListLeadsResponse>(url, { method: "GET" });
}

export async function getLead(id: string): Promise<LeadDetailResponse> {
  return apiFetch<LeadDetailResponse>(`/crm/leads/${id}`, {
    method: "GET",
  });
}

export interface UpdateLeadPayload {
  name?: string;
  email?: string;
  phone?: string | null;
  company?: string | null;
  country?: string | null;
  product_interest?: string | null;
  message?: string | null;
  status?: LeadStatus;
  source?: string | null;
}

export async function updateLead(
  id: string,
  payload: UpdateLeadPayload
): Promise<LeadDetailResponse> {
  return apiFetch<LeadDetailResponse>(`/crm/leads/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteLead(
  id: string
): Promise<{ ok: boolean; message?: string; error?: string }> {
  return apiFetch(`/crm/leads/${id}`, {
    method: "DELETE",
  });
}

/* -------------------- Notes APIs -------------------- */
/* /api/crm/leads/:id/notes */

export async function getLeadNotes(
  leadId: string
): Promise<LeadNotesResponse> {
  return apiFetch<LeadNotesResponse>(`/crm/leads/${leadId}/notes`, {
    method: "GET",
  });
}

export async function addLeadNote(
  leadId: string,
  note: string
): Promise<{ ok: boolean; note?: LeadNote; error?: string }> {
  return apiFetch(`/crm/leads/${leadId}/notes`, {
    method: "POST",
    body: { note },
  });
}

// Backward compatibility alias (public contact form)
export const createLead = createLeadPublic;
