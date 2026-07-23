import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, XCircle, Calendar as CalIcon } from "lucide-react";
import { monthlyAttendance, dailyAttendance } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { API_BASE } from "@/services/request";

const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

export const Route = createFileRoute("/student/attendance")({
  head: () => ({ meta: [{ title: "My Attendance — Student" }] }),
  component: StudentAttendance,
});

function StudentAttendance() {
  const { data: realAtt, isLoading } = useQuery({
    queryKey: ["student", "attendance"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/student/attendance/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("Failed");
      return r.json() as Promise<{ records: Array<Record<string,unknown>>; summary: { present: number; absent: number; total: number; percentage: number } }>;
    },
    enabled: !!token,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const summary = realAtt?.summary;
  const presentDays = summary?.present ?? dailyAttendance.filter(d => d.present === true).length;
  const absentDays = summary?.absent ?? dailyAttendance.filter(d => d.present === false).length;
  const attendancePct = Math.round(summary?.percentage ?? (presentDays / (presentDays + absentDays || 1) * 100));

  return (
    <PageWrapper>
      <StaggerContainer className="grid grid-cols-3 gap-4">
        <StaggerItem><StatCard label="Present" value={`${presentDays}d`} icon={CheckCircle2} accent="success" /></StaggerItem>
        <StaggerItem><StatCard label="Absent" value={`${absentDays}d`} icon={XCircle} accent="warning" /></StaggerItem>
        <StaggerItem><StatCard label="Attendance %" value={`${attendancePct}%`} icon={CalIcon} accent="primary" /></StaggerItem>
      </StaggerContainer>
      <Tabs defaultValue="calendar" className="mt-6">
        <TabsList><TabsTrigger value="calendar">Daily Calendar</TabsTrigger><TabsTrigger value="trend">Monthly Trend</TabsTrigger></TabsList>
        <TabsContent value="calendar">
          <Card><CardHeader><CardTitle>Last 30 Days</CardTitle></CardHeader><CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">Attendance calendar coming when records exist.</p>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="trend">
          <Card><CardHeader><CardTitle>Monthly Attendance %</CardTitle></CardHeader><CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyAttendance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis domain={[0, 100]} className="text-xs" />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="percentage" fill="oklch(0.68 0.2 148)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
