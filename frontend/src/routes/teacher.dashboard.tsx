import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Layers, FileCheck, ClipboardCheck, BookOpen, GraduationCap } from "lucide-react";
import { teacherSubjectData, teacherAssignments, teacherTimetable, announcements, teacherProfileData } from "@/lib/mock-data";

export const Route = createFileRoute("/teacher/dashboard")({
  head: () => ({ meta: [{ title: "Teacher Dashboard — EduSphere" }] }),
  component: () => {
    const SESSION_RECESS = "Recess";

    const subject = teacherSubjectData;
    const activeAssignments = teacherAssignments.filter(a => a.status === "active");
    const pendingAttendance = teacherTimetable.filter(d =>
      d.slots.some(s => s[1] !== SESSION_RECESS)
    ).length;
    const teacherInitials = teacherProfileData.personal.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
      <PageWrapper>
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem><StatCard label="Assigned Subject" value={subject.name} icon={BookOpen} accent="primary" /></StaggerItem>
          <StaggerItem><StatCard label="Total Classes" value={String(subject.classes.length)} icon={Layers} accent="info" /></StaggerItem>
          <StaggerItem><StatCard label="Total Students" value={String(subject.totalStudents)} icon={Users} accent="brand" /></StaggerItem>
          <StaggerItem><StatCard label="Pending Evaluations" value={String(subject.evaluations.pending)} icon={GraduationCap} accent="warning" /></StaggerItem>
        </StaggerContainer>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          <StaggerItem><StatCard label="Active Assignments" value={String(activeAssignments.length)} icon={FileCheck} accent="warning" /></StaggerItem>
          <StaggerItem><StatCard label="Attendance Pending" value={String(pendingAttendance)} icon={ClipboardCheck} accent="brand" /></StaggerItem>
        </StaggerContainer>

        <StaggerContainer className="grid lg:grid-cols-3 gap-4 mt-6">
          <StaggerItem><Card className="lg:col-span-2"><CardHeader><CardTitle>Syllabus Progress</CardTitle></CardHeader><CardContent>
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-3xl font-bold">{subject.progress}%</p><p className="text-xs text-muted-foreground">{subject.chapters.filter(c => c.completed).length}/{subject.chapters.length} chapters</p></div>
            </div>
            <Progress value={subject.progress} className="h-3 mb-4" />
            <div className="space-y-2">
              {subject.chapters.map(ch => (
                <div key={ch.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{ch.title}</span>
                  <Badge variant={ch.completed ? "default" : "secondary"} className={ch.completed ? "bg-success text-success-foreground" : ""}>{ch.completed ? "Done" : `${ch.completedLessons}/${ch.lessons}`}</Badge>
                </div>
              ))}
            </div>
          </CardContent></Card></StaggerItem>
          <StaggerItem><Card><CardHeader><CardTitle>Today's Schedule</CardTitle></CardHeader><CardContent className="space-y-3">
            {teacherTimetable[0].slots.map(([t, cls, sub, room]) => (
              <div key={t} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                <div className="text-sm font-mono text-muted-foreground w-14">{t}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{cls === SESSION_RECESS ? "Recess" : `${sub} — ${cls}`}</p>
                  <p className="text-xs text-muted-foreground">{room || (cls === SESSION_RECESS ? "Break" : "")}</p>
                </div>
              </div>
            ))}
          </CardContent></Card></StaggerItem>
        </StaggerContainer>

        <StaggerContainer className="grid lg:grid-cols-2 gap-4 mt-4">
          <StaggerItem><Card><CardHeader><CardTitle>Active Assignments</CardTitle></CardHeader><CardContent className="space-y-3">
            {activeAssignments.slice(0, 4).map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="font-medium text-sm">{a.title}</p><p className="text-xs text-muted-foreground">{a.class} · {a.submissions}/{a.total} submitted</p></div>
                <div className="text-right"><Badge variant="secondary">{a.graded}/{a.submissions} graded</Badge></div>
              </div>
            ))}
          </CardContent></Card></StaggerItem>
          <StaggerItem><Card><CardHeader><CardTitle>Announcements</CardTitle></CardHeader><CardContent className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{teacherInitials}</AvatarFallback></Avatar>
                <div className="flex-1"><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.date}</p></div>
              </div>
            ))}
          </CardContent></Card></StaggerItem>
        </StaggerContainer>
      </PageWrapper>
    );
  },
});
