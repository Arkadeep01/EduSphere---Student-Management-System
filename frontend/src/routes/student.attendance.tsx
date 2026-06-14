import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Calendar as CalIcon } from "lucide-react";
import { monthlyAttendance, dailyAttendance } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const presentDays = dailyAttendance.filter(d => d.present === true).length;
const absentDays = dailyAttendance.filter(d => d.present === false).length;
const attendancePct = Math.round(presentDays / dailyAttendance.length * 100);

export const Route = createFileRoute("/student/attendance")({
  head: () => ({ meta: [{ title: "My Attendance — Student" }] }),
  component: () => (
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
            <div className="grid grid-cols-10 gap-2">
              {dailyAttendance.map(d => (
                <div key={d.day} className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${d.present ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{d.day}</div>
              ))}
            </div>
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
                <Bar dataKey="percentage" fill="oklch(0.68 0.2 148)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {monthlyAttendance.map(m => (
              <StaggerItem key={m.month}><Card><CardContent className="p-4 text-center">
                <p className="text-sm font-medium">{m.month}</p>
                <p className={`text-2xl font-bold mt-1 ${m.percentage >= 90 ? "text-success" : m.percentage >= 75 ? "text-warning" : "text-destructive"}`}>{m.percentage}%</p>
                <p className="text-xs text-muted-foreground">{m.present}/{m.total} days</p>
              </CardContent></Card></StaggerItem>
            ))}
          </StaggerContainer>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  ),
});
