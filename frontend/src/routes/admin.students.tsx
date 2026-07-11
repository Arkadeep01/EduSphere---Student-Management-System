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
import { Search, ArrowLeft, Users, UserCheck, Download, Plus, ToggleLeft, ToggleRight, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { students, classCards, classDetailsData, feeStatusData, subjectRequestRecords, notificationRecords } from "@/lib/mock-data";
import type { SubjectRequestRecord } from "@/lib/mock-data";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExportDialog } from "@/components/export";
import { studentExportConfig } from "@/components/export/moduleConfigs";

type ViewMode = "classes" | "class-detail" | "student-detail" | "fee-report";

function AdminStudentsComponent() {
  const [view, setView] = useState<ViewMode>("classes");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [subjectRequestsEnabled, setSubjectRequestsEnabled] = useState(true);
  const [requests, setRequests] = useState<SubjectRequestRecord[]>(subjectRequestRecords);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showExport, setShowExport] = useState(false);
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

  function renderStudentScopeInputs(scope: string, fv: Record<string, string>, setFv: React.Dispatch<React.SetStateAction<Record<string, string>>>): React.ReactNode {
    return (
      <div className="space-y-2">
        {scope === "class" && (
          <div>
            <Label className="text-xs">Class</Label>
            <Select value={fv["class_assigned"] || ""} onValueChange={v => setFv(prev => ({ ...prev, class_assigned: v }))}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {classCards.map(c => <SelectItem key={c.name} value={c.name}>Class {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        {scope === "section" && (
          <>
            <div>
              <Label className="text-xs">Class</Label>
              <Select value={fv["class_assigned"] || ""} onValueChange={v => setFv(prev => ({ ...prev, class_assigned: v }))}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {classCards.map(c => <SelectItem key={c.name} value={c.name}>Class {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Section</Label>
              <Select value={fv["section"] || ""} onValueChange={v => setFv(prev => ({ ...prev, section: v }))}>
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {["A", "B", "C"].map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        {scope === "multiple" && (
          <div>
            <Label className="text-xs">Classes (comma-separated)</Label>
            <Input
              placeholder="e.g. X-A, X-B, IX-A"
              value={fv["class_names"] || ""}
              onChange={e => setFv(prev => ({ ...prev, class_names: e.target.value }))}
            />
          </div>
        )}
      </div>
    );
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

      <ExportDialog open={showExport} onOpenChange={setShowExport} config={studentExportConfig} renderScopeInputs={renderStudentScopeInputs} />
    </>
  );
}

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: [{ title: "Students — Admin" }] }),
  component: AdminStudentsComponent,
});
