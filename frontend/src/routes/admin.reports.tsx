import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FileSpreadsheet, FileJson } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { studentGrowth, examPerformance, attendanceData } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Admin" }] }),
  component: () => (
    <>
      <PageHeader title="Reports & Analytics" description="Deep insights across attendance, exams, finance and more"
        actions={<><Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4" />PDF</Button><Button variant="outline" size="sm"><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button><Button variant="outline" size="sm"><FileJson className="mr-2 h-4 w-4" />CSV</Button></>} />
      <Tabs defaultValue="growth">
        <TabsList><TabsTrigger value="growth">Growth</TabsTrigger><TabsTrigger value="attendance">Attendance</TabsTrigger><TabsTrigger value="exams">Exams</TabsTrigger></TabsList>
        <TabsContent value="growth"><Card><CardContent className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={studentGrowth}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="month" /><YAxis /><Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} /><Line dataKey="students" stroke="oklch(0.48 0.18 265)" strokeWidth={3} /></LineChart>
          </ResponsiveContainer>
        </CardContent></Card></TabsContent>
        <TabsContent value="attendance"><Card><CardContent className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={attendanceData}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="day" /><YAxis /><Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} /><Bar dataKey="present" fill="oklch(0.48 0.18 265)" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </CardContent></Card></TabsContent>
        <TabsContent value="exams"><Card><CardContent className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={examPerformance}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="subject" /><YAxis /><Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} /><Bar dataKey="avg" fill="oklch(0.48 0.18 265)" radius={[6, 6, 0, 0]} /><Bar dataKey="top" fill="oklch(0.7 0.17 50)" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </CardContent></Card></TabsContent>
      </Tabs>
    </>
  ),
});
