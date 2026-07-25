import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { promotionApi, type AcademicSession } from "@/services/promotionApi";
import { API_BASE } from "@/services/request";

const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

const COPY_OPTIONS = [
  { id: "subjects", label: "Student Subject Allocations", description: "Carry forward student subject selections" },
  { id: "teachers", label: "Teacher Allocations", description: "Carry forward teacher-to-subject assignments" },
  { id: "timetables", label: "Timetables", description: "Duplicate timetable entries for the new session" },
  { id: "fee_structures", label: "Fee Structures", description: "Carry forward fee configurations" },
  { id: "classes", label: "Academic Settings", description: "Carry forward grade boundaries and academic settings" },
];

function AdminPromotionRolloverComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [fromSessionId, setFromSessionId] = useState<number | null>(null);
  const [toSessionId, setToSessionId] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(COPY_OPTIONS.map((o) => o.id));
  const [showDetailId, setShowDetailId] = useState<number | null>(null);

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["admin", "sessions"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/admin/sessions/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error("Failed to fetch sessions");
      return r.json() as Promise<AcademicSession[]>;
    },
    enabled: !!token,
  });

  const { data: logsData } = useQuery({
    queryKey: ["admin", "promotion-logs"],
    queryFn: () => promotionApi.getLogs(),
  });

  const sessions = sessionsData || [];
  const currentSession = sessions.find((s) => s.is_current);

  const rolloverMutation = useMutation({
    mutationFn: (data: { from_session_id: number; to_session_id: number; copy_options: string[] }) =>
      promotionApi.createRollover(data.from_session_id, data.to_session_id, data.copy_options),
    onSuccess: (res) => {
      toast.success("Session rollover initiated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "promotion-logs"] });
      setShowConfirmDialog(false);
      setShowDetailId(res.rollover.id);
    },
    onError: (err: Error) => {
      toast.error(`Rollover failed: ${err.message}`);
    },
  });

  const { data: rolloverDetail } = useQuery({
    queryKey: ["admin", "rollover-detail", showDetailId],
    queryFn: () => (showDetailId ? promotionApi.getRolloverDetail(showDetailId) : null),
    enabled: !!showDetailId,
  });

  if (sessionsLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/admin/promotions" })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Academic Session Rollover</h2>
          <p className="text-sm text-muted-foreground">
            Carry forward data from one academic session to another
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Current Session Info */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-4">Current Session</h3>
              {currentSession ? (
                <div className="p-4 rounded bg-primary/5 border border-primary/20">
                  <p className="text-lg font-bold text-primary">{currentSession.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentSession.start_date} → {currentSession.end_date}
                  </p>
                  <Badge className="mt-2 bg-green-100 text-green-700">Current</Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active session found.</p>
              )}
            </CardContent>
          </Card>

          {/* Select Sessions */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-4">Configure Rollover</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>From Session</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={fromSessionId || ""}
                    onChange={(e) => setFromSessionId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Select source session...</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.is_current ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>To Session</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={toSessionId || ""}
                    onChange={(e) => setToSessionId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Select target session...</option>
                    {sessions
                      .filter((s) => s.id !== fromSessionId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.is_current ? "(Current)" : ""}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-center py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{fromSessionId ? sessions.find((s) => s.id === fromSessionId)?.name : "Source"}</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-medium">{toSessionId ? sessions.find((s) => s.id === toSessionId)?.name : "Target"}</span>
                </div>
              </div>

              <h4 className="font-medium text-sm mb-3 mt-6">Data to Carry Forward</h4>
              <div className="space-y-2">
                {COPY_OPTIONS.map((opt) => (
                  <div key={opt.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
                    <Checkbox
                      checked={selectedOptions.includes(opt.id)}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedOptions((prev) => [...prev, opt.id]);
                        else setSelectedOptions((prev) => prev.filter((o) => o !== opt.id));
                      }}
                      className="mt-1"
                    />
                    <div>
                      <Label className="font-medium">{opt.label}</Label>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 rounded bg-amber-50 text-sm text-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Important Notes</p>
                    <ul className="mt-1 list-disc list-inside text-xs space-y-1">
                      <li>Result records are NOT carried forward</li>
                      <li>Archived sessions remain read-only</li>
                      <li>Student class assignments are NOT automatically updated — use Promotion for that</li>
                      <li>This operation is logged and audited</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-gradient-brand border-0"
                disabled={!fromSessionId || !toSessionId || rolloverMutation.isPending}
                onClick={() => setShowConfirmDialog(true)}
              >
                {rolloverMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Start Session Rollover
              </Button>
            </CardContent>
          </Card>

          {/* Rollover Result */}
          {rolloverDetail && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4">Rollover Result</h3>
                <div
                  className={`p-4 rounded border ${
                    rolloverDetail.rollover.status === "completed"
                      ? "bg-green-50 border-green-200"
                      : rolloverDetail.rollover.status === "failed"
                        ? "bg-red-50 border-red-200"
                        : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {rolloverDetail.rollover.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : rolloverDetail.rollover.status === "failed" ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-blue-600" />
                    )}
                    <span className="font-medium">
                      Status: {rolloverDetail.rollover.status.charAt(0).toUpperCase() + rolloverDetail.rollover.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">From:</span> {rolloverDetail.rollover.from_session.name}
                      <span className="text-muted-foreground ml-3">To:</span> {rolloverDetail.rollover.to_session.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Processed by:</span>{" "}
                      {rolloverDetail.rollover.processed_by?.name || "System"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Options:</span>{" "}
                      {rolloverDetail.rollover.copy_options?.join(", ") || "All"}
                    </p>
                    {rolloverDetail.rollover.completed_at && (
                      <p>
                        <span className="text-muted-foreground">Completed at:</span>{" "}
                        {new Date(rolloverDetail.rollover.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {rolloverDetail.rollover.error_log && rolloverDetail.rollover.error_log.length > 0 && (
                    <div className="mt-3 p-2 rounded bg-red-100 text-red-800 text-xs">
                      <p className="font-medium">Errors:</p>
                      {rolloverDetail.rollover.error_log.map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Rollovers Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-4">Recent Rollovers</h3>
              {logsData?.logs
                ?.filter((l) => l.action === "rollover")
                .slice(0, 5)
                .map((log) => (
                  <div key={log.id} className="p-3 rounded bg-muted/30 mb-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.from_class} → {log.to_class}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          log.action === "rollover"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {log.action}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              {(!logsData?.logs || logsData.logs.filter((l) => l.action === "rollover").length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent rollovers</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-2">Available Sessions</h3>
              <div className="space-y-2 text-sm">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`p-2 rounded ${s.is_current ? "bg-primary/5 border border-primary/20" : "bg-muted/30"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{s.name}</span>
                      {s.is_current && <Badge className="text-[10px] bg-green-100 text-green-700">Current</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.start_date} → {s.end_date}
                    </p>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <p className="text-muted-foreground">No sessions configured</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Session Rollover</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded bg-muted/30 text-sm">
              <p>
                <span className="text-muted-foreground">From:</span>{" "}
                <span className="font-medium">{sessions.find((s) => s.id === fromSessionId)?.name}</span>
              </p>
              <p>
                <span className="text-muted-foreground">To:</span>{" "}
                <span className="font-medium">{sessions.find((s) => s.id === toSessionId)?.name}</span>
              </p>
              <p className="mt-2">
                <span className="text-muted-foreground">Options:</span>{" "}
                <span className="font-medium">
                  {selectedOptions.length === COPY_OPTIONS.length ? "All" : selectedOptions.join(", ")}
                </span>
              </p>
            </div>
            <div className="p-3 rounded bg-amber-50 text-sm text-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>This action will start the rollover process. It may take a few moments to complete depending on the amount of data.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-brand border-0"
              disabled={rolloverMutation.isPending}
              onClick={() => {
                if (fromSessionId && toSessionId) {
                  rolloverMutation.mutate({
                    from_session_id: fromSessionId,
                    to_session_id: toSessionId,
                    copy_options: selectedOptions,
                  });
                }
              }}
            >
              {rolloverMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm & Start Rollover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Route = createFileRoute("/admin/promotions/rollover")({
  head: () => ({ meta: [{ title: "Session Rollover — Admin" }] }),
  component: AdminPromotionRolloverComponent,
});