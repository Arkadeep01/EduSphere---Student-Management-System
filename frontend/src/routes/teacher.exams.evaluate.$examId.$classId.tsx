import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, CheckCircle2, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/services/request";

interface Script {
  id: number; student: number; student_name: string; roll_number: string;
  exam_name: string; script_file: string; marks_obtained: number | null;
  total_marks: number | null; evaluation_status: string; draft_marks: number | null;
  draft_remarks: string; uploaded_at: string;
}

const TEACHER_API_BASE = "http://localhost:8000/api/teacher";

export const Route = createFileRoute("/teacher/exams/evaluate/$examId/$classId")({
  head: () => ({ meta: [{ title: "Evaluate — Teacher" }] }),
  component: () => {
    const { examId, classId } = Route.useParams();
    const [scripts, setScripts] = useState<Script[]>([]);
    const [loading, setLoading] = useState(true);
    const [evaluateScript, setEvaluateScript] = useState<Script | null>(null);
    const [marks, setMarks] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [remarks, setRemarks] = useState("");

    const fetchScripts = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${TEACHER_API_BASE}/evaluation/queue/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setScripts(data as Script[] || []);
      } catch { toast.error("Failed to load scripts"); }
      finally { setLoading(false); }
    };

    useEffect(() => { fetchScripts(); }, []);

    async function handleSaveDraft() {
      if (!evaluateScript) return;
      try {
        const token = localStorage.getItem("accessToken");
        await fetch(`${TEACHER_API_BASE}/evaluation/${evaluateScript.id}/draft/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ marks: Number(marks), remarks }),
        });
        toast.success("Draft saved");
        fetchScripts();
      } catch { toast.error("Failed to save draft"); }
    }

    async function handleSubmitEvaluation() {
      if (!evaluateScript || !marks || !totalMarks) { toast.error("Marks and total marks required"); return; }
      try {
        const token = localStorage.getItem("accessToken");
        await fetch(`${TEACHER_API_BASE}/evaluation/${evaluateScript.id}/submit/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ marks: Number(marks), total_marks: Number(totalMarks), remarks }),
        });
        toast.success("Evaluation submitted");
        setEvaluateScript(null);
        setMarks(""); setTotalMarks(""); setRemarks("");
        fetchScripts();
      } catch { toast.error("Failed to submit evaluation"); }
    }

    if (loading) return <div className="text-center py-8 text-muted-foreground">Loading scripts...</div>;

    const pending = scripts.filter(s => s.evaluation_status === "pending" || s.evaluation_status === "evaluating");

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-bold">Evaluation</h2><p className="text-sm text-muted-foreground">Exam #{examId} · {classId}</p></div>
        </div>

        <Card>
          <CardHeader><CardTitle>Evaluation Queue ({pending.length} pending)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Roll No</TableHead><TableHead>Exam</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {pending.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No scripts pending evaluation</TableCell></TableRow>
                ) : pending.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.student_name}</TableCell>
                    <TableCell>{s.roll_number}</TableCell>
                    <TableCell>{s.exam_name}</TableCell>
                    <TableCell><Badge variant={s.evaluation_status === "evaluating" ? "default" : "secondary"}>{s.evaluation_status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => { setEvaluateScript(s); setMarks(s.draft_marks?.toString() || ""); setRemarks(s.draft_remarks || ""); }}>
                        <FileText className="h-3 w-3 mr-1" />Evaluate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {scripts.filter(s => s.evaluation_status === "completed").length > 0 && (
          <Card>
            <CardHeader><CardTitle>Completed Evaluations</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Marks</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {scripts.filter(s => s.evaluation_status === "completed").map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.student_name}</TableCell>
                      <TableCell>{s.marks_obtained}/{s.total_marks}</TableCell>
                      <TableCell><Badge className="bg-success">Completed</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={!!evaluateScript} onOpenChange={o => { if (!o) setEvaluateScript(null); }}>
          <DialogContent><DialogHeader><DialogTitle>Evaluate: {evaluateScript?.student_name}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Marks Obtained</Label><Input type="number" value={marks} onChange={e => setMarks(e.target.value)} /></div>
                <div className="space-y-1"><Label>Total Marks</Label><Input type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} /></div>
              </div>
              <div className="space-y-1"><Label>Remarks</Label><Input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional remarks" /></div>
              <p className="text-xs text-muted-foreground">Save draft to keep progress, Submit to finalize evaluation.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleSaveDraft}><Save className="h-3 w-3 mr-1" />Save Draft</Button>
              <Button className="bg-gradient-brand border-0" onClick={handleSubmitEvaluation}><Send className="h-3 w-3 mr-1" />Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
});
