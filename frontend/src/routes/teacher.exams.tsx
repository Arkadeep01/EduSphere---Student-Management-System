import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exams, answerScripts, teacherSubjectData } from "@/lib/mock-data";
import { FileText, Save, Send, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

function TeacherExamsComponent() {
  const [activeTab, setActiveTab] = useState("exams");
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [draftMarks, setDraftMarks] = useState<Record<string, string>>({});
  const [draftRemarks, setDraftRemarks] = useState<Record<string, string>>({});

  const pendingScripts = answerScripts.filter(s => s.status === "pending");
  const evaluatingScripts = answerScripts.filter(s => s.status === "evaluating");
  const completedScripts = answerScripts.filter(s => s.status === "completed");

  if (selectedScript) {
    const script = answerScripts.find(s => s.id === selectedScript);
    if (!script) return null;
    return (
      <PageWrapper>
        <StaggerContainer className="grid lg:grid-cols-3 gap-4">
          <StaggerItem><Card className="lg:col-span-2"><CardContent className="p-6 space-y-6">
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium mt-3">Answer Script Preview</p>
              <p className="text-xs text-muted-foreground">{script.student} · {script.exam}</p>
              <Button variant="outline" size="sm" className="mt-3"><Eye className="mr-2 h-4 w-4" />View Full Script</Button>
            </div>
            <Card><CardContent className="p-4">
              <h3 className="font-semibold mb-3">Draft Marks</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Marks Obtained</Label><Input type="number" placeholder="Enter marks" value={draftMarks[script.id] || ""} onChange={e => setDraftMarks({ ...draftMarks, [script.id]: e.target.value })} /></div>
                <div><Label>Total Marks</Label><Input value={script.totalMarks} readOnly className="bg-muted" /></div>
              </div>
              <div className="mt-4"><Label>Remarks</Label><Textarea value={draftRemarks[script.id] || ""} onChange={e => setDraftRemarks({ ...draftRemarks, [script.id]: e.target.value })} placeholder="Add remarks about this script..." className="min-h-[80px]" /></div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => { toast.success("Draft saved"); }} variant="outline"><Save className="mr-2 h-4 w-4" />Save Draft</Button>
                <Button onClick={() => { toast.success("Marks submitted for final review"); setSelectedScript(null); }} className="bg-gradient-brand border-0"><Send className="mr-2 h-4 w-4" />Submit Final Marks</Button>
              </div>
            </CardContent></Card>
          </CardContent></Card></StaggerItem>
          <StaggerItem><div className="space-y-4">
            <Card><CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Student</p>
              <p className="font-semibold">{script.student}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Exam</p>
              <p className="font-semibold">{script.exam}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Class</p>
              <p className="font-semibold">{script.class}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={script.status === "completed" ? "default" : "secondary"}>{script.status}</Badge>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Uploaded</p>
              <p className="font-semibold">{script.uploadedAt}</p>
            </CardContent></Card>
          </div></StaggerItem>
        </StaggerContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="exams">Exam List</TabsTrigger>
          <TabsTrigger value="queue" className="relative">
            Evaluation Queue
            {pendingScripts.length > 0 && <Badge className="ml-2 bg-destructive text-destructive-foreground h-4 text-[8px]">{pendingScripts.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedScripts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="mt-4">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Exam</TableHead><TableHead>Date</TableHead><TableHead>Subject</TableHead><TableHead>Scripts</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>{exams.map(e => {
                const total = answerScripts.filter(a => a.exam === e.name).length;
                const completed = answerScripts.filter(a => a.exam === e.name && a.status === "completed").length;
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.date}</TableCell>
                    <TableCell>{teacherSubjectData.name}</TableCell>
                    <TableCell>{completed}/{total} evaluated</TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => setActiveTab("queue")}>Evaluate</Button></TableCell>
                  </TableRow>
                );
              })}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="queue" className="mt-4">
          <StaggerContainer className="grid lg:grid-cols-3 gap-4 mb-4">
            <StaggerItem><Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-warning">{pendingScripts.length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card></StaggerItem>
            <StaggerItem><Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{evaluatingScripts.length}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card></StaggerItem>
            <StaggerItem><Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-success">{completedScripts.length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card></StaggerItem>
          </StaggerContainer>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Exam</TableHead><TableHead>Status</TableHead><TableHead>Draft</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>{answerScripts.filter(s => s.status !== "completed").map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.student}</TableCell>
                  <TableCell>{s.class}</TableCell>
                  <TableCell>{s.exam}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "evaluating" ? "default" : "secondary"} className={s.status === "evaluating" ? "bg-primary" : ""}>
                      {s.status === "pending" ? "Pending" : "Evaluating"}
                    </Badge>
                  </TableCell>
                  <TableCell>{s.draftMarks ?? "—"}</TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => setSelectedScript(s.id)}><Eye className="mr-2 h-4 w-4" />Review</Button></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Exam</TableHead><TableHead>Marks</TableHead><TableHead>Total</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
              <TableBody>{completedScripts.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.student}</TableCell>
                  <TableCell>{s.exam}</TableCell>
                  <TableCell className="text-success font-semibold">{s.marks}</TableCell>
                  <TableCell>{s.totalMarks}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{s.remarks}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/teacher/exams")({
  head: () => ({ meta: [{ title: "Exams — Teacher" }] }),
  component: TeacherExamsComponent,
});
