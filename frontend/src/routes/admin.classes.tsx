import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Users, BookOpen, GraduationCap, ArrowLeft, Plus, AlertTriangle, Clock, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { request } from "@/services/request";
import { ExportDialog } from "@/components/export";
import { classExportConfig } from "@/components/export/moduleConfigs";

interface ClassItem {
  id: number;
  name: string;
  section: string;
  academic_session: string | null;
  total_students: number;
  class_teacher: string | null;
}

interface ClassDetail {
  id: number;
  name: string;
  section: string;
  academic_session: string | null;
  total_students: number;
  subjects: { code: string; name: string; teacher: string | null }[];
  class_teacher: string | null;
}

interface SessionItem {
  id: number;
  name: string;
  is_current: boolean;
}

function AdminClassesComponent() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAssignTeacher, setShowAssignTeacher] = useState<{ subject: string; class: string } | null>(null);
  const [newClass, setNewClass] = useState({ name: "", section: "A", academic_session_id: "" });
  const [showExport, setShowExport] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      request<ClassItem[]>("/classes/"),
      request<SessionItem[]>("/sessions/"),
    ]).then(([cls, sess]) => {
      setClasses(cls || []);
      setSessions(sess || []);
    }).catch(() => toast.error("Failed to load classes")).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClass) { setDetail(null); return; }
    request<ClassDetail>(`/classes/${selectedClass}/`).then(d => {
      setDetail(d);
    }).catch(() => {
      toast.error("Failed to load class details");
      setSelectedClass(null);
    });
  }, [selectedClass]);

  function handleClassClick(name: string) {
    setSelectedClass(name);
  }

  if (selectedClass && detail) {
    const missingTeacherSubjects = detail.subjects.filter(s => !s.teacher);
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setSelectedClass(null)}><ArrowLeft className="h-4 w-4" /></Button>
          <div><h2 className="text-xl font-bold">Class {selectedClass}</h2><p className="text-sm text-muted-foreground">{detail.total_students} students</p></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="p-4 text-center"><Users className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold">{detail.total_students}</p><p className="text-xs text-muted-foreground">Students</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Layers className="h-5 w-5 mx-auto mb-1 text-info" /><p className="text-2xl font-bold">{detail.section || "—"}</p><p className="text-xs text-muted-foreground">Section</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><BookOpen className="h-5 w-5 mx-auto mb-1 text-brand" /><p className="text-2xl font-bold">{detail.subjects.length}</p><p className="text-xs text-muted-foreground">Subjects</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><GraduationCap className="h-5 w-5 mx-auto mb-1 text-success" /><p className="text-sm font-medium truncate">{detail.class_teacher || "Not assigned"}</p><p className="text-xs text-muted-foreground">Class Teacher</p></CardContent></Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardContent className="p-4">
              <h3 className="font-semibold mb-3">Subjects & Teachers</h3>
              <Table><TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Teacher</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>{detail.subjects.map(sub => (
                  <TableRow key={sub.code}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>{sub.teacher || <span className="text-muted-foreground">Not assigned</span>}</TableCell>
                    <TableCell>{sub.teacher ? <Badge variant="default" className="bg-success">Assigned</Badge> : <Badge variant="destructive">No Teacher</Badge>}</TableCell>
                    <TableCell>{!sub.teacher && <Button size="sm" variant="outline" onClick={() => setShowAssignTeacher({ subject: sub.name, class: selectedClass })}><AlertTriangle className="mr-1 h-3 w-3" />Assign</Button>}</TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </CardContent></Card>
          </div>

          <div>
            <Card><CardContent className="p-4 space-y-3">
              <h3 className="font-semibold">Quick Actions</h3>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.success("Redirecting to teacher allocation")}><GraduationCap className="mr-2 h-4 w-4" />Manage Teachers</Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.success("Redirecting to timetable")}><Clock className="mr-2 h-4 w-4" />Edit Timetable</Button>
            </CardContent></Card>

            {missingTeacherSubjects.length > 0 && (
              <Card className="mt-4"><CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive mb-2"><AlertTriangle className="h-4 w-4" /><h4 className="font-medium text-sm">Missing Teachers</h4></div>
                <div className="space-y-1">{missingTeacherSubjects.map(sub => (
                  <div key={sub.code} className="flex items-center justify-between text-sm"><span>{sub.name}</span><Button size="sm" variant="ghost" className="text-destructive h-6" onClick={() => setShowAssignTeacher({ subject: sub.name, class: selectedClass })}>Assign</Button></div>
                ))}</div>
              </CardContent></Card>
            )}
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading classes...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-bold">Classes</h2><p className="text-sm text-muted-foreground">{classes.length} classes</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowAddClass(true)}><Plus className="mr-2 h-4 w-4" />Add Class</Button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {classes.map(c => (
          <Card key={c.name} className="hover-lift overflow-hidden cursor-pointer" onClick={() => handleClassClick(c.name)}>
            <div className="h-1 bg-gradient-brand" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Layers className="h-5 w-5" /></div>
                <Badge variant="secondary">{c.total_students} students</Badge>
              </div>
              <h3 className="mt-3 font-semibold text-lg">Class {c.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Class teacher: {c.class_teacher || "Not assigned"}</p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground">
                {c.academic_session && <><GraduationCap className="h-3 w-3 mr-1" />{c.academic_session}</>}
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3">View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddClass} onOpenChange={setShowAddClass}>
        <DialogContent><DialogHeader><DialogTitle>Add Class</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Class Name</Label><Input placeholder="e.g. X-B" value={newClass.name} onChange={e => setNewClass({ ...newClass, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Section</Label><Input placeholder="e.g. A" value={newClass.section} onChange={e => setNewClass({ ...newClass, section: e.target.value })} /></div>
            <div className="space-y-2"><Label>Academic Session</Label>
              <Select value={newClass.academic_session_id} onValueChange={v => setNewClass({ ...newClass, academic_session_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
                <SelectContent>
                  {sessions.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}{s.is_current ? " (Current)" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClass(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={async () => {
              if (!newClass.name) { toast.error("Class name is required"); return; }
              try {
                await request("/classes/", {
                  method: "POST",
                  body: JSON.stringify({
                    name: newClass.name,
                    section: newClass.section,
                    academic_session_id: newClass.academic_session_id ? parseInt(newClass.academic_session_id) : null,
                  }),
                });
                toast.success("Class created successfully");
                setShowAddClass(false);
                setNewClass({ name: "", section: "A", academic_session_id: "" });
                const data = await request<ClassItem[]>("/classes/");
                setClasses(data || []);
              } catch { toast.error("Failed to create class"); }
            }}>Create Class</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportDialog open={showExport} onOpenChange={setShowExport} config={classExportConfig} />
    </>
  );
}

export const Route = createFileRoute("/admin/classes")({
  head: () => ({ meta: [{ title: "Classes — Admin" }] }),
  component: AdminClassesComponent,
});
