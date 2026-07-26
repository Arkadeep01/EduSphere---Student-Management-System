import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, GraduationCap, FileText } from "lucide-react";

export const Route = createFileRoute("/director/dashboard")({
  head: () => ({ meta: [{ title: "Director Dashboard — EduSphere" }] }),
  component: DirectorDashboard,
});

const API_BASE = "http://localhost:8000";

function DirectorDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: "Admins", value: "...", icon: Shield, color: "text-blue-600" },
    { label: "Staff", value: "...", icon: Users, color: "text-green-600" },
    { label: "Teachers", value: "...", icon: GraduationCap, color: "text-purple-600" },
    { label: "Students", value: "...", icon: FileText, color: "text-orange-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Director Dashboard</h1>
        <p className="text-muted-foreground">Institution-wide oversight and management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6 flex items-center gap-4">
              <s.icon className={`h-10 w-10 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Use the sidebar to manage Admin and Staff accounts, or perform role changes and overrides.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Institution Info</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Logged in as <strong>{user?.email}</strong> (Director)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}