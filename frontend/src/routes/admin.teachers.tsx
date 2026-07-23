import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
import { Loader2, Star, Mail, Plus, Search, GraduationCap, BookOpen, Users, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { teacherAdminApi } from "@/services/adminApi";
import { ExportDialog } from "@/components/export";
import { teacherExportConfig } from "@/components/export/moduleConfigs";
import { API_BASE } from "@/services/request";

const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

function AdminTeachersComponent() {
  const [showNotifyModal, setShowNotifyModal] = useState<number | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAllocateSubject, setShowAllocateSubject] = useState(false);
  const [showAssignClassTeacher, setShowAssignClassTeacher] = useState(false);
  const [q, setQ] = useState("");
  const [allocations, setAllocations] = useState<any[]>([]);
  const [ctAssignments, setCtAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classNames, setClassNames] = useState<string[]>([]);

  const { data: realTeachers, isLoading } = useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/admin/teachers/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("Failed to fetch teachers");
      return r.json() as Promise<Array<Record<string, unknown>>>;
    },
    enabled: !!token,
  });

  const teachers = realTeachers ? realTeachers.map((t: any) => ({
    id: t.id as number,
    name: t.full_name || t.email || t.user?.email || "",
    subject: t.assigned_subject_name || "Unassigned",
    classes: 0,
    email: t.email || t.user?.email || "",
    experience: t.experience ?? 0,
    rating: "0.0",
  })) : [];

  useEffect(() => {
    Promise.all([
      teacherAdminApi.allocations().catch(() => []),
      teacherAdminApi.classTeacherAssignments().catch(() => []),
      fetch(`${API_BASE}/api/admin/subjects/`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/api/admin/classes/`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => (d as any[])?.map((c: any) => c.name) || []).catch(() => []),
    ]).then(([alloc, ct, subs, cls]) => {
      setAllocations(alloc as any[] || []);
      setCtAssignments(ct as any[] || []);
      setSubjects(subs as any[] || []);
      setClassNames(cls as string[] || []);
    });
  }, []);

  const filtered = teachers.filter(t =>
    t.name?.toLowerCase().includes(q.toLowerCase()) ||
    t.subject?.toLowerCase().includes(q.toLowerCase())
  );

  const sendNotification = async (id: number) => {
    try {
      await teacherAdminApi.notify(id, notifyTitle || "Notification", notifyMessage);
      toast.success("Notification sent to teacher");
      setShowNotifyModal(null);
      setNotifyMessage("");
      setNotifyTitle("");
    } catch { toast.error("Failed to send notification"); }
  };

  const allocateSubject = async (teacherId: number, subjectId: number, classes: string[]) => {
    try {
      await teacherAdminApi.allocateSubject(teacherId, subjectId, classes);
      toast.success("Subject allocation saved");
      const alloc = await teacherAdminApi.allocations();
      setAllocations(alloc as any[] || []);
      setShowAllocateSubject(false);
    } catch { toast.error("Failed to allocate subject"); }
  };

  const assignClassTeacher = async (teacherId: number, className: string) => {
    try {
      await teacherAdminApi.assignClassTeacher(teacherId, className);
      toast.success("Class teacher assigned");
      const ct = await teacherAdminApi.classTeacherAssignments();
      setCtAssignments(ct as any[] || []);
      setShowAssignClassTeacher(false);
    } catch { toast.error("Failed to assign class teacher"); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
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
                  <Avatar className="h-12 w-12"><AvatarFallback className="bg-gradient-brand text-white">{t.name.split(" ").map((s: string) => s[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
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
            <Table><TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Subject</TableHead><TableHead>Assigned Classes</TableHead></TableRow></TableHeader>
              <TableBody>{allocations.map((sa: any, i: number) => (
                <TableRow key={sa.id || i}>
                  <TableCell className="font-medium">{sa.teacher_name || sa.teacher}</TableCell>
                  <TableCell>{sa.subject_name || sa.subject}</TableCell>
                  <TableCell>{(sa.assigned_classes || []).join(", ")}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="class-teachers">
          <Card><CardContent className="p-4">
            <Table><TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Class</TableHead></TableRow></TableHeader>
              <TableBody>{ctAssignments.map((ct: any, i: number) => (
                <TableRow key={ct.id || i}>
                  <TableCell className="font-medium">{ct.teacher_name || ct.teacher}</TableCell>
                  <TableCell>Class {ct.class_name || ct.class}</TableCell>
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
            <div className="space-y-2"><Label>Title</Label><Input value={notifyTitle} onChange={e => setNotifyTitle(e.target.value)} placeholder="Notification title" /></div>
            <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Type your notification message..." value={notifyMessage} onChange={e => setNotifyMessage(e.target.value)} rows={4} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setShowNotifyModal(null); setNotifyMessage(""); setNotifyTitle(""); }}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={() => sendNotification(showNotifyModal!)}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAllocateSubject} onOpenChange={setShowAllocateSubject}>
        <DialogContent><DialogHeader><DialogTitle>Subject Teacher Allocation</DialogTitle></DialogHeader>
          <AllocateSubjectForm teachers={teachers} subjects={subjects} classNames={classNames} onSave={allocateSubject} onCancel={() => setShowAllocateSubject(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignClassTeacher} onOpenChange={setShowAssignClassTeacher}>
        <DialogContent><DialogHeader><DialogTitle>Assign Class Teacher</DialogTitle></DialogHeader>
          <AssignClassTeacherForm teachers={teachers} classNames={classNames} onSave={assignClassTeacher} onCancel={() => setShowAssignClassTeacher(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddTeacher} onOpenChange={setShowAddTeacher}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Teacher</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Enter full name" /></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Email</Label><Input type="email" /></div><div className="space-y-2"><Label>Phone</Label><Input placeholder="Phone number" /></div></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Employee ID</Label><Input placeholder="TCHxxx" /></div><div className="space-y-2"><Label>Qualification</Label><Input placeholder="e.g. Ph.D., M.Sc." /></div></div>
            <div className="space-y-2"><Label>Experience (years)</Label><Input type="number" placeholder="0" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddTeacher(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Teacher added"); setShowAddTeacher(false); }}>Add Teacher</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportDialog open={showExport} onOpenChange={setShowExport} config={teacherExportConfig} />
    </>
  );
}

function AllocateSubjectForm({ teachers, subjects, classNames, onSave, onCancel }: {
  teachers: any[]; subjects: any[]; classNames: string[];
  onSave: (teacherId: number, subjectId: number, classes: string[]) => void; onCancel: () => void;
}) {
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  return (
    <div className="space-y-3">
      <div className="space-y-2"><Label>Teacher</Label>
        <Select onValueChange={v => setTeacherId(parseInt(v))}><SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
          <SelectContent>{teachers.map((t: any) => (<SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label>Subject</Label>
        <Select onValueChange={v => setSubjectId(parseInt(v))}><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
          <SelectContent>{subjects.map((s: any) => (<SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label>Assigned Classes</Label>
        <div className="flex flex-wrap gap-2">{classNames.map(c => (
          <Badge key={c} variant={selectedClasses.includes(c) ? "default" : "outline"} className="cursor-pointer"
            onClick={() => setSelectedClasses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}>
            Class {c}
          </Badge>
        ))}</div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button className="bg-gradient-brand border-0" onClick={() => { if (teacherId && subjectId) onSave(teacherId, subjectId, selectedClasses); }}>Save Allocation</Button>
      </DialogFooter>
    </div>
  );
}

function AssignClassTeacherForm({ teachers, classNames, onSave, onCancel }: {
  teachers: any[]; classNames: string[];
  onSave: (teacherId: number, className: string) => void; onCancel: () => void;
}) {
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [className, setClassName] = useState("");

  return (
    <div className="space-y-3">
      <div className="space-y-2"><Label>Teacher</Label>
        <Select onValueChange={v => setTeacherId(parseInt(v))}><SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
          <SelectContent>{teachers.map((t: any) => (<SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label>Class</Label>
        <Select onValueChange={setClassName}><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
          <SelectContent>{classNames.map(c => (<SelectItem key={c} value={c}>Class {c}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button className="bg-gradient-brand border-0" onClick={() => { if (teacherId && className) onSave(teacherId, className); }}>Assign</Button>
      </DialogFooter>
    </div>
  );
}

export const Route = createFileRoute("/admin/teachers")({
  head: () => ({ meta: [{ title: "Teachers — Admin" }] }),
  component: AdminTeachersComponent,
});
