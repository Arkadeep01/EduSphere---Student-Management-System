import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — EduSphere" }] }),
  component: () => (
    <div className="min-h-screen flex items-center justify-center p-6 bg-hero-glow">
      <Card className="w-full max-w-md border-0 shadow-elegant"><CardContent className="p-8">
        <Logo />
        <h1 className="text-2xl font-bold mt-6">Reset your password</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send a reset link.</p>
        <form className="mt-6 space-y-4" onSubmit={e => { e.preventDefault(); toast.success("Reset link sent! Check your inbox."); }}>
          <div><Label>Email</Label><Input type="email" required /></div>
          <Button type="submit" className="w-full bg-gradient-brand border-0">Send reset link</Button>
        </form>
        <p className="text-center text-sm mt-6"><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></p>
      </CardContent></Card>
    </div>
  ),
});
