import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, Award, FileCheck, Loader2, TrendingUp, BarChart3 } from "lucide-react";
import { results, subjects, holidays, timetable, announcements, monthlyAttendance, rankings, studentGrowth, submissionHistory, assignments } from "@/lib/mock-data";
import { useRequireRole } from "@/context/AuthContext";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

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

  const assignmentAvg = submissionHistory.reduce((s, h) => s + (h.marks / h.total) * 100, 0) / submissionHistory.length;
  const attendanceAvg = monthlyAttendance.reduce((s, m) => s + m.percentage, 0) / monthlyAttendance.length;

  return (
    <PageWrapper>
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem><StatCard label="Attendance" value={`${Math.round(attendanceAvg)}%`} icon={ClipboardCheck} accent="success" /></StaggerItem>
        <StaggerItem><StatCard label="Current GPA" value={rankings.topStudents.find(s => s.name === "Aarav Sharma")?.gpa?.toString() || "—"} icon={Award} accent="primary" /></StaggerItem>
        <StaggerItem><StatCard label="Assignments Due" value={assignments.filter(a => a.status === "pending").length} icon={FileCheck} accent="warning" /></StaggerItem>
        <StaggerItem><StatCard label="Class Rank" value={`#${rankings.classRank}`} icon={BarChart3} trend={`of ${rankings.totalStudents}`} trendUp accent="brand" /></StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="grid lg:grid-cols-2 gap-4 mt-6">
        <StaggerItem>
        {/* Academic Growth */}
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Academic Growth</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={studentGrowth}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="students" stroke="oklch(0.48 0.18 265)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent></Card></StaggerItem>

        <StaggerItem>
        {/* Assignment Performance */}
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="h-4 w-4" />Assignment Performance</CardTitle></CardHeader><CardContent>
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="text-center"><p className="text-3xl font-bold text-success">{Math.round(assignmentAvg)}%</p><p className="text-xs text-muted-foreground">Average Score</p></div>
            <div className="text-center"><p className="text-3xl font-bold text-warning">{submissionHistory.length}</p><p className="text-xs text-muted-foreground">Completed</p></div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={submissionHistory}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="title" tick={false} />
              <YAxis domain={[0, 100]} hide />
              <Bar dataKey="marks" fill="oklch(0.48 0.18 265)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card></StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="grid lg:grid-cols-3 gap-4 mt-4">
        <StaggerItem>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Subject Progress</CardTitle></CardHeader><CardContent className="space-y-4">
          {subjects.slice(0, 5).map(s => (
            <div key={s.id}>
              <div className="flex justify-between text-sm mb-1"><span className="font-medium">{s.name}</span><span className="text-muted-foreground">{s.progress}%</span></div>
              <Progress value={s.progress} />
            </div>
          ))}
        </CardContent></Card>
        </StaggerItem>

        <StaggerItem>
        <Card><CardHeader><CardTitle>Today's Classes</CardTitle></CardHeader><CardContent className="space-y-2">
          {(timetable.find(d => d.day === new Date().toLocaleDateString("en-US", { weekday: "short" })) || timetable[0]).slots.map(([t, s, , room]) => (
            <div key={t} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
              <div className="text-xs font-mono text-muted-foreground w-12">{t}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{s}</p><p className="text-xs text-muted-foreground">Room {room}</p></div>
            </div>
          ))}
        </CardContent></Card>
        </StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="grid lg:grid-cols-3 gap-4 mt-4">
        <StaggerItem>
        <Card><CardHeader><CardTitle>Subject Profile</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={results}>
              <PolarGrid /><PolarAngleAxis dataKey="subject" className="text-xs" /><PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar dataKey="marks" stroke="oklch(0.48 0.18 265)" fill="oklch(0.48 0.18 265)" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent></Card>
        </StaggerItem>

        <StaggerItem>
        <Card><CardHeader><CardTitle>Attendance Trend</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyAttendance}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={false} />
              <YAxis domain={[0, 100]} hide />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Bar dataKey="percentage" fill="oklch(0.68 0.2 148)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>
        </StaggerItem>

        <StaggerItem>
        <Card><CardHeader><CardTitle>Class Rankings</CardTitle></CardHeader><CardContent>
          <div className="space-y-2">
            {rankings.topStudents.slice(0, 5).map((s, i) => (
              <div key={s.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? "bg-amber-400 text-amber-900" : i === 1 ? "bg-slate-300 text-slate-800" : i === 2 ? "bg-orange-300 text-orange-900" : "bg-muted text-muted-foreground"
                }`}>{s.rank}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{s.name}</p><p className="text-xs text-muted-foreground">GPA {s.gpa}</p></div>
                <span className="text-xs font-semibold">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </CardContent></Card>
        </StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="grid lg:grid-cols-2 gap-4 mt-4">
        <StaggerItem>
        <Card><CardHeader><CardTitle>Recent Results</CardTitle></CardHeader><CardContent className="space-y-3">
          {results.slice(0, 4).map(r => (
            <div key={r.subject} className="flex items-center justify-between p-3 rounded-lg border">
              <div><p className="font-medium text-sm">{r.subject}</p><p className="text-xs text-muted-foreground">{r.marks}/{r.total}</p></div>
              <Badge className="bg-gradient-brand text-white border-0">{r.grade}</Badge>
            </div>
          ))}
        </CardContent></Card>
        </StaggerItem>
        <StaggerItem>
        <Card><CardHeader><CardTitle>Announcements & Holidays</CardTitle></CardHeader><CardContent className="space-y-2">
          {announcements.map(a => <div key={a.id} className="p-2 rounded hover:bg-muted text-sm">{a.title}</div>)}
          <div className="pt-3 border-t mt-3"><p className="text-xs uppercase font-semibold text-muted-foreground mb-2">Upcoming holidays</p>
            {holidays.map(h => <div key={h.date} className="flex justify-between py-1 text-sm"><span>{h.name}</span><span className="text-muted-foreground">{h.date}</span></div>)}
          </div>
        </CardContent></Card>
        </StaggerItem>
      </StaggerContainer>
    </PageWrapper>
  );
}
