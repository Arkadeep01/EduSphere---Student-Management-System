import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, GraduationCap, Layers, DollarSign, AlertCircle, TrendingUp, Calendar, Plus, FileText, Loader2 } from "lucide-react";
import { stats, studentGrowth, attendanceData, examPerformance, notifications, announcements, events } from "@/lib/mock-data";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";
import { useRequireRole } from "@/context/AuthContext";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — EduSphere" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { authorized, loading } = useRequireRole("admin");

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
      <PageHeader
        title="Welcome back, Alex"
        description="Here's what's happening at your school today."
        actions={
          <>
            <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4" />Export</Button>
            <Button size="sm" className="bg-gradient-brand border-0"><Plus className="mr-2 h-4 w-4" />Quick action</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={stats.students.toLocaleString()} icon={Users} trend="12% vs last month" trendUp accent="primary" />
        <StatCard label="Total Teachers" value={stats.teachers} icon={GraduationCap} trend="3 new this week" trendUp accent="info" />
        <StatCard label="Total Classes" value={stats.classes} icon={Layers} accent="brand" />
        <StatCard label="Revenue" value={`$${(stats.revenue / 1000).toFixed(1)}k`} icon={DollarSign} trend="8.2% growth" trendUp accent="success" />
        <StatCard label="Pending Fees" value={`$${(stats.pendingFees / 1000).toFixed(1)}k`} icon={AlertCircle} trend="4 students" accent="warning" />
        <StatCard label="Attendance" value={`${stats.attendance}%`} icon={TrendingUp} trend="2.1% vs last week" trendUp accent="success" />
        <StatCard label="Upcoming Exams" value={stats.upcomingExams} icon={FileText} accent="info" />
        <StatCard label="Upcoming Events" value={stats.upcomingEvents} icon={Calendar} accent="brand" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Student Growth & Revenue</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={studentGrowth}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="oklch(0.48 0.18 265)" stopOpacity={0.4} /><stop offset="95%" stopColor="oklch(0.48 0.18 265)" stopOpacity={0} /></linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="oklch(0.7 0.17 50)" stopOpacity={0.4} /><stop offset="95%" stopColor="oklch(0.7 0.17 50)" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="students" stroke="oklch(0.48 0.18 265)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.7 0.17 50)" fill="url(#g2)" strokeWidth={2} yAxisId={0} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="flex gap-3 p-2 rounded-lg hover:bg-muted">
                <div className={`h-2 w-2 rounded-full mt-2 ${n.unread ? "bg-brand" : "bg-muted-foreground"}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader><CardTitle>Weekly Attendance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="present" fill="oklch(0.48 0.18 265)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" fill="oklch(0.7 0.17 50)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Exam Performance by Subject</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={examPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="subject" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="avg" stroke="oklch(0.48 0.18 265)" strokeWidth={2} />
                <Line type="monotone" dataKey="top" stroke="oklch(0.7 0.17 50)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <Avatar><AvatarFallback className="bg-primary/10 text-primary">EM</AvatarFallback></Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.date}</p>
                </div>
                <Badge variant={a.priority === "high" ? "destructive" : "secondary"}>{a.priority}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Upcoming Events</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {events.slice(0, 4).map(e => (
              <div key={e.id} className="flex gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-brand text-white flex flex-col items-center justify-center text-xs font-bold">
                  <span>{new Date(e.date).toLocaleString("default", { month: "short" })}</span>
                  <span>{new Date(e.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.location}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
