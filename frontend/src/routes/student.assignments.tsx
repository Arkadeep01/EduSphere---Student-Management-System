import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { studentSubmissionApi } from "@/services/studentApi";
import { request, API_BASE } from "@/services/request";

interface Assignment {
  id: number; title: string; description: string; subject_name: string; target_class: string;
  due_date: string; status: string; created_at: string;
}

interface Submission {
  id: number; assignment: number; assignment_title: string; student_name: string;
  status: string; grade: string | null; remarks: string; submitted_at: string;
  files: { id: number; file: string; original_name: string; file_size: number; uploaded_at: string }[];
}

const STUDENT_API_BASE = "http://localhost:8000/api/student";

export const Route = createFileRoute("/student/assignments")({
  head: () => ({ meta: [{ title: "Assignments — Student" }] }),
  component: () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      (async () => {
        try {
          const [a, s] = await Promise.all([
            request<Assignment[]>("/assignments/", undefined, STUDENT_API_BASE).catch(() => []),
            studentSubmissionApi.list().catch(() => []),
          ]);
          setAssignments(a || []);
          setSubmissions(s || []);
        } catch { toast.error("Failed to load assignments"); }
        finally { setLoading(false); }
      })();
    }, []);

    const handleSubmit = async () => {
      if (!selectedAssignment || selectedFiles.length === 0) { toast.error("Select files to upload"); return; }
      setSubmitting(true);
      try {
        const sub = await studentSubmissionApi.submit(selectedAssignment.toString(), selectedFiles);
        if (sub) {
          toast.success("Assignment submitted");
          setShowSubmitDialog(false);
          setSelectedFiles([]);
          const s = await studentSubmissionApi.list();
          setSubmissions(s || []);
        }
      } catch { toast.error("Failed to submit"); }
      finally { setSubmitting(false); }
    };

    const getSubmissionFor = (assignmentId: number) => submissions.find(s => s.assignment === assignmentId);

    if (loading) return <div className="text-center py-8 text-muted-foreground">Loading assignments...</div>;

    return (
      <div className="space-y-6">
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="evaluated">Evaluated</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="space-y-3">
              {assignments.filter(a => !submissions.find(s => s.assignment === a.id && s.status !== "draft")).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground"><CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-40" /><p>All assignments completed!</p></div>
              ) : assignments.filter(a => !submissions.find(s => s.assignment === a.id && s.status !== "draft")).map(a => (
                <Card key={a.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div><h3 className="font-semibold">{a.title}</h3><p className="text-xs text-muted-foreground mt-1">{a.subject_name} · {a.target_class}</p></div>
                      <div className="text-right text-xs">
                        <Badge variant={new Date(a.due_date) < new Date() ? "destructive" : "outline"}>
                          {new Date(a.due_date) < new Date() ? "Overdue" : "Active"}
                        </Badge>
                        <p className="text-muted-foreground mt-1">Due: {new Date(a.due_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{a.description}</p>
                    <div className="flex justify-end mt-3">
                      <Button size="sm" className="bg-gradient-brand border-0" onClick={() => { setSelectedAssignment(a.id); setShowSubmitDialog(true); }}>
                        <Upload className="h-3 w-3 mr-1" />Submit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="submitted">
            {submissions.filter(s => s.status === "submitted" || s.status === "pending").length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No submissions pending review</div>
            ) : (
              <Table><TableHeader><TableRow><TableHead>Assignment</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>{submissions.filter(s => s.status === "submitted" || s.status === "pending").map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.assignment_title}</TableCell>
                    <TableCell className="text-xs">{new Date(s.submitted_at).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant="secondary">Awaiting Review</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="evaluated">
            {submissions.filter(s => s.status === "evaluated").length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No evaluated assignments yet</div>
            ) : (
              <Table><TableHeader><TableRow><TableHead>Assignment</TableHead><TableHead>Grade</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                <TableBody>{submissions.filter(s => s.status === "evaluated").map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.assignment_title}</TableCell>
                    <TableCell><Badge className="bg-success">{s.grade || "N/A"}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.remarks || "—"}</TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showSubmitDialog} onOpenChange={o => { if (!o) { setShowSubmitDialog(false); setSelectedFiles([]); } }}>
          <DialogContent><DialogHeader><DialogTitle>Submit Assignment</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary" onClick={() => fileRef.current?.click()}>
                <Upload className="h-5 w-5 mx-auto mb-1" />
                {selectedFiles.length > 0 ? <p>{selectedFiles.length} file(s) selected</p> : <p>Click to select files</p>}
              </div>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={e => { const files = Array.from(e.target.files || []); setSelectedFiles(prev => [...prev, ...files]); e.target.value = ""; }} />
              {selectedFiles.length > 0 && (
                <div className="space-y-1 max-h-[150px] overflow-y-auto">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between border rounded p-1 text-xs">
                      <span className="truncate">{f.name}</span>
                      <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-destructive" onClick={() => setSelectedFiles(prev => prev.filter((_, j) => j !== i))}><X className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowSubmitDialog(false); setSelectedFiles([]); }}>Cancel</Button>
              <Button className="bg-gradient-brand border-0" disabled={submitting || selectedFiles.length === 0} onClick={handleSubmit}>
                {submitting ? "Submitting..." : `Submit (${selectedFiles.length})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
});
