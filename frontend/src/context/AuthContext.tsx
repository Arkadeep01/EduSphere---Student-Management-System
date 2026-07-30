import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { API_BASE } from "@/services/request";

const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "teacher" | "admin" | "staff" | "director";
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  password_changed: boolean;
  needs_activation: boolean;
  date_joined: string;
}

interface LoginParams {
  email: string;
  password: string;
  selected_role?: string;
}

interface RegisterParams {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  role: "student" | "teacher";
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (params: LoginParams) => Promise<User>;
  register: (params: RegisterParams) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  changeTempPassword: (newPassword: string) => Promise<void>;
}

export function getRoleRedirect(role: string): string {
  switch (role) {
    case "admin": return "/admin/dashboard";
    case "teacher": return "/teacher/dashboard";
    case "student": return "/student/dashboard";
    case "staff": return "/staff/dashboard";
    case "director": return "/director/dashboard";
    default: return "/login";
  }
}

export function getRouteRole(pathname: string): User["role"] | null {
  const match = pathname.match(/^\/(admin|teacher|student|staff|director)\//);
  return match ? (match[1] as User["role"]) : null;
}

export function isAuthorizedForRoute(user: User, pathname: string): boolean {
  const routeRole = getRouteRole(pathname);
  return routeRole ? user.role === routeRole : false;
}

export function getSafeRedirect(user: User, returnTo: string | null): string {
  if (returnTo && isAuthorizedForRoute(user, returnTo)) {
    return returnTo;
  }
  return getRoleRedirect(user.role);
}

function storeTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}/api/me/`, {
        headers,
        credentials: "include",
      });
      const data = await res.json();
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
        clearTokens();
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (params: LoginParams) => {
    setLoading(true);
    setError(null);
    try {
      const body = { email: params.email, password: params.password, selected_role: params.selected_role || "student" };
      const res = await fetch(`${API_BASE}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        storeTokens(data.access, data.refresh);
        setUser(data.user);
        return data.user;
      }
      if (data.needs_activation) {
        const err = new Error("needs_activation");
        (err as any).needs_activation = true;
        setError(data.message || "You must change your temporary password.");
        throw err;
      }
      const msg = data.message || "Login failed.";
      setError(msg);
      throw new Error(msg);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (params: RegisterParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        return data.user;
      }
      const msg = data.message || "Registration failed.";
      setError(msg);
      throw new Error(msg);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const refresh = localStorage.getItem(REFRESH_KEY);
      await fetch(`${API_BASE}/api/logout/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      clearTokens();
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const changeTempPassword = useCallback(async (newPassword: string) => {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE}/api/force-password-change/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ new_password: newPassword, new_password2: newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      storeTokens(data.access, data.refresh);
      setUser(data.user);
      return;
    }
    throw new Error(data.error || "Password change failed.");
  }, []);

  return (
    <Ctx.Provider
      value={{ user, loading, error, login, register, logout, refreshSession, clearError, changeTempPassword }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const returnTo = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem("returnTo", returnTo);
    }
  }, [user, loading, returnTo]);
  return { user, loading, authenticated: !loading && !!user };
}

export function useRequireRole(role: User["role"]) {
  const { user, loading } = useAuth();
  const returnTo = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem("returnTo", returnTo);
    }
  }, [user, loading, returnTo, role]);
  return { user, loading, authorized: !loading && !!user && user.role === role };
}
