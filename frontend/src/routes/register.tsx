import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Sign up — EduSphere" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, error, clearError } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (password !== password2) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await register({
        email,
        password,
        password2,
        first_name: firstName,
        last_name: lastName,
        role,
      });
      toast.success(`Account created! Welcome, ${user.first_name || user.email}!`);
      nav({
        to: role === "teacher" ? "/teacher/dashboard" : "/student/dashboard",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center bg-gradient-brand p-12 text-white relative">
        <div className="absolute inset-0 bg-hero-glow opacity-30" />
        <div className="relative">
          <Logo />
          <h2 className="text-4xl font-bold mt-12">Start learning, the smart way.</h2>
          <Sparkles className="h-10 w-10 mt-6 opacity-70" />
        </div>
      </div>
      <div className="flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-0 shadow-elegant">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose your role and fill in the details.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={cn(
                  "py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 transition-all",
                  role === "student"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <User className="h-3.5 w-3.5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={cn(
                  "py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 transition-all",
                  role === "teacher"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Teacher
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>First name</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Last name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <Label>Confirm password</Label>
                <Input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-brand border-0"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create account
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
