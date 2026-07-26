import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export const Route = createFileRoute("/teacher")({
  beforeLoad: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      sessionStorage.setItem("returnTo", "/teacher/dashboard");
      throw redirect({ to: "/login" });
    }
  },
  component: () => <DashboardLayout role="teacher" />,
});