import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth, getSafeRedirect } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const API_BASE = "http://localhost:8000";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Authenticating... — EduSphere" }] }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { user, loading, refreshSession } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying your session...");
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    const exchangeSession = async () => {
      setStatus("Completing authentication...");
      try {
        const res = await fetch(`${API_BASE}/api/oauth/callback/`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (data.success) {
          if (data.access && data.refresh) {
            localStorage.setItem("accessToken", data.access);
            localStorage.setItem("refreshToken", data.refresh);
          }
          await refreshSession();
        } else {
          setStatus("Authentication failed. Redirecting...");
          setTimeout(() => navigate({ to: "/login" }), 2000);
        }
      } catch {
        try {
          await refreshSession();
        } catch {
          setStatus("Authentication failed. Redirecting...");
          setTimeout(() => navigate({ to: "/login" }), 2000);
        }
      }
    };
    exchangeSession();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        setStatus(`Welcome, ${user.first_name || user.email}! Redirecting...`);
        const returnTo = sessionStorage.getItem("returnTo");
        sessionStorage.removeItem("returnTo");
        const target = getSafeRedirect(user, returnTo);
        setTimeout(() => navigate({ to: target as any }), 500);
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
