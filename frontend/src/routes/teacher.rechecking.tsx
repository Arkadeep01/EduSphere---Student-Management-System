import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileSearch, Loader2, Save, Send, CheckCircle2, Eye, ShieldBan } from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "@/services/request";

interface RecheckingScript {
  id: number;
  script_id: string;
  exam_name: string;
  subject_name: string;
  status: string;
  marks: number | null;
  total_marks: number | null;
  remarks: string;
  assigned_at: string;
  completed_at?: string;
  is_revised?: boolean;
}

const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

const evalStatusBadge: Record<string, { variant: "default" | "secondary" | "outline"; className: string }> = {
  pending: { variant: "secondary", className: "" },
  evaluating: { variant: "default", className: "bg-warning" },
  completed: { variant: "default", className: "bg-success" },
};

function TeacherRecheckingPage() {
  const queryClient = useQueryClient();
  const [selectedScript, setSelectedScript] = useState<RecheckingScript | null>(null);
  const [marks, setMarks] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: queue, isLoading: queueLoading } = useQuery<RecheckingScript[]>({
    queryKey: ["teacher-rechecking-queue"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/teacher/rechecking/queue/`, { headers });
      if (!r.ok) throw new Error("Failed to load rechecking queue");
      return r.json();
    },
    enabled: !!token,
  });

  const { data: history, isLoading: historyLoading } = useQuery<RecheckingScript[]>({
    queryKey: ["teacher-rechecking-history"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/teacher/rechecking/history/`, { headers });
      if (!r.ok) throw new Error("Failed to load history");
      return r.json();
    },
    enabled: !!token,
  });

  const saveDraft = async () => {
    if (!selectedScript) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${API_BASE}/api/teacher/rechecking/${selectedScript.id}/draft/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ marks: Number(marks), remarks }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || "Failed"); }
      toast.success("Draft saved");
      queryClient.invalidateQueries({ queryKey: ["teacher-rechecking"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitEval = async () => {
    if (!selectedScript) return;
    if (!marks || !totalMarks) { toast.error("Marks and total marks required"); return; }
    setSubmitting(true);
    try {
      const r = await fetch(`${API_BASE}/api/teacher/rechecking/${selectedScript.id}/submit/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ marks: Number(marks), total_marks: Number(totalMarks), remarks }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || "Failed"); }
      toast.success("Re-evaluation submitted");
      setSelectedScript(null);
      setMarks(""); setTotalMarks(""); setRemarks("");
      queryClient.invalidateQueries({ queryKey: ["teacher-rechecking"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (queueLoading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const pending = (queue ?? []).filter(s => s.status !== "completed");
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Rechecking</h2>
        <p className="text-sm text-muted-foreground">Anonymous script re-evaluation — student identity is hidden</p>
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Evaluation Queue ({pending.length})</TabsTrigger>
          <TabsTrigger value="history">History ({history?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><ShieldBan className="h-4 w-4" />Blind Re-evaluation Queue</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => queryClient.invalidateQueries({ queryKey: ["teacher-rechecking-queue"] })}>
                <Loader2 className="h-3 w-3 mr-1" />Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Script ID</TableHead><TableHead>Exam</TableHead><TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead><TableHead>Marks</TableHead><TableHead>Assigned</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {pending.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <FileSearch className="h-6 w-6 mx-auto mb-2 opacity-40" />
                      No scripts assigned for blind re-evaluation
                    </TableCell></TableRow>
                  ) : pending.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.script_id}</TableCell>
                      <TableCell className="font-medium">{s.exam_name}</TableCell>
                      <TableCell>{s.subject_name}</TableCell>
                      <TableCell><Badge variant={evalStatusBadge[s.status]?.variant || "secondary"} className={evalStatusBadge[s.status]?.className || ""}>{s.status}</Badge></TableCell>
                      <TableCell>{s.marks != null ? s.marks : "--"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.assigned_at ? new Date(s.assigned_at).toLocaleDateString() : "--"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedScript(s); setMarks(s.marks?.toString() || ""); setRemarks(s.remarks || ""); }}>
                          <Eye className="h-3 w-3 mr-1" />Evaluate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          {historyLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : !history || history.length === 0 ? (
            <Card className="p-8"><div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
              <CheckCircle2 className="h-8 w-8 opacity-40" /><p className="font-medium">No Completed Evaluations</p>
            </div></Card>
          ) : (
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Script ID</TableHead><TableHead>Exam</TableHead><TableHead>Subject</TableHead>
                  <TableHead>Marks</TableHead><TableHead>Revised</TableHead><TableHead>Completed</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {history.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.script_id}</TableCell>
                      <TableCell className="font-medium">{s.exam_name}</TableCell>
                      <TableCell>{s.subject_name}</TableCell>
                      <TableCell>{s.marks}/{s.total_marks}</TableCell>
                      <TableCell>{s.is_revised ? <Badge variant="default" className="bg-success">Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.completed_at ? new Date(s.completed_at).toLocaleDateString() : "--"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedScript} onOpenChange={o => { if (!o) setSelectedScript(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldBan className="h-4 w-4" />
              Blind Evaluate: {selectedScript?.script_id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {selectedScript?.exam_name} &middot; {selectedScript?.subject_name}
            </div>
            <div className="text-xs text-muted-foreground bg-muted rounded p-2 flex items-center gap-2">
              <ShieldBan className="h-3 w-3" />
              This is a blind re-evaluation. Student identity and original marks are hidden.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Marks Obtained</Label><Input type="number" value={marks} onChange={e => setMarks(e.target.value)} /></div>
              <div className="space-y-1"><Label>Total Marks</Label><Input type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} /></div>
            </div>
            <div className="space-y-1"><Label>Remarks</Label><Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional remarks" className="resize-none" rows={3} /></div>
            <p className="text-xs text-muted-foreground">Save draft to keep progress. Submit to complete the blind re-evaluation.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={saveDraft} disabled={submitting}><Save className="h-3 w-3 mr-1" />{submitting ? "Saving..." : "Save Draft"}</Button>
            <Button className="bg-gradient-brand border-0" onClick={submitEval} disabled={submitting}><Send className="h-3 w-3 mr-1" />{submitting ? "Submitting..." : "Submit"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/teacher/rechecking")({
  head: () => ({ meta: [{ title: "Rechecking — Teacher" }] }),
  component: TeacherRecheckingPage,
});