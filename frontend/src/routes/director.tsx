import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export const Route = createFileRoute("/director")({
  beforeLoad: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      sessionStorage.setItem("returnTo", "/director/dashboard");
      throw redirect({ to: "/login" });
    }
  },
  component: () => <DashboardLayout role="director" />,
});