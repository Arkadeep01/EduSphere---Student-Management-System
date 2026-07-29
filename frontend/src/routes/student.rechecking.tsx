import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Loader2, AlertCircle, FileSearch, Send, History,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "@/services/request";

interface EligibleResult {
  id: number;
  exam_id: number;
  exam_name: string;
  subject_id: number;
  subject_name: string;
  marks_obtained: number;
  total_marks: number;
  grade: string;
  published_at: string;
  has_active_request: boolean;
  rechecking_window_open: boolean;
}

interface RecheckingRequest {
  id: number;
  exam_name: string;
  subject_name: string;
  status: string;
  marks_obtained_original: string | null;
  total_marks_original: string | null;
  marks_obtained_revised: string | null;
  total_marks_revised: string | null;
  is_revised: boolean;
  marks_difference: string | null;
  requested_at: string;
  completed_at: string | null;
  rejected_reason: string;
}

const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

const statusBadge: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  pending_approval: { variant: "secondary", className: "bg-amber-100 text-amber-800" },
  approved: { variant: "default", className: "bg-blue-100 text-blue-800" },
  re_evaluating: { variant: "default", className: "bg-purple-100 text-purple-800" },
  comparing: { variant: "default", className: "bg-cyan-100 text-cyan-800" },
  completed: { variant: "default", className: "bg-green-100 text-green-800" },
  rejected: { variant: "destructive", className: "" },
  closed: { variant: "outline", className: "" },
};

function StudentRecheckingPage() {
  const queryClient = useQueryClient();

  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const { data: eligible, isLoading: eligibleLoading } = useQuery<EligibleResult[]>({
    queryKey: ["student-rechecking-eligible"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/student/rechecking/eligible/`, { headers });
      if (!r.ok) throw new Error("Failed to load eligible results");
      return r.json();
    },
    enabled: !!token,
  });

  const { data: myRequests, isLoading: requestsLoading } = useQuery<RecheckingRequest[]>({
    queryKey: ["student-rechecking-list"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/student/rechecking/`, { headers });
      if (!r.ok) throw new Error("Failed to load requests");
      return r.json();
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { exam_id: number; subject_id: number }) => {
      const r = await fetch(`${API_BASE}/api/student/rechecking/create/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || "Failed"); }
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-rechecking"] });
      toast.success("Rechecking request submitted");
      setShowRequestDialog(false);
      setSelectedExamId(null);
      setSelectedSubjectId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (eligibleLoading || requestsLoading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold">Rechecking Requests</h2><p className="text-sm text-muted-foreground">Request a blind re-evaluation of your exam scripts</p></div>

      <Tabs defaultValue="request">
        <TabsList><TabsTrigger value="request">Request Rechecking</TabsTrigger><TabsTrigger value="my-requests">My Requests ({myRequests?.length ?? 0})</TabsTrigger></TabsList>

        <TabsContent value="request">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileSearch className="h-4 w-4" />Eligible Published Results</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Exam</TableHead><TableHead>Subject</TableHead><TableHead>Marks</TableHead><TableHead>Grade</TableHead><TableHead>Window</TableHead><TableHead className="text-right">Action</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {(!eligible || eligible.length === 0) ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-40" />
                      No eligible results available. Results are available for rechecking within 7 days of publication.
                    </TableCell></TableRow>
                  ) : eligible.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.exam_name}</TableCell>
                      <TableCell>{r.subject_name}</TableCell>
                      <TableCell>{r.marks_obtained}/{r.total_marks}</TableCell>
                      <TableCell><Badge variant="outline">{r.grade}</Badge></TableCell>
                      <TableCell>
                        {r.rechecking_window_open ? (
                          <Badge variant="default" className="bg-success">Open</Badge>
                        ) : (
                          <Badge variant="outline">Closed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!r.rechecking_window_open || r.has_active_request}
                          onClick={() => {
                            setSelectedExamId(r.exam_id);
                            setSelectedSubjectId(r.subject_id);
                            setShowRequestDialog(true);
                          }}
                        >
                          {r.has_active_request ? "Requested" : <><Send className="h-3 w-3 mr-1" />Request</>}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-requests">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Exam</TableHead><TableHead>Subject</TableHead><TableHead>Original</TableHead>
                <TableHead>Revised</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(!myRequests || myRequests.length === 0) ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <History className="h-6 w-6 mx-auto mb-2 opacity-40" />
                    No rechecking requests submitted yet.
                  </TableCell></TableRow>
                ) : myRequests.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.exam_name}</TableCell>
                    <TableCell>{r.subject_name}</TableCell>
                    <TableCell>{r.marks_obtained_original ?? "--"}/{r.total_marks_original ?? "--"}</TableCell>
                    <TableCell>
                      {r.status === "completed" ? (
                        <span className={r.is_revised ? "text-green-600 font-medium" : "text-muted-foreground"}>
                          {r.marks_obtained_revised ?? "--"}/{r.total_marks_revised ?? "--"}
                          {r.is_revised && r.marks_difference && <span className="ml-1 text-xs">({parseFloat(r.marks_difference) > 0 ? "+" : ""}{r.marks_difference})</span>}
                        </span>
                      ) : "--"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadge[r.status]?.variant || "secondary"} className={statusBadge[r.status]?.className || ""}>
                        {r.status.replace(/_/g, " ")}
                      </Badge>
                      {r.status === "rejected" && r.rejected_reason && (
                        <p className="text-xs text-destructive mt-1">{r.rejected_reason}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.completed_at ? new Date(r.completed_at).toLocaleDateString() : new Date(r.requested_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Rechecking Request</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            You are about to request a blind re-evaluation for the selected exam and subject. 
            This process is free and will be evaluated by a different teacher.
            Your current published result will be temporarily unlocked for revision.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={() => {
              if (selectedExamId && selectedSubjectId) createMutation.mutate({ exam_id: selectedExamId, subject_id: selectedSubjectId });
            }} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/student/rechecking")({
  head: () => ({ meta: [{ title: "Rechecking — Student" }] }),
  component: StudentRecheckingPage,
});