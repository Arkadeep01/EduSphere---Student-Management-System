import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Layers, TrendingUp, FileText, Calendar, Loader2 } from "lucide-react";
import { useRequireRole } from "@/context/AuthContext";
import { useAdminDashboardSummary } from "@/hooks/useAdminDashboard";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — EduSphere" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { authorized, loading } = useRequireRole("admin");
  const { data: summary, isLoading: summaryLoading } = useAdminDashboardSummary();

  if (loading || summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  const totalStudents = (summary?.total_students as number) ?? 0;
  const totalTeachers = (summary?.total_teachers as number) ?? 0;
  const totalClasses = (summary?.total_classes as number) ?? 0;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={totalStudents.toLocaleString()} icon={Users} accent="primary" />
        <StatCard label="Total Teachers" value={totalTeachers} icon={GraduationCap} accent="info" />
        <StatCard label="Total Classes" value={totalClasses} icon={Layers} accent="brand" />
        <StatCard label="Attendance" value="--" icon={TrendingUp} accent="success" />
        <StatCard label="Upcoming Exams" value="--" icon={FileText} accent="info" />
        <StatCard label="Upcoming Events" value="--" icon={Calendar} accent="brand" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Welcome to EduSphere Admin. Real-time charts and analytics coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
