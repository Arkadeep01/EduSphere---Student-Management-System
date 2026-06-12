import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Layers, FileCheck, ClipboardCheck, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { examPerformance, assignments, announcements, timetable } from "@/lib/mock-data";
import { useRequireRole } from "@/context/AuthContext";

export const Route = createFileRoute("/teacher/dashboard")({
  head: () => ({ meta: [{ title: "Teacher Dashboard — EduSphere" }] }),
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const { authorized, loading } = useRequireRole("teacher");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <>
      <PageHeader title="Good morning, Dr. Rao" description="Here's your day at a glance." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned Classes" value="6" icon={Layers} accent="primary" />
        <StatCard label="Total Students" value="192" icon={Users} accent="info" />
        <StatCard label="Assignments Pending" value="3" icon={FileCheck} accent="warning" />
        <StatCard label="Attendance Pending" value="2" icon={ClipboardCheck} accent="brand" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Class Performance</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={examPerformance}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="subject" /><YAxis /><Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} /><Bar dataKey="avg" fill="oklch(0.48 0.18 265)" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Today's Schedule</CardTitle></CardHeader><CardContent className="space-y-3">
          {timetable[0].slots.map(([t, s, , room]) => (
            <div key={t} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
              <div className="text-sm font-mono text-muted-foreground w-14">{t}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium">{s}</p><p className="text-xs text-muted-foreground">Room {room}</p></div>
            </div>
          ))}
        </CardContent></Card>
      </div>
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card><CardHeader><CardTitle>Recent Submissions</CardTitle></CardHeader><CardContent className="space-y-3">
          {assignments.slice(0, 4).map(a => (
            <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div><p className="font-medium text-sm">{a.title}</p><p className="text-xs text-muted-foreground">{a.subject} · {a.submissions}/{a.total} submitted</p></div>
              <Badge variant={a.status === "graded" ? "default" : "secondary"} className={a.status === "graded" ? "bg-success text-success-foreground" : ""}>{a.status}</Badge>
            </div>
          ))}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Announcements</CardTitle></CardHeader><CardContent className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">EM</AvatarFallback></Avatar>
              <div className="flex-1"><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.date}</p></div>
            </div>
          ))}
        </CardContent></Card>
      </div>
    </>
  );
}
