import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const API_BASE = "http://localhost:8000";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — EduSphere" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        toast.success("Reset link sent! Check your inbox.");
      } else {
        toast.error(data.email?.[0] || data.error || "Failed to send reset link.");
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
        <h1 className="text-2xl font-bold mt-6">Reset your password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {sent ? "Check your email for the OTP code." : "Enter your email and we'll send a reset code."}
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={sent} /></div>
          <Button type="submit" className="w-full bg-gradient-brand border-0" disabled={loading || sent}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {sent ? "Email sent" : "Send reset code"}
          </Button>
        </form>
        {sent && (
          <p className="text-center text-sm mt-4">
            <Link to="/reset-password" className="text-primary hover:underline font-medium">Enter reset code</Link>
          </p>
        )}
        <p className="text-center text-sm mt-6"><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></p>
      </CardContent></Card>
    </div>
  );
}
