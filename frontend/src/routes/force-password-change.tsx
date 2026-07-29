import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth, getSafeRedirect } from "@/context/AuthContext";

export const Route = createFileRoute("/force-password-change")({
  head: () => ({ meta: [{ title: "Change Password — EduSphere" }] }),
  component: ForcePasswordChangePage,
});

function ForcePasswordChangePage() {
  const { user, changeTempPassword, loading } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate({ to: "/login", search: { error: undefined, actual_role: undefined, label: undefined } });
    return null;
  }

  if (user.password_changed) {
    navigate({ to: `/${user.role}/dashboard` });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await changeTempPassword(newPassword);
      toast.success("Password changed successfully! Welcome to EduSphere.");
      const returnTo = sessionStorage.getItem("returnTo");
      sessionStorage.removeItem("returnTo");
      navigate({ to: getSafeRedirect(user, returnTo) as any });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-brand p-4">
      <Card className="w-full max-w-md shadow-elegant border-0">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Set Your Password</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome, {user.first_name || user.email}! This is your first login. Please set a new password.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Set Password & Activate Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}