import { createFileRoute } from "@tanstack/react-router";
import { ProfileView } from "@/components/dashboard/ProfileView";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({ meta: [{ title: "Profile — Admin" }] }),
  component: ProfileView,
});
