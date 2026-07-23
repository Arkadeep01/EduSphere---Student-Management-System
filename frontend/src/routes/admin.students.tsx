import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, ArrowLeft, Users, UserCheck, Download, Plus, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExportDialog } from "@/components/export";
import { studentExportConfig } from "@/components/export/moduleConfigs";
import { API_BASE } from "@/services/request";
import { studentAdminApi, classAdminApi, subjectRequestApi } from "@/services/adminApi";
import type { PendingSubjectRequest } from "@/services/adminApi";

interface StudentItem {
  id: string;
  name: string;
  class: string;
  email: string;
  attendance: number;
  gpa: string;
  status: string;
}

interface StudentDetail {
  id: number;
  full_name: string;
  email: string;
  class_assigned: string;
  roll_number: string;
  subjects: { id: number; name: string; code: string }[];
}

interface ClassBrief {
  name: string;
  total_students: number;
  subjects: { code: string; name: string; teacher: string | null }[];
  class_teacher: string | null;
}

type ViewMode = "classes" | "class-detail" | "student-detail";

const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

function AdminStudentsComponent() {
  const [view, setView] = useState<ViewMode>("classes");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [classDetail, setClassDetail] = useState<ClassBrief | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [studentDocs, setStudentDocs] = useState<any[]>([]);
  const [studentNotifs, setStudentNotifs] = useState<any[]>([]);
  const [requests, setRequests] = useState<PendingSubjectRequest[]>([]);
  const [subjectReqEnabled, setSubjectReqEnabled] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");

  const { data: realStudents, isLoading } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/admin/students/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("Failed to fetch students");
      return r.json() as Promise<Array<Record<string, unknown>>>;
    },
    enabled: !!token,
  });

  const students: StudentItem[] = realStudents ? realStudents.map((s: any, i) => ({
    id: s.id?.toString(),
    name: s.full_name || `${s.user?.first_name || ""} ${s.user?.last_name || ""}`,
    class: s.class_assigned || "",
    email: s.email || s.user?.email || "",
    attendance: 0,
    gpa: "0.00",
    status: "Active",
  })) : [];

  const classNames = [...new Set(students.map(s => s.class).filter(Boolean))];

  useEffect(() => {
    subjectRequestApi.get().then(d => setSubjectReqEnabled(d?.enabled ?? true)).catch(() => {});
    subjectRequestApi.pendingRequests().then(d => setRequests(d || [])).catch(() => {});
  }, []);

  const fetchClassDetail = useCallback(async (name: string) => {
    try {
      const d = await classAdminApi.detail(name);
      setClassDetail(d as ClassBrief);
    } catch { setClassDetail(null); }
  }, []);

  const fetchStudentDetail = useCallback(async (id: string) => {
    try {
      const [detail, docs, notifs] = await Promise.all([
        studentAdminApi.detail(parseInt(id)),
        studentAdminApi.documents(parseInt(id)).catch(() => []),
        studentAdminApi.notifications(parseInt(id)).catch(() => []),
      ]);
      setStudentDetail(detail as StudentDetail);
      setStudentDocs(docs as any[]);
      setStudentNotifs(notifs as any[]);
    } catch { setStudentDetail(null); }
  }, []);

  const pendingRequests = requests.filter(r => r.status === "pending");

  function getClassPendingCount(className: string): number {
    return pendingRequests.filter(r => r.class_assigned?.startsWith(className)).length;
  }

  async function handleApprove(req: PendingSubjectRequest) {
    try {
      await subjectRequestApi.approve(req.student_id, [req.subject_id]);
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "approved" } : r));
      toast.success(`${req.student_name} approved for ${req.subject_name}`);
    } catch { toast.error("Failed to approve"); }
  }

  async function handleReject(req: PendingSubjectRequest) {
    try {
      await subjectRequestApi.reject(req.student_id, [req.subject_id]);
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "rejected" } : r));
      toast.success(`${req.student_name} rejected for ${req.subject_name}`);
    } catch { toast.error("Failed to reject"); }
  }

  async function handleToggle() {
    const newVal = !subjectReqEnabled;
    try {
      await subjectRequestApi.update(newVal);
      setSubjectReqEnabled(newVal);
      toast.success(newVal ? "Subject requests globally enabled" : "Subject requests globally disabled");
    } catch { toast.error("Failed to toggle"); }
  }

  const filtered = students.filter(s =>
    (s.name?.toLowerCase().includes(q.toLowerCase()) || s.id?.toLowerCase().includes(q.toLowerCase()))
    && (cls === "all" || s.class === cls)
  );

  useEffect(() => {
    if (selectedClass) fetchClassDetail(selectedClass);
  }, [selectedClass, fetchClassDetail]);

  useEffect(() => {
    if (selectedStudent) fetchStudentDetail(selectedStudent.id);
  }, [selectedStudent, fetchStudentDetail]);

  if (view === "class-detail" && selectedClass && classDetail) {
    const classStudents = students.filter(s => s.class?.startsWith(selectedClass));
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => { setView("classes"); setSelectedClass(null); }}><ArrowLeft className="h-4 w-4" /></Button>
          <div><h2 className="text-xl font-bold">Class {selectedClass}</h2><p className="text-sm text-muted-foreground">{classDetail.total_students} students</p></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Students" value={classDetail.total_students} icon={Users} accent="primary" />
          <StatCard label="Subjects" value={classDetail.subjects?.length || 0} icon={Users} accent="info" />
          <StatCard label="Class Teacher" value={classDetail.class_teacher || "N/A"} icon={UserCheck} accent="success" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardContent className="p-4">
              <h3 className="font-semibold mb-3">Students</h3>
              <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>ID</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>{classStudents.map(s => (
                  <TableRow key={s.id} className="cursor-pointer" onClick={() => { setSelectedStudent(s); setView("student-detail"); }}>
                    <TableCell><div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{s.name?.split(" ").map((x: string) => x[0]).join("")}</AvatarFallback></Avatar><span className="font-medium">{s.name}</span></div></TableCell>
                    <TableCell className="text-xs font-mono">{s.id}</TableCell>
                    <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </CardContent></Card>
          </div>
          <div>
            <Card><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Subject Requests</h3>
              {pendingRequests.filter(r => r.class_assigned?.startsWith(selectedClass)).slice(0, 5).map(req => (
                <div key={req.id} className="p-2 rounded bg-muted/40 text-xs space-y-1">
                  <span className="font-medium">{req.student_name}</span>
                  <p className="text-muted-foreground">Requested: <span className="font-medium">{req.subject_name}</span></p>
                  <div className="flex gap-1 pt-1">
                    <Button size="sm" variant="default" className="h-6 px-2 text-[10px] bg-success" onClick={() => handleApprove(req)}>Approve</Button>
                    <Button size="sm" variant="destructive" className="h-6 px-2 text-[10px]" onClick={() => handleReject(req)}>Reject</Button>
                  </div>
                </div>
              ))}
            </CardContent></Card>
          </div>
        </div>
      </>
    );
  }

  if (view === "student-detail" && selectedStudent) {
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => { setView("class-detail"); setSelectedStudent(null); }}><ArrowLeft className="h-4 w-4" /></Button>
          <div><h2 className="text-xl font-bold">{selectedStudent.name}</h2><p className="text-sm text-muted-foreground">{selectedStudent.id} · {selectedStudent.class}</p></div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Card><CardContent className="p-5 text-center">
              <Avatar className="h-16 w-16 mx-auto"><AvatarFallback className="bg-gradient-brand text-white text-lg">{selectedStudent.name?.split(" ").map((x: string) => x[0]).join("")}</AvatarFallback></Avatar>
              <h3 className="font-semibold mt-2">{selectedStudent.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 space-y-2">
              <h4 className="font-medium text-sm">Details</h4>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Class:</span> {selectedStudent.class}</p>
                <p><span className="text-muted-foreground">Roll:</span> {studentDetail?.roll_number || selectedStudent.id}</p>
              </div>
            </CardContent></Card>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Card><CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2">Subjects</h4>
              <div className="flex flex-wrap gap-2">
                {studentDetail?.subjects?.map((sub: any) => (
                  <Badge key={sub.id || sub.code} variant="outline">{sub.name}</Badge>
                )) || <span className="text-sm text-muted-foreground">No subjects</span>}
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2">Documents ({studentDocs.length})</h4>
              <div className="flex flex-wrap gap-2">
                {studentDocs.length > 0 ? studentDocs.map((d: any, i: number) => (
                  <Badge key={d.id || i} variant="outline" className="cursor-pointer">{d.name || d.document_type || `Document ${i + 1}`}</Badge>
                )) : <span className="text-sm text-muted-foreground">No documents</span>}
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2">Notifications ({studentNotifs.length})</h4>
              {studentNotifs.length > 0 ? (
                <div className="space-y-2">
                  {studentNotifs.slice(0, 5).map((n: any, i: number) => (
                    <div key={n.id || i} className="p-2 rounded bg-muted/30 text-sm">
                      <p className="font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                    </div>
                  ))}
                </div>
              ) : <span className="text-sm text-muted-foreground">No notifications</span>}
            </CardContent></Card>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-bold">Student Management</h2><p className="text-sm text-muted-foreground">{classNames.length} classes · {students.length} students</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowAddStudent(true)}><Plus className="mr-2 h-4 w-4" />Add Student</Button>
        </div>
      </div>

      <Card className="mb-4"><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by name or ID..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} /></div>
          <Select value={cls} onValueChange={setCls}><SelectTrigger className="w-40"><SelectValue placeholder="All classes" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All classes</SelectItem>{classNames.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {classNames.map(cn => {
          const cStudents = students.filter(s => s.class === cn);
          return (
            <Card key={cn} className="hover-lift overflow-hidden cursor-pointer" onClick={() => { setSelectedClass(cn); setView("class-detail"); }}>
              <div className="h-1 bg-gradient-brand" />
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Users className="h-5 w-5" /></div>
                  {getClassPendingCount(cn) > 0 && <Badge variant="secondary">{getClassPendingCount(cn)} pending</Badge>}
                </div>
                <h3 className="mt-3 font-semibold text-lg">Class {cn}</h3>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">{cStudents.length}</span></div>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3">View Class</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Subject Request Control</h3>
              <p className="text-sm text-muted-foreground">Pending Requests ({pendingRequests.length})</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{subjectReqEnabled ? "Enabled" : "Disabled"}</span>
              <Button variant={subjectReqEnabled ? "default" : "outline"} size="sm" onClick={handleToggle}
                className={subjectReqEnabled ? "bg-success hover:bg-success/90" : ""}>
                {subjectReqEnabled ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 mr-2 text-success" />No Pending Subject Requests
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Student Name</TableHead><TableHead>Roll Number</TableHead><TableHead>Class</TableHead><TableHead>Requested Subject</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {pendingRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.student_name}</TableCell>
                      <TableCell className="font-mono text-xs">{req.roll_number}</TableCell>
                      <TableCell>{req.class_assigned}</TableCell>
                      <TableCell>{req.subject_name} ({req.subject_code})</TableCell>
                      <TableCell className="text-xs">{new Date(req.requested_on).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="default" className="bg-success hover:bg-success/90 h-8 px-3" onClick={() => handleApprove(req)}>
                            <CheckCircle className="h-3 w-3 mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8 px-3" onClick={() => handleReject(req)}>
                            <XCircle className="h-3 w-3 mr-1" />Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent><DialogHeader><DialogTitle>Add Student</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Enter full name" /></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="student@edusphere.edu" /></div><div className="space-y-2"><Label>Phone</Label><Input placeholder="Phone number" /></div></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Class</Label><Select><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent>{classNames.map(c => (<SelectItem key={c} value={c}>Class {c}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label>Section</Label><Select><SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger><SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem></SelectContent></Select></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddStudent(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Student added successfully"); setShowAddStudent(false); }}>Add Student</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportDialog open={showExport} onOpenChange={setShowExport} config={studentExportConfig} />
    </>
  );
}

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: [{ title: "Students — Admin" }] }),
  component: AdminStudentsComponent,
});
