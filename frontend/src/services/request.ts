const API_BASE = "http://localhost:8000";
const ADMIN_API_BASE = "http://localhost:8000/api/admin";
const STAFF_API_BASE = "http://localhost:8000/api/staff";
const STUDENT_API_BASE = "http://localhost:8000/api/student";
const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

function storeTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    const data = await res.json();
    if (data.access) {
      storeTokens(data.access, data.refresh || refresh);
      return data.access;
    }
    return null;
  } catch {
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
  baseUrl?: string,
): Promise<T> {
  const base = baseUrl || ADMIN_API_BASE;
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options?.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let res = await fetch(`${base}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${base}${endpoint}`, { ...options, headers });
    } else {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export { request, API_BASE, ADMIN_API_BASE, STAFF_API_BASE, STUDENT_API_BASE };
