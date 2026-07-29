import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, CheckCircle2, Save, Send, Loader2, AlertCircle, ShieldBan, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/services/request";

const TEACHER_API_BASE = "http://localhost:8000/api/teacher";

interface AnonymousScript {
  script_id: string;
  subject_name: string;
  exam_name: string;
  upload_status: string;
  is_locked: boolean;
  draft_marks: number | null;
  draft_remarks: string;
  marks_obtained: number | null;
  total_marks: number | null;
  evaluation_status: string;
}

const evalStatusBadge: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  pending: { variant: "secondary", className: "" },
  evaluating: { variant: "default", className: "bg-warning" },
  completed: { variant: "default", className: "bg-success" },
};



export const Route = createFileRoute("/teacher/exams/evaluate/$examId/$classId")({
  head: () => ({ meta: [{ title: "Evaluate — Teacher" }] }),
  component: () => {
    const { examId, classId } = Route.useParams();
    const [scripts, setScripts] = useState<AnonymousScript[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [evaluateScript, setEvaluateScript] = useState<AnonymousScript | null>(null);
    const [marks, setMarks] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchScripts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await request<AnonymousScript[]>(
          "/evaluation/queue/",
          undefined,
          TEACHER_API_BASE,
        );
        setScripts(data || []);
      } catch {
        setError("Failed to load evaluation queue");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => { fetchScripts(); }, []);

    async function handleSaveDraft() {
      if (!evaluateScript) return;
      setSubmitting(true);
      try {
        await request(
          `/evaluation/${evaluateScript.script_id}/draft/`,
          { method: "POST", body: JSON.stringify({ marks: Number(marks), remarks }) },
          TEACHER_API_BASE,
        );
        toast.success("Draft saved");
        fetchScripts();
      } catch {
        toast.error("Failed to save draft");
      } finally {
        setSubmitting(false);
      }
    }

    async function handleSubmitEvaluation() {
      if (!evaluateScript) { toast.error("No script selected"); return; }
      if (!marks || !totalMarks) { toast.error("Marks and total marks required"); return; }
      setSubmitting(true);
      try {
        await request(
          `/evaluation/${evaluateScript.script_id}/submit/`,
          { method: "POST", body: JSON.stringify({ marks: Number(marks), total_marks: Number(totalMarks), remarks }) },
          TEACHER_API_BASE,
        );
        toast.success("Evaluation submitted");
        setEvaluateScript(null);
        setMarks("");
        setTotalMarks("");
        setRemarks("");
        fetchScripts();
      } catch {
        toast.error("Failed to submit evaluation");
      } finally {
        setSubmitting(false);
      }
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-destructive gap-2">
          <AlertCircle className="h-8 w-8" />
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchScripts}>Retry</Button>
        </div>
      );
    }

    const pending = scripts.filter(s => s.evaluation_status === "pending" || s.evaluation_status === "evaluating");
    const completed = scripts.filter(s => s.evaluation_status === "completed");
    const locked = scripts.filter(s => s.is_locked);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Evaluation</h2>
            <p className="text-sm text-muted-foreground">Exam #{examId} &middot; {classId}</p>
          </div>
          <Badge variant="outline" className="gap-1">
            {locked.length > 0 ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            {locked.length} locked
          </Badge>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Evaluation Queue ({pending.length} pending)</CardTitle>
            <Button size="sm" variant="ghost" onClick={fetchScripts}><Loader2 className="h-3 w-3 mr-1" />Refresh</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Script ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No scripts pending evaluation
                    </TableCell>
                  </TableRow>
                ) : pending.map(s => (
                  <TableRow key={s.script_id} className={s.is_locked ? "opacity-60" : ""}>
                    <TableCell className="font-mono text-xs">{s.script_id}</TableCell>
                    <TableCell className="font-medium">{s.subject_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant={evalStatusBadge[s.evaluation_status]?.variant || "secondary"}
                          className={evalStatusBadge[s.evaluation_status]?.className || ""}>
                          {s.evaluation_status}
                        </Badge>
                        {s.is_locked && <ShieldBan className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </TableCell>
                    <TableCell>{s.draft_marks != null ? s.draft_marks : "--"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={s.is_locked}
                        onClick={() => {
                          setEvaluateScript(s);
                          setMarks(s.draft_marks?.toString() || "");
                          setRemarks(s.draft_remarks || "");
                        }}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Evaluate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {completed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Completed Evaluations ({completed.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Script ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completed.map(s => (
                    <TableRow key={s.script_id}>
                      <TableCell className="font-mono text-xs">{s.script_id}</TableCell>
                      <TableCell>{s.subject_name}</TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {s.marks_obtained ?? "--"}/{s.total_marks ?? "--"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-success">Completed</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={!!evaluateScript} onOpenChange={o => { if (!o) setEvaluateScript(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Evaluate: {evaluateScript?.script_id}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {evaluateScript?.subject_name} &middot; {evaluateScript?.exam_name}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Marks Obtained</Label>
                  <Input type="number" value={marks} onChange={e => setMarks(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Total Marks</Label>
                  <Input type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Remarks</Label>
                <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional remarks" className="resize-none" rows={3} />
              </div>
              {evaluateScript?.is_locked && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded p-2">
                  <Lock className="h-3 w-3" />
                  This script is locked and cannot be modified
                </div>
              )}
              <p className="text-xs text-muted-foreground">Save draft to keep progress. Submit to finalize — locked scripts cannot be edited.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleSaveDraft} disabled={submitting || evaluateScript?.is_locked}>
                <Save className="h-3 w-3 mr-1" />
                {submitting ? "Saving..." : "Save Draft"}
              </Button>
              <Button className="bg-gradient-brand border-0" onClick={handleSubmitEvaluation} disabled={submitting || evaluateScript?.is_locked}>
                <Send className="h-3 w-3 mr-1" />
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
});