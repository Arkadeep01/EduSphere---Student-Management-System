import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, MessageSquare } from "lucide-react";
import { teacherAssignments, teacherSubjectData, classStudents } from "@/lib/mock-data";
import { toast } from "sonner";
import { useState } from "react";

function TeacherAssignmentsComponent() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState("all");
  const [form, setForm] = useState({ title: "", description: "", targetClass: "", dueDate: "" });

  const filtered = classFilter === "all"
    ? teacherAssignments
    : teacherAssignments.filter(a => a.class === classFilter);

  const handleCreate = () => {
    if (!form.title || !form.description || !form.dueDate) {
      toast.error("Title, description and due date are required");
      return;
    }
    toast.success(`Assignment "${form.title}" created for ${form.targetClass || "all classes"}`);
    setShowCreate(false);
    setForm({ title: "", description: "", targetClass: "", dueDate: "" });
  };

  if (selectedAssignment) {
    const asgn = teacherAssignments.find(a => a.id === selectedAssignment);
    if (!asgn) return null;
    const students = classStudents[asgn.class] || [];

    return (
      <PageWrapper>

        <StaggerContainer className="grid lg:grid-cols-3 gap-4">
          <StaggerItem><Card className="lg:col-span-2"><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Status</TableHead><TableHead>Marks</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
              <TableBody>
                {students.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <Input className="w-20 h-8 text-sm" placeholder="—" type="number" />
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost"><MessageSquare className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card></StaggerItem>
          <StaggerItem><Card><CardContent className="p-6 space-y-4">
            <div><p className="text-sm text-muted-foreground">Submissions</p><p className="text-2xl font-bold">{asgn.submissions}/{asgn.total}</p></div>
            <div><p className="text-sm text-muted-foreground">Graded</p><p className="text-2xl font-bold text-success">{asgn.graded}/{asgn.submissions}</p></div>
            <ProgressBar value={asgn.graded} max={asgn.total} />
            <Button className="w-full bg-gradient-brand border-0" onClick={() => toast.success("Grades saved")}><Save className="mr-2 h-4 w-4" />Save All Grades</Button>
          </CardContent></Card></StaggerItem>
        </StaggerContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {showCreate && (
        <Card className="mb-6"><CardContent className="p-6">
          <h3 className="font-semibold mb-4">Create New Assignment</h3>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="sm:col-span-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Quadratic Equations Problem Set" /></div>
            <div className="sm:col-span-2"><Label>Description *</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed instructions for the assignment..." className="min-h-[100px]" /></div>
            <div><Label>Target Class</Label>
              <Select value={form.targetClass} onValueChange={v => setForm({ ...form, targetClass: v })}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {teacherSubjectData.classes.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Due Date *</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div className="sm:col-span-2 flex gap-2">
              <Button onClick={handleCreate} className="bg-gradient-brand border-0">Create & Publish</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        </CardContent></Card>
      )}

      <Card className="mb-4"><CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Filter by class:</span>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {teacherSubjectData.classes.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Class</TableHead><TableHead>Due</TableHead><TableHead>Submissions</TableHead><TableHead>Graded</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{filtered.map(a => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.title}</TableCell>
              <TableCell>{a.class}</TableCell>
              <TableCell>{a.due}</TableCell>
              <TableCell>{a.submissions}/{a.total}</TableCell>
              <TableCell>{a.graded}/{a.submissions}</TableCell>
              <TableCell><Badge variant={a.status === "closed" ? "default" : "secondary"} className={a.status === "closed" ? "bg-success text-success-foreground" : ""}>{a.status}</Badge></TableCell>
              <TableCell><Button size="sm" variant="outline" onClick={() => setSelectedAssignment(a.id)}>Grade</Button></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </PageWrapper>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} /></div>;
}

export const Route = createFileRoute("/teacher/assignments")({
  head: () => ({ meta: [{ title: "Assignments — Teacher" }] }),
  component: TeacherAssignmentsComponent,
});
