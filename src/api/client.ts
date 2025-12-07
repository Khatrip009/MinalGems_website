// =====================================================
// CLIENT API — Core HTTP Wrapper for All Frontend APIs
// =====================================================
//
// ENV examples:
//   VITE_API_BASE_URL = "http://localhost:4500"
//   VITE_API_BASE_URL = "http://localhost:4500/api"
// Both will normalize to: http://localhost:4500/api
// =====================================================


// -----------------------------------------------------
// NORMALIZE API BASE URL
// -----------------------------------------------------
let base = (import.meta.env.VITE_API_BASE_URL || "").trim();

// Remove trailing slashes
base = base.replace(/\/+$/, "");

// Remove existing /api to avoid duplicate /api/api
base = base.replace(/\/api$/, "");

// Final base ALWAYS ends with /api
export const API_BASE_URL = base + "/api";

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL="https://apiminalgems.exotech.co.in";

// -----------------------------------------------------
// VISITOR ID HANDLING
// -----------------------------------------------------
function getVisitorId(): string {
  let id = localStorage.getItem("visitor_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitor_id", id);
  }

  return id;
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
  if (token) localStorage.setItem("auth_token", token);
  else localStorage.removeItem("auth_token");
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
export async function apiFetch<T>(
  path: string,
  options: RequestInit & { body?: any } = {}
): Promise<T> {

  const url = buildUrl(path);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  // Add JWT token
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Always include visitor ID
  headers["x-visitor-id"] = getVisitorId();

  // Body handling
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
      credentials: "include",
      headers,
      body: bodyToSend,
    });
  } catch (err) {
    console.error("🌐 Network error:", err);
    throw new Error("Network error — please check your internet/server.");
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
    localStorage.removeItem("auth_user");
    throw new Error("unauthorized");
  }

  // Other errors
  if (!response.ok) {
    throw new Error(data?.error || "API request failed");
  }

  return data;
}
