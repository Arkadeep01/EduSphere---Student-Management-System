import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, MapPin, FileText, ClipboardCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { teacherExamApi } from "@/services/teacherApi";

interface Exam { id: number; name: string; date: string; time: string | null; room: string; duration: string; status: string; classes: string[]; }

export const Route = createFileRoute("/teacher/exams")({
  head: () => ({ meta: [{ title: "Exams — Teacher" }] }),
  component: () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      teacherExamApi.list()
        .then(d => setExams(d as Exam[]))
        .catch(() => toast.error("Failed to load exams"))
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-8 text-muted-foreground">Loading exams...</div>;

    const publishedExams = exams.filter(e => e.status === "published");

    return (
      <div className="space-y-6">
        <div><h2 className="text-xl font-bold">Examinations</h2></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><FileText className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{exams.length}</p><p className="text-xs text-muted-foreground">Total Exams</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><ClipboardCheck className="h-8 w-8 text-warning" /><div><p className="text-2xl font-bold">{publishedExams.length}</p><p className="text-xs text-muted-foreground">Active Exams</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-success" /><div><p className="text-2xl font-bold">{exams.filter(e => e.status === "archived").length}</p><p className="text-xs text-muted-foreground">Completed</p></div></div></CardContent></Card>
        </div>

        <Card><CardHeader><CardTitle>Exam Schedule</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Exam</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Room</TableHead><TableHead>Duration</TableHead><TableHead>Classes</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No exams scheduled</TableCell></TableRow>
                ) : exams.map(exam => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell><span className="flex items-center gap-1 text-sm"><Calendar className="h-3 w-3" />{exam.date}</span></TableCell>
                    <TableCell><span className="flex items-center gap-1 text-sm"><Clock className="h-3 w-3" />{exam.time || "--"}</span></TableCell>
                    <TableCell><span className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3" />{exam.room || "--"}</span></TableCell>
                    <TableCell className="text-sm">{exam.duration || "--"}</TableCell>
                    <TableCell><div className="flex flex-wrap gap-1">{(exam.classes || []).map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}</div></TableCell>
                    <TableCell><Badge variant={exam.status === "published" ? "default" : exam.status === "archived" ? "outline" : "secondary"}>{exam.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      {exam.status === "published" && (
                        <Link to="/teacher/exams/evaluate/$examId/$classId" params={{ examId: exam.id.toString(), classId: (exam.classes?.[0] || "").toString() }}>
                          <Button size="sm" variant="outline"><ClipboardCheck className="h-3 w-3 mr-1" />Evaluate</Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  },
});
