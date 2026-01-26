// src/context/AuthContext.tsx
import React,
  {
    createContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
  } from "react";

import {
  login as apiLogin,
  logout as apiLogout,
  refresh,
} from "../api/auth.api";
import type { User } from "../api/types";

export interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ------------------------------------
  // Hydrate auth state from localStorage
  // ------------------------------------
  useEffect(() => {
    const cached = localStorage.getItem("auth_user");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        setIsLoggedIn(true);
      } catch {
        // ignore corrupt cache
      }
    }
    setIsLoading(false);
  }, []);

  // ----------------------
  // LOGIN
  // ----------------------
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await apiLogin(email, password); // POST /auth/login

        if (res.ok && res.user) {
          if (res.token) {
            localStorage.setItem("auth_token", res.token);
          }
          localStorage.setItem("auth_user", JSON.stringify(res.user));

          setUser(res.user);
          setIsLoggedIn(true);

          return { ok: true as const };
        }

        return {
          ok: false as const,
          error:
            (res as any)?.error === "invalid_credentials"
              ? "Invalid email or password."
              : (res as any)?.error || "Login failed.",
        };
      } catch (err: any) {
        console.error("Login failed:", err);
        return {
          ok: false as const,
          error: err?.message || "Login failed. Please try again.",
        };
      }
    },
    []
  );

  // ----------------------
  // LOGOUT
  // ----------------------
  const handleLogout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout request failed (ignoring):", err);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoggedIn,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}