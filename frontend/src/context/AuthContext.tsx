import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

const API_BASE = "http://localhost:8000";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "teacher" | "admin";
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

const MOCK_CREDENTIALS: Record<string, { password: string; user: User }> = {
  "admin@edusphere.edu": {
    password: "admin123",
    user: { id: 1, email: "admin@edusphere.edu", first_name: "Alex", last_name: "Morgan", role: "admin", is_active: true, is_staff: true, is_superuser: true, date_joined: "2026-01-01" },
  },
  "teacher@edusphere.edu": {
    password: "teacher123",
    user: { id: 2, email: "teacher@edusphere.edu", first_name: "Anika", last_name: "Rao", role: "teacher", is_active: true, is_staff: true, is_superuser: false, date_joined: "2026-01-01" },
  },
  "student@edusphere.edu": {
    password: "student123",
    user: { id: 3, email: "student@edusphere.edu", first_name: "Aarav", last_name: "Sharma", role: "student", is_active: true, is_staff: false, is_superuser: false, date_joined: "2026-01-01" },
  },
};

interface LoginParams {
  email: string;
  password: string;
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
    case "admin":
      return "/admin/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    case "student":
      return "/student/dashboard";
    default:
      return "/login";
  }
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/me/`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      const raw = localStorage.getItem("edusphere_mock_user");
      if (raw) {
        try { setUser(JSON.parse(raw)); } catch { setUser(null); }
      } else {
        setUser(null);
      }
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
      const entry = MOCK_CREDENTIALS[params.email];
      if (entry) {
        if (entry.password !== params.password) {
          const msg = "Invalid email or password.";
          setError(msg);
          throw new Error(msg);
        }
        setUser(entry.user);
        localStorage.setItem("edusphere_mock_user", JSON.stringify(entry.user));
        return entry.user;
      }
      const res = await fetch(`${API_BASE}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return data.user;
      } else {
        setError(data.message);
        throw new Error(data.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
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
        setUser(data.user);
        return data.user;
      } else {
        setError(data.message);
        throw new Error(data.message);
      }
    } catch (err) {
      const newUser: User = {
        id: Date.now(),
        email: params.email,
        first_name: params.first_name,
        last_name: params.last_name,
        role: params.role,
        is_active: true,
        is_staff: false,
        is_superuser: false,
        date_joined: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem("edusphere_mock_user", JSON.stringify(newUser));
      return newUser;
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
      localStorage.removeItem("edusphere_mock_user");
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
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  return { user, loading };
}

export function useRequireRole(role: "student" | "teacher" | "admin") {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    } else if (!loading && user && user.role !== role) {
      navigate({ to: getRoleRedirect(user.role) });
    }
  }, [user, loading, role, navigate]);

  return { user, loading, authorized: !loading && !!user && user.role === role };
}
