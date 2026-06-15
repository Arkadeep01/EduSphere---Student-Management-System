import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Users, BookOpen, GraduationCap, ArrowLeft, Plus, AlertTriangle, Clock } from "lucide-react";
import { useState } from "react";
import { classCards, classDetailsData, teachers, subjects } from "@/lib/mock-data";
import { toast } from "sonner";

function AdminClassesComponent() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAssignTeacher, setShowAssignTeacher] = useState<{ subject: string; class: string } | null>(null);

  const detail = selectedClass ? classDetailsData[selectedClass] : null;

  if (selectedClass && detail) {
    const missingTeacherSubjects = detail.subjects.filter(s => !s.teacher);
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setSelectedClass(null)}><ArrowLeft className="h-4 w-4" /></Button>
          <div><h2 className="text-xl font-bold">Class {selectedClass}</h2><p className="text-sm text-muted-foreground">{detail.totalStudents} students · {detail.sections.length} sections</p></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="p-4 text-center"><Users className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold">{detail.totalStudents}</p><p className="text-xs text-muted-foreground">Students</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Layers className="h-5 w-5 mx-auto mb-1 text-info" /><p className="text-2xl font-bold">{detail.sections.length}</p><p className="text-xs text-muted-foreground">Sections</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><BookOpen className="h-5 w-5 mx-auto mb-1 text-brand" /><p className="text-2xl font-bold">{detail.subjects.length}</p><p className="text-xs text-muted-foreground">Subjects</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><GraduationCap className="h-5 w-5 mx-auto mb-1 text-success" /><p className="text-sm font-medium truncate">{detail.classTeacher}</p><p className="text-xs text-muted-foreground">Class Teacher</p></CardContent></Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardContent className="p-4">
              <h3 className="font-semibold mb-3">Sections</h3>
              <div className="flex flex-wrap gap-2">{detail.sections.map(s => (<Badge key={s} variant="outline" className="text-sm px-3 py-1">Section {s}</Badge>))}</div>
            </CardContent></Card>

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

            <Card><CardContent className="p-4">
              <h3 className="font-semibold mb-3">Timetable</h3>
              <div className="space-y-3">{detail.timetable.map(day => (
                <div key={day.day}>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{day.day}</p>
                  <div className="space-y-1">{day.slots.map((slot, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/50">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono text-xs">{slot[0]}</span>
                      <span className="font-medium">{slot[1]}</span>
                      <span className="text-muted-foreground">{slot[2]}</span>
                      <span className="text-muted-foreground ml-auto">{slot[3]}</span>
                    </div>
                  ))}</div>
                </div>
              ))}</div>
            </CardContent></Card>
          </div>

          <div>
            <Card><CardContent className="p-4 space-y-3">
              <h3 className="font-semibold">Quick Actions</h3>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.success("Redirecting to teacher allocation")}><GraduationCap className="mr-2 h-4 w-4" />Manage Teachers</Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.success("Redirecting to timetable")}><Clock className="mr-2 h-4 w-4" />Edit Timetable</Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.success("Attendance report generated")}><Users className="mr-2 h-4 w-4" />Attendance Report</Button>
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

        <Dialog open={!!showAssignTeacher} onOpenChange={o => { if (!o) setShowAssignTeacher(null); }}>
          <DialogContent><DialogHeader><DialogTitle>Assign Teacher</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Subject</Label><p className="text-sm font-medium">{showAssignTeacher?.subject}</p></div>
              <div><Label>Class</Label><p className="text-sm font-medium">Class {showAssignTeacher?.class}</p></div>
              <div><Label>Select Teacher</Label><Select><SelectTrigger><SelectValue placeholder="Choose teacher" /></SelectTrigger><SelectContent>{teachers.filter(t => t.subject === showAssignTeacher?.subject || !showAssignTeacher?.subject).map(t => (<SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowAssignTeacher(null)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success(`Teacher assigned to ${showAssignTeacher?.subject}`); setShowAssignTeacher(null); }}>Assign</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-bold">Classes</h2><p className="text-sm text-muted-foreground">{classCards.length} classes</p></div>
        <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowAddClass(true)}><Plus className="mr-2 h-4 w-4" />Add Class</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {classCards.map(c => (
          <Card key={c.name} className="hover-lift overflow-hidden cursor-pointer" onClick={() => setSelectedClass(c.name)}>
            <div className="h-1 bg-gradient-brand" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Layers className="h-5 w-5" /></div>
                <Badge variant="secondary">{c.total} students</Badge>
              </div>
              <h3 className="mt-3 font-semibold text-lg">Class {c.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Class teacher: {c.classTeacher}</p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground">
                <BookOpen className="h-3 w-3 mr-1" />{classDetailsData[c.name]?.subjects.length || 0} subjects
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3">View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddClass} onOpenChange={setShowAddClass}>
        <DialogContent><DialogHeader><DialogTitle>Add Class</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Class Name</Label><Input placeholder="e.g. 10" /></div>
            <div><Label>Sections</Label><div className="flex flex-wrap gap-2">{["A", "B", "C"].map(s => (<Badge key={s} variant="outline" className="cursor-pointer">Section {s}</Badge>))}</div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Capacity per Section</Label><Input type="number" placeholder="40" /></div><div><Label>Academic Year</Label><Select defaultValue="2026-27"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2026-27">2026-27</SelectItem><SelectItem value="2025-26">2025-26</SelectItem></SelectContent></Select></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddClass(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Class created successfully"); setShowAddClass(false); }}>Create Class</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Route = createFileRoute("/admin/classes")({
  head: () => ({ meta: [{ title: "Classes — Admin" }] }),
  component: AdminClassesComponent,
});
