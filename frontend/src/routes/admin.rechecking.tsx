import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Loader2, Search, CheckCircle2, XCircle, UserCheck,
  FileSearch, Clock, TrendingUp, Users, Layers, Scale,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "@/services/request";

interface RecheckingRequest {
  id: number;
  student_name: string;
  exam_name: string;
  subject_name: string;
  status: string;
  marks_obtained_original: string | null;
  total_marks_original: string | null;
  grade_original: string;
  marks_obtained_revised: string | null;
  total_marks_revised: string | null;
  grade_revised: string;
  original_evaluator_name: string;
  second_evaluator_name: string;
  second_evaluator_status: string;
  is_revised: boolean;
  marks_difference: string | null;
  rechecking_policy_applied: string;
  rechecking_window_deadline: string | null;
  requested_at: string;
  approved_at: string | null;
  rejected_reason: string;
  completed_at: string | null;
}

interface RecheckingStats {
  total: number;
  pending_approval: number;
  approved: number;
  re_evaluating: number;
  comparing: number;
  completed: number;
  rejected: number;
  closed: number;
  revised: number;
}

interface EvaluatorItem {
  id: number;
  email: string;
  name: string;
  subject_name: string;
}

const statusBadge: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  pending_approval: { variant: "secondary", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  approved: { variant: "default", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  re_evaluating: { variant: "default", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  comparing: { variant: "default", className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400" },
  completed: { variant: "default", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { variant: "destructive", className: "" },
  closed: { variant: "outline", className: "" },
};

const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

function AdminRecheckingComponent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("requests");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [actionData, setActionData] = useState({ reason: "", evaluator_id: "", policy: "use_policy" });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["admin-rechecking", statusFilter, search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));
      const r = await fetch(`${API_BASE}/api/admin/rechecking/?${params}`, { headers });
      if (!r.ok) throw new Error("Failed to load requests");
      return r.json() as Promise<{ results: RecheckingRequest[]; total: number; page: number; page_size: number; total_pages: number }>;
    },
    enabled: !!token,
  });

  const { data: stats } = useQuery<RecheckingStats>({
    queryKey: ["admin-rechecking-stats"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/admin/rechecking/stats/`, { headers });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    enabled: !!token,
  });

  const { data: evaluators } = useQuery<EvaluatorItem[]>({
    queryKey: ["admin-rechecking-evaluators"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/admin/rechecking/evaluators/`, { headers });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    enabled: !!token,
  });

  const approveMutation = useMutation({
    mutationFn: async (data: { id: number; evaluator_id?: number; policy: string }) => {
      const r = await fetch(`${API_BASE}/api/admin/rechecking/${data.id}/action/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          second_evaluator_id: data.evaluator_id,
          rechecking_policy: data.policy,
        }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || "Failed"); }
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-rechecking"] }); toast.success("Request approved"); setShowActionDialog(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: async (data: { id: number; reason: string }) => {
      const r = await fetch(`${API_BASE}/api/admin/rechecking/${data.id}/action/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: data.reason }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || "Failed"); }
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-rechecking"] }); toast.success("Request rejected"); setShowActionDialog(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignMutation = useMutation({
    mutationFn: async (data: { id: number; teacher_id: number }) => {
      const r = await fetch(`${API_BASE}/api/admin/rechecking/${data.id}/assign/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_id: data.teacher_id }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || "Failed"); }
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-rechecking"] }); toast.success("Evaluator assigned"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const completeMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`${API_BASE}/api/admin/rechecking/${id}/complete/`, { method: "POST", headers });
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || "Failed"); }
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-rechecking"] }); toast.success("Comparison complete — result updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const closeExpiredMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch(`${API_BASE}/api/admin/rechecking/close-expired/`, { method: "POST", headers });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: (data: any) => { queryClient.invalidateQueries({ queryKey: ["admin-rechecking"] }); toast.success(`${data.closed_count} expired request(s) closed`); },
    onError: (e: Error) => toast.error(e.message),
  });

  const statCards = [
    { label: "Total Requests", value: stats?.total ?? 0, icon: FileSearch, color: "text-blue-600" },
    { label: "Pending Approval", value: stats?.pending_approval ?? 0, icon: Clock, color: "text-amber-600" },
    { label: "Re-evaluating", value: stats?.re_evaluating ?? 0, icon: UserCheck, color: "text-purple-600" },
    { label: "Completed", value: stats?.completed ?? 0, icon: CheckCircle2, color: "text-green-600" },
    { label: "Revised", value: stats?.revised ?? 0, icon: TrendingUp, color: "text-cyan-600" },
    { label: "Rejected", value: stats?.rejected ?? 0, icon: XCircle, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Rechecking Management</h2>
        <Button variant="outline" size="sm" onClick={() => closeExpiredMutation.mutate()} disabled={closeExpiredMutation.isPending}>
          <Clock className="mr-2 h-4 w-4" />Close Expired Windows
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(s => (
          <Card key={s.label} className="p-3">
            <div className="flex items-center gap-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
            <p className="text-xl font-bold mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="requests">Requests</TabsTrigger><TabsTrigger value="stats">Statistics</TabsTrigger></TabsList>

        <TabsContent value="requests">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search student, exam, subject..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="re_evaluating">Re-evaluating</SelectItem>
                <SelectItem value="comparing">Comparing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {requestsLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : !requestsData || requestsData.results.length === 0 ? (
            <Card className="p-8"><div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
              <FileSearch className="h-10 w-10 opacity-40" /><p className="font-medium">No Rechecking Requests</p><p className="text-sm">Requests will appear here when students submit rechecking requests.</p>
            </div></Card>
          ) : (
            <>
              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Student</TableHead><TableHead>Exam</TableHead><TableHead>Subject</TableHead>
                    <TableHead>Original</TableHead><TableHead>Status</TableHead><TableHead>Window</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {requestsData.results.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.student_name}</TableCell>
                        <TableCell>{r.exam_name}</TableCell>
                        <TableCell>{r.subject_name}</TableCell>
                        <TableCell className="text-sm">{r.marks_obtained_original ?? "--"}/{r.total_marks_original ?? "--"}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadge[r.status]?.variant || "secondary"} className={statusBadge[r.status]?.className || ""}>
                            {r.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {r.rechecking_window_deadline ? new Date(r.rechecking_window_deadline).toLocaleDateString() : "--"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            {r.status === "pending_approval" && (
                              <>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-success" onClick={() => { setSelectedId(r.id); setActionType("approve"); setShowActionDialog(true); }}>
                                  <CheckCircle2 className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => { setSelectedId(r.id); setActionType("reject"); setShowActionDialog(true); }}>
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {r.status === "approved" && evaluators && (
                              <Select onValueChange={v => assignMutation.mutate({ id: r.id, teacher_id: parseInt(v) })}>
                                <SelectTrigger className="h-7 w-36 text-xs"><SelectValue placeholder="Assign evaluator" /></SelectTrigger>
                                <SelectContent>
                                  {evaluators.filter(e => e.name !== r.original_evaluator_name).map(e => (
                                    <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {r.status === "comparing" && (
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => completeMutation.mutate(r.id)} disabled={completeMutation.isPending}>
                                <Scale className="h-3 w-3 mr-1" />Compare & Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent></Card></>
            )}
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" />Volume</CardTitle></CardHeader>
              <CardContent><div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Total Requests</span><span className="font-bold">{stats?.total ?? 0}</span></div>
                <div className="flex justify-between"><span>Pending Approval</span><span className="font-bold">{stats?.pending_approval ?? 0}</span></div>
                <div className="flex justify-between"><span>Approved</span><span className="font-bold">{stats?.approved ?? 0}</span></div>
                <div className="flex justify-between"><span>Rejected</span><span className="font-bold">{stats?.rejected ?? 0}</span></div>
                <div className="flex justify-between"><span>Closed (Expired)</span><span className="font-bold">{stats?.closed ?? 0}</span></div>
              </div></CardContent>
            </Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Pipeline</CardTitle></CardHeader>
              <CardContent><div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Re-evaluating</span><span className="font-bold">{stats?.re_evaluating ?? 0}</span></div>
                <div className="flex justify-between"><span>Comparing Results</span><span className="font-bold">{stats?.comparing ?? 0}</span></div>
                <div className="flex justify-between"><span>Completed</span><span className="font-bold">{stats?.completed ?? 0}</span></div>
                <div className="flex justify-between"><span>Results Revised</span><span className="font-bold text-cyan-600">{stats?.revised ?? 0}</span></div>
              </div></CardContent>
            </Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Layers className="h-4 w-4" />Summary</CardTitle></CardHeader>
              <CardContent><div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Overall Revision Rate</span><span className="font-bold">{stats && stats.total > 0 ? `${((stats.revised / stats.total) * 100).toFixed(1)}%` : "0%"}</span></div>
                <div className="flex justify-between"><span>Completion Rate</span><span className="font-bold">{stats && stats.total > 0 ? `${((stats.completed / stats.total) * 100).toFixed(1)}%` : "0%"}</span></div>
                <div className="flex justify-between"><span>Rejection Rate</span><span className="font-bold">{stats && stats.total > 0 ? `${((stats.rejected / stats.total) * 100).toFixed(1)}%` : "0%"}</span></div>
              </div></CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{actionType === "approve" ? "Approve Rechecking Request" : "Reject Rechecking Request"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {actionType === "approve" ? (
              <>
                <div className="space-y-2"><Label>Assign Evaluator (optional)</Label>
                  <Select value={actionData.evaluator_id} onValueChange={v => setActionData(prev => ({ ...prev, evaluator_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                    <SelectContent>{(evaluators ?? []).map(e => (<SelectItem key={e.id} value={e.id.toString()}>{e.name} ({e.subject_name})</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Rechecking Policy</Label>
                  <Select value={actionData.policy} onValueChange={v => setActionData(prev => ({ ...prev, policy: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="use_policy">Institution Policy</SelectItem>
                      <SelectItem value="use_higher">Use Higher Marks</SelectItem>
                      <SelectItem value="use_average">Use Average Marks</SelectItem>
                      <SelectItem value="use_new">Use New Marks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="space-y-2"><Label>Reason for Rejection</Label>
                <Textarea value={actionData.reason} onChange={e => setActionData(prev => ({ ...prev, reason: e.target.value }))} placeholder="Provide a reason..." />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>Cancel</Button>
            <Button className={actionType === "approve" ? "bg-gradient-brand border-0" : "destructive"} onClick={() => {
              if (!selectedId) return;
              if (actionType === "approve") approveMutation.mutate({ id: selectedId, evaluator_id: actionData.evaluator_id ? parseInt(actionData.evaluator_id) : undefined, policy: actionData.policy });
              else rejectMutation.mutate({ id: selectedId, reason: actionData.reason });
            }} disabled={approveMutation.isPending || rejectMutation.isPending}>
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/admin/rechecking")({
  head: () => ({ meta: [{ title: "Rechecking — Admin" }] }),
  component: AdminRecheckingComponent,
});