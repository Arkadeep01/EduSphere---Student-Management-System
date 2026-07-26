import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — EduSphere" }] }),
  component: () => <Outlet />,
});
