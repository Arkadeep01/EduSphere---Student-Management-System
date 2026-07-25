import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle, FileText, BookOpen } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { API_BASE } from "@/services/request";

interface StudentPublishedResult {
  id: number;
  exam: number;
  exam_name: string;
  subject: number;
  subject_name: string;
  student: number;
  student_name: string;
  marks_obtained: number;
  total_marks: number;
  grade: string;
  published_at: string;
}

export const Route = createFileRoute("/student/results")({
  head: () => ({ meta: [{ title: "Results — Student" }] }),
  component: ResultsPage,
});

function ResultsPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const { data: results, isLoading, error } = useQuery<StudentPublishedResult[]>({
    queryKey: ["student", "results"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/student/results/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error("Failed to load results");
      return r.json();
    },
    enabled: !!token,
  });

  const percentage = results && results.length > 0
    ? (results.reduce((sum, r) => sum + (r.marks_obtained / r.total_marks) * 100, 0) / results.length)
    : 0;
  const gpa = results && results.length > 0
    ? (results.reduce((sum, r) => {
        const pct = (r.marks_obtained / r.total_marks) * 100;
        if (pct >= 90) return sum + 4.0;
        if (pct >= 80) return sum + 3.7;
        if (pct >= 70) return sum + 3.3;
        if (pct >= 60) return sum + 3.0;
        if (pct >= 50) return sum + 2.3;
        if (pct >= 40) return sum + 2.0;
        if (pct >= 35) return sum + 1.0;
        return sum + 0.0;
      }, 0) / results.length)
    : 0;

  if (isLoading) return (
    <PageWrapper>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </PageWrapper>
  );

  if (error) return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-destructive gap-3">
        <AlertCircle className="h-10 w-10" />
        <p className="font-medium">Failed to load results</p>
        <p className="text-sm text-muted-foreground">Please try again later or contact your administrator.</p>
      </div>
    </PageWrapper>
  );

  if (!results || results.length === 0) return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
        <FileText className="h-12 w-12 opacity-40" />
        <p className="font-medium text-lg">No Results Available</p>
        <p className="text-sm">Your exam results will appear here once published.</p>
      </div>
    </PageWrapper>
  );

  const examName = results[0]?.exam_name || "Examination";
  const radarData = results.map((r) => ({
    subject: r.subject_name || `Subject #${r.subject}`,
    marks: (r.marks_obtained / r.total_marks) * 100,
    grade: r.grade,
  }));

  const passedCount = results.filter((r) => {
    const pct = (r.marks_obtained / r.total_marks) * 100;
    return pct >= 40;
  }).length;
  const failedCount = results.length - passedCount;

  return (
    <PageWrapper>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Subjects</p>
          <p className="text-2xl font-bold">{results.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Passed</p>
          <p className="text-2xl font-bold text-success">{passedCount}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-2xl font-bold text-destructive">{failedCount}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Average</p>
          <p className="text-2xl font-bold">{percentage.toFixed(1)}%</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="marks" className="mb-6">
        <TabsList>
          <TabsTrigger value="marks">Subject Marks</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="marks" className="mt-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{examName}</span>
          </div>
          <StaggerContainer className="grid lg:grid-cols-3 gap-4">
            <StaggerItem className="lg:col-span-2">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((r) => {
                        const pct = (r.marks_obtained / r.total_marks) * 100;
                        return (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.subject_name || `Subject #${r.subject}`}</TableCell>
                            <TableCell>{r.marks_obtained}</TableCell>
                            <TableCell>{r.total_marks}</TableCell>
                            <TableCell>
                              <span className={pct >= 40 ? "text-success font-medium" : "text-destructive font-medium"}>
                                {pct.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-gradient-brand text-white border-0">{r.grade}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem className="lg:col-span-1">
              <Card>
                <CardHeader><CardTitle>Subject Profile</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" className="text-xs" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar dataKey="marks" stroke="oklch(0.48 0.18 265)" fill="oklch(0.48 0.18 265)" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Performance comparison across all subjects. Estimated GPA: <strong>{gpa.toFixed(2)}</strong> / 4.0
              </p>
              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((r) => {
                  const pct = (r.marks_obtained / r.total_marks) * 100;
                  return (
                    <StaggerItem key={r.id}>
                      <div className="p-4 border rounded-lg">
                        <p className="font-medium text-sm truncate">{r.subject_name || `Subject #${r.subject}`}</p>
                        <p className="text-2xl font-bold mt-1 text-primary">
                          {r.marks_obtained}/{r.total_marks}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-gradient-brand text-white border-0">{r.grade}</Badge>
                          <span className={pct >= 40 ? "text-success text-xs" : "text-destructive text-xs"}>
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}