const ADMIN_API_BASE = "http://localhost:8000/api/admin";
const STUDENT_API_BASE = "http://localhost:8000/api/student";

function getToken(): string | null {
  return localStorage.getItem("accessToken");
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
  baseUrl?: string
): Promise<T> {
  const base = baseUrl || ADMIN_API_BASE;
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options?.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${base}${endpoint}`, { ...options, headers });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export { request, ADMIN_API_BASE, STUDENT_API_BASE };
