import { createFileRoute } from "@tanstack/react-router";
import { ProfileView } from "@/components/dashboard/ProfileView";

export const Route = createFileRoute("/student/profile")({
  head: () => ({ meta: [{ title: "Profile — Student" }] }),
  component: ProfileView,
});
