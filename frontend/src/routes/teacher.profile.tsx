import { createFileRoute } from "@tanstack/react-router";
import { ProfileView } from "@/components/dashboard/ProfileView";

export const Route = createFileRoute("/teacher/profile")({
  head: () => ({ meta: [{ title: "Profile — Teacher" }] }),
  component: () => <ProfileView role="teacher" />,
});
