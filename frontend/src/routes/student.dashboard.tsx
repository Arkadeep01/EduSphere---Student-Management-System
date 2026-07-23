import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Award, FileCheck, Loader2, TrendingUp, BarChart3 } from "lucide-react";
import { useRequireRole } from "@/context/AuthContext";
import { useStudentDashboard, useMySubjects } from "@/hooks/useStudentDashboard";
import { studentDashboardApi } from "@/services/studentApi";

export const Route = createFileRoute("/student/dashboard")({
  head: () => ({ meta: [{ title: "Student Dashboard — EduSphere" }] }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { authorized, loading } = useRequireRole("student");
  const { data: dash, isLoading: dashLoading } = useStudentDashboard();
  const { data: mySubjects } = useMySubjects();

  const subjects = dash?.subjects ?? [];
  const pendingAssignments = dash?.pendingAssignments ?? 0;

  if (loading || dashLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <PageWrapper>
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem><StatCard label="Subjects" value={dash?.totalSubjects ?? 0} icon={Award} accent="primary" /></StaggerItem>
        <StaggerItem><StatCard label="Assignments Due" value={pendingAssignments} icon={FileCheck} accent="warning" /></StaggerItem>
        <StaggerItem><StatCard label="Attendance" value="--" icon={ClipboardCheck} accent="success" /></StaggerItem>
        <StaggerItem><StatCard label="Class Rank" value="--" icon={BarChart3} accent="brand" /></StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="grid lg:grid-cols-2 gap-4 mt-6">
        <StaggerItem>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Academic Growth</CardTitle></CardHeader><CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">Academic growth data coming soon.</p>
        </CardContent></Card></StaggerItem>

        <StaggerItem>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="h-4 w-4" />Assignment Performance</CardTitle></CardHeader><CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">Assignment data coming soon.</p>
        </CardContent></Card></StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="grid lg:grid-cols-3 gap-4 mt-4">
        <StaggerItem>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>My Subjects</CardTitle></CardHeader><CardContent className="space-y-4">
          {subjects.map(s => (
            <div key={s.id}>
              <div className="flex justify-between text-sm mb-1"><span className="font-medium">{s.name}</span><span className="text-muted-foreground">{s.code}</span></div>
            </div>
          ))}
          {subjects.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No subjects assigned yet.</p>}
        </CardContent></Card>
        </StaggerItem>

        <StaggerItem>
        <Card><CardHeader><CardTitle>Subject Profile</CardTitle></CardHeader><CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">Results data coming soon.</p>
        </CardContent></Card>
        </StaggerItem>
      </StaggerContainer>
    </PageWrapper>
  );
}
