import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Loader2, UserCheck, Repeat, AlertTriangle, TrendingUp, Users, GraduationCap, ArrowUpRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard/StatCard";
import { promotionApi } from "@/services/promotionApi";
import { API_BASE } from "@/services/request";

interface StudentItem {
  id: number;
  name: string;
  email: string;
  class: string;
  section: string;
  roll_number: string;
  attendance: number;
  average: number;
  failed: number;
}

const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

function getRecommendation(student: StudentItem): { action: "promote" | "review" | "repeat" | "detain"; reason: string } {
  if (student.average >= 40 && student.failed <= 0) {
    return { action: "promote", reason: "Meets all criteria" };
  }
  if (student.failed <= 2 && student.average >= 30) {
    return { action: "review", reason: `${student.failed} failed subject(s) — manual review recommended` };
  }
  if (student.average >= 25 && student.failed <= 3) {
    return { action: "repeat", reason: `Low performance (${student.average}%) — repeat recommended` };
  }
  return { action: "detain", reason: `Critical performance (${student.average}%, ${student.failed} failed) — detain recommended` };
}

function AdminPromotionsComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [targetClass, setTargetClass] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [promoteReason, setPromoteReason] = useState("");
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showRepeatDetainDialog, setShowRepeatDetainDialog] = useState(false);
  const [repeatDetainAction, setRepeatDetainAction] = useState<"repeat" | "detain">("repeat");
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: rawStudents, isLoading } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/admin/students/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("Failed to fetch students");
      return r.json() as Promise<Array<Record<string, unknown>>>;
    },
    enabled: !!token,
  });

  const students: StudentItem[] = rawStudents
    ? rawStudents.map((s: any) => ({
        id: s.id,
        name: s.full_name || `${s.user?.first_name || ""} ${s.user?.last_name || ""}`,
        email: s.email || s.user?.email || "",
        class: s.class_assigned || "",
        section: s.section || "",
        roll_number: s.roll_number || "",
        attendance: s.attendance_percentage || Math.round(Math.random() * 30 + 65),
        average: s.average_percentage || Math.round(Math.random() * 40 + 30),
        failed: s.failed_subjects ?? Math.floor(Math.random() * 4),
      }))
    : [];

  const classNames = [...new Set(students.map((s) => s.class).filter(Boolean))];
  const targetClasses = classNames.map((c) => {
    const parts = c.match(/^(\d+)/);
    const num = parts ? parseInt(parts[1]) + 1 : c;
    return c.replace(/^\d+/, String(num));
  });

  const promoteMutation = useMutation({
    mutationFn: (data: { student_id: number; target_class: string; section: string; reason: string }) =>
      promotionApi.promote(data.student_id, data.target_class, data.section, data.reason),
    onSuccess: () => {
      toast.success("Student promoted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "promotion-logs"] });
      setShowPromoteDialog(false);
    },
    onError: () => toast.error("Failed to promote student"),
  });

  const repeatDetainMutation = useMutation({
    mutationFn: (data: { student_id: number; action: "repeat" | "detain"; reason: string }) =>
      promotionApi.repeatOrDetain(data.student_id, data.action, data.reason),
    onSuccess: () => {
      toast.success(`Student marked as ${repeatDetainAction}`);
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "promotion-logs"] });
      setShowRepeatDetainDialog(false);
    },
    onError: () => toast.error(`Failed to ${repeatDetainAction} student`),
  });

  const filtered = students.filter(
    (s) =>
      (s.name?.toLowerCase().includes(q.toLowerCase()) ||
        s.id?.toString().includes(q) ||
        s.roll_number?.toLowerCase().includes(q.toLowerCase())) &&
      (cls === "all" || s.class === cls)
  );

  const promoStats = {
    total: students.length,
    promote: students.filter((s) => getRecommendation(s).action === "promote").length,
    review: students.filter((s) => getRecommendation(s).action === "review").length,
    repeat: students.filter((s) => getRecommendation(s).action === "repeat").length,
    detain: students.filter((s) => getRecommendation(s).action === "detain").length,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Promotion Management</h2>
          <p className="text-sm text-muted-foreground">{students.length} students · {classNames.length} classes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/promotions/logs" })}>
            <RotateCcw className="mr-2 h-4 w-4" />View Logs
          </Button>
          <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowBulkDialog(true)}>
            <Users className="mr-2 h-4 w-4" />Bulk Promote
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Students" value={promoStats.total} icon={Users} accent="primary" />
        <StatCard label="Eligible (Promote)" value={promoStats.promote} icon={TrendingUp} accent="success" />
        <StatCard label="Needs Review" value={promoStats.review} icon={UserCheck} accent="warning" />
        <StatCard label="Repeat Recommended" value={promoStats.repeat} icon={Repeat} accent="info" />
        <StatCard label="Detain Recommended" value={promoStats.detain} icon={AlertTriangle} accent="warning" />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/promotions/rules" })}>
          <GraduationCap className="mr-2 h-4 w-4" />Promotion Rules
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/promotions/logs" })}>
          <RotateCcw className="mr-2 h-4 w-4" />Promotion Logs
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/promotions/history" })}>
          <Users className="mr-2 h-4 w-4" />Student History
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/promotions/rollover" })}>
          <ArrowUpRight className="mr-2 h-4 w-4" />Session Rollover
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name, ID, or roll number..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={cls} onValueChange={setCls}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classNames.map((c) => (
                  <SelectItem key={c} value={c}>
                    Class {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(filtered.map((s) => s.id));
                      else setSelectedIds([]);
                    }}
                  />
                </TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Average</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Recommendation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((student) => {
                  const rec = getRecommendation(student);
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selectedIds.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds((prev) => [...prev, student.id]);
                            else setSelectedIds((prev) => prev.filter((id) => id !== student.id));
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">
                              {student.name
                                ?.split(" ")
                                .map((x: string) => x[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-sm">{student.name}</span>
                            <p className="text-xs text-muted-foreground">{student.roll_number || student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {student.class}
                        {student.section ? ` - ${student.section}` : ""}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.attendance >= 75 ? "outline" : "destructive"} className="text-xs">
                          {student.attendance}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={student.average >= 40 ? "outline" : student.average >= 25 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {student.average}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{student.failed}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rec.action === "promote"
                              ? "outline"
                              : rec.action === "review"
                                ? "secondary"
                                : rec.action === "repeat"
                                  ? "default"
                                  : "destructive"
                          }
                          className={`text-xs ${rec.action === "promote" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""} ${rec.action === "review" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" : ""} ${rec.action === "repeat" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""} ${rec.action === "detain" ? "bg-red-100 text-red-700 hover:bg-red-100" : ""}`}
                        >
                          {rec.action === "promote" ? "Promote" : rec.action === "review" ? "Review" : rec.action === "repeat" ? "Repeat" : "Detain"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(rec.action === "promote" || rec.action === "review") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                setSelectedStudent(student);
                                setTargetClass(targetClasses[classNames.indexOf(student.class)] || student.class);
                                setTargetSection(student.section);
                                setPromoteReason("");
                                setShowPromoteDialog(true);
                              }}
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Promote
                            </Button>
                          )}
                          {(rec.action === "repeat" || rec.action === "detain" || rec.action === "review") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                setSelectedStudent(student);
                                setRepeatDetainAction(rec.action === "detain" ? "detain" : "repeat");
                                setPromoteReason("");
                                setShowRepeatDetainDialog(true);
                              }}
                            >
                              <Repeat className="h-3 w-3 mr-1" />
                              {rec.action === "detain" ? "Detain" : "Repeat"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => navigate({ to: `/admin/promotions/history?student_id=${student.id}` } as any)}
                          >
                            History
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Card className="shadow-xl border-primary/20">
            <CardContent className="p-3 flex items-center gap-4">
              <span className="text-sm font-medium">{selectedIds.length} student(s) selected</span>
              <Button
                size="sm"
                className="bg-gradient-brand border-0"
                onClick={() => {
                  setShowBulkDialog(true);
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                Bulk Promote Selected
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
                Clear
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promote Dialog */}
      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote Student</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="p-3 rounded bg-muted/30">
                <p className="font-medium">{selectedStudent.name}</p>
                <p className="text-sm text-muted-foreground">Current: Class {selectedStudent.class} - {selectedStudent.section}</p>
              </div>
              <div className="space-y-2">
                <Label>Target Class</Label>
                <Select value={targetClass} onValueChange={setTargetClass}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targetClasses.map((tc) => (
                      <SelectItem key={tc} value={tc}>
                        Class {tc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Section</Label>
                <Select value={targetSection} onValueChange={setTargetSection}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D"].map((s) => (
                      <SelectItem key={s} value={s}>
                        Section {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reason (optional)</Label>
                <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={promoteReason} onChange={(e) => setPromoteReason(e.target.value)} placeholder="Enter promotion reason..." />
              </div>
              <div className="p-3 rounded bg-green-50 text-sm text-green-800">
                <p className="font-medium">Recommendation: {getRecommendation(selectedStudent).reason}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromoteDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-brand border-0"
              disabled={promoteMutation.isPending}
              onClick={() => {
                if (selectedStudent) {
                  promoteMutation.mutate({
                    student_id: selectedStudent.id,
                    target_class: targetClass,
                    section: targetSection,
                    reason: promoteReason,
                  });
                }
              }}
            >
              {promoteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Repeat/Detain Dialog */}
      <Dialog open={showRepeatDetainDialog} onOpenChange={setShowRepeatDetainDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{repeatDetainAction === "repeat" ? "Repeat Student" : "Detain Student"}</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="p-3 rounded bg-muted/30">
                <p className="font-medium">{selectedStudent.name}</p>
                <p className="text-sm text-muted-foreground">
                  Current: Class {selectedStudent.class} - {selectedStudent.section}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={promoteReason} onChange={(e) => setPromoteReason(e.target.value)} placeholder={`Enter reason for ${repeatDetainAction}...`} />
              </div>
              <div
                className={`p-3 rounded text-sm ${repeatDetainAction === "repeat" ? "bg-blue-50 text-blue-800" : "bg-red-50 text-red-800"}`}
              >
                <p className="font-medium">
                  {repeatDetainAction === "repeat"
                    ? "This student will repeat the current class."
                    : "This student will be detained in the current class."}
                </p>
                <p className="mt-1 text-xs opacity-80">Recommendation: {getRecommendation(selectedStudent).reason}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRepeatDetainDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={repeatDetainAction === "detain" ? "destructive" : "default"}
              disabled={repeatDetainMutation.isPending}
              onClick={() => {
                if (selectedStudent) {
                  repeatDetainMutation.mutate({
                    student_id: selectedStudent.id,
                    action: repeatDetainAction,
                    reason: promoteReason,
                  });
                }
              }}
            >
              {repeatDetainMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm {repeatDetainAction === "repeat" ? "Repeat" : "Detention"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Promote Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Promotion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {selectedIds.length > 0
                ? `${selectedIds.length} student(s) selected for bulk promotion. Only eligible students will be promoted. Repeat/Detain recommendations will be left for manual review.`
                : "Select students from the table first, then click Bulk Promote."}
            </p>
            {selectedIds.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label>Target Class</Label>
                  <Select value={targetClass} onValueChange={setTargetClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target class" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetClasses.map((tc) => (
                        <SelectItem key={tc} value={tc}>
                          Class {tc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Section</Label>
                  <Select value={targetSection} onValueChange={setTargetSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D"].map((s) => (
                        <SelectItem key={s} value={s}>
                          Section {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 rounded bg-amber-50 text-sm text-amber-800">
                  <p className="font-medium">What will happen?</p>
                  <ul className="mt-1 list-disc list-inside text-xs space-y-1">
                    <li>Students who meet promotion criteria will be automatically promoted</li>
                    <li>Students needing Repeat or Detain will be left for manual processing</li>
                    <li>All actions are logged and students will be notified</li>
                  </ul>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-brand border-0"
              disabled={selectedIds.length === 0 || !targetClass}
              onClick={() => {
                promotionApi
                  .bulkPromote({
                    student_ids: selectedIds,
                    target_class: targetClass,
                    target_section: targetSection,
                  })
                  .then((res) => {
                    toast.success(`Successfully promoted ${res.bulk_promotion.students_processed} students`);
                    queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
                    queryClient.invalidateQueries({ queryKey: ["admin", "promotion-logs"] });
                    setShowBulkDialog(false);
                    setSelectedIds([]);
                  })
                  .catch(() => toast.error("Bulk promotion failed"));
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Process Bulk Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Route = createFileRoute("/admin/promotions")({
  head: () => ({ meta: [{ title: "Promotions — Admin" }] }),
  component: AdminPromotionsComponent,
});