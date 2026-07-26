import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import {
  Eye, EyeOff, Sparkles, Shield, GraduationCap, FileText, Loader2, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth, getSafeRedirect } from "@/context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const API_BASE = "http://localhost:8000";

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
    setEmail("");
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
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-brand p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow opacity-30" />
        <div className="relative"><Logo invert /></div>
        <div className="relative">
          <Sparkles className="h-10 w-10 mb-6 opacity-80" />
          <h2 className="text-4xl font-bold leading-tight">
            Faculty Portal
          </h2>
          <p className="mt-4 text-white/80 max-w-md">
            Sign in as Teacher, Staff, or Administrator.
          </p>
        </div>
        <div className="relative text-sm text-white/70">2026 EduSphere</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
        <Card className="w-full max-w-md shadow-elegant border-0">
          <CardContent className="p-8">
            <div className="lg:hidden mb-6"><Logo /></div>
            <h1 className="text-2xl font-bold">Faculty Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select your role to continue.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
              {facultyRoles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleChange(r.id)}
                  className={cn(
                    "py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 transition-all",
                    role === r.id
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <r.icon className="h-3.5 w-3.5" />{r.label}
                </button>
              ))}
            </div>

            <form className="mt-6 space-y-4" onSubmit={handle} method="POST">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`${role}@edusphere.edu`}
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={show ? "text" : "password"}
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {displayError && (
                <p className="text-sm text-destructive">
                  {displayError}
                  {search.error === "role_mismatch" && search.label && search.label.toLowerCase() === "student" && (
                    <> Please use the Student login.</>
                  )}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-brand border-0 hover:opacity-90"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Sign in
              </Button>
            </form>

            {role === "teacher" && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-xs text-muted-foreground">or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => window.location.href = `${API_BASE}/api/oauth/init/google/?role=teacher`}
                    className="flex items-center gap-2"
                  >
                    <FcGoogle className="h-5 w-5" />Google
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => window.location.href = `${API_BASE}/api/oauth/init/github/?role=teacher`}
                    className="flex items-center gap-2"
                  >
                    <FaGithub className="h-5 w-5" />GitHub
                  </Button>
                </div>
              </>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link to="/login" className="text-primary hover:underline font-medium">
                <User className="h-3.5 w-3.5 inline mr-1" />Student Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
