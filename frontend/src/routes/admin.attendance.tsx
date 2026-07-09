import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserCheck, UserX, TrendingUp, BarChart3, Calendar, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, LineChart, Line } from "recharts";
import { attendanceData, facultyAttendanceData, attendanceAnalytics } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";
import { ExportDialog } from "@/components/export";
import { attendanceExportConfig } from "@/components/export/moduleConfigs";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  present: "default",
  absent: "destructive",
  leave: "secondary",
  half_day: "outline",
};

function AdminAttendanceComponent() {
  const [faculty, setFaculty] = useState(facultyAttendanceData);

  const markAttendance = (id: string, status: "present" | "absent" | "leave" | "half_day") => {
    setFaculty(prev => prev.map(f => f.id === id ? { ...f, today: status } : f));
    toast.success("Attendance marked");
  };

  const [showExport, setShowExport] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Attendance Management</h2>
        <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="mr-2 h-4 w-4" />Export</Button>
      </div>
      <Tabs defaultValue="analytics">
        <TabsList className="mb-4"><TabsTrigger value="analytics"><BarChart3 className="mr-2 h-4 w-4" />Analytics</TabsTrigger><TabsTrigger value="faculty"><Users className="mr-2 h-4 w-4" />Faculty Attendance</TabsTrigger></TabsList>

        <TabsContent value="analytics">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="School Avg" value={`${attendanceAnalytics.school.present}%`} icon={TrendingUp} trend={`${(attendanceAnalytics.school.present - attendanceAnalytics.school.previous).toFixed(1)}% vs last month`} trendUp={attendanceAnalytics.school.trend === "up"} accent="primary" />
            <StatCard label="Total Students" value="1,248" icon={Users} accent="info" />
            <StatCard label="Present Today" value="1,180" icon={UserCheck} accent="success" />
            <StatCard label="Absent Today" value="68" icon={UserX} accent="warning" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mt-6">
            <Card><CardHeader><CardTitle>Weekly Trends</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" /><YAxis />
                  <Tooltip contentStyle={{ background: "var(--color-card)", borderRadius: 8 }} />
                  <Bar dataKey="present" fill="oklch(0.48 0.18 265)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="absent" fill="oklch(0.7 0.17 50)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent></Card>

            <Card><CardHeader><CardTitle>5-Week Trend</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={attendanceAnalytics.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" /><YAxis domain={[85, 100]} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="present" stroke="oklch(0.48 0.18 265)" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="absent" stroke="oklch(0.7 0.17 50)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent></Card>
          </div>

          <Card className="mt-4"><CardHeader><CardTitle>Class-wise Attendance</CardTitle></CardHeader><CardContent>
            <Table><TableHeader><TableRow><TableHead>Class</TableHead><TableHead>Attendance %</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{attendanceAnalytics.byClass.map(c => (
                <TableRow key={c.class}>
                  <TableCell className="font-medium">Class {c.class}</TableCell>
                  <TableCell>{c.present}%</TableCell>
                  <TableCell><Badge variant={c.present >= 94 ? "default" : c.present >= 90 ? "secondary" : "destructive"} className={c.present >= 94 ? "bg-success" : ""}>{c.present >= 94 ? "Good" : c.present >= 90 ? "Average" : "Needs Attention"}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="faculty">
          <Card><CardContent className="p-4">
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Subject</TableHead><TableHead>Today</TableHead><TableHead>Present</TableHead><TableHead>Absent</TableHead><TableHead>Leave</TableHead><TableHead>Half Day</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>{faculty.map(f => (
                  <TableRow key={f.id}>
                    <TableCell><div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="text-xs bg-gradient-brand text-white">{f.name.split(" ").map(s => s[0]).join("")}</AvatarFallback></Avatar><span className="font-medium text-sm">{f.name}</span></div></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{f.subject}</TableCell>
                    <TableCell><Badge variant={statusColors[f.today]} className={f.today === "present" ? "bg-success" : ""}>{f.today.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="text-sm">{f.monthly.present}</TableCell>
                    <TableCell className="text-sm">{f.monthly.absent}</TableCell>
                    <TableCell className="text-sm">{f.monthly.leave}</TableCell>
                    <TableCell className="text-sm">{f.monthly.halfDay}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className={`h-7 px-2 ${f.today === "present" ? "text-success bg-success/10" : ""}`} onClick={() => markAttendance(f.id, "present")}>P</Button>
                        <Button size="sm" variant="ghost" className={`h-7 px-2 ${f.today === "absent" ? "text-destructive bg-destructive/10" : ""}`} onClick={() => markAttendance(f.id, "absent")}>A</Button>
                        <Button size="sm" variant="ghost" className={`h-7 px-2 ${f.today === "leave" ? "text-warning bg-warning/10" : ""}`} onClick={() => markAttendance(f.id, "leave")}>L</Button>
                        <Button size="sm" variant="ghost" className={`h-7 px-2 ${f.today === "half_day" ? "text-info bg-info/10" : ""}`} onClick={() => markAttendance(f.id, "half_day")}>HD</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <ExportDialog open={showExport} onOpenChange={setShowExport} config={attendanceExportConfig} />
    </>
  );
}

export const Route = createFileRoute("/admin/attendance")({
  head: () => ({ meta: [{ title: "Attendance — Admin" }] }),
  component: AdminAttendanceComponent,
});
