import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, getRoleRedirect } from "@/context/AuthContext";

export function ForbiddenPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    if (user) {
      navigate({ to: getRoleRedirect(user.role) as any });
    } else {
      navigate({ to: "/login" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <ShieldAlert className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h1 className="text-7xl font-bold text-destructive">403</h1>
        <h2 className="mt-4 text-xl font-semibold">Access Denied</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have permission to access this page.
          {user && (
            <span className="block mt-1">
              Signed in as <span className="font-medium capitalize">{user.role}</span>.
            </span>
          )}
        </p>
        <div className="mt-6">
          <Button onClick={handleReturnToDashboard} disabled={loading}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}