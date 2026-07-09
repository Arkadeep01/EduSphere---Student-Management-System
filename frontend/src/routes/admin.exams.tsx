import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, Plus, CheckCircle2, Archive, Eye, Upload, BarChart3, X, FileText, Download } from "lucide-react";
import { useState, useRef } from "react";
import { examsFull, answerScriptsFull, evaluationTracking, subjects, classCards, classStudents } from "@/lib/mock-data";
import { addAnswerScript, getAnswerScripts } from "@/lib/script-store";
import { validateFile, generateMockUploadResponse, ALLOWED_SCRIPT_TYPES, MAX_SCRIPT_SIZE_BYTES, formatFileSize } from "@/lib/upload";
import type { UploadedFileInfo } from "@/lib/upload";
import { toast } from "sonner";
import { ExportDialog } from "@/components/export";
import { examExportConfig } from "@/components/export/moduleConfigs";

const statusBadge: Record<string, { variant: "default" | "secondary" | "outline" | "destructive", className: string }> = {
  draft: { variant: "secondary", className: "" },
  scheduled: { variant: "default", className: "bg-info" },
  published: { variant: "default", className: "bg-success" },
  archived: { variant: "outline", className: "" },
};

const scriptStatusBadge: Record<string, { variant: "default" | "secondary" | "outline", className: string }> = {
  pending: { variant: "secondary", className: "" },
  evaluating: { variant: "default", className: "bg-warning" },
  completed: { variant: "default", className: "bg-success" },
};

function AdminExamsComponent() {
  const [showExport, setShowExport] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [exams, setExams] = useState(examsFull);
  const [scriptState, setScriptState] = useState(answerScriptsFull);
  const [uploadForm, setUploadForm] = useState({ className: "", section: "", subject: "", examName: "" });
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [uploadEntries, setUploadEntries] = useState<{ studentId: string; studentName: string; rollNumber: string; file: File }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewScriptFile, setPreviewScriptFile] = useState<File | null>(null);
  const scriptFileInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);

  const publishExam = (id: string) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, status: "published" as const } : e));
    toast.success("Exam published");
  };

  const archiveExam = (id: string) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, status: "archived" as const } : e));
    toast.success("Exam archived");
  };

  return (
    <>
      <Tabs defaultValue="exams">
        <TabsList className="mb-4"><TabsTrigger value="exams">Exams</TabsTrigger><TabsTrigger value="scripts">Answer Scripts</TabsTrigger><TabsTrigger value="evaluation">Evaluation Tracking</TabsTrigger></TabsList>

        <TabsContent value="exams">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-lg font-semibold">Exam Schedule</h3></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="mr-2 h-4 w-4" />Export</Button>
              <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Create Exam</Button>
            </div>
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Exam</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Room</TableHead><TableHead>Duration</TableHead><TableHead>Classes</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>{exams.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell><span className="flex items-center gap-1 text-sm"><Calendar className="h-3 w-3" />{e.date}</span></TableCell>
                  <TableCell><span className="flex items-center gap-1 text-sm"><Clock className="h-3 w-3" />{e.time}</span></TableCell>
                  <TableCell><span className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3" />{e.room}</span></TableCell>
                  <TableCell>{e.duration}</TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{e.classes.slice(0, 2).map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}{e.classes.length > 2 && <Badge variant="outline" className="text-xs">+{e.classes.length - 2}</Badge>}</div></TableCell>
                  <TableCell><Badge variant={statusBadge[e.status].variant} className={statusBadge[e.status].className}>{e.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {e.status === "draft" && <Button size="sm" variant="ghost" className="h-7 px-2 text-success" onClick={() => publishExam(e.id)}><CheckCircle2 className="h-3 w-3" /></Button>}
                      {e.status === "scheduled" && <Button size="sm" variant="ghost" className="h-7 px-2 text-success" onClick={() => publishExam(e.id)}><CheckCircle2 className="h-3 w-3" /></Button>}
                      {(e.status === "published" || e.status === "scheduled") && <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => archiveExam(e.id)}><Archive className="h-3 w-3" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="scripts">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-lg font-semibold">Answer Scripts</h3></div>
            <Button size="sm" variant="outline" onClick={() => setShowUpload(true)}><Upload className="mr-2 h-4 w-4" />Upload Scripts</Button>
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Roll No</TableHead><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Section</TableHead><TableHead>Exam</TableHead><TableHead>Subject</TableHead><TableHead>PDF Name</TableHead><TableHead>Upload Date</TableHead><TableHead>Teacher</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{[...(() => {
                const dynamic = getAnswerScripts().map(s => ({
                  id: s.id,
                  rollNumber: s.rollNumber,
                  student: s.studentName,
                  class: s.className,
                  section: s.section,
                  exam: s.examName,
                  subject: s.subject,
                  teacher: s.teacher,
                  status: s.status as "pending" | "evaluating" | "completed",
                  pdfName: s.file.original_name,
                  uploadedAt: s.uploadedAt,
                }));
                const existingIds = new Set(answerScriptsFull.map(x => x.id));
                return [...answerScriptsFull, ...dynamic.filter(d => !existingIds.has(d.id))];
              })()].map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.rollNumber || "—"}</TableCell>
                  <TableCell className="font-medium">{s.student}</TableCell>
                  <TableCell>{s.class}</TableCell>
                  <TableCell>{s.section}</TableCell>
                  <TableCell className="text-sm">{s.exam}</TableCell>
                  <TableCell>{s.subject}</TableCell>
                  <TableCell className="text-xs font-mono">{(s as any).pdfName || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{(s as any).uploadedAt ? new Date((s as any).uploadedAt).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.teacher}</TableCell>
                  <TableCell><Badge variant={scriptStatusBadge[s.status].variant} className={scriptStatusBadge[s.status].className}>{s.status}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="evaluation">
          <Card><CardContent className="p-4">
            <Table><TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Subject</TableHead><TableHead>Exam</TableHead><TableHead>Total</TableHead><TableHead>Pending</TableHead><TableHead>Evaluating</TableHead><TableHead>Completed</TableHead></TableRow></TableHeader>
              <TableBody>{evaluationTracking.map(et => (
                <TableRow key={et.teacher}>
                  <TableCell className="font-medium">{et.teacher}</TableCell>
                  <TableCell>{et.subject}</TableCell>
                  <TableCell className="text-sm">{et.exam}</TableCell>
                  <TableCell>{et.total}</TableCell>
                  <TableCell><Badge variant="secondary">{et.pending}</Badge></TableCell>
                  <TableCell><Badge variant="default" className="bg-warning">{et.evaluating}</Badge></TableCell>
                  <TableCell><Badge variant="default" className="bg-success">{et.completed}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Create Exam</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2"><Label>Exam Name</Label><Input placeholder="e.g. Midterm — Mathematics" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
              <div className="space-y-2"><Label>Time</Label><Input type="time" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Duration</Label><Input placeholder="e.g. 2h" /></div><div className="space-y-2"><Label>Room</Label><Input placeholder="e.g. Hall A" /></div></div>
            <div className="space-y-2"><Label>Classes</Label><div className="flex flex-wrap gap-2">{classCards.slice(0, 4).map(c => (<Badge key={c.name} variant="outline" className="cursor-pointer">Class {c.name}</Badge>))}</div></div>
            <div className="space-y-2"><Label>Subjects</Label><Select><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger><SelectContent>{subjects.map(s => (<SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>))}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Exam created"); setShowCreate(false); }}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpload} onOpenChange={o => { if (!o) { setShowUpload(false); setUploadEntries([]); setSelectedStudent(""); setUploadForm({ className: "", section: "", subject: "", examName: "" }); } }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Upload Answer Scripts</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Class</Label>
                <Select value={uploadForm.className} onValueChange={v => { setUploadForm({ ...uploadForm, className: v }); setSelectedStudent(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{classCards.map(c => (<SelectItem key={c.name} value={c.name}>Class {c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Section</Label>
                <Select value={uploadForm.section} onValueChange={v => setUploadForm({ ...uploadForm, section: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Subject</Label>
                <Select value={uploadForm.subject} onValueChange={v => setUploadForm({ ...uploadForm, subject: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{subjects.map(s => (<SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Exam</Label>
                <Select value={uploadForm.examName} onValueChange={v => setUploadForm({ ...uploadForm, examName: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{exams.map(e => (<SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="border-t pt-3 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Add Script Entry</p>
              <div className="space-y-2"><Label>Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!uploadForm.className}>
                  <SelectTrigger><SelectValue placeholder={uploadForm.className ? "Select student" : "Select class first"} /></SelectTrigger>
                  <SelectContent>
                    {uploadForm.className ? (classStudents[uploadForm.className] || []).map(st => (
                      <SelectItem key={st.id} value={st.id}>{st.name} ({st.id})</SelectItem>
                    )) : <SelectItem value="__none__" disabled>No class selected</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label>PDF File</Label>
                  <div className="border-2 border-dashed rounded-lg p-3 text-center text-xs text-muted-foreground cursor-pointer hover:border-primary mt-1" onClick={() => singleFileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mx-auto mb-1" />
                    <p>Click to select PDF</p>
                  </div>
                  <input ref={singleFileInputRef} type="file" accept=".pdf" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const error = validateFile(file, ALLOWED_SCRIPT_TYPES, MAX_SCRIPT_SIZE_BYTES);
                    if (error) { toast.error(error); e.target.value = ""; return; }
                    if (!selectedStudent || !uploadForm.className) { toast.error("Please select a student first"); e.target.value = ""; return; }
                    const student = (classStudents[uploadForm.className] || []).find(st => st.id === selectedStudent);
                    if (!student) { toast.error("Student not found"); e.target.value = ""; return; }
                    const existingNames = new Set(getAnswerScripts().filter(s => s.examName === uploadForm.examName && s.className === uploadForm.className).map(s => s.file.original_name));
                    const existingStudents = new Set(getAnswerScripts().filter(s => s.examName === uploadForm.examName && s.className === uploadForm.className).map(s => s.studentName));
                    if (existingNames.has(file.name)) { toast.error(`"${file.name}" already uploaded for this exam`); e.target.value = ""; return; }
                    if (existingStudents.has(student.name)) { toast.error(`Script already uploaded for ${student.name}`); e.target.value = ""; return; }
                    if (uploadEntries.some(e => e.studentId === student.id)) { toast.error(`Entry already added for ${student.name}`); e.target.value = ""; return; }
                    if (uploadEntries.some(e => e.file.name === file.name)) { toast.error(`"${file.name}" already in entries`); e.target.value = ""; return; }
                    setUploadEntries(prev => [...prev, { studentId: student.id, studentName: student.name, rollNumber: student.id, file }]);
                    e.target.value = "";
                    toast.success(`Added ${student.name}`);
                  }} />
                </div>
              </div>
            </div>
            {uploadEntries.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-2">
                <p className="text-xs font-medium text-muted-foreground px-1">{uploadEntries.length} entry(ies)</p>
                {uploadEntries.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{entry.studentName}</p>
                        <p className="text-[10px] text-muted-foreground">{entry.rollNumber} · {entry.file.name}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 shrink-0 text-destructive" onClick={() => setUploadEntries(prev => prev.filter((_, j) => j !== i))}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowUpload(false); setUploadEntries([]); setSelectedStudent(""); }}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" disabled={uploading || uploadEntries.length === 0 || !uploadForm.subject || !uploadForm.examName}
              onClick={async () => {
                setUploading(true);
                for (let i = 0; i < uploadEntries.length; i++) {
                  const { studentName, rollNumber, file } = uploadEntries[i];
                  const uploadInfo = generateMockUploadResponse(file, "admin");
                  addAnswerScript({
                    id: `script_${Date.now()}_${i}`,
                    studentName,
                    rollNumber,
                    className: uploadForm.className,
                    section: uploadForm.section,
                    examName: uploadForm.examName,
                    subject: uploadForm.subject,
                    teacher: "Dr. Anika Rao",
                    file: uploadInfo,
                    uploadedAt: new Date().toISOString(),
                    status: "pending",
                    totalMarks: 100,
                  });
                }
                setUploading(false);
                setShowUpload(false);
                setUploadEntries([]);
                setSelectedStudent("");
                toast.success(`${uploadEntries.length} answer script(s) uploaded`);
                window.dispatchEvent(new CustomEvent("answerScriptsUpdated"));
              }}
            >
              {uploading ? "Uploading..." : "Upload All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewScriptFile} onOpenChange={o => { if (!o) setPreviewScriptFile(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{previewScriptFile?.name || "Preview"}</DialogTitle></DialogHeader>
          <div className="min-h-[300px] bg-muted/10 rounded-lg flex items-center justify-center">
            {previewScriptFile?.type === "application/pdf" ? (
              <embed src={URL.createObjectURL(previewScriptFile)} type="application/pdf" className="w-full h-[400px]" />
            ) : (
              <div className="text-center p-8">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium mt-2">{previewScriptFile?.name}</p>
                {previewScriptFile && <p className="text-xs text-muted-foreground mt-1">{formatFileSize(previewScriptFile.size)}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewScriptFile(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportDialog open={showExport} onOpenChange={setShowExport} config={examExportConfig} />
    </>
  );
}

export const Route = createFileRoute("/admin/exams")({
  head: () => ({ meta: [{ title: "Examinations — Admin" }] }),
  component: AdminExamsComponent,
});
