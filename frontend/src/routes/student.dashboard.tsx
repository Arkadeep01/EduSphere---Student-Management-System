import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, Award, FileCheck, FileText, BookOpen, DollarSign, Loader2 } from "lucide-react";
// import { results, assignments, subjects, holidays, timetable, announcements } from "@/lib/mock-data";
import { results, subjects, holidays, timetable, announcements } from "@/lib/mock-data";
import { useRequireRole } from "@/context/AuthContext";
import { ProfileView } from "@/components/dashboard/ProfileView";

export const Route = createFileRoute("/student/dashboard")({
  head: () => ({ meta: [{ title: "Student Dashboard — EduSphere" }] }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { authorized, loading } = useRequireRole("student");

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
      <PageHeader title="Hey Aarav 👋" description="Here's your learning snapshot today." />
      <ProfileView />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Attendance" value="94%" icon={ClipboardCheck} accent="success" />
        <StatCard label="Current GPA" value="3.82" icon={Award} trend="0.12 vs last term" trendUp accent="primary" />
        <StatCard label="Assignments Due" value="3" icon={FileCheck} accent="warning" />
        <StatCard label="Upcoming Exams" value="5" icon={FileText} accent="info" />
        <StatCard label="Unread Notes" value="7" icon={BookOpen} accent="brand" />
        <StatCard label="Pending Fees" value="$2,400" icon={DollarSign} accent="warning" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Subject Progress</CardTitle></CardHeader><CardContent className="space-y-4">
          {subjects.map(s => (
            <div key={s.id}>
              <div className="flex justify-between text-sm mb-1"><span className="font-medium">{s.name}</span><span className="text-muted-foreground">{s.progress}%</span></div>
              <Progress value={s.progress} />
            </div>
          ))}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Today's Classes</CardTitle></CardHeader><CardContent className="space-y-2">
          {timetable[0].slots.map(([t, s, , room]) => (
            <div key={t} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
              <div className="text-xs font-mono text-muted-foreground w-12">{t}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{s}</p><p className="text-xs text-muted-foreground">Room {room}</p></div>
            </div>
          ))}
        </CardContent></Card>
      </div>
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card><CardHeader><CardTitle>Recent Results</CardTitle></CardHeader><CardContent className="space-y-3">
          {results.slice(0, 4).map(r => (
            <div key={r.subject} className="flex items-center justify-between p-3 rounded-lg border">
              <div><p className="font-medium text-sm">{r.subject}</p><p className="text-xs text-muted-foreground">{r.marks}/{r.total}</p></div>
              <Badge className="bg-gradient-brand text-white border-0">{r.grade}</Badge>
            </div>
          ))}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Announcements & Holidays</CardTitle></CardHeader><CardContent className="space-y-2">
          {announcements.map(a => <div key={a.id} className="p-2 rounded hover:bg-muted text-sm">{a.title}</div>)}
          <div className="pt-3 border-t mt-3"><p className="text-xs uppercase font-semibold text-muted-foreground mb-2">Upcoming holidays</p>
            {holidays.map(h => <div key={h.date} className="flex justify-between py-1 text-sm"><span>{h.name}</span><span className="text-muted-foreground">{h.date}</span></div>)}
          </div>
        </CardContent></Card>
      </div>
    </>
  );
}
