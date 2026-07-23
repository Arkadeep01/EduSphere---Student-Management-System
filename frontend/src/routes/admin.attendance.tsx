import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, Users, UserCheck, UserX, BarChart3, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { attendanceAdminApi } from "@/services/adminApi";
import { ExportDialog } from "@/components/export";
import { attendanceExportConfig } from "@/components/export/moduleConfigs";

interface AnalyticsData {
  school: { present: number; previous: number; trend: string };
  byClass: { class: string; present: number }[];
  weeklyTrend: { week: string; present: number; absent: number }[];
}

interface FacultyItem {
  id: number;
  name: string;
  subject: string;
  today: string;
  monthly: { present: number; absent: number; leave: number; halfDay: number };
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  present: "default",
  absent: "destructive",
  leave: "secondary",
  half_day: "outline",
};

function AdminAttendanceComponent() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [faculty, setFaculty] = useState<FacultyItem[]>([]);
  const [showExport, setShowExport] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      attendanceAdminApi.analytics(),
      attendanceAdminApi.faculty(),
    ]).then(([a, f]) => {
      setAnalytics(a as AnalyticsData);
      setFaculty(f as FacultyItem[]);
    }).catch(() => toast.error("Failed to load attendance data"))
    .finally(() => setLoading(false));
  }, []);

  const markAttendance = async (id: number, status: string) => {
    try {
      await attendanceAdminApi.markFaculty(id, status);
      setFaculty(prev => prev.map(f => f.id === id ? { ...f, today: status } : f));
      toast.success("Attendance marked");
    } catch {
      toast.error("Failed to mark attendance");
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading attendance data...</div>;
  }

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
            <StatCard label="School Avg" value={analytics ? `${analytics.school.present}%` : "--"} icon={TrendingUp} trend={analytics ? `${(analytics.school.present - analytics.school.previous).toFixed(1)}% vs last month` : undefined} trendUp={analytics?.school.trend === "up"} accent="primary" />
            <StatCard label="Total Students" value={faculty.length > 0 ? `${faculty.length}` : "--"} icon={Users} accent="info" />
            <StatCard label="Present" value="--" icon={UserCheck} accent="success" />
            <StatCard label="Absent" value="--" icon={UserX} accent="warning" />
          </div>

          {analytics?.byClass && analytics.byClass.length > 0 && (
            <Card className="mt-4"><CardHeader><CardTitle>Class-wise Attendance</CardTitle></CardHeader><CardContent>
              <Table><TableHeader><TableRow><TableHead>Class</TableHead><TableHead>Attendance %</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>{analytics.byClass.map((c: any) => (
                  <TableRow key={c.class}>
                    <TableCell className="font-medium">Class {c.class}</TableCell>
                    <TableCell>{c.present}%</TableCell>
                    <TableCell><Badge variant={c.present >= 94 ? "default" : c.present >= 90 ? "secondary" : "destructive"} className={c.present >= 94 ? "bg-success" : ""}>{c.present >= 94 ? "Good" : c.present >= 90 ? "Average" : "Needs Attention"}</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </CardContent></Card>
          )}
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
                    <TableCell><Badge variant={statusColors[f.today] || "outline"} className={f.today === "present" ? "bg-success" : ""}>{f.today.replace("_", " ")}</Badge></TableCell>
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
