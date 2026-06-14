import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const API_BASE = "http://localhost:8000";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — EduSphere" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/password-reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp_code: otpCode,
          new_password: newPwd,
          new_password2: confirmPwd,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated! Please sign in.");
        navigate({ to: "/login" });
      } else {
        toast.error(data.error || data.new_password2?.[0] || "Failed to reset password.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-hero-glow">
      <Card className="w-full max-w-md border-0 shadow-elegant"><CardContent className="p-8">
        <Logo />
        <h1 className="text-2xl font-bold mt-6">Set a new password</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter the OTP sent to your email and set a new password.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div><Label>OTP Code</Label><Input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="6-digit code" required maxLength={6} /></div>
          <div><Label>New password</Label><Input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required /></div>
          <div><Label>Confirm password</Label><Input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required /></div>
          <Button type="submit" className="w-full bg-gradient-brand border-0" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Update password
          </Button>
        </form>
        <p className="text-center text-sm mt-6"><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></p>
      </CardContent></Card>
    </div>
  );
}
