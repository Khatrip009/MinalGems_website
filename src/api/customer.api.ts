// src/api/customer.api.ts
import { apiFetch } from "./client";

export async function getProfile() {
  return apiFetch("/profile");
}

export async function updateProfile(data: any) {
  return apiFetch("/profile", {
    method: "PUT",
    body: data,
  });
}

export async function getCustomerAddresses() {
  return apiFetch("/customer/addresses");
}

export async function createAddress(data: any) {
  return apiFetch("/customer/addresses", {
    method: "POST",
    body: data,
  });
}

export async function updateAddress(id: string, data: any) {
  return apiFetch(`/customer/addresses/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteAddress(id: string) {
  return apiFetch(`/customer/addresses/${id}`, {
    method: "DELETE",
  });
}
