import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FuturisticLoginLayout } from "@/components/login/FuturisticLoginLayout";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth, getSafeRedirect } from "@/context/AuthContext";

export const Route = createFileRoute("/login/director")({
  head: () => ({ meta: [{ title: "Director Sign in — EduSphere" }] }),
  validateSearch: (search: Record<string, string | undefined>) => ({
    error: search.error as string | undefined,
    actual_role: search.actual_role as string | undefined,
    label: search.label as string | undefined,
  }),
  component: DirectorLoginPage,
});

function DirectorLoginPage() {
  const { login, error, clearError } = useAuth();
  const search = Route.useSearch() as { error?: string; actual_role?: string; label?: string };
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      const user = await login({ email, password: pwd, selected_role: "director" });
      toast.success(`Welcome back, ${user.first_name || user.email}!`);
      const returnTo = sessionStorage.getItem("returnTo");
      sessionStorage.removeItem("returnTo");
      navigate({ to: getSafeRedirect(user, returnTo) as any });
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "Login failed.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FuturisticLoginLayout
      heading="Director Portal"
      subtitle="Sign in to access the director dashboard."
      pageTitle="Director Login"
    >
      <form className="space-y-3" onSubmit={handle} method="POST">
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-background/40 px-3 py-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Director-only access
        </div>
        <div className="space-y-2">
          <Label htmlFor="director-email">Email</Label>
          <Input
            id="director-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="director@edusphere.edu.in"
            required
            autoComplete="email"
            className="bg-background/40 border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="director-password">Password</Label>
          <div className="relative">
            <Input
              id="director-password"
              type={show ? "text" : "password"}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
              autoComplete="current-password"
              className="bg-background/40 border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {search.error && !error && (
          <p className="text-sm text-destructive" role="alert">
            {search.error}
          </p>
        )}
        <Button
          type="submit"
          className="w-full bg-gradient-brand border-0 hover:opacity-90 transition-all glow-primary"
          disabled={submitting}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Sign In
        </Button>
      </form>
    </FuturisticLoginLayout>
  );
}
