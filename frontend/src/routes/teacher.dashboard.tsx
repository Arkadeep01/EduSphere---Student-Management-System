import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Layers, FileCheck, BookOpen, GraduationCap, Loader2 } from "lucide-react";
import { useRequireRole } from "@/context/AuthContext";
import { useTeacherDashboard, useTeacherClasses } from "@/hooks/useTeacherDashboard";

export const Route = createFileRoute("/teacher/dashboard")({
  head: () => ({ meta: [{ title: "Teacher Dashboard — EduSphere" }] }),
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const { authorized, loading } = useRequireRole("teacher");
  const { data: dash, isLoading: dashLoading } = useTeacherDashboard();
  const { data: classes } = useTeacherClasses();

  if (loading || dashLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  const assignedSubject = (dash?.assigned_subject as string) ?? "--";
  const totalClasses = (dash?.total_classes as number) ?? 0;
  const totalStudents = (dash?.total_students as number) ?? 0;
  const pendingEvaluations = (dash?.pending_evaluations as number) ?? 0;

  return (
    <PageWrapper>
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem><StatCard label="Assigned Subject" value={assignedSubject} icon={BookOpen} accent="primary" /></StaggerItem>
        <StaggerItem><StatCard label="Total Classes" value={String(totalClasses)} icon={Layers} accent="info" /></StaggerItem>
        <StaggerItem><StatCard label="Total Students" value={String(totalStudents)} icon={Users} accent="brand" /></StaggerItem>
        <StaggerItem><StatCard label="Pending Evaluations" value={String(pendingEvaluations)} icon={GraduationCap} accent="warning" /></StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="grid lg:grid-cols-2 gap-4 mt-6">
        <StaggerItem>
        <Card><CardHeader><CardTitle>My Classes</CardTitle></CardHeader><CardContent>
          {classes && classes.length > 0 ? (
            <div className="space-y-2">
              {classes.map((c: Record<string, unknown>, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium">{c.class_name as string}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No classes assigned yet.</p>
          )}
        </CardContent></Card>
        </StaggerItem>
        <StaggerItem>
        <Card><CardHeader><CardTitle>Syllabus Progress</CardTitle></CardHeader><CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">Syllabus progress tracking coming soon.</p>
        </CardContent></Card>
        </StaggerItem>
      </StaggerContainer>
    </PageWrapper>
  );
}
