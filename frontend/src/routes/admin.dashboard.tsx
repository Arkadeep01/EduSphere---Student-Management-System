import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Layers, TrendingUp, FileText, Calendar, Loader2, AlertCircle } from "lucide-react";
import { useRequireRole } from "@/context/AuthContext";
import { useAdminDashboardSummary } from "@/hooks/useAdminDashboard";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — EduSphere" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { authorized, loading: authLoading } = useRequireRole("admin");
  const { data: summary, isLoading: summaryLoading, isError } = useAdminDashboardSummary();

  if (authLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  if (isError) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 p-6">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <p className="text-muted-foreground">Unable to load dashboard data.</p>
        </div>
      </div>
    );
  }

  const summaryData = summary as Record<string, unknown> | undefined;
  const totalStudents = (summaryData?.students as number) ?? 0;
  const totalTeachers = (summaryData?.teachers as number) ?? 0;
  const totalClasses = (summaryData?.classes as number) ?? 0;
  const attendance = (summaryData?.attendance as number) ?? null;
  const upcomingExams = (summaryData?.upcomingExams as number) ?? null;
  const upcomingEvents = (summaryData?.upcomingEvents as number) ?? null;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={totalStudents.toLocaleString()} icon={Users} accent="primary" />
        <StatCard label="Total Teachers" value={totalTeachers} icon={GraduationCap} accent="info" />
        <StatCard label="Total Classes" value={totalClasses} icon={Layers} accent="brand" />
        <StatCard label="Attendance" value={attendance !== null ? `${attendance}%` : "--"} icon={TrendingUp} accent="success" />
        <StatCard label="Upcoming Exams" value={upcomingExams !== null ? String(upcomingExams) : "--"} icon={FileText} accent="info" />
        <StatCard label="Upcoming Events" value={upcomingEvents !== null ? String(upcomingEvents) : "--"} icon={Calendar} accent="brand" />
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
