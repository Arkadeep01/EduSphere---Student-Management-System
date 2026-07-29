import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Sign Up — EduSphere" }] }),
  component: RegisterDisabledPage,
});

function RegisterDisabledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md border-0 shadow-elegant">
        <CardContent className="p-8 text-center space-y-6">
          <Logo />
          <h1 className="text-2xl font-bold">Registration Disabled</h1>
          <p className="text-muted-foreground">
            Public registration is currently disabled. Please contact your school administration to create an account.
          </p>
          <Button asChild className="bg-gradient-brand border-0">
            <Link to="/login" search={{ error: undefined, actual_role: undefined, label: undefined }}>Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
