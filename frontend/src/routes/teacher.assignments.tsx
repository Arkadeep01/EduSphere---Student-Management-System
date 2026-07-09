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
import { teacherAssignments, teacherSubjectData, classStudents } from "@/lib/mock-data";
import { getSubmissions, updateMarks } from "@/lib/assignment-store";
import { toast } from "sonner";
import { useState } from "react";
import type { Assignment } from "@/lib/mock-data";
import { teacherAssignmentApi } from "@/services/teacherApi";

function getAssignmentStatus(a: Assignment): "active" | "closed" | "marked" {
  const dueDate = new Date(a.due);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dueDate >= today) return "active";
  if (a.graded < a.submissions) return "closed";
  return "marked";
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
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState("all");
  const [form, setForm] = useState({ title: "", description: "", targetClass: "", dueDate: "" });
  const [marksInput, setMarksInput] = useState<Record<string, string>>({});
  const [remarksInput, setRemarksInput] = useState<Record<string, string>>({});
  const [docViewerFile, setDocViewerFile] = useState<{ filename: string; url?: string } | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>(teacherAssignments);
  const [uploading, setUploading] = useState(false);

  const filtered = classFilter === "all"
    ? assignments
    : assignments.filter(a => a.class === classFilter);

  const handleCreate = () => {
    if (!form.title || !form.description || !form.dueDate) {
      toast.error("Title, description and due date are required");
      return;
    }
    toast.success(`Assignment "${form.title}" created for ${form.targetClass || "all classes"}`);
    setShowCreate(false);
    setForm({ title: "", description: "", targetClass: "", dueDate: "" });
  };

  async function handleUploadMarks(asgn: Assignment) {
    setUploading(true);
    const studentIds = Object.keys(marksInput);
    if (studentIds.length === 0) {
      toast.error("No marks entered to upload");
      setUploading(false);
      return;
    }
    try {
      const submissions = await teacherAssignmentApi.listSubmissions(asgn.id);
      if (submissions) {
        await Promise.all(
          submissions
            .filter(s => studentIds.includes(s.student.toString()))
            .map(s => teacherAssignmentApi.submitMarks(s.id, parseFloat(marksInput[s.student.toString()] || "0"), remarksInput[s.student.toString()] || "")),
        );
      }
    } catch {
      console.log("Teacher API unavailable, updating local state only");
    }
    studentIds.forEach(sid => {
      const m = parseFloat(marksInput[sid]);
      if (!isNaN(m)) {
        updateMarks(asgn.title, asgn.class, sid, m, 100, remarksInput[sid] || "No remarks");
      }
    });
    setAssignments(prev => prev.map(a => {
      if (a.id !== asgn.id) return a;
      const newMarks = { ...(a.marks || {}) };
      studentIds.forEach(sid => {
        const m = parseFloat(marksInput[sid]);
        if (!isNaN(m)) {
          newMarks[sid] = {
            marks: m,
            total: 100,
            remarks: remarksInput[sid] || "No remarks",
            evaluatedAt: new Date().toISOString().split("T")[0],
          };
        }
      });
      const newGraded = Object.keys(newMarks).length;
      return { ...a, marks: newMarks, graded: newGraded };
    }));
    setMarksInput({});
    setRemarksInput({});
    setUploading(false);
    toast.success(`Marks uploaded for ${studentIds.length} student(s)`);
  }

  if (selectedAssignment) {
    const asgn = assignments.find(a => a.id === selectedAssignment);
    if (!asgn) return null;
    const students = classStudents[asgn.class] || [];
    const storeSubmissions = getSubmissions(asgn.title, asgn.class);
    const totalGraded = Object.keys(asgn.marks || {}).length;
    const storeGraded = Object.values(storeSubmissions).filter(s => s.status === "evaluated").length;
    const combinedGraded = Math.max(totalGraded, storeGraded);

    return (
      <PageWrapper>
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedAssignment(null); setMarksInput({}); setRemarksInput({}); }}><ArrowLeft className="h-4 w-4" /></Button>
          <div><h2 className="text-lg font-bold">{asgn.title}</h2><p className="text-xs text-muted-foreground">{asgn.class} · Due {asgn.due}</p></div>
        </div>
        <StaggerContainer className="grid lg:grid-cols-3 gap-4">
          <StaggerItem><Card className="lg:col-span-2"><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Status</TableHead><TableHead>File</TableHead><TableHead>Marks</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
              <TableBody>
                {students.map(s => {
                  const sid = s.id;
                  const storeSub = storeSubmissions[sid];
                  const hasStoreFiles = storeSub && storeSub.files.length > 0;
                  const mockSubmitted = asgn.submittedFiles && asgn.submittedFiles[sid];
                  const marks = asgn.marks?.[sid] || (storeSub?.status === "evaluated" ? { marks: storeSub.marks!, total: storeSub.totalMarks!, remarks: storeSub.remarks, evaluatedAt: storeSub.evaluatedAt! } : undefined);
                  const status = marks ? "Marked" : (hasStoreFiles || mockSubmitted) ? "Submitted" : "Pending";
                  const storeFiles = storeSub?.files || [];

                  return (
                    <TableRow key={sid}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={status === "Marked" ? "default" : status === "Submitted" ? "secondary" : "outline"}
                          className={status === "Marked" ? "bg-success text-success-foreground" : ""}
                        >
                          {status === "Marked" ? `Marked (${marks!.marks}/${marks!.total})` : status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(hasStoreFiles || mockSubmitted) ? (
                          <div className="flex flex-col gap-1">
                            {storeFiles.length > 0 ? (
                              storeFiles.map((f, fi) => (
                                <div key={f.id} className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">{f.originalName}</span>
                                  <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => setDocViewerFile({ filename: f.originalName, url: f.dataUrl })}>
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-6 px-1.5" asChild>
                                    <a href={f.dataUrl} download={f.originalName}><Download className="h-3 w-3" /></a>
                                  </Button>
                                </div>
                              ))
                            ) : mockSubmitted ? (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setDocViewerFile({ filename: mockSubmitted.filename, url: mockSubmitted.url })}>
                                  <Eye className="h-3 w-3 mr-1" />View
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2" asChild>
                                  <a href={mockSubmitted.url} download={mockSubmitted.filename}><Download className="h-3 w-3" /></a>
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {marks ? (
                          <span className="text-sm font-medium text-success">{marks.marks}/{marks.total}</span>
                        ) : (
                          <Input
                            className="w-20 h-8 text-sm"
                            placeholder="—"
                            type="number"
                            value={marksInput[sid] || ""}
                            onChange={e => setMarksInput(prev => ({ ...prev, [sid]: e.target.value }))}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {marks ? (
                          <span className="text-xs text-muted-foreground max-w-[100px] truncate block">{marks.remarks}</span>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => {
                            const r = prompt("Enter remarks:", remarksInput[sid] || "");
                            if (r !== null) setRemarksInput(prev => ({ ...prev, [sid]: r }));
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
            <div><p className="text-sm text-muted-foreground">Submissions</p><p className="text-2xl font-bold">{asgn.submissions}/{asgn.total}</p></div>
            <div><p className="text-sm text-muted-foreground">Marked</p><p className="text-2xl font-bold text-success">{combinedGraded}/{asgn.submissions}</p></div>
            <ProgressBar value={combinedGraded} max={asgn.submissions} />
            <Button
              className="w-full bg-gradient-brand border-0"
              onClick={() => handleUploadMarks(asgn)}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />{uploading ? "Uploading..." : "Upload Marks"}
            </Button>
          </CardContent></Card></StaggerItem>
        </StaggerContainer>
        {docViewerFile && <StudentDocViewer filename={docViewerFile.filename} fileUrl={docViewerFile.url} onClose={() => setDocViewerFile(null)} />}
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
              <Select value={form.targetClass} onValueChange={v => setForm({ ...form, targetClass: v })}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {teacherSubjectData.classes.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Due Date *</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
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
              {teacherSubjectData.classes.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" className="ml-auto bg-gradient-brand border-0" onClick={() => setShowCreate(true)}>+ New Assignment</Button>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Class</TableHead><TableHead>Due</TableHead><TableHead>Submissions</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{filtered.map(a => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.title}</TableCell>
              <TableCell>{a.class}</TableCell>
              <TableCell>{a.due}</TableCell>
              <TableCell>{a.submissions}/{a.total}</TableCell>
              <TableCell>
                {getAssignmentStatus(a) === "active" && <Badge variant="secondary">Active</Badge>}
                {getAssignmentStatus(a) === "closed" && <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/10">Closed</Badge>}
                {getAssignmentStatus(a) === "marked" && <Badge className="bg-success text-success-foreground">Marked</Badge>}
              </TableCell>
              <TableCell><Button size="sm" variant="outline" onClick={() => setSelectedAssignment(a.id)}>Grade</Button></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </PageWrapper>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} /></div>;
}

export const Route = createFileRoute("/teacher/assignments")({
  head: () => ({ meta: [{ title: "Assignments — Teacher" }] }),
  component: TeacherAssignmentsComponent,
});
