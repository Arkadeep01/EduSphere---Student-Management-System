import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import {
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  GraduationCap,
  User,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/mock-data";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — EduSphere" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, error, clearError } = useAuth();
  const [role, setRole] = useState<Role>("student");
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
      const user = await login({ email, password: pwd });
      toast.success(`Welcome back, ${user.first_name || user.email}!`);
      const redirectMap: Record<string, string> = {
        admin: "/admin/dashboard",
        teacher: "/teacher/dashboard",
        student: "/student/dashboard",
      };
      navigate({ to: redirectMap[user.role] || "/student/dashboard" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const roles: { id: Role; label: string; icon: typeof Shield }[] = [
    { id: "student", label: "Student", icon: User },
    { id: "teacher", label: "Teacher", icon: GraduationCap },
    { id: "admin", label: "Admin", icon: Shield },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-brand p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow opacity-30" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative">
          <Sparkles className="h-10 w-10 mb-6 opacity-80" />
          <h2 className="text-4xl font-bold leading-tight">
            A modern home for your school.
          </h2>
          <p className="mt-4 text-white/80 max-w-md">
            Everything you need to run, learn, and lead — in one platform.
          </p>
        </div>
        <div className="relative text-sm text-white/70">2026 EduSphere</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
        <Card className="w-full max-w-md shadow-elegant border-0">
          <CardContent className="p-8">
            <div className="lg:hidden mb-6">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold">Sign in to your account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your credentials to continue.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 transition-all",
                    role === r.id
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <r.icon className="h-3.5 w-3.5" />
                  {r.label}
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
                  placeholder="admin@edusphere.edu"
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
                    placeholder=""
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {show ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-brand border-0 hover:opacity-90"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Sign in
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">
                  or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  (window.location.href =
                    "http://localhost:8000/authentication/google/login/")
                }
              >
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  (window.location.href =
                    "http://localhost:8000/authentication/github/login/")
                }
              >
                GitHub
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
