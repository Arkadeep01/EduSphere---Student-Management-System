import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Star, Mail, Plus, Search, GraduationCap, BookOpen, Users, Download, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { teachers, classCards, subjectAllocations, classTeacherAssignments, subjects } from "@/lib/mock-data";
import { toast } from "sonner";
import { exportApi } from "@/services/adminApi";

type ExportFormat = "csv" | "excel" | "pdf";
type ExportScope = "school" | "subject" | "class" | "class_teacher" | "non_class_teacher" | "selected";

const TEACHER_FIELD_GROUPS: { group: string; fields: { key: string; label: string }[] }[] = [
  {
    group: "Personal Information",
    fields: [
      { key: "name", label: "Name" },
      { key: "employee_id", label: "Employee ID" },
      { key: "username", label: "Username" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "gender", label: "Gender" },
    ],
  },
  {
    group: "Professional Information",
    fields: [
      { key: "qualification", label: "Qualification" },
      { key: "experience", label: "Experience" },
      { key: "date_of_joining", label: "Date Of Joining" },
      { key: "employment_status", label: "Employment Status" },
    ],
  },
  {
    group: "Academic Information",
    fields: [
      { key: "assigned_subject", label: "Assigned Subject" },
      { key: "assigned_classes", label: "Assigned Classes" },
      { key: "assigned_sections", label: "Assigned Sections" },
      { key: "class_teacher_of", label: "Class Teacher Of" },
    ],
  },
  {
    group: "Statistics",
    fields: [
      { key: "total_students", label: "Total Students" },
      { key: "pending_evaluations", label: "Pending Evaluations" },
      { key: "assignments_created", label: "Assignments Created" },
      { key: "attendance_taken", label: "Attendance Taken" },
      { key: "resources_uploaded", label: "Resources Uploaded" },
      { key: "syllabus_uploaded", label: "Syllabus Uploaded" },
    ],
  },
  {
    group: "System Information",
    fields: [
      { key: "last_login", label: "Last Login" },
      { key: "performance_rating", label: "Performance Rating" },
    ],
  },
];

const TEACHER_ALL_FIELD_KEYS = TEACHER_FIELD_GROUPS.flatMap(g => g.fields.map(f => f.key));
const TEACHER_DEFAULT_FIELDS = ["name", "employee_id", "email", "assigned_subject", "experience"];

function AdminTeachersComponent() {
  const [showNotifyModal, setShowNotifyModal] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [exportScope, setExportScope] = useState<ExportScope>("school");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [exportSubject, setExportSubject] = useState("");
  const [exportClass, setExportClass] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>(["name", "employee_id", "email", "assigned_subject", "experience"]);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showLargeWarning, setShowLargeWarning] = useState(false);
  const [pendingLargeExport, setPendingLargeExport] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAllocateSubject, setShowAllocateSubject] = useState(false);
  const [showAssignClassTeacher, setShowAssignClassTeacher] = useState(false);
  const [q, setQ] = useState("");

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(q.toLowerCase()) ||
    t.subject.toLowerCase().includes(q.toLowerCase()) ||
    t.id.toLowerCase().includes(q.toLowerCase())
  );

  function toggleField(key: string) {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  }

  function selectAllFields() {
    setSelectedFields([...TEACHER_ALL_FIELD_KEYS]);
  }

  function deselectAllFields() {
    setSelectedFields([]);
  }

  function buildTeacherExportFilters(): Record<string, unknown> {
    const f: Record<string, unknown> = {};
    if (exportScope === "subject" && exportSubject) {
      f.subject_id = exportSubject;
      f.subject_name = exportSubject;
    }
    if (exportScope === "class" && exportClass) {
      f.class_name = exportClass;
    }
    if (exportScope === "class_teacher") {
      f.class_teacher = true;
    }
    if (exportScope === "non_class_teacher") {
      f.class_teacher = false;
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
    if (teachers.length > 500) {
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
      const filters = buildTeacherExportFilters();
      const { blob, filename } = await exportApi.downloadTeachers(exportFormat, selectedFields, filters);
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

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-bold">Teacher Management</h2><p className="text-sm text-muted-foreground">{teachers.length} teachers</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button variant="outline" size="sm" onClick={() => setShowAssignClassTeacher(true)}><Users className="mr-2 h-4 w-4" />Class Teacher</Button>
          <Button variant="outline" size="sm" onClick={() => setShowAllocateSubject(true)}><BookOpen className="mr-2 h-4 w-4" />Allocate Subject</Button>
          <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowAddTeacher(true)}><Plus className="mr-2 h-4 w-4" />Add Teacher</Button>
        </div>
      </div>

      <Tabs defaultValue="teachers">
        <TabsList className="mb-4"><TabsTrigger value="teachers">Teachers</TabsTrigger><TabsTrigger value="allocations">Subject Allocations</TabsTrigger><TabsTrigger value="class-teachers">Class Teachers</TabsTrigger></TabsList>

        <TabsContent value="teachers">
          <div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search teachers..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} /></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(t => (
              <Card key={t.id} className="hover-lift"><CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12"><AvatarFallback className="bg-gradient-brand text-white">{t.name.split(" ").map(s => s[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1"><p className="font-semibold truncate">{t.name}</p><p className="text-xs text-muted-foreground">{t.subject}</p></div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <Badge variant="outline">{t.classes} classes</Badge>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{t.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t.experience} years experience</p>
                <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => setShowNotifyModal(t.id)}><Mail className="mr-2 h-3 w-3" />Send Notification</Button>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="allocations">
          <Card><CardContent className="p-4">
            <Table><TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Subject</TableHead><TableHead>Assigned Classes</TableHead><TableHead>Academic Year</TableHead></TableRow></TableHeader>
              <TableBody>{subjectAllocations.map((sa, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{sa.teacher}</TableCell>
                  <TableCell>{sa.subject}</TableCell>
                  <TableCell>{sa.classes.join(", ")}</TableCell>
                  <TableCell><Badge variant="outline">{sa.academicYear}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="class-teachers">
          <Card><CardContent className="p-4">
            <Table><TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Class</TableHead><TableHead>Academic Year</TableHead></TableRow></TableHeader>
              <TableBody>{classTeacherAssignments.map((ct, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{ct.teacher}</TableCell>
                  <TableCell>Class {ct.class}</TableCell>
                  <TableCell><Badge variant="outline">{ct.academicYear}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!showNotifyModal} onOpenChange={o => { if (!o) setShowNotifyModal(null); }}>
        <DialogContent><DialogHeader><DialogTitle>Send Notification</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Teacher</Label><p className="text-sm font-medium">{teachers.find(t => t.id === showNotifyModal)?.name}</p></div>
            <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Type your notification message..." value={notifyMessage} onChange={e => setNotifyMessage(e.target.value)} rows={4} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setShowNotifyModal(null); setNotifyMessage(""); }}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Notification sent to teacher"); setShowNotifyModal(null); setNotifyMessage(""); }}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddTeacher} onOpenChange={setShowAddTeacher}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Teacher</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Enter full name" /></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Email</Label><Input type="email" /></div><div className="space-y-2"><Label>Phone</Label><Input placeholder="Phone number" /></div></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Employee ID</Label><Input placeholder="TCHxxx" /></div><div className="space-y-2"><Label>Qualification</Label><Input placeholder="e.g. Ph.D., M.Sc." /></div></div>
            <div className="space-y-2"><Label>Experience (years)</Label><Input type="number" placeholder="0" /></div>
            <div className="space-y-2"><Label>Subject</Label><Select><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger><SelectContent>{subjects.map(s => (<SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Assigned Classes</Label><Select><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent>{classCards.map(c => (<SelectItem key={c.name} value={c.name}>Class {c.name}</SelectItem>))}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddTeacher(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Teacher added successfully"); setShowAddTeacher(false); }}>Add Teacher</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAllocateSubject} onOpenChange={setShowAllocateSubject}>
        <DialogContent><DialogHeader><DialogTitle>Subject Teacher Allocation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Teacher</Label><Select><SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger><SelectContent>{teachers.map(t => (<SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Subject</Label><Select><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger><SelectContent>{subjects.map(s => (<SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Assigned Classes</Label><div className="flex flex-wrap gap-2">{classCards.slice(0, 4).map(c => (<Badge key={c.name} variant="outline" className="cursor-pointer">Class {c.name}</Badge>))}</div></div>
            <div className="space-y-2"><Label>Academic Session</Label><Select defaultValue="2026-27"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2026-27">2026-27</SelectItem><SelectItem value="2025-26">2025-26</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAllocateSubject(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Subject allocation saved"); setShowAllocateSubject(false); }}>Save Allocation</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignClassTeacher} onOpenChange={setShowAssignClassTeacher}>
        <DialogContent><DialogHeader><DialogTitle>Assign Class Teacher</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Teacher</Label><Select><SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger><SelectContent>{teachers.map(t => (<SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Class</Label><Select><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent>{classCards.map(c => (<SelectItem key={c.name} value={c.name}>Class {c.name}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Academic Year</Label><Select defaultValue="2026-27"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2026-27">2026-27</SelectItem><SelectItem value="2025-26">2025-26</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAssignClassTeacher(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Class teacher assigned"); setShowAssignClassTeacher(false); }}>Assign</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExport} onOpenChange={o => { if (!o) { setShowExport(false); setShowExportConfirm(false); setShowLargeWarning(false); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Export Teacher Data</DialogTitle></DialogHeader>

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

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Export Scope</Label>
            <Select value={exportScope} onValueChange={v => setExportScope(v as ExportScope)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="school">Entire School Teachers</SelectItem>
                <SelectItem value="subject">Subject-wise</SelectItem>
                <SelectItem value="class">Class-wise</SelectItem>
                <SelectItem value="class_teacher">Class Teachers Only</SelectItem>
                <SelectItem value="non_class_teacher">Non-Class Teachers Only</SelectItem>
              </SelectContent>
            </Select>
            {exportScope === "subject" && (
              <div className="mt-2">
                <Label>Subject</Label>
                <Select value={exportSubject} onValueChange={setExportSubject}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {exportScope === "class" && (
              <div className="mt-2">
                <Label>Class</Label>
                <Select value={exportClass} onValueChange={setExportClass}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classCards.map(c => (
                      <SelectItem key={c.name} value={c.name}>Class {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Filter Options</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Employment Status</Label>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Fields to Export</Label>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={selectAllFields}>Select All</Button>
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={deselectAllFields}>Deselect All</Button>
              </div>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-3">
              {TEACHER_FIELD_GROUPS.map(group => (
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
              {exportSubject && <div className="flex justify-between"><span className="text-muted-foreground">Subject</span><span className="font-medium">{exportSubject}</span></div>}
              {exportClass && <div className="flex justify-between"><span className="text-muted-foreground">Class</span><span className="font-medium">{exportClass}</span></div>}
              {exportStatus && <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium capitalize">{exportStatus}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Records</span><span className="font-medium">{teachers.length} teachers</span></div>
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
              {exporting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Exporting...</> : "Export"}
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
            You are about to export <strong>{teachers.length}</strong> teacher records.
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

export const Route = createFileRoute("/admin/teachers")({
  head: () => ({ meta: [{ title: "Teachers — Admin" }] }),
  component: AdminTeachersComponent,
});
