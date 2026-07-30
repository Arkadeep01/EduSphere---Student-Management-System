import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FuturisticLoginLayout } from "@/components/login/FuturisticLoginLayout";
import { Eye, EyeOff, Loader2, Shield, GraduationCap, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth, getSafeRedirect } from "@/context/AuthContext";
import { API_BASE } from "@/services/request";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export const Route = createFileRoute("/login/faculty")({
  head: () => ({ meta: [{ title: "Faculty Sign in — EduSphere" }] }),
  validateSearch: (search: Record<string, string | undefined>) => ({
    error: search.error as string | undefined,
    actual_role: search.actual_role as string | undefined,
    label: search.label as string | undefined,
  }),
  component: FacultyLoginPage,
});

interface RoleOption {
  id: string;
  label: string;
  icon: typeof Shield;
}

const facultyRoles: RoleOption[] = [
  { id: "teacher", label: "Teacher", icon: GraduationCap },
  { id: "staff", label: "Staff", icon: FileText },
  { id: "admin", label: "Admin", icon: Shield },
];

const ERROR_MESSAGES: Record<string, string> = {
  account_not_found: "No institutional account was found for this email. Please contact your institution.",
  role_mismatch: "This email is registered as a different account type.",
  oauth_failed: "Google sign-in could not be completed. Please try again.",
};

function FacultyLoginPage() {
  const { login, error, clearError } = useAuth();
  const search = Route.useSearch();
  const [role, setRole] = useState("teacher");
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleRoleChange = (r: string) => {
    setRole(r);
    setPwd("");
    clearError();
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      const user = await login({ email, password: pwd, selected_role: role });
      toast.success(`Welcome back, ${user.first_name || user.email}!`);
      const returnTo = sessionStorage.getItem("returnTo");
      sessionStorage.removeItem("returnTo");
      navigate({ to: getSafeRedirect(user, returnTo) as any });
    } catch (err: any) {
      if (err?.needs_activation) {
        navigate({ to: "/force-password-change" });
        return;
      }
      const message = err instanceof Error ? err.message : "Login failed.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const urlError = search.error ? (ERROR_MESSAGES[search.error] || "Authentication failed.") : null;
  const displayError = urlError || error;

  return (
    <FuturisticLoginLayout
      heading="Faculty Portal"
      subtitle="Sign in as Teacher, Staff, or Administrator."
      pageTitle="Faculty Login"
    >
      <div className="grid grid-cols-3 gap-1 p-1 bg-muted/50 rounded-lg border border-border/30">
        {facultyRoles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => handleRoleChange(r.id)}
            className={cn(
              "py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 transition-all",
              role === r.id
                ? "bg-background/80 shadow-sm border border-primary/20 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/30 border border-transparent",
            )}
          >
            <r.icon className="h-3.5 w-3.5" />{r.label}
          </button>
        ))}
      </div>

      <form className="mt-6 space-y-3" onSubmit={handle} method="POST">
        <div className="space-y-2">
          <Label htmlFor="faculty-email">Email</Label>
          <Input
            id="faculty-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`${role}@edusphere.edu`}
            required
            autoComplete="email"
            className="bg-background/40 border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="faculty-password">Password</Label>
          <div className="relative">
            <Input
              id="faculty-password"
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
        {displayError && (
          <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
            {displayError}
            {search.error === "role_mismatch" && search.label && search.label.toLowerCase() === "student" && (
              <> Please use the Student login.</>
            )}
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

      {role === "teacher" && (
        <>
          <div className="flex items-center w-full my-4">
            <div className="flex-1 border-t border-border/50"></div>
            <span className="px-3 text-xs text-muted-foreground whitespace-nowrap">or continue with</span>
            <div className="flex-1 border-t border-border/50"></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => window.location.href = `${API_BASE}/api/oauth/init/google/?role=teacher`}
              className="flex items-center gap-2 bg-background/40 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all"
            >
              <FcGoogle className="h-5 w-5" />Google
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => window.location.href = `${API_BASE}/api/oauth/init/github/?role=teacher`}
              className="flex items-center gap-2 bg-background/40 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all"
            >
              <FaGithub className="h-5 w-5" />GitHub
            </Button>
          </div>
        </>
      )}

    </FuturisticLoginLayout>
  );
}