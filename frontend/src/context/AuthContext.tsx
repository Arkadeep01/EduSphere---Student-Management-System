import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

const API_BASE = "http://localhost:8000";
const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "teacher" | "admin" | "staff";
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

interface LoginParams {
  email: string;
  password: string;
  portal?: string;
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
}

function getRoleRedirect(role: string): string {
  switch (role) {
    case "admin": return "/admin/dashboard";
    case "teacher": return "/teacher/dashboard";
    case "student": return "/student/dashboard";
    case "staff": return "/staff/dashboard";
    default: return "/login";
  }
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
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/me/`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const body = { email: params.email, password: params.password, portal: params.portal || "student" };
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
      await fetch(`${API_BASE}/api/logout/`, {
        method: "POST",
        credentials: "include",
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

  return (
    <Ctx.Provider
      value={{ user, loading, error, login, register, logout, refreshSession, clearError }}
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
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);
  return { user, loading };
}

export function useRequireRole(role: User["role"]) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
    else if (!loading && user && user.role !== role) navigate({ to: getRoleRedirect(user.role) });
  }, [user, loading, role, navigate]);
  return { user, loading, authorized: !loading && !!user && user.role === role };
}
