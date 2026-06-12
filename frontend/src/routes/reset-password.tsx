import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — EduSphere" }] }),
  component: () => (
    <div className="min-h-screen flex items-center justify-center p-6 bg-hero-glow">
      <Card className="w-full max-w-md border-0 shadow-elegant"><CardContent className="p-8">
        <Logo />
        <h1 className="text-2xl font-bold mt-6">Set a new password</h1>
        <form className="mt-6 space-y-4" onSubmit={e => { e.preventDefault(); toast.success("Password updated!"); }}>
          <div><Label>New password</Label><Input type="password" required /></div>
          <div><Label>Confirm password</Label><Input type="password" required /></div>
          <Button type="submit" className="w-full bg-gradient-brand border-0">Update password</Button>
        </form>
        <p className="text-center text-sm mt-6"><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></p>
      </CardContent></Card>
    </div>
  ),
});
