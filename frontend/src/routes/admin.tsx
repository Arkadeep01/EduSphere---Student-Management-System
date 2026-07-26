import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      sessionStorage.setItem("returnTo", "/admin/dashboard");
      throw redirect({ to: "/login" });
    }
  },
  component: () => <DashboardLayout role="admin" />,
});