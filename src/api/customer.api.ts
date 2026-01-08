// src/api/customer.api.ts
import { apiFetch } from "./client";

/* =====================================================
 * PROFILE
 * ===================================================== */

/**
 * GET /api/system/profile
 */
export async function getProfile() {
  return apiFetch("/system/profile");
}

/**
 * PUT /api/system/profile
 */
export async function updateProfile(data: any) {
  return apiFetch("/system/profile", {
    method: "PUT",
    body: data,
  });
}

/* =====================================================
 * CUSTOMER ADDRESSES
 * ===================================================== */

/**
 * GET /api/customer-addresses
 */
export async function getCustomerAddresses() {
  return apiFetch("/customer-addresses");
}

/**
 * POST /api/customer-addresses
 */
export async function createAddress(data: any) {
  return apiFetch("/customer-addresses", {
    method: "POST",
    body: data,
  });
}

/**
 * PUT /api/customer-addresses/:id
 */
export async function updateAddress(id: string, data: any) {
  return apiFetch(`/customer-addresses/${id}`, {
    method: "PUT",
    body: data,
  });
}

/**
 * DELETE /api/customer-addresses/:id
 */
export async function deleteAddress(id: string) {
  return apiFetch(`/customer-addresses/${id}`, {
    method: "DELETE",
  });
}
