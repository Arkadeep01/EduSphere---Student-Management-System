import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Authenticating... — EduSphere" }] }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { user, loading, refreshSession } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying your session...");

  useEffect(() => {
    const checkSession = async () => {
      setStatus("Checking authentication...");
      try {
        await refreshSession();
      } catch {
        setStatus("Authentication failed. Redirecting...");
        setTimeout(() => navigate({ to: "/login" }), 2000);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        setStatus(`Welcome, ${user.first_name || user.email}! Redirecting...`);
        const redirectMap: Record<string, string> = {
          admin: "/admin/dashboard",
          teacher: "/teacher/dashboard",
          student: "/student/dashboard",
        };
        const target = redirectMap[user.role] || "/student/dashboard";
        setTimeout(() => navigate({ to: target }), 500);
      } else {
        setStatus("Not authenticated. Redirecting to login...");
        setTimeout(() => navigate({ to: "/login" }), 2000);
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
