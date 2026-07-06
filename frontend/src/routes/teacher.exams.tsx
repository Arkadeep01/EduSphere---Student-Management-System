import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { teacherExamData } from "@/lib/mock-data";
import { FileText, ArrowUpRight, CheckCircle2, Clock, XCircle } from "lucide-react";

const subjectName = "Mathematics";

const statusBadge = (status: string) => {
  if (status === "completed") return <Badge className="bg-success text-success-foreground border-0 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
  if (status === "evaluating") return <Badge className="bg-primary border-0 text-xs"><Clock className="h-3 w-3 mr-1" />Evaluating</Badge>;
  return <Badge variant="outline" className="text-xs"><XCircle className="h-3 w-3 mr-1" />Pending</Badge>;
};

function TeacherExamsComponent() {
  const navigate = useNavigate();
  const data = teacherExamData;

  const inQueue = data.filter(c => c.status !== "completed");
  const completed = data.filter(c => c.status === "completed");
  const totalPending = data.reduce((s, c) => s + c.papers.filter(p => p.status === "pending").length, 0);
  const totalEvaluating = data.reduce((s, c) => s + c.papers.filter(p => p.status === "draft").length, 0);
  const totalCompleted = data.reduce((s, c) => s + c.papers.filter(p => p.status === "completed").length, 0);

  return (
    <PageWrapper>
      <Tabs defaultValue="exams">
        <TabsList>
          <TabsTrigger value="exams">Exam List</TabsTrigger>
          <TabsTrigger value="queue" className="relative">
            Evaluation Queue
            {totalPending > 0 && <Badge className="ml-2 bg-destructive text-destructive-foreground h-4 text-[8px]">{totalPending}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="mt-4 space-y-4">
          {data.map(cls => (
            <Card key={cls.className}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{cls.examName}</p>
                      <p className="text-xs text-muted-foreground">{cls.className} · {cls.subject} · {cls.examDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{cls.evaluatedCount}/{cls.submittedCount}</p>
                      <p className="text-[10px] text-muted-foreground">Evaluated</p>
                    </div>
                    {statusBadge(cls.status)}
                    <Button
                      size="sm"
                      variant={cls.status === "completed" ? "ghost" : "default"}
                      className={cls.status !== "completed" ? "bg-gradient-brand border-0" : ""}
                      disabled={cls.status === "completed"}
                      onClick={() => navigate({ to: `/teacher/exams/evaluate/${cls.examId}/${cls.className}` })}
                    >
                      {cls.status === "completed" ? "Done" : "Evaluate"}
                    </Button>
                  </div>
                </div>
                <Progress
                  value={cls.submittedCount > 0 ? (cls.evaluatedCount / cls.submittedCount) * 100 : 0}
                  className="h-1 mt-3"
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="queue" className="mt-4">
          <StaggerContainer className="grid lg:grid-cols-3 gap-4 mb-4">
            <StaggerItem><Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-warning">{totalPending}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card></StaggerItem>
            <StaggerItem><Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{totalEvaluating}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card></StaggerItem>
            <StaggerItem><Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-success">{totalCompleted}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card></StaggerItem>
          </StaggerContainer>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Class</TableHead><TableHead>Exam</TableHead><TableHead>Subject</TableHead><TableHead>Evaluated</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>{inQueue.map(cls => (
                <TableRow key={cls.className}>
                  <TableCell className="font-medium">{cls.className}</TableCell>
                  <TableCell>{cls.examName}</TableCell>
                  <TableCell>{cls.subject}</TableCell>
                  <TableCell>{cls.evaluatedCount}/{cls.submittedCount}</TableCell>
                  <TableCell>{statusBadge(cls.status)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => navigate({ to: `/teacher/exams/evaluate/${cls.examId}/${cls.className}` })}>
                      <ArrowUpRight className="h-4 w-4 mr-1" />Evaluate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {completed.map(cls => (
              <Card key={cls.className}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{cls.examName}</p>
                      <p className="text-xs text-muted-foreground">{cls.className} · {cls.subject}</p>
                    </div>
                    <Badge className="bg-success text-success-foreground border-0"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>
                  </div>
                  <Progress value={100} className="h-1.5 mb-3" />
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div><p className="text-lg font-bold">{cls.averageMarks ?? "—"}</p><p className="text-[10px] text-muted-foreground">Average</p></div>
                    <div><p className="text-lg font-bold text-success">{cls.highestMarks ?? "—"}</p><p className="text-[10px] text-muted-foreground">Highest</p></div>
                    <div><p className="text-lg font-bold text-destructive">{cls.lowestMarks ?? "—"}</p><p className="text-[10px] text-muted-foreground">Lowest</p></div>
                    <div><p className="text-lg font-bold">{cls.passPercentage ?? "—"}%</p><p className="text-[10px] text-muted-foreground">Pass %</p></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {completed.length === 0 && (
            <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground text-sm">No fully evaluated exams yet.</p></CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/teacher/exams")({
  head: () => ({ meta: [{ title: "Exams — Teacher" }] }),
  component: TeacherExamsComponent,
});
