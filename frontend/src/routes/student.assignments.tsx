import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { assignments, submissionHistory, assignmentDetails } from "@/lib/mock-data";
import { toast } from "sonner";
import { useState } from "react";
import { FileUp, Download, FileText, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

function StudentAssignmentsComponent() {
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitNote, setSubmitNote] = useState("");

  const detail = assignmentDetails;

  if (selectedAssignment && selectedAssignment === detail.id) {
    return (
      <PageWrapper>
        <StaggerContainer className="grid lg:grid-cols-3 gap-4">
          <StaggerItem><div className="lg:col-span-2 space-y-4">
            <Card><CardContent className="p-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{detail.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><FileText className="h-4 w-4" />Total Marks: {detail.totalMarks}</span>
                <Badge variant={detail.status === "pending" ? "secondary" : "default"}>{detail.status}</Badge>
              </div>
            </CardContent></Card>
            {detail.attachments.length > 0 && (
              <Card><CardContent className="p-6">
                <h3 className="font-semibold mb-3">Attachments</h3>
                {detail.attachments.map((att, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                    <div className="flex items-center gap-3"><FileText className="h-4 w-4 text-primary" /><span className="text-sm">{att}</span></div>
                    <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                  </div>
                ))}
              </CardContent></Card>
            )}
            {!showSubmitModal && detail.status === "pending" && (
              <Card><CardContent className="p-6">
                <h3 className="font-semibold mb-3">Your Submission</h3>
                <p className="text-sm text-muted-foreground mb-4">You haven't submitted this assignment yet.</p>
                <Button onClick={() => setShowSubmitModal(true)} className="bg-gradient-brand border-0"><FileUp className="mr-2 h-4 w-4" />Upload Submission</Button>
              </CardContent></Card>
            )}
            {showSubmitModal && (
              <Card><CardContent className="p-6">
                <h3 className="font-semibold mb-3">Submit Assignment</h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                    <FileUp className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium mt-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, ZIP (max 10MB)</p>
                  </div>
                  <div><p className="text-sm font-medium mb-1">Notes (optional)</p><Textarea value={submitNote} onChange={e => setSubmitNote(e.target.value)} placeholder="Add a note to your teacher..." className="min-h-[80px]" /></div>
                  <div className="flex gap-2">
                    <Button onClick={() => { toast.success("Assignment submitted!"); setShowSubmitModal(false); setSubmitNote(""); }} className="bg-gradient-brand border-0">Submit</Button>
                    <Button variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
                  </div>
                </div>
              </CardContent></Card>
            )}
            {detail.marks !== null && (
              <Card><CardContent className="p-6">
                <h3 className="font-semibold mb-3">Evaluation</h3>
                <div className="flex items-center gap-6 mb-4">
                  <div><p className="text-3xl font-bold text-success">{detail.marks}/{detail.totalMarks}</p><p className="text-xs text-muted-foreground">Marks Obtained</p></div>
                </div>
                {detail.teacherRemarks && (
                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                    <MessageSquare className="h-4 w-4 text-primary mt-1" />
                    <div><p className="text-sm font-medium">Teacher's Remarks</p><p className="text-sm text-muted-foreground">{detail.teacherRemarks}</p></div>
                  </div>
                )}
              </CardContent></Card>
            )}
          </div></StaggerItem>
          <StaggerItem><Card><CardContent className="p-6">
            <h3 className="font-semibold mb-3">Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subject</span><span className="font-medium">{detail.subject}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span className="font-medium">{detail.due}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={detail.status === "pending" ? "secondary" : "default"} className="text-[10px]">{detail.status}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Marks</span><span className="font-medium">{detail.totalMarks}</span></div>
            </div>
          </CardContent></Card></StaggerItem>
        </StaggerContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Tabs defaultValue="active">
        <TabsList><TabsTrigger value="active">Active</TabsTrigger><TabsTrigger value="history">Submission History</TabsTrigger></TabsList>
        <TabsContent value="active">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Subject</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>{assignments.filter(a => a.status === "pending").map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium"><button onClick={() => setSelectedAssignment(a.id)} className="hover:text-primary transition-colors text-left">{a.title}</button></TableCell>
                  <TableCell>{a.subject}</TableCell>
                  <TableCell>{a.due}</TableCell>
                  <TableCell><Badge variant="secondary">{a.status}</Badge></TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setSelectedAssignment(a.id)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="history">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Subject</TableHead><TableHead>Submitted</TableHead><TableHead>Marks</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
              <TableBody>{submissionHistory.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.subject}</TableCell>
                  <TableCell>{s.submitted}</TableCell>
                  <TableCell>{s.marks}/{s.total}</TableCell>
                  <TableCell><Badge className="bg-gradient-brand text-white border-0">{s.grade}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
          <Card className="mt-4"><CardHeader><CardTitle>Teacher Remarks</CardTitle></CardHeader><CardContent className="space-y-3">
            {submissionHistory.map(s => (
              <div key={s.id} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1"><span className="font-medium text-sm">{s.title}</span><Badge className="bg-gradient-brand text-white border-0 text-[10px]">{s.grade}</Badge></div>
                <p className="text-sm text-muted-foreground">{s.remarks}</p>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/student/assignments")({
  head: () => ({ meta: [{ title: "Assignments — Student" }] }),
  component: StudentAssignmentsComponent,
});
