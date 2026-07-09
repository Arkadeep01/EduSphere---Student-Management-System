import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, ArrowLeft, Users, UserCheck, Download, Plus, ToggleLeft, ToggleRight, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { students, classCards, classDetailsData, feeStatusData, subjectRequestRecords, notificationRecords } from "@/lib/mock-data";
import type { SubjectRequestRecord } from "@/lib/mock-data";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard/StatCard";
import { exportApi } from "@/services/adminApi";

type ViewMode = "classes" | "class-detail" | "student-detail" | "fee-report";

type ExportFormat = "csv" | "excel" | "pdf";
type ExportScope = "school" | "class" | "section" | "selected" | "multiple";

const FIELD_GROUPS: { group: string; fields: { key: string; label: string }[] }[] = [
  {
    group: "Personal Information",
    fields: [
      { key: "name", label: "Name" },
      { key: "username", label: "Username" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "gender", label: "Gender" },
      { key: "date_of_birth", label: "Date of Birth" },
    ],
  },
  {
    group: "Academic",
    fields: [
      { key: "roll_number", label: "Roll Number" },
      { key: "admission_number", label: "Admission Number" },
      { key: "class_assigned", label: "Class" },
      { key: "section", label: "Section" },
      { key: "academic_session", label: "Academic Session" },
    ],
  },
  {
    group: "Guardian",
    fields: [
      { key: "father_name", label: "Father Name" },
      { key: "mother_name", label: "Mother Name" },
      { key: "guardian_contact", label: "Guardian Contact" },
    ],
  },
  {
    group: "Subjects",
    fields: [
      { key: "core_subjects", label: "Core Subjects" },
      { key: "specialized_subjects", label: "Specialized Subjects" },
      { key: "enriched_subjects", label: "Enriched Subjects" },
    ],
  },
  {
    group: "Attendance",
    fields: [
      { key: "attendance_percentage", label: "Attendance Percentage" },
      { key: "present_days", label: "Present Days" },
      { key: "absent_days", label: "Absent Days" },
    ],
  },
  {
    group: "Performance",
    fields: [
      { key: "gpa", label: "GPA" },
      { key: "overall_percentage", label: "Overall Percentage" },
      { key: "rank", label: "Rank" },
      { key: "assignment_average", label: "Assignment Average" },
      { key: "exam_average", label: "Exam Average" },
    ],
  },
  {
    group: "Fees",
    fields: [
      { key: "fees_paid", label: "Paid" },
      { key: "fees_pending", label: "Pending" },
      { key: "fees_total_due", label: "Total Due" },
    ],
  },
  {
    group: "Verification",
    fields: [
      { key: "admission_status", label: "Admission Status" },
      { key: "document_verification", label: "Document Verification" },
    ],
  },
];

const ALL_FIELD_KEYS = FIELD_GROUPS.flatMap(g => g.fields.map(f => f.key));
const DEFAULT_FIELDS = ["name", "email", "roll_number", "class_assigned", "section"];

function AdminStudentsComponent() {
  const [view, setView] = useState<ViewMode>("classes");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [subjectRequestsEnabled, setSubjectRequestsEnabled] = useState(true);
  const [requests, setRequests] = useState<SubjectRequestRecord[]>(subjectRequestRecords);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportScope, setExportScope] = useState<ExportScope>("school");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [exportClass, setExportClass] = useState("");
  const [exportSection, setExportSection] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>(DEFAULT_FIELDS);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showLargeWarning, setShowLargeWarning] = useState(false);
  const [pendingLargeExport, setPendingLargeExport] = useState(false);
  const [feeFilter, setFeeFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");

  const pendingRequests = requests.filter(r => r.status === "pending");

  function getClassPendingCount(className: string): number {
    return pendingRequests.filter(r => r.class.startsWith(className)).length;
  }

  function handleApprove(req: SubjectRequestRecord) {
    setRequests(prev => prev.map(r =>
      r.id === req.id ? { ...r, status: "approved" as const } : r
    ));
    notificationRecords.push({
      id: `n${Date.now()}`,
      studentId: req.studentId,
      studentName: req.studentName,
      title: "Subject Request Approved",
      message: `Your request for ${req.subjectName} has been approved.`,
      createdAt: new Date().toISOString(),
      read: false,
    });
    toast.success(`${req.studentName} approved for ${req.subjectName}`);
  }

  function handleReject(req: SubjectRequestRecord) {
    setRequests(prev => prev.map(r =>
      r.id === req.id ? { ...r, status: "rejected" as const } : r
    ));
    notificationRecords.push({
      id: `n${Date.now()}`,
      studentId: req.studentId,
      studentName: req.studentName,
      title: "Subject Request Rejected",
      message: `Your request for ${req.subjectName} has been rejected.`,
      createdAt: new Date().toISOString(),
      read: false,
    });
    toast.success(`${req.studentName} rejected for ${req.subjectName}`);
  }

  function handleToggle() {
    const newVal = !subjectRequestsEnabled;
    setSubjectRequestsEnabled(newVal);
    toast.success(newVal ? "Subject requests globally enabled" : "Subject requests globally disabled");
  }

  const filtered = students.filter(s =>
    (s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase()))
    && (cls === "all" || s.class === cls)
  );

  const classDetail = selectedClass ? classDetailsData[selectedClass] : null;
  const feeData = selectedClass ? feeStatusData[selectedClass] || [] : [];
  const filteredFees = feeData.filter(f => feeFilter === "all" || f.status === feeFilter);
  const classStudents = students.filter(s => s.class.startsWith(selectedClass || ""));
  const classPendingReqs = selectedClass ? pendingRequests.filter(r => r.class.startsWith(selectedClass)) : [];

  function toggleField(key: string) {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  }

  function selectAllFields() {
    setSelectedFields([...ALL_FIELD_KEYS]);
  }

  function deselectAllFields() {
    setSelectedFields([]);
  }

  function buildExportFilters(): Record<string, unknown> {
    const f: Record<string, unknown> = {};
    if (exportScope === "class" && exportClass) {
      f.class_assigned = exportClass;
    }
    if (exportScope === "section") {
      if (exportClass) f.class_assigned = exportClass;
      if (exportSection) f.section = exportSection;
    }
    if (exportScope === "multiple" && exportClass) {
      const names = exportClass.split(",").map(s => s.trim()).filter(Boolean);
      if (names.length > 0) f.class_names = names;
    }
    if (exportStatus) {
      f.status = exportStatus;
    }
    return f;
  }

  function handleProceedToConfirm() {
    if (selectedFields.length === 0) {
      toast.error("Please select at least one field to export");
      return;
    }
    const totalRecords = students.length;
    if (totalRecords > 500) {
      setShowLargeWarning(true);
      setPendingLargeExport(true);
    } else {
      setShowExportConfirm(true);
    }
  }

  function handleLargeConfirm() {
    setShowLargeWarning(false);
    setPendingLargeExport(false);
    setShowExportConfirm(true);
  }

  function handleLargeCancel() {
    setShowLargeWarning(false);
    setPendingLargeExport(false);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const filters = buildExportFilters();
      const { blob, filename } = await exportApi.downloadStudents(exportFormat, selectedFields, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setShowExportConfirm(false);
      setShowExport(false);
      toast.success(`Exported ${filename}`);
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  if (view === "class-detail" && selectedClass && classDetail) {
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => { setView("classes"); setSelectedClass(null); }}><ArrowLeft className="h-4 w-4" /></Button>
          <div><h2 className="text-xl font-bold">Class {selectedClass}</h2><p className="text-sm text-muted-foreground">{classDetail.totalStudents} students · {classDetail.sections.length} sections</p></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Students" value={classDetail.totalStudents} icon={Users} accent="primary" />
          <StatCard label="Sections" value={classDetail.sections.length} icon={Users} accent="info" />
          <StatCard label="Subjects" value={classDetail.subjects.length} icon={Users} accent="brand" />
          <StatCard label="Class Teacher" value={classDetail.classTeacher} icon={UserCheck} accent="success" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardContent className="p-4">
              <h3 className="font-semibold mb-3">Sections</h3>
              <div className="flex flex-wrap gap-2">{classDetail.sections.map(s => (<Badge key={s} variant="outline" className="text-sm px-3 py-1">Section {s}</Badge>))}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <h3 className="font-semibold mb-3">Subject Allocations</h3>
              <Table><TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Teacher</TableHead></TableRow></TableHeader>
                <TableBody>{classDetail.subjects.map(sub => (
                  <TableRow key={sub.code}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>{sub.teacher || <span className="text-destructive">No Teacher Assigned</span>}</TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <h3 className="font-semibold mb-3">Students</h3>
              <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>ID</TableHead><TableHead>Section</TableHead><TableHead>Attendance</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>{classStudents.map(s => (
                  <TableRow key={s.id} className="cursor-pointer" onClick={() => { setSelectedStudent(s); setView("student-detail"); }}>
                    <TableCell><div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{s.name.split(" ").map(x => x[0]).join("")}</AvatarFallback></Avatar><span className="font-medium">{s.name}</span></div></TableCell>
                    <TableCell className="text-xs font-mono">{s.id}</TableCell>
                    <TableCell>{s.class.split("-")[1] || "A"}</TableCell>
                    <TableCell>{s.attendance}%</TableCell>
                    <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <h3 className="font-semibold mb-3">Fee Report — Class {selectedClass}</h3>
              <div className="flex items-center gap-2 mb-3">
                <Select value={feeFilter} onValueChange={(v: "all" | "paid" | "unpaid") => setFeeFilter(v)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="unpaid">Unpaid</SelectItem></SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">{feeData.filter(f => f.status === "paid").length} paid · {feeData.filter(f => f.status === "unpaid").length} unpaid</span>
              </div>
              <Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Amount</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>{filteredFees.map(f => (
                  <TableRow key={f.student}><TableCell>{f.student}</TableCell><TableCell>${f.amount}</TableCell><TableCell>{f.dueDate}</TableCell><TableCell><Badge variant={f.status === "paid" ? "default" : "secondary"} className={f.status === "paid" ? "bg-success" : ""}>{f.status}</Badge></TableCell></TableRow>
                ))}</TableBody>
              </Table>
            </CardContent></Card>
          </div>
          <div>
            <Card><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Attendance Summary</h3>
              <div className="text-center"><div className="text-3xl font-bold text-success">94.2%</div><p className="text-sm text-muted-foreground">Overall attendance</p></div>
              <div className="space-y-2"><div className="flex justify-between text-sm"><span>Present</span><span className="font-medium">87</span></div><div className="flex justify-between text-sm"><span>Absent</span><span className="font-medium">5</span></div></div>
            </CardContent></Card>
            <Card className="mt-4"><CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Subject Requests</span>
                <Button variant="ghost" size="sm" onClick={handleToggle}>
                  {subjectRequestsEnabled ? <ToggleRight className="h-5 w-5 text-success" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                </Button>
              </div>
              {classPendingReqs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No pending requests</p>
              ) : (
                <div className="space-y-2 mt-1">
                  {classPendingReqs.slice(0, 4).map(req => (
                    <div key={req.id} className="p-2 rounded bg-muted/40 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{req.studentName}</span>
                        <span className="text-muted-foreground">{req.section}</span>
                      </div>
                      <p className="text-muted-foreground">Requested: <span className="font-medium">{req.subjectName}</span></p>
                      <div className="flex gap-1 pt-1">
                        <Button size="sm" variant="default" className="h-6 px-2 text-[10px] bg-success hover:bg-success/90" onClick={() => handleApprove(req)}>Approve</Button>
                        <Button size="sm" variant="destructive" className="h-6 px-2 text-[10px]" onClick={() => handleReject(req)}>Reject</Button>
                      </div>
                    </div>
                  ))}
                  {classPendingReqs.length > 4 && (
                    <p className="text-[10px] text-muted-foreground text-center">+{classPendingReqs.length - 4} more</p>
                  )}
                </div>
              )}
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
              <Avatar className="h-16 w-16 mx-auto"><AvatarFallback className="bg-gradient-brand text-white text-lg">{selectedStudent.name.split(" ").map(x => x[0]).join("")}</AvatarFallback></Avatar>
              <h3 className="font-semibold mt-2">{selectedStudent.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 space-y-2">
              <h4 className="font-medium text-sm">Personal Information</h4>
              <div className="text-sm space-y-1"><p><span className="text-muted-foreground">Roll:</span> {selectedStudent.id}</p><p><span className="text-muted-foreground">Class:</span> {selectedStudent.class}</p><p><span className="text-muted-foreground">Attendance:</span> {selectedStudent.attendance}%</p><p><span className="text-muted-foreground">GPA:</span> {selectedStudent.gpa}</p><p><span className="text-muted-foreground">Status:</span> <Badge variant={selectedStudent.status === "Active" ? "default" : "secondary"}>{selectedStudent.status}</Badge></p></div>
            </CardContent></Card>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Card><CardContent className="p-4"><h4 className="font-medium text-sm mb-2">Subjects</h4>
              <div className="flex flex-wrap gap-2">{["Mathematics", "Physics", "English", "Biology", "Chemistry", "CS"].map(sub => (<Badge key={sub} variant="outline">{sub}</Badge>))}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4"><h4 className="font-medium text-sm mb-2">Attendance Records</h4>
              <div className="text-sm text-muted-foreground">Monthly attendance: {selectedStudent.attendance}%</div>
            </CardContent></Card>
            <Card><CardContent className="p-4"><h4 className="font-medium text-sm mb-2">Documents</h4>
              <div className="flex flex-wrap gap-2">{[{ name: "10th Marksheet" }, { name: "ID Card" }, { name: "TC" }].map(d => (<Badge key={d.name} variant="outline" className="cursor-pointer">{d.name}</Badge>))}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4"><h4 className="font-medium text-sm mb-2">Notifications</h4>
              <p className="text-sm text-muted-foreground">No unread notifications</p>
            </CardContent></Card>
          </div>
        </div>
      </>
    );
  }

  if (view === "fee-report") {
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setView("classes")}><ArrowLeft className="h-4 w-4" /></Button>
          <h2 className="text-xl font-bold">Fee Report</h2>
        </div>
        <Card><CardContent className="p-4">
          <div className="flex gap-3 mb-4">
            <Select value={selectedClass || ""} onValueChange={v => setSelectedClass(v)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>{classCards.map(c => (<SelectItem key={c.name} value={c.name}>Class {c.name}</SelectItem>))}</SelectContent>
            </Select>
            <Select value={feeFilter} onValueChange={(v: "all" | "paid" | "unpaid") => setFeeFilter(v)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="unpaid">Unpaid</SelectItem></SelectContent>
            </Select>
          </div>
          {selectedClass && feeData.length > 0 ? (
            <Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Amount</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{filteredFees.map(f => (<TableRow key={f.student}><TableCell>{f.student}</TableCell><TableCell>${f.amount}</TableCell><TableCell>{f.dueDate}</TableCell><TableCell><Badge variant={f.status === "paid" ? "default" : "secondary"} className={f.status === "paid" ? "bg-success" : ""}>{f.status}</Badge></TableCell></TableRow>))}</TableBody>
            </Table>
          ) : <p className="text-sm text-muted-foreground text-center py-8">{selectedClass ? "No fee data" : "Select a class"}</p>}
        </CardContent></Card>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-bold">Student Management</h2><p className="text-sm text-muted-foreground">{classCards.length} classes · {students.length} students</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowAddStudent(true)}><Plus className="mr-2 h-4 w-4" />Add Student</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {classCards.map(c => {
          const classPending = getClassPendingCount(c.name);
          return (
            <Card key={c.name} className="hover-lift overflow-hidden cursor-pointer" onClick={() => { setSelectedClass(c.name); setView("class-detail"); }}>
              <div className="h-1 bg-gradient-brand" />
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Users className="h-5 w-5" /></div>
                  {classPending > 0 && <Badge variant="secondary">{classPending} pending</Badge>}
                </div>
                <h3 className="mt-3 font-semibold text-lg">Class {c.name}</h3>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">{c.total}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Boys</span><span>{c.boys}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Girls</span><span>{c.girls}</span></div>
                </div>
                <div className="mt-3 flex items-center text-xs text-muted-foreground">
                  <UserCheck className="h-3 w-3 mr-1" />{c.sections.length} sections
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3">View Class</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subject Request Control Panel */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Subject Request Control</h3>
              <p className="text-sm text-muted-foreground">
                Pending Requests ({pendingRequests.length})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{subjectRequestsEnabled ? "Enabled" : "Disabled"}</span>
              <Button
                variant={subjectRequestsEnabled ? "default" : "outline"}
                size="sm"
                onClick={handleToggle}
                className={subjectRequestsEnabled ? "bg-success hover:bg-success/90" : ""}
              >
                {subjectRequestsEnabled ? <><ToggleRight className="mr-2 h-4 w-4" />Disable</> : <><ToggleLeft className="mr-2 h-4 w-4" />Enable</>}
              </Button>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 mr-2 text-success" />
              No Pending Subject Requests
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Requested Subject</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.studentName}</TableCell>
                      <TableCell className="font-mono text-xs">{req.rollNumber}</TableCell>
                      <TableCell>{req.class}</TableCell>
                      <TableCell>{req.section || "-"}</TableCell>
                      <TableCell>{req.subjectName} ({req.subjectCode})</TableCell>
                      <TableCell className="text-xs">{new Date(req.requestedOn).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-warning/15 text-warning-foreground">Pending</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-success hover:bg-success/90 h-8 px-3"
                            onClick={() => handleApprove(req)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 px-3"
                            onClick={() => handleReject(req)}
                          >
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
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Class</Label><Select><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent>{classCards.map(c => (<SelectItem key={c.name} value={c.name}>Class {c.name}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label>Section</Label><Select><SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger><SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem></SelectContent></Select></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddStudent(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Student added successfully"); setShowAddStudent(false); }}>Add Student</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExport} onOpenChange={o => { if (!o) { setShowExport(false); setShowExportConfirm(false); setShowLargeWarning(false); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Export Student Data</DialogTitle></DialogHeader>

          {/* Section 1: Export Format */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Export Format</Label>
            <div className="flex gap-2">
              {(["csv", "excel", "pdf"] as ExportFormat[]).map(fmt => (
                <Button
                  key={fmt}
                  size="sm"
                  variant={exportFormat === fmt ? "default" : "outline"}
                  onClick={() => setExportFormat(fmt)}
                  className="capitalize"
                >
                  {fmt === "csv" ? "CSV (.csv)" : fmt === "excel" ? "Excel (.xlsx)" : "PDF (.pdf)"}
                </Button>
              ))}
            </div>
          </div>

          {/* Section 2: Export Scope */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Export Scope</Label>
            <Select value={exportScope} onValueChange={v => setExportScope(v as ExportScope)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="school">Entire School</SelectItem>
                <SelectItem value="class">Single Class</SelectItem>
                <SelectItem value="section">Single Section</SelectItem>
                <SelectItem value="multiple">Multiple Classes</SelectItem>
              </SelectContent>
            </Select>
            {exportScope !== "school" && (
              <div className="mt-2 space-y-2">
                <div>
                  <Label>Class{exportScope === "multiple" ? "es (comma-separated)" : ""}</Label>
                  {exportScope === "multiple" ? (
                    <Input
                      placeholder="e.g. X-A, X-B, IX-A"
                      value={exportClass}
                      onChange={e => setExportClass(e.target.value)}
                    />
                  ) : (
                    <Select value={exportClass} onValueChange={setExportClass}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {classCards.map(c => (
                          <SelectItem key={c.name} value={c.name}>Class {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {exportScope === "section" && (
                  <div>
                    <Label>Section</Label>
                    <Select value={exportSection} onValueChange={setExportSection}>
                      <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                      <SelectContent>
                        {["A", "B", "C"].map(s => (
                          <SelectItem key={s} value={s}>Section {s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Filter Options */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Filter Options</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Student Status</Label>
                <Select value={exportStatus} onValueChange={setExportStatus}>
                  <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 4: Field Selection Panel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Fields to Export</Label>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={selectAllFields}>Select All</Button>
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={deselectAllFields}>Deselect All</Button>
              </div>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-3">
              {FIELD_GROUPS.map(group => (
                <div key={group.group}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{group.group}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.fields.map(f => (
                      <Badge
                        key={f.key}
                        variant={selectedFields.includes(f.key) ? "default" : "outline"}
                        className={`cursor-pointer text-xs ${selectedFields.includes(f.key) ? "bg-primary" : ""}`}
                        onClick={() => toggleField(f.key)}
                      >
                        {selectedFields.includes(f.key) ? "☑" : "☐"} {f.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowExport(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleProceedToConfirm}>
              Review & Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Confirmation Dialog */}
      <Dialog open={showExportConfirm} onOpenChange={setShowExportConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Export</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Format</span><span className="font-medium capitalize">{exportFormat === "csv" ? "CSV (.csv)" : exportFormat === "excel" ? "Excel (.xlsx)" : "PDF (.pdf)"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Scope</span><span className="font-medium capitalize">{exportScope.replace("_", " ")}</span></div>
              {exportClass && <div className="flex justify-between"><span className="text-muted-foreground">Class</span><span className="font-medium">{exportClass}</span></div>}
              {exportSection && <div className="flex justify-between"><span className="text-muted-foreground">Section</span><span className="font-medium">{exportSection}</span></div>}
              {exportStatus && <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium capitalize">{exportStatus}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Records</span><span className="font-medium">{students.length} students</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fields</span><span className="font-medium">{selectedFields.length} selected</span></div>
            </div>
            <p className="text-xs text-muted-foreground">
              {exportFormat === "csv" && "CSV files can be opened in Excel, Google Sheets, or any text editor."}
              {exportFormat === "excel" && "Excel files include formatted headers and auto-filter."}
              {exportFormat === "pdf" && "PDF will be generated in landscape orientation with a table layout."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportConfirm(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleExport} disabled={exporting}>
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Large Export Warning */}
      <Dialog open={showLargeWarning} onOpenChange={o => { if (!o) { setShowLargeWarning(false); setPendingLargeExport(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Large Export
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You are about to export <strong>{students.length}</strong> student records.
            This may take a moment depending on the selected fields and format.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={handleLargeCancel}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleLargeConfirm}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: [{ title: "Students — Admin" }] }),
  component: AdminStudentsComponent,
});
