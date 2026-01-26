// src/api/customer.api.ts
import { apiFetch } from "./client";

/* =====================================================
 * CUSTOMER / PROFILE
 * ===================================================== */

/**
 * GET /api/system/profile/me
 * (Fetch logged-in customer profile)
 */
export async function getCustomer() {
  return apiFetch("/system/profile/me");
}

/**
 * PUT /api/system/profile
 * (Update customer profile)
 */
export async function updateCustomer(data: any) {
  return apiFetch("/system/profile", {
    method: "PUT",
    body: data,
  });
}

/* -----------------------------------------------------
 * Aliases (safe)
 * ----------------------------------------------------- */
export const getProfile = getCustomer;
export const updateProfile = updateCustomer;

/* =====================================================
 * CUSTOMER ADDRESSES
 * ===================================================== */

export async function getCustomerAddresses() {
  return apiFetch("/customer-addresses");
}

export async function createAddress(data: any) {
  return apiFetch("/customer-addresses", {
    method: "POST",
    body: data,
  });
}

export async function updateAddress(id: string, data: any) {
  return apiFetch(`/customer-addresses/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteAddress(id: string) {
  return apiFetch(`/customer-addresses/${id}`, {
    method: "DELETE",
  });
}
