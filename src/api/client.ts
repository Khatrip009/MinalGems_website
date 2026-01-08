// =====================================================
// CLIENT API — Core HTTP Wrapper (FIXED)
// =====================================================

// -----------------------------------------------------
// NORMALIZE API BASE URL
// -----------------------------------------------------
let base = (import.meta.env.VITE_API_BASE_URL || "").trim();

if (!base) {
  base = "https://apiminalgems.exotech.co.in";
}

// Remove trailing slashes
base = base.replace(/\/+$/, "");

// Remove existing /api
base = base.replace(/\/api$/, "");

// FINAL BASE — ALWAYS /api
export const API_BASE_URL = `${base}/api`;

// -----------------------------------------------------
// VISITOR ID
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
  } catch {}
}

// -----------------------------------------------------
// URL BUILDER
// -----------------------------------------------------
function buildUrl(path: string): string {
  if (!path.startsWith("/")) path = "/" + path;
  return API_BASE_URL + path;
}

// -----------------------------------------------------
// MAIN FETCH WRAPPER
// -----------------------------------------------------
export async function apiFetch<T>(
  path: string,
  options: any = {}
): Promise<T> {
  const url = buildUrl(path);
  const method = (options.method || "GET").toUpperCase();

  const headers = new Headers(options.headers || {});

  // Set JSON header ONLY when body is plain object
  const isFormData = options.body instanceof FormData;

  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  // Auth token
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Visitor ID (analytics)
  headers.set("x-visitor-id", getVisitorId());

  // Body handling
  let bodyToSend: any = undefined;

  if (options.body !== undefined && method !== "GET") {
    bodyToSend = isFormData
      ? options.body
      : typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      method,
      credentials: "include",
      headers,
      body: bodyToSend,
    });
  } catch (err) {
    console.error("🌐 Network error:", err);
    throw new Error("network_error");
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    throw new Error("invalid_json_response");
  }

  // Unauthorized → force logout
  if (response.status === 401) {
    setToken(null);
    try {
      localStorage.removeItem("auth_user");
    } catch {}
    throw new Error("unauthorized");
  }

  // Other errors
  if (!response.ok) {
    const err = new Error(data?.error || "api_error") as any;
    err.status = response.status;
    err.payload = data;
    throw err;
  }

  return data as T;
}
