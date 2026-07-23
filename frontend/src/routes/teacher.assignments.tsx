import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, MessageSquare, Eye, Download, ArrowLeft, FileText } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { teacherAssignmentApi } from "@/services/teacherApi";
import type { AssignmentData, SubmissionData } from "@/services/teacherApi";

function getAssignmentStatus(dueDate: string): "active" | "closed" {
  return new Date(dueDate) >= new Date() ? "active" : "closed";
}

function StudentDocViewer({ filename, fileUrl }: { filename: string; fileUrl?: string; onClose: () => void }) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const isPdf = ext === "pdf";
  const href = fileUrl || `http://localhost:8000/media/student_submissions/${filename}`;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {filename}
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-[400px] w-full bg-muted/10 rounded-lg overflow-hidden">
          {isPdf ? (
            <iframe src={href} className="w-full h-[65vh] border-0" title={filename} />
          ) : (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium mt-3">{filename}</p>
                <p className="text-xs text-muted-foreground mt-1">Preview not available for this format</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" asChild>
            <a href={href} download={filename}><Download className="mr-2 h-4 w-4" />Download</a>
          </Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TeacherAssignmentsComponent() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentData | null>(null);
  const [classFilter, setClassFilter] = useState("all");
  const [form, setForm] = useState({ title: "", description: "", target_class: "", due_date: "" });
  const [marksInput, setMarksInput] = useState<Record<string, string>>({});
  const [remarksInput, setRemarksInput] = useState<Record<string, string>>({});
  const [docViewerFile, setDocViewerFile] = useState<{ filename: string; url?: string } | null>(null);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [classOptions, setClassOptions] = useState<string[]>([]);

  const fetchAssignments = useCallback(async () => {
    try {
      const data = await teacherAssignmentApi.list();
      setAssignments(data || []);
      setClassOptions(Array.from(new Set((data || []).map(a => a.target_class))));
    } catch {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const filtered = classFilter === "all"
    ? assignments
    : assignments.filter(a => a.target_class === classFilter);

  function getStudentsForClass(class_name: string): { id: number; name: string }[] {
    if (!submissions.length) return [];
    const seen = new Map<number, string>();
    submissions.forEach(s => {
      if (!seen.has(s.student)) {
        seen.set(s.student, s.student_name);
      }
    });
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.due_date) {
      toast.error("Title, description and due date are required");
      return;
    }
    try {
      await teacherAssignmentApi.create({
        title: form.title,
        description: form.description,
        subject: 0,
        target_class: form.target_class,
        due_date: new Date(form.due_date).toISOString(),
      });
      toast.success(`Assignment "${form.title}" created`);
      setShowCreate(false);
      setForm({ title: "", description: "", target_class: "", due_date: "" });
      fetchAssignments();
    } catch {
      toast.error("Failed to create assignment");
    }
  };

  function handleGradeClick(asgn: AssignmentData) {
    setSelectedAssignment(asgn);
    setMarksInput({});
    setRemarksInput({});
    teacherAssignmentApi.listSubmissions(asgn.id).then(data => {
      setSubmissions(data || []);
    }).catch(() => setSubmissions([]));
  }

  async function handleUploadMarks() {
    setUploading(true);
    const studentIds = Object.keys(marksInput);
    if (studentIds.length === 0) {
      toast.error("No marks entered to upload");
      setUploading(false);
      return;
    }
    let count = 0;
    for (const sid of studentIds) {
      const grade = parseFloat(marksInput[sid]);
      if (isNaN(grade)) continue;
      const sub = submissions.find(s => s.student.toString() === sid);
      if (sub) {
        try {
          await teacherAssignmentApi.submitMarks(sub.id, grade, remarksInput[sid] || "");
          count++;
        } catch { /* skip */ }
      }
    }
    if (count > 0) {
      toast.success(`Marks uploaded for ${count} student(s)`);
      const data = await teacherAssignmentApi.listSubmissions(selectedAssignment!.id);
      setSubmissions(data || []);
    }
    setMarksInput({});
    setRemarksInput({});
    setUploading(false);
  }

  if (loading) {
    return <PageWrapper><div className="text-center py-8 text-muted-foreground">Loading assignments...</div></PageWrapper>;
  }

  if (selectedAssignment) {
    const asgn = selectedAssignment;
    const students = getStudentsForClass(asgn.target_class);

    return (
      <PageWrapper>
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedAssignment(null); setMarksInput({}); setRemarksInput({}); }}><ArrowLeft className="h-4 w-4" /></Button>
          <div><h2 className="text-lg font-bold">{asgn.title}</h2><p className="text-xs text-muted-foreground">{asgn.target_class} · Due {new Date(asgn.due_date).toLocaleDateString()}</p></div>
        </div>
        <StaggerContainer className="grid lg:grid-cols-3 gap-4">
          <StaggerItem><Card className="lg:col-span-2"><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Status</TableHead><TableHead>File</TableHead><TableHead>Marks</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
              <TableBody>
                {students.map(s => {
                  const sub = submissions.find(x => x.student === s.id);
                  const status = sub?.status === "evaluated" ? "Marked" : sub?.status === "submitted" ? "Submitted" : "Pending";
                  const markEntry = sub?.status === "evaluated" ? { marks: sub.grade, total: 100, remarks: sub.remarks } : null;

                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={status === "Marked" ? "default" : status === "Submitted" ? "secondary" : "outline"}
                          className={status === "Marked" ? "bg-success text-success-foreground" : ""}
                        >
                          {status === "Marked" ? `Marked (${markEntry!.marks}/100)` : status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sub?.files?.length ? (
                          <div className="flex flex-col gap-1">
                            {sub.files.map((f, fi) => (
                              <div key={f.id} className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground truncate max-w-[100px]">{f.original_name}</span>
                                <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => setDocViewerFile({ filename: f.original_name })}>
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 px-1.5" asChild>
                                  <a href={f.file} download={f.original_name}><Download className="h-3 w-3" /></a>
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {markEntry ? (
                          <span className="text-sm font-medium text-success">{markEntry.marks}/100</span>
                        ) : (
                          <Input
                            className="w-20 h-8 text-sm"
                            placeholder="—"
                            type="number"
                            value={marksInput[s.id.toString()] || ""}
                            onChange={e => setMarksInput(prev => ({ ...prev, [s.id.toString()]: e.target.value }))}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {markEntry ? (
                          <span className="text-xs text-muted-foreground max-w-[100px] truncate block">{markEntry.remarks}</span>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => {
                            const r = prompt("Enter remarks:", remarksInput[s.id.toString()] || "");
                            if (r !== null) setRemarksInput(prev => ({ ...prev, [s.id.toString()]: r }));
                          }}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent></Card></StaggerItem>
          <StaggerItem><Card><CardContent className="p-6 space-y-4">
            <div><p className="text-sm text-muted-foreground">Submissions</p><p className="text-2xl font-bold">{submissions.filter(s => s.status === "submitted" || s.status === "evaluated").length}/{students.length}</p></div>
            <div><p className="text-sm text-muted-foreground">Marked</p><p className="text-2xl font-bold text-success">{submissions.filter(s => s.status === "evaluated").length}/{submissions.filter(s => s.status === "submitted" || s.status === "evaluated").length}</p></div>
            <Button
              className="w-full bg-gradient-brand border-0"
              onClick={handleUploadMarks}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />{uploading ? "Uploading..." : "Upload Marks"}
            </Button>
          </CardContent></Card></StaggerItem>
        </StaggerContainer>
        {docViewerFile && <StudentDocViewer filename={docViewerFile.filename} onClose={() => setDocViewerFile(null)} />}
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {showCreate && (
        <Card className="mb-6"><CardContent className="p-6">
          <h3 className="font-semibold mb-4">Create New Assignment</h3>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="sm:col-span-2 space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Quadratic Equations Problem Set" /></div>
            <div className="sm:col-span-2 space-y-2"><Label>Description *</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed instructions for the assignment..." className="min-h-[100px]" /></div>
            <div className="space-y-2"><Label>Target Class</Label>
              <Select value={form.target_class} onValueChange={v => setForm({ ...form, target_class: v })}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classOptions.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Due Date *</Label><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
            <div className="sm:col-span-2 flex gap-2">
              <Button onClick={handleCreate} className="bg-gradient-brand border-0">Create & Publish</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        </CardContent></Card>
      )}

      <Card className="mb-4"><CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Filter by class:</span>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classOptions.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" className="ml-auto bg-gradient-brand border-0" onClick={() => setShowCreate(true)}>+ New Assignment</Button>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Class</TableHead><TableHead>Due</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{filtered.map(a => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.title}</TableCell>
              <TableCell>{a.target_class}</TableCell>
              <TableCell>{new Date(a.due_date).toLocaleDateString()}</TableCell>
              <TableCell>{a.subject_name}</TableCell>
              <TableCell>
                {getAssignmentStatus(a.due_date) === "active" && <Badge variant="secondary">Active</Badge>}
                {getAssignmentStatus(a.due_date) === "closed" && <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/10">Closed</Badge>}
              </TableCell>
              <TableCell><Button size="sm" variant="outline" onClick={() => handleGradeClick(a)}>Grade</Button></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/teacher/assignments")({
  head: () => ({ meta: [{ title: "Assignments — Teacher" }] }),
  component: TeacherAssignmentsComponent,
});
