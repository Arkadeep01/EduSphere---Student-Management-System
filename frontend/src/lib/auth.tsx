import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./mock-data";

interface AuthUser {
  name: string;
  email: string;
  role: Role;
  avatarInitials: string;
}

interface AuthCtx {
  user: AuthUser | null;
  login: (email: string, role: Role) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "edusphere_user";

const defaults: Record<Role, AuthUser> = {
  admin: { name: "Alex Morgan", email: "admin@edusphere.edu", role: "admin", avatarInitials: "AM" },
  teacher: { name: "Dr. Anika Rao", email: "teacher@edusphere.edu", role: "teacher", avatarInitials: "AR" },
  student: { name: "Aarav Sharma", email: "student@edusphere.edu", role: "student", avatarInitials: "AS" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  const login = (email: string, role: Role) => {
    const u = { ...defaults[role], email: email || defaults[role].email };
    setUser(u);
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(u));
  };
  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") localStorage.removeItem(KEY);
  };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = (localStorage.getItem("edusphere_theme") as "light" | "dark" | null) ?? "light";
    setTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
  }, []);
  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    if (typeof window !== "undefined") localStorage.setItem("edusphere_theme", next);
  };
  return { theme, toggle };
}
