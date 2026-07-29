import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { request, API_BASE } from "@/services/request";
import { Users, Shield, GraduationCap, FileText, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/director/dashboard")({
  head: () => ({ meta: [{ title: "Director Dashboard — EduSphere" }] }),
  component: DirectorDashboard,
});

interface DirectorStats {
  admins: number;
  staff: number;
  teachers: number;
  students: number;
  directors: number;
}

function DirectorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DirectorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    request<DirectorStats>("/admin/director/dashboard/", undefined, `${API_BASE}`)
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Admins", value: stats?.admins ?? 0, icon: Shield, color: "text-blue-600" },
    { label: "Staff", value: stats?.staff ?? 0, icon: Users, color: "text-green-600" },
    { label: "Teachers", value: stats?.teachers ?? 0, icon: GraduationCap, color: "text-purple-600" },
    { label: "Students", value: stats?.students ?? 0, icon: FileText, color: "text-orange-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Director Dashboard</h1>
        <p className="text-muted-foreground">Institution-wide oversight and management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded" />
                <Skeleton className="h-8 w-16 mt-2" />
                <Skeleton className="h-4 w-20 mt-1" />
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-full flex items-center gap-3 p-6">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="text-muted-foreground">Unable to load dashboard data.</p>
          </div>
        ) : (
          statCards.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-6 flex items-center gap-4">
                <s.icon className={`h-10 w-10 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
