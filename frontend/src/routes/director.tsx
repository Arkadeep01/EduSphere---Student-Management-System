import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export const Route = createFileRoute("/director")({
  beforeLoad: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      sessionStorage.setItem("returnTo", "/director/dashboard");
      throw redirect({ to: "/login", search: { error: undefined, actual_role: undefined, label: undefined } });
    }
  },
  component: () => <DashboardLayout role="director" />,
});