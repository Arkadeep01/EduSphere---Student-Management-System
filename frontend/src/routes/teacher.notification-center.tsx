import { createFileRoute } from "@tanstack/react-router";
import NotificationCenter from "./student.notification-center";

export const Route = createFileRoute("/teacher/notification-center")({
  head: () => ({ meta: [{ title: "Notification Center" }] }),
  component: NotificationCenter,
});