import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { attendanceData } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/attendance")({
  head: () => ({ meta: [{ title: "Attendance — Admin" }] }),
  component: () => (
    <>
      <PageHeader title="Attendance" description="Today's school-wide attendance overview" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value="1,248" icon={Users} accent="primary" />
        <StatCard label="Present" value="1,180" icon={UserCheck} accent="success" />
        <StatCard label="Absent" value="68" icon={UserX} accent="warning" />
        <StatCard label="Attendance %" value="94.5%" icon={TrendingUp} trend="2.1% vs last week" trendUp accent="info" />
      </div>
      <Card className="mt-6"><CardHeader><CardTitle>Weekly Trends</CardTitle></CardHeader><CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="day" /><YAxis />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
            <Bar dataKey="present" fill="oklch(0.48 0.18 265)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="absent" fill="oklch(0.7 0.17 50)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent></Card>
    </>
  ),
});
