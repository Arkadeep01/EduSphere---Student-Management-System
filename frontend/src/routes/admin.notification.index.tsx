import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, BarChart3, Mail, Calendar, ClipboardList, Settings, Plus } from "lucide-react";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";

const quickLinks = [
  { label: "Create Notification", to: "/admin/notification/create", icon: Plus, color: "bg-blue-500" },
  { label: "Notification Center", to: "/admin/notification-center", icon: Bell, color: "bg-purple-500" },
  { label: "Analytics", to: "/admin/notification/analytics", icon: BarChart3, color: "bg-green-500" },
  { label: "Email Templates", to: "/admin/notification/email-templates", icon: Mail, color: "bg-orange-500" },
  { label: "Schedules", to: "/admin/notification/schedules", icon: Calendar, color: "bg-teal-500" },
  { label: "Delivery Logs", to: "/admin/notification/delivery-logs", icon: ClipboardList, color: "bg-indigo-500" },
  { label: "Institution Settings", to: "/admin/notification/institution-settings", icon: Settings, color: "bg-gray-500" },
];

function NotificationSettings() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold">Notification Management</h2>
          <p className="text-sm text-muted-foreground">Central hub for managing all notification features</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickLinks.map(link => (
            <Card
              key={link.to}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate({ to: link.to as any })}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-full ${link.color}`}>
                  <link.icon className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium">{link.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/admin/notification/")({
  head: () => ({ meta: [{ title: "Notification Management" }] }),
  component: NotificationSettings,
});