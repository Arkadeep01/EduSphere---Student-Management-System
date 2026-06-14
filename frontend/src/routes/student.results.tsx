import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { results, rankings, exams, studentProfileData } from "@/lib/mock-data";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/student/results")({
  head: () => ({ meta: [{ title: "Results — Student" }] }),
  component: () => {
    return (
      <PageWrapper>
        <Tabs defaultValue="marks" className="mb-6">
          <TabsList><TabsTrigger value="marks">Subject Marks</TabsTrigger><TabsTrigger value="rankings">Rankings</TabsTrigger><TabsTrigger value="comparison">Comparison</TabsTrigger></TabsList>

          <TabsContent value="marks" className="mt-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium">Exam: {exams[0]?.name || "Midterm Examination"}</span>
            </div>
            <StaggerContainer className="grid lg:grid-cols-3 gap-4">
              <StaggerItem><Card className="lg:col-span-2"><CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Marks</TableHead><TableHead>Total</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
                  <TableBody>{results.map(r => (
                    <TableRow key={r.subject}><TableCell className="font-medium">{r.subject}</TableCell><TableCell>{r.marks}</TableCell><TableCell>{r.total}</TableCell><TableCell><Badge className="bg-gradient-brand text-white border-0">{r.grade}</Badge></TableCell></TableRow>
                  ))}</TableBody>
                </Table>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Subject Profile</CardTitle></CardHeader><CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={results}>
                    <PolarGrid /><PolarAngleAxis dataKey="subject" className="text-xs" /><PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar dataKey="marks" stroke="oklch(0.48 0.18 265)" fill="oklch(0.48 0.18 265)" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent></Card></StaggerItem>
            </StaggerContainer>
          </TabsContent>

          <TabsContent value="rankings" className="mt-4">
            <StaggerContainer className="grid lg:grid-cols-3 gap-4">
              <StaggerItem><Card><CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Class Rank</p>
                <p className="text-4xl font-bold mt-2 text-primary">#{rankings.classRank}</p>
                <p className="text-xs text-muted-foreground">of {rankings.totalStudents} students</p>
              </CardContent></Card></StaggerItem>
              <StaggerItem><Card><CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Section Rank</p>
                <p className="text-4xl font-bold mt-2 text-brand">#{rankings.sectionRank}</p>
                <p className="text-xs text-muted-foreground">{studentProfileData.academic.section}</p>
              </CardContent></Card></StaggerItem>
              <StaggerItem><Card><CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">GPA</p>
                <p className="text-4xl font-bold mt-2 text-success">{results.length > 0 ? (results.reduce((sum, r) => sum + r.marks / r.total, 0) / results.length * 4).toFixed(2) : "—"}</p>
                <p className="text-xs text-muted-foreground">Out of 4.0</p>
              </CardContent></Card></StaggerItem>
            </StaggerContainer>
            <Card className="mt-4"><CardHeader><CardTitle>Top Students — Class {studentProfileData.academic.class}</CardTitle></CardHeader><CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Name</TableHead><TableHead>GPA</TableHead><TableHead>Percentage</TableHead></TableRow></TableHeader>
                <TableBody>{rankings.topStudents.map(s => (
                  <TableRow key={s.rank}>
                    <TableCell><div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      s.rank === 1 ? "bg-amber-400 text-amber-900" : s.rank === 2 ? "bg-slate-300 text-slate-800" : s.rank === 3 ? "bg-orange-300 text-orange-900" : "bg-muted text-muted-foreground"
                    }`}>{s.rank}</div></TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.gpa}</TableCell>
                    <TableCell><Badge variant="secondary">{s.percentage}%</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="comparison" className="mt-4">
            <Card><CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Performance comparison across all assigned subjects.</p>
              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {results.map(r => (
                  <StaggerItem key={r.subject}><div className="p-4 border rounded-lg">
                    <p className="font-medium text-sm">{r.subject}</p>
                    <p className="text-2xl font-bold mt-1 text-primary">{r.marks}/{r.total}</p>
                    <Badge className="bg-gradient-brand text-white border-0 mt-1">{r.grade}</Badge>
                  </div></StaggerItem>
                ))}
              </StaggerContainer>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </PageWrapper>
    );
  },
});
