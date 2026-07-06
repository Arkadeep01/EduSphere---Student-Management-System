import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { assignments, submissionHistory, getAssignmentDetailById, studentSubmissions } from "@/lib/mock-data";
import type { StudentSubmission, SubmissionFileInfo } from "@/lib/mock-data";
import { addSubmission, getSubmission, removeFile as storeRemoveFile } from "@/lib/assignment-store";
import { studentProfileData } from "@/lib/mock-data";
import { toast } from "sonner";
import { useState, useRef, useCallback, useMemo } from "react";
import { FileUp, Download, FileText, MessageSquare, X, Upload, CheckCircle, Clock, Eye } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { studentSubmissionApi } from "@/services/studentApi";

const ALLOWED_TYPES = [".pdf", ".ppt", ".pptx"];
const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPastDue(due: string): boolean {
  return new Date(due) < new Date();
}

function StudentAssignmentsComponent() {
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitNote, setSubmitNote] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submission, setSubmission] = useState<StudentSubmission | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewSubmittedFile, setPreviewSubmittedFile] = useState<SubmissionFileInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detail = useMemo(() => {
    if (!selectedAssignment) return null;
    return getAssignmentDetailById(selectedAssignment);
  }, [selectedAssignment]);

  const duePassed = detail ? isPastDue(detail.due) : false;

  const className = studentProfileData.academic.class;
  const studentId = studentProfileData.academic.rollNumber;
  const studentName = studentProfileData.personal.fullName;

  const getAssignmentTitle = useCallback((assignmentId: string): string | undefined => {
    return assignments.find(a => a.id === assignmentId)?.title;
  }, []);

  const loadSubmission = useCallback(async (assignmentId: string) => {
    const title = getAssignmentTitle(assignmentId);
    if (!title) return;

    try {
      const data = await studentSubmissionApi.getForAssignment(assignmentId);
      if (data && "submission" in data && data.submission === null) {
        setSubmission(null);
        return;
      }
      const s = data as { id: number; status: string; files: { id: number; original_name: string; file_type: string; file_size: number; uploaded_at: string }[]; grade: string | null; remarks: string; submitted_at: string; evaluated_at: string | null };
      const mapped: StudentSubmission = {
        id: String(s.id),
        assignmentId,
        status: s.status as StudentSubmission["status"],
        files: s.files.map(f => ({
          id: String(f.id),
          originalName: f.original_name,
          fileType: f.file_type,
          fileSize: f.file_size,
          uploadedAt: f.uploaded_at,
        })),
        grade: s.grade,
        marks: s.grade ? Number(s.grade) : null,
        totalMarks: detail?.totalMarks ?? 50,
        remarks: s.remarks,
        submittedAt: s.submitted_at,
        evaluatedAt: s.evaluated_at,
      };
      setSubmission(mapped);
      studentSubmissions[assignmentId] = mapped;
    } catch {
      const stored = getSubmission(title, className, studentId);
      if (stored) {
        const mapped: StudentSubmission = {
          id: stored.id,
          assignmentId,
          status: stored.status,
          files: stored.files.map(f => ({
            id: f.id,
            originalName: f.originalName,
            fileType: f.fileType,
            fileSize: f.fileSize,
            uploadedAt: f.uploadedAt,
            dataUrl: f.dataUrl,
          })),
          grade: stored.marks?.toString() || null,
          marks: stored.marks,
          totalMarks: stored.totalMarks ?? detail?.totalMarks ?? 50,
          remarks: stored.remarks,
          submittedAt: stored.submittedAt,
          evaluatedAt: stored.evaluatedAt,
        };
        setSubmission(mapped);
        studentSubmissions[assignmentId] = mapped;
      } else {
        const existing = studentSubmissions[assignmentId];
        setSubmission(existing || null);
      }
    }
  }, [className, studentId, detail, getAssignmentTitle]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const errors: string[] = [];
    const valid: File[] = [];

    for (const f of files) {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_TYPES.includes(ext)) {
        errors.push(`"${f.name}": unsupported format. Allowed: PDF, PPT, PPTX`);
        continue;
      }
      if (f.size > MAX_SIZE_BYTES) {
        errors.push(`"${f.name}": exceeds ${MAX_SIZE_MB} MB limit`);
        continue;
      }
      valid.push(f);
    }

    const combined = [...selectedFiles, ...valid].slice(0, MAX_FILES);
    if (valid.length + selectedFiles.length > MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} files allowed.`);
    }

    setSelectedFiles(combined);
    if (errors.length > 0) {
      toast.error(errors.join("\n"));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (selectedFiles.length === 0 || !selectedAssignment) {
      toast.error("Please select at least one file.");
      return;
    }
    const title = getAssignmentTitle(selectedAssignment);
    if (!title) {
      toast.error("Assignment not found.");
      return;
    }
    setUploading(true);
    try {
      const data = await studentSubmissionApi.submit(selectedAssignment, selectedFiles);
      const mapped: StudentSubmission = {
        id: String(data.id),
        assignmentId: selectedAssignment,
        status: data.status as StudentSubmission["status"],
        files: data.files.map(f => ({
          id: String(f.id),
          originalName: f.original_name,
          fileType: f.file_type,
          fileSize: f.file_size,
          uploadedAt: f.uploaded_at,
        })),
        grade: data.grade,
        marks: data.grade ? Number(data.grade) : null,
        totalMarks: detail?.totalMarks ?? 50,
        remarks: data.remarks,
        submittedAt: data.submitted_at,
        evaluatedAt: data.evaluated_at,
      };
      setSubmission(mapped);
      studentSubmissions[selectedAssignment] = mapped;
      setSelectedFiles([]);
      setShowSubmitModal(false);
      setSubmitNote("");
      toast.success("Assignment submitted!");
    } catch {
      const fileEntries = selectedFiles.map((f, i) => ({
        id: `mock_f_${Date.now()}_${i}`,
        originalName: f.name,
        fileType: f.name.split(".").pop() || "",
        fileSize: f.size,
        uploadedAt: new Date().toISOString(),
        dataUrl: URL.createObjectURL(f),
      }));

      const stored = addSubmission(title, className, studentId, studentName, fileEntries, detail?.totalMarks ?? 50);

      const existing = studentSubmissions[selectedAssignment];
      const merged: StudentSubmission = {
        id: stored.id,
        assignmentId: selectedAssignment,
        status: stored.status,
        files: stored.files.map(f => ({
          id: f.id,
          originalName: f.originalName,
          fileType: f.fileType,
          fileSize: f.fileSize,
          uploadedAt: f.uploadedAt,
          dataUrl: f.dataUrl,
        })),
        grade: null,
        marks: null,
        totalMarks: detail?.totalMarks ?? 50,
        remarks: "",
        submittedAt: stored.submittedAt,
        evaluatedAt: null,
      };
      setSubmission(merged);
      studentSubmissions[selectedAssignment] = merged;
      setSelectedFiles([]);
      setShowSubmitModal(false);
      setSubmitNote("");
      toast.success("Assignment submitted!");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveFile(fileId: string) {
    if (!submission || !selectedAssignment) return;
    const title = getAssignmentTitle(selectedAssignment);
    if (!title) return;
    try {
      await studentSubmissionApi.removeFile(Number(fileId));
    } catch {
      /* mock fallback */
    }
    storeRemoveFile(title, className, studentId, fileId);
    const updated = {
      ...submission,
      files: submission.files.filter(f => f.id !== fileId),
    };
    if (updated.files.length === 0) {
      updated.status = "pending";
    }
    setSubmission(updated);
    studentSubmissions[selectedAssignment] = updated;
    toast.success("File removed.");
  }

  const submissionStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "secondary" | "default" | "outline" }> = {
      pending: { label: "Pending", variant: "secondary" },
      submitted: { label: "Submitted", variant: "default" },
      evaluated: { label: "Marked", variant: "outline" },
      late: { label: "Late", variant: "outline" },
    };
    const s = map[status] || map.pending;
    return <Badge variant={s.variant} className={status === "submitted" ? "bg-success" : status === "evaluated" ? "bg-brand" : ""}>{s.label}</Badge>;
  };

  function SelectedFilePreviewDialog({ file, onClose }: { file: File | null; onClose: () => void }) {
    if (!file) return null;
    const ext = file.name.split(".").pop()?.toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
    const isPdf = ext === "pdf";
    return (
      <Dialog open={!!file} onOpenChange={o => { if (!o) onClose(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{file.name}</DialogTitle></DialogHeader>
          <div className="min-h-[300px] bg-muted/10 rounded-lg flex items-center justify-center">
            {isImage ? (
              <img src={URL.createObjectURL(file)} alt={file.name} className="max-h-[400px] object-contain rounded" />
            ) : isPdf ? (
              <embed src={URL.createObjectURL(file)} type="application/pdf" className="w-full h-[400px]" />
            ) : (
              <div className="text-center p-8">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium mt-2">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Preview not available for this format</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function SubmittedFilePreviewDialog({ file, onClose }: { file: SubmissionFileInfo | null; onClose: () => void }) {
    if (!file) return null;
    const isPdf = file.fileType === "pdf" || file.originalName.toLowerCase().endsWith(".pdf");
    const hasPreview = isPdf && file.dataUrl;
    return (
      <Dialog open={!!file} onOpenChange={o => { if (!o) onClose(); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{file.originalName}</DialogTitle></DialogHeader>
          <div className="min-h-[300px] bg-muted/10 rounded-lg flex items-center justify-center">
            {hasPreview ? (
              <iframe src={file.dataUrl} className="w-full h-[60vh] border-0" title={file.originalName} />
            ) : (
              <div className="text-center p-8">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium mt-2">{file.originalName}</p>
                <p className="text-xs text-muted-foreground mt-1">Uploaded: {new Date(file.uploadedAt).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Size: {formatSize(file.fileSize)}</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            {file.dataUrl && (
              <Button variant="outline" asChild>
                <a href={file.dataUrl} download={file.originalName}><Download className="mr-2 h-4 w-4" />Download</a>
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (selectedAssignment && detail) {
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
                {duePassed && <span className="flex items-center gap-1 text-destructive"><Clock className="h-4 w-4" />Due date passed</span>}
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
            {submission && submission.files.length > 0 && !showSubmitModal && (
              <Card><CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Submitted Files</h3>
                  {submission.status === "evaluated" ? (
                    <Badge variant="outline" className="bg-success text-success-foreground">Marked ({submission.marks}/{submission.totalMarks})</Badge>
                  ) : (
                    submissionStatusBadge(submission.status)
                  )}
                </div>
                <div className="space-y-2">
                  {submission.files.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{f.originalName}</p>
                          <p className="text-xs text-muted-foreground">{formatSize(f.fileSize)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => setPreviewSubmittedFile(f)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        {f.dataUrl && (
                          <Button size="sm" variant="ghost" className="h-7" asChild>
                            <a href={f.dataUrl} download={f.originalName}><Download className="h-3 w-3" /></a>
                          </Button>
                        )}
                        {!duePassed && submission.status !== "evaluated" && (
                          <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive" onClick={() => handleRemoveFile(f.id)}>
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {!duePassed && submission.status !== "evaluated" && (
                  <Button onClick={() => setShowSubmitModal(true)} className="mt-3 bg-gradient-brand border-0" size="sm"><Upload className="mr-2 h-4 w-4" />Add More Files</Button>
                )}
              </CardContent></Card>
            )}
            {!submission && !showSubmitModal && !duePassed && (
              <Card><CardContent className="p-6">
                <h3 className="font-semibold mb-3">Your Submission</h3>
                <p className="text-sm text-muted-foreground mb-4">You haven't submitted this assignment yet.</p>
                <Button onClick={() => setShowSubmitModal(true)} className="bg-gradient-brand border-0"><FileUp className="mr-2 h-4 w-4" />Upload Submission</Button>
              </CardContent></Card>
            )}
            {!submission && duePassed && (
              <Card><CardContent className="p-6">
                <h3 className="font-semibold mb-3">Your Submission</h3>
                <p className="text-sm text-muted-foreground">The due date has passed. You can no longer submit this assignment.</p>
              </CardContent></Card>
            )}
            {showSubmitModal && (
              <Card><CardContent className="p-6">
                <h3 className="font-semibold mb-3">Submit Assignment</h3>
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium mt-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PDF, PPT, PPTX (max {MAX_SIZE_MB}MB each, up to {MAX_FILES} files)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.ppt,.pptx"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selected Files ({selectedFiles.length}/{MAX_FILES})</p>
                      {selectedFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-4 w-4 shrink-0 text-primary" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{f.name}</p>
                              <p className="text-xs text-muted-foreground">{formatSize(f.size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button size="sm" variant="ghost" className="h-7" onClick={() => setPreviewFile(f)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive" onClick={() => removeSelectedFile(i)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div><p className="text-sm font-medium mb-1">Notes (optional)</p><Textarea value={submitNote} onChange={e => setSubmitNote(e.target.value)} placeholder="Add a note to your teacher..." className="min-h-[80px]" /></div>
                  <div className="flex gap-2">
                    <Button onClick={handleSubmit} disabled={uploading || selectedFiles.length === 0} className="bg-gradient-brand border-0">
                      {uploading ? <>Uploading...</> : <><CheckCircle className="mr-2 h-4 w-4" />Submit</>}
                    </Button>
                    <Button variant="outline" onClick={() => { setShowSubmitModal(false); setSelectedFiles([]); }}>Cancel</Button>
                  </div>
                </div>
              </CardContent></Card>
            )}
            {submission?.status === "evaluated" && (
              <Card><CardContent className="p-6">
                <h3 className="font-semibold mb-3">Evaluation</h3>
                <div className="flex items-center gap-6 mb-4">
                  <div><p className="text-3xl font-bold text-success">{submission.marks}/{submission.totalMarks}</p><p className="text-xs text-muted-foreground">Marks Obtained</p></div>
                </div>
                {submission.remarks && (
                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                    <MessageSquare className="h-4 w-4 text-primary mt-1" />
                    <div><p className="text-sm font-medium">Teacher's Remarks</p><p className="text-sm text-muted-foreground">{submission.remarks}</p></div>
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
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span>{submission ? submissionStatusBadge(submission.status) : <Badge variant="secondary">Pending</Badge>}</div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Marks</span><span className="font-medium">{detail.totalMarks}</span></div>
              {submission && submission.files.length > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Submitted Files</span><span className="font-medium">{submission.files.length}</span></div>
              )}
            </div>
          </CardContent></Card>          </StaggerItem>
        </StaggerContainer>
        <SelectedFilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
        <SubmittedFilePreviewDialog file={previewSubmittedFile} onClose={() => setPreviewSubmittedFile(null)} />
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
                  <TableCell className="font-medium"><button onClick={() => { setSelectedAssignment(a.id); loadSubmission(a.id); }} className="hover:text-primary transition-colors text-left">{a.title}</button></TableCell>
                  <TableCell>{a.subject}</TableCell>
                  <TableCell>{a.due}</TableCell>
                  <TableCell>
                    {studentSubmissions[a.id] ? (
                      submissionStatusBadge(studentSubmissions[a.id].status)
                    ) : (
                      <Badge variant="secondary">{a.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedAssignment(a.id); loadSubmission(a.id); }}>View</Button>
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
