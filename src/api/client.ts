// =====================================================
// CLIENT API — Core HTTP Wrapper for All Frontend APIs
// =====================================================
//
// ENV examples:
//   VITE_API_BASE_URL = "http://localhost:4500"
//   VITE_API_BASE_URL = "http://localhost:4500/api"
//   VITE_API_BASE_URL = "https://apiminalgems.exotech.co.in"
// All will normalize to: <base>/api
// =====================================================

// -----------------------------------------------------
// NORMALIZE API BASE URL
// -----------------------------------------------------
let base = (import.meta.env.VITE_API_BASE_URL || "").trim();

// Fallback if env is missing
if (!base) {
  base = "https://apiminalgems.exotech.co.in";
}

// Remove trailing slashes
base = base.replace(/\/+$/, "");

// Remove existing /api to avoid duplicate /api/api
base = base.replace(/\/api$/, "");

// Final base ALWAYS ends with /api
export const API_BASE_URL = `${base}/api`;

export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:4500/api";

// -----------------------------------------------------
// VISITOR ID HANDLING
// -----------------------------------------------------
function getVisitorId(): string {
  try {
    let id = localStorage.getItem("visitor_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("visitor_id", id);
    }
    return id;
  } catch {
    // If localStorage not available
    return "anonymous";
  }
}

// -----------------------------------------------------
// TOKEN HANDLING
// -----------------------------------------------------
function getToken(): string | null {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  } catch {
    // ignore storage errors
  }
}

// -----------------------------------------------------
// URL BUILDER
// -----------------------------------------------------
function buildUrl(path: string): string {
  if (!path.startsWith("/")) path = "/" + path;
  return API_BASE_URL + path;
}

// -----------------------------------------------------
// MAIN API FETCH WRAPPER
// -----------------------------------------------------
//
// NOTE: `options` is intentionally typed as `any` to avoid
// fighting with RequestInit.body vs our typed payloads in TS.
export async function apiFetch<T>(
  path: string,
  options: any = {}
): Promise<T> {
  const url = buildUrl(path);

  // Start from any existing headers passed in
  const headers = new Headers(options.headers || {});

  // Ensure JSON content-type unless caller overrides intentionally
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Add JWT token
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Always include visitor ID
  headers.set("x-visitor-id", getVisitorId());

  // Body handling — we accept plain objects and strings
  let bodyToSend: any = undefined;
  if (options.body !== undefined) {
    bodyToSend =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      // Always send cookies (for session-based or mixed auth)
      credentials: "include",
      headers,
      body: bodyToSend,
    });
  } catch (err) {
    console.error("🌐 Network error:", err);
    throw new Error("Network error — please check your internet or server.");
  }

  // Parse JSON safely
  let data: any;
  try {
    data = await response.json();
  } catch {
    console.warn("⚠ API did not return JSON:", url);
    throw new Error("Invalid JSON response from server");
  }

  // Handle expired session
  if (response.status === 401) {
    setToken(null);
    try {
      localStorage.removeItem("auth_user");
    } catch {}
    throw new Error("unauthorized");
  }

  // Other errors
  if (!response.ok) {
    // If backend returns { ok:false, error:"..." }
    throw new Error(data?.error || "API request failed");
  }

  return data as T;
}
