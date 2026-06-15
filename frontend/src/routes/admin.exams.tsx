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
import { Calendar, MapPin, Clock, Plus, CheckCircle2, Archive, Eye, Upload, BarChart3 } from "lucide-react";
import { useState } from "react";
import { examsFull, answerScriptsFull, evaluationTracking, subjects, classCards } from "@/lib/mock-data";
import { toast } from "sonner";

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
  const [showCreate, setShowCreate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [exams, setExams] = useState(examsFull);

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
            <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Create Exam</Button>
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
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Section</TableHead><TableHead>Exam</TableHead><TableHead>Subject</TableHead><TableHead>Teacher</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{answerScriptsFull.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.student}</TableCell>
                  <TableCell>{s.class}</TableCell>
                  <TableCell>{s.section}</TableCell>
                  <TableCell className="text-sm">{s.exam}</TableCell>
                  <TableCell>{s.subject}</TableCell>
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
            <div><Label>Exam Name</Label><Input placeholder="e.g. Midterm — Mathematics" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date</Label><Input type="date" /></div>
              <div><Label>Time</Label><Input type="time" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Duration</Label><Input placeholder="e.g. 2h" /></div><div><Label>Room</Label><Input placeholder="e.g. Hall A" /></div></div>
            <div><Label>Classes</Label><div className="flex flex-wrap gap-2">{classCards.slice(0, 4).map(c => (<Badge key={c.name} variant="outline" className="cursor-pointer">Class {c.name}</Badge>))}</div></div>
            <div><Label>Subjects</Label><Select><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger><SelectContent>{subjects.map(s => (<SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>))}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Exam created"); setShowCreate(false); }}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent><DialogHeader><DialogTitle>Upload Answer Scripts</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3"><div><Label>Class</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{classCards.map(c => (<SelectItem key={c.name} value={c.name}>Class {c.name}</SelectItem>))}</SelectContent></Select></div><div><Label>Section</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem></SelectContent></Select></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Subject</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{subjects.map(s => (<SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>))}</SelectContent></Select></div><div><Label>Exam</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{exams.map(e => (<SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>))}</SelectContent></Select></div></div>
            <div><Label>Upload Files</Label><div className="border-2 border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary"><Upload className="h-6 w-6 mx-auto mb-2" /><p>Drag & drop files or click to browse</p></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Scripts uploaded"); setShowUpload(false); }}>Upload</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Route = createFileRoute("/admin/exams")({
  head: () => ({ meta: [{ title: "Examinations — Admin" }] }),
  component: AdminExamsComponent,
});
