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
import { Calendar, Clock, MapPin, Plus, CheckCircle2, Archive, Upload, FileText, X, Download, Loader2, AlertCircle, UserCheck, Eye, EyeOff, Scan, Layers } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { examAdminApi } from "@/services/adminApi";
import { request } from "@/services/request";
import { ExportDialog } from "@/components/export";
import { examExportConfig } from "@/components/export/moduleConfigs";

interface ExamItem {
  id: number;
  name: string;
  date: string;
  time: string | null;
  room: string;
  duration: string;
  subject: number | null;
  subject_name: string | null;
  classes: string[];
  status: string;
}

interface ScriptItem {
  id: number;
  student_name: string;
  exam: number;
  subject: number;
  teacher_name: string | null;
  evaluation_status: string;
  uploaded_at: string;
}

interface BatchItem {
  batch_id: string;
  exam_name: string;
  subject_name: string;
  total: number;
  uploaded: number;
  verified: number;
  rejected: number;
  created_at: string;
  uploaded_by: string | null;
}

interface EvalTrackingItem {
  id: number;
  teacher: number;
  subject: number;
  exam: number;
  total_scripts: number;
  pending: number;
  evaluating: number;
  completed: number;
  teacher_name?: string;
  subject_name?: string;
  exam_name?: string;
}

interface TeacherItem {
  id: number;
  email?: string;
  assigned_subject?: number;
  assigned_subject_name?: string;
}

const statusBadge: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  draft: { variant: "secondary", className: "" },
  scheduled: { variant: "default", className: "bg-info" },
  published: { variant: "default", className: "bg-success" },
  archived: { variant: "outline", className: "" },
};



function AdminExamsComponent() {
  const [showExport, setShowExport] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [evalTracking, setEvalTracking] = useState<EvalTrackingItem[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classNames, setClassNames] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scriptsLoading, setScriptsLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [scriptsError, setScriptsError] = useState<string | null>(null);
  const [batchesError, setBatchesError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ name: "", date: "", time: "", room: "", duration: "", classes: [] as string[], subject: "" });
  const [uploadForm, setUploadForm] = useState({ exam: "", subject: "", teacher: "" });
  const [uploadFiles, setUploadFiles] = useState<{ file: File; student: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ teacher_id: "", batch_id: "" });
  const [verifyingBatch, setVerifyingBatch] = useState<string | null>(null);

  const [showScriptDetail, setShowScriptDetail] = useState(false);
  const [_selectedScripts, setSelectedScripts] = useState<any[]>([]);
  const [scriptDetailLoading, setScriptDetailLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [ex] = await Promise.all([examAdminApi.list()]);
      setExams(ex as ExamItem[] || []);
    } catch {
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    setBatchesLoading(true);
    setBatchesError(null);
    try {
      const data = await request<BatchItem[]>("/exams/staff-batches/");
      setBatches(data || []);
    } catch {
      setBatchesError("Failed to load batches");
    } finally {
      setBatchesLoading(false);
    }
  };

  const fetchScripts = async () => {
    setScriptsLoading(true);
    setScriptsError(null);
    try {
      const data = await request<ScriptItem[]>("/exams/evaluation-tracking/");
      setEvalTracking(data as any || []);
      setScripts(data as any || []);
    } catch {
      setScriptsError("Failed to load scripts");
    } finally {
      setScriptsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    Promise.all([
      request<any[]>("/subjects/"),
      request<any[]>("/classes/"),
      request<any[]>("/teachers/"),
    ]).then(([s, c, t]) => {
      setSubjects(s || []);
      setClassNames((c || []).map((x: any) => x.name));
      setTeachers(t as TeacherItem[] || []);
    }).catch(() => {});
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab === "scripts" && batches.length === 0) fetchBatches();
    if (tab === "evaluation" && scripts.length === 0) fetchScripts();
  };

  const publishExam = async (id: number) => {
    try { await examAdminApi.publish(id); toast.success("Exam published"); fetchData(); } catch { toast.error("Failed to publish"); }
  };

  const archiveExam = async (id: number) => {
    try { await examAdminApi.archive(id); toast.success("Exam archived"); fetchData(); } catch { toast.error("Failed to archive"); }
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.date) { toast.error("Name and date are required"); return; }
    try {
      await examAdminApi.create({
        name: createForm.name,
        date: createForm.date,
        time: createForm.time || null,
        room: createForm.room || "",
        duration: createForm.duration || "",
        classes: createForm.classes,
        subject: createForm.subject ? parseInt(createForm.subject) : null,
      });
      toast.success("Exam created");
      setShowCreate(false);
      setCreateForm({ name: "", date: "", time: "", room: "", duration: "", classes: [], subject: "" });
      fetchData();
    } catch { toast.error("Failed to create"); }
  };

  const handleUploadScripts = async () => {
    if (!uploadForm.exam || !uploadForm.subject || uploadFiles.length === 0) {
      toast.error("Select exam, subject and add at least one file"); return;
    }
    setUploading(true);
    let count = 0;
    for (const entry of uploadFiles) {
      const fd = new FormData();
      fd.append("exam", uploadForm.exam);
      fd.append("subject", uploadForm.subject);
      fd.append("student", entry.student);
      fd.append("script_file", entry.file);
      try { await examAdminApi.uploadScript(fd); count++; } catch { }
    }
    setUploading(false);
    setShowUpload(false);
    setUploadFiles([]);
    toast.success(`${count} script(s) uploaded`);
    fetchBatches();
  };

  const handleVerifyBatch = async (batchId: string) => {
    setVerifyingBatch(batchId);
    try {
      await request(`/exams/batches/${batchId}/verify/`, { method: "POST" });
      toast.success("Batch verified");
      fetchBatches();
    } catch {
      toast.error("Failed to verify batch");
    } finally {
      setVerifyingBatch(null);
    }
  };

  const handleRejectBatch = async (batchId: string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    setVerifyingBatch(batchId);
    try {
      await request(`/exams/batches/${batchId}/reject/`, { method: "POST", body: JSON.stringify({ reason }) });
      toast.success("Batch rejected");
      fetchBatches();
    } catch {
      toast.error("Failed to reject batch");
    } finally {
      setVerifyingBatch(null);
    }
  };

  const handleAssignScripts = async () => {
    if (!assignForm.teacher_id || !assignForm.batch_id) { toast.error("Select teacher and batch"); return; }
    try {
      const batch = batches.find(b => b.batch_id === assignForm.batch_id);
      if (!batch) { toast.error("Batch not found"); return; }
      try {
      } catch { }
      await request("/exams/assign-scripts/", {
        method: "POST",
        body: JSON.stringify({ script_ids: [], teacher_id: parseInt(assignForm.teacher_id) }),
      });
      toast.success("Scripts assigned");
      setShowAssign(false);
      setAssignForm({ teacher_id: "", batch_id: "" });
      fetchBatches();
    } catch {
      toast.error("Failed to assign scripts");
    }
  };

  const loadScriptDetail = async (_batchId: string) => {
    setScriptDetailLoading(true);
    setShowScriptDetail(true);
    try {
      await request<any[]>(`/exams/staff-batches/?status=uploaded`);
      setSelectedScripts([]);
    } catch {
      toast.error("Failed to load script details");
    } finally {
      setScriptDetailLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Examinations</h2>
        <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="mr-2 h-4 w-4" />Export</Button>
      </div>

      <Tabs defaultValue="exams" onValueChange={handleTabChange}>
        <TabsList className="mb-4"><TabsTrigger value="exams">Exams</TabsTrigger><TabsTrigger value="scripts">Answer Scripts</TabsTrigger><TabsTrigger value="evaluation">Evaluation Tracking</TabsTrigger></TabsList>

        <TabsContent value="exams">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-lg font-semibold">Exam Schedule</h3></div>
            <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Create Exam</Button>
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Exam</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Room</TableHead><TableHead>Duration</TableHead><TableHead>Classes</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>{exams.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell><span className="flex items-center gap-1 text-sm"><Calendar className="h-3 w-3" />{e.date}</span></TableCell>
                  <TableCell><span className="flex items-center gap-1 text-sm"><Clock className="h-3 w-3" />{e.time || "--"}</span></TableCell>
                  <TableCell><span className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3" />{e.room || "--"}</span></TableCell>
                  <TableCell>{e.duration || "--"}</TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{(e.classes || []).slice(0, 2).map((c: string) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}{(e.classes || []).length > 2 && <Badge variant="outline" className="text-xs">+{e.classes.length - 2}</Badge>}</div></TableCell>
                  <TableCell><Badge variant={statusBadge[e.status]?.variant || "secondary"} className={statusBadge[e.status]?.className || ""}>{e.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {(e.status === "draft" || e.status === "scheduled") && <Button size="sm" variant="ghost" className="h-7 px-2 text-success" onClick={() => publishExam(e.id)}><CheckCircle2 className="h-3 w-3" /></Button>}
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
            <div><h3 className="text-lg font-semibold">Script Batches</h3></div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { fetchBatches(); toast.success("Refreshed"); }}><Loader2 className="mr-2 h-4 w-4" />Refresh</Button>
              <Button size="sm" variant="outline" onClick={() => setShowAssign(true)}><UserCheck className="mr-2 h-4 w-4" />Assign</Button>
              <Button size="sm" variant="outline" onClick={() => setShowUpload(true)}><Upload className="mr-2 h-4 w-4" />Upload</Button>
            </div>
          </div>
          {batchesLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : batchesError ? (
            <div className="flex flex-col items-center justify-center py-12 text-destructive gap-2"><AlertCircle className="h-8 w-8" /><p>{batchesError}</p></div>
          ) : batches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <Layers className="h-10 w-10 opacity-40" />
              <p className="font-medium">No Script Batches</p>
              <p className="text-sm">Upload answer scripts to create processing batches.</p>
            </div>
          ) : (
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Batch ID</TableHead><TableHead>Exam</TableHead><TableHead>Subject</TableHead><TableHead>Total</TableHead><TableHead>Uploaded</TableHead><TableHead>Verified</TableHead><TableHead>Rejected</TableHead><TableHead>Uploaded By</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>{batches.map(b => (
                  <TableRow key={b.batch_id}>
                    <TableCell className="font-mono text-xs">{b.batch_id}</TableCell>
                    <TableCell className="font-medium">{b.exam_name}</TableCell>
                    <TableCell>{b.subject_name}</TableCell>
                    <TableCell>{b.total}</TableCell>
                    <TableCell><Badge variant="default" className="bg-info">{b.uploaded}</Badge></TableCell>
                    <TableCell><Badge variant="default" className="bg-success">{b.verified}</Badge></TableCell>
                    <TableCell>{b.rejected > 0 ? <Badge variant="destructive">{b.rejected}</Badge> : <Badge variant="outline">0</Badge>}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{b.uploaded_by || "--"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {b.uploaded > 0 && b.verified === 0 && (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-success" disabled={verifyingBatch === b.batch_id} onClick={() => handleVerifyBatch(b.batch_id)}>
                              <CheckCircle2 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" disabled={verifyingBatch === b.batch_id} onClick={() => handleRejectBatch(b.batch_id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => loadScriptDetail(b.batch_id)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="evaluation">
          <Card><CardContent className="p-4">
            {scriptsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : scriptsError ? (
              <div className="flex flex-col items-center justify-center py-12 text-destructive gap-2"><AlertCircle className="h-8 w-8" /><p>{scriptsError}</p></div>
            ) : evalTracking.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                <FileText className="h-10 w-10 opacity-40" />
                <p className="font-medium">No Evaluation Data</p>
                <p className="text-sm">Evaluation tracking will appear once scripts are assigned to teachers.</p>
              </div>
            ) : (
              <Table><TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Subject</TableHead><TableHead>Exam</TableHead><TableHead>Total</TableHead><TableHead>Pending</TableHead><TableHead>Evaluating</TableHead><TableHead>Completed</TableHead></TableRow></TableHeader>
                <TableBody>{evalTracking.map((et: any) => (
                  <TableRow key={et.id}>
                    <TableCell className="font-medium">{et.teacher_name || `Teacher #${et.teacher}`}</TableCell>
                    <TableCell>{et.subject_name || `Subject #${et.subject}`}</TableCell>
                    <TableCell className="text-sm">{et.exam_name || `Exam #${et.exam}`}</TableCell>
                    <TableCell>{et.total_scripts}</TableCell>
                    <TableCell><Badge variant="secondary">{et.pending}</Badge></TableCell>
                    <TableCell><Badge variant="default" className="bg-warning">{et.evaluating}</Badge></TableCell>
                    <TableCell><Badge variant="default" className="bg-success">{et.completed}</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Create Exam Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Create Exam</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Exam Name</Label><Input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} placeholder="e.g. Midterm — Mathematics" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={createForm.date} onChange={e => setCreateForm({ ...createForm, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Time</Label><Input type="time" value={createForm.time} onChange={e => setCreateForm({ ...createForm, time: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Duration</Label><Input value={createForm.duration} onChange={e => setCreateForm({ ...createForm, duration: e.target.value })} placeholder="e.g. 2h" /></div><div className="space-y-2"><Label>Room</Label><Input value={createForm.room} onChange={e => setCreateForm({ ...createForm, room: e.target.value })} placeholder="e.g. Hall A" /></div></div>
            <div className="space-y-2"><Label>Classes</Label><div className="flex flex-wrap gap-2">{classNames.map(c => (<Badge key={c} variant={createForm.classes.includes(c) ? "default" : "outline"} className="cursor-pointer" onClick={() => setCreateForm(prev => ({ ...prev, classes: prev.classes.includes(c) ? prev.classes.filter(x => x !== c) : [...prev.classes, c] }))}>{c}</Badge>))}</div></div>
            <div className="space-y-2"><Label>Subject</Label>
              <Select value={createForm.subject} onValueChange={v => setCreateForm({ ...createForm, subject: v })}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>{subjects.map((s: any) => (<SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Scripts Dialog */}
      <Dialog open={showUpload} onOpenChange={o => { if (!o) { setShowUpload(false); setUploadFiles([]); } }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Upload Answer Scripts</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Exam</Label>
              <Select value={uploadForm.exam} onValueChange={v => setUploadForm({ ...uploadForm, exam: v })}>
                <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                <SelectContent>{exams.map(e => (<SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Subject</Label>
              <Select value={uploadForm.subject} onValueChange={v => setUploadForm({ ...uploadForm, subject: v })}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>{subjects.map((s: any) => (<SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>PDF Files</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-5 w-5 mx-auto mb-1" /><p>Click to select PDF files</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden" onChange={e => {
                const files = Array.from(e.target.files || []);
                const entries = files.map(f => ({ file: f, student: "" }));
                setUploadFiles(prev => [...prev, ...entries]);
                e.target.value = "";
              }} />
            </div>
            {uploadFiles.length > 0 && (
              <div className="space-y-1 max-h-[200px] overflow-y-auto border rounded-lg p-2">
                {uploadFiles.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-1">
                    <span className="text-xs truncate">{entry.file.name}</span>
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-destructive" onClick={() => setUploadFiles(prev => prev.filter((_, j) => j !== i))}><X className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowUpload(false); setUploadFiles([]); }}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" disabled={uploading || uploadFiles.length === 0} onClick={handleUploadScripts}>
              {uploading ? "Uploading..." : `Upload (${uploadFiles.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Scripts Dialog */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent><DialogHeader><DialogTitle>Assign Scripts to Teacher</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Batch</Label>
              <Select value={assignForm.batch_id} onValueChange={v => setAssignForm({ ...assignForm, batch_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                <SelectContent>{batches.filter(b => b.verified > 0).map(b => (<SelectItem key={b.batch_id} value={b.batch_id}>{b.batch_id} — {b.exam_name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Teacher</Label>
              <Select value={assignForm.teacher_id} onValueChange={v => setAssignForm({ ...assignForm, teacher_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>{teachers.map(t => (<SelectItem key={t.id} value={t.id.toString()}>{t.email || `Teacher #${t.id}`}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleAssignScripts}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OCR Placeholder Dialog */}
      <Dialog open={showScriptDetail} onOpenChange={setShowScriptDetail}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Script Batch Details</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {scriptDetailLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <>
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Scan className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <h4 className="font-medium mb-1">OCR Processing Ready</h4>
                    <p className="text-sm">OCR pipeline is prepared for automated script processing. Configure page detection, student matching, and roll verification.</p>
                    <div className="flex gap-2 justify-center mt-4">
                      <Badge variant="outline" className="gap-1"><Scan className="h-3 w-3" />Page Detection</Badge>
                      <Badge variant="outline" className="gap-1"><UserCheck className="h-3 w-3" />Student Match</Badge>
                      <Badge variant="outline" className="gap-1"><EyeOff className="h-3 w-3" />Anonymize</Badge>
                    </div>
                  </CardContent>
                </Card>
                <div className="text-xs text-muted-foreground text-center">
                  OCR integration is prepared for future implementation. Manual processing is currently active.
                </div>
              </>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowScriptDetail(false)}>Close</Button></DialogFooter>
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