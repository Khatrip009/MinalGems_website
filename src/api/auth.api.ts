// src/api/auth.api.ts
import { apiFetch } from "./client";
import type { User } from "./types";

type AuthResponse = {
  ok: boolean;
  user: User | null;
  token: string;
  error?: string;
};

// LOGIN
export async function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

// LOGOUT
export async function logout() {
  return apiFetch<{ ok: boolean }>("/auth/logout", {
    method: "POST",
  });
}

// REFRESH
export async function refresh() {
  return apiFetch<AuthResponse>("/auth/refresh", {
    method: "POST",
    skipAuthLogout: true, // ✅ CRITICAL
  });
}

