import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DollarSign, TrendingUp, AlertCircle, Wallet, CheckCircle2, XCircle, RotateCcw, Plus, Pencil, Trash2, Copy, Eye, Download, Ban, History, CalendarDays, Receipt, Search, CreditCard, Landmark, Banknote, Bell, Gauge, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { toast } from "sonner";
import { ExportDialog } from "@/components/export";
import { feeExportConfig } from "@/components/export/moduleConfigs";
import { feeApi } from "@/services/adminApi";

const COLORS = ["oklch(0.48 0.18 265)", "oklch(0.65 0.13 230)", "oklch(0.7 0.17 50)", "oklch(0.62 0.16 155)", "oklch(0.55 0.15 340)", "oklch(0.5 0.1 200)"];

const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

interface FeeStructure {
  id: number; class_name: string; academic_session: string; late_fine_per_day: string; gst_enabled: boolean; is_active: boolean; components: FeeComponent[];
}
interface FeeComponent { id: number; name: string; amount: string; frequency: string; is_optional: boolean; is_active: boolean; }
interface FeePayment {
  id: number; student_name: string; class_name: string; section: string; admission_number: string;
  month: string; total_fee: string; paid_amount: string; fine: string; gst: string; status: string;
  payment_method: string | null; transaction_ref: string | null; receipt_number: string | null;
  advance_payment: string; refund_status: string; paid_at: string | null; correction_status: string;
  fee_component: string | null; paid_at_fine: string;
}
interface Scholarship { id: number; student_name: string; class_name: string; type: string; value: string; reason: string; is_active: boolean; }
interface AnalyticsData { summary: { total_collection: string; pending_fees: string; monthly_collection: string }; monthly: { month: string; collection: string; pending: string }[]; class_wise: { class_name: string; collection: string; pending: string; total: string }[]; }
interface ActivityLog { id: number; action: string; admin_name: string; student_name: string | null; amount: string; created_at: string; }

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-success text-success-foreground" },
  not_paid: { label: "Not Paid", cls: "bg-muted text-muted-foreground" },
  not_due: { label: "Not Due", cls: "bg-secondary text-secondary-foreground" },
  overdue: { label: "Overdue", cls: "bg-destructive text-destructive-foreground" },
  pending_verification: { label: "Pending", cls: "bg-warning text-warning-foreground" },
  rejected: { label: "Rejected", cls: "bg-destructive text-destructive-foreground" },
};

function statusBadge(status: string) {
  const s = STATUS_MAP[status] || { label: status, cls: "" };
  return <Badge className={s.cls}>{s.label}</Badge>;
}

function AdminFeesComponent() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showExport, setShowExport] = useState(false);

  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [showCreateStructure, setShowCreateStructure] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [structureForm, setStructureForm] = useState<{ className: string; lateFinePerDay: number; gstEnabled: boolean; components: Omit<FeeComponent, "id">[] }>({ className: "", lateFinePerDay: 50, gstEnabled: false, components: [] });

  const [feeClassFilter, setFeeClassFilter] = useState("all_classes");
  const [feeMonthFilter, setFeeMonthFilter] = useState("all_months");
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>("all");

  const [showScholarshipDialog, setShowScholarshipDialog] = useState(false);
  const [scholarshipForm, setScholarshipForm] = useState<{ studentId: string; studentName: string; className: string; type: "percentage" | "fixed"; value: number; reason: string }>({ studentId: "", studentName: "", className: "", type: "percentage", value: 0, reason: "" });

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState<{ payment_id: number; student_name: string; total_fee: number; fine: number; method: string; transaction_ref: string }>({ payment_id: 0, student_name: "", total_fee: 0, fine: 0, method: "CASH", transaction_ref: "" });

  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [correctionForm, setCorrectionForm] = useState<{ payment_id: number; type: "correction" | "refund"; reason: string }>({ payment_id: 0, type: "correction", reason: "" });

  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generateForm, setGenerateForm] = useState<{ class_name: string; academic_session: string }>({ class_name: "", academic_session: "2026-27" });

  const [showClearanceDialog, setShowClearanceDialog] = useState(false);
  const [clearanceForm, setClearanceForm] = useState<{ student_id: number; student_name: string; deadline: string }>({ student_id: 0, student_name: "", deadline: "" });

  const f = async () => {
    setLoading(true);
    try {
      const [s, p, sch, logs, an] = await Promise.all([
        feeApi.structures.list().catch(() => []),
        feeApi.payments.list().catch(() => []),
        feeApi.scholarships.list().catch(() => []),
        feeApi.activityLog().catch(() => []),
        feeApi.analytics().catch(() => ({ summary: { total_collection: "0", pending_fees: "0", monthly_collection: "0" }, monthly: [], class_wise: [] })),
      ]);
      setStructures(s as FeeStructure[]);
      setPayments(p as FeePayment[]);
      setScholarships(sch as Scholarship[]);
      setActivityLog(logs as ActivityLog[]);
      setAnalytics(an as AnalyticsData);
    } catch { toast.error("Failed to load fee data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { f(); }, []);

  const filteredPayments = useMemo(() => {
    let list = payments;
    if (feeClassFilter && feeClassFilter !== "all_classes") list = list.filter(p => p.class_name === feeClassFilter);
    if (feeMonthFilter && feeMonthFilter !== "all_months") list = list.filter(p => p.month === feeMonthFilter);
    if (feeStatusFilter !== "all") list = list.filter(p => p.status === feeStatusFilter);
    return list;
  }, [payments, feeClassFilter, feeMonthFilter, feeStatusFilter]);

  const statsSummary = useMemo(() => {
    const totalCollection = parseFloat(analytics?.summary.total_collection || "0");
    const pendingFees = parseFloat(analytics?.summary.pending_fees || "0");
    const monthlyCollection = parseFloat(analytics?.summary.monthly_collection || "0");
    return { totalCollection, pendingFees, monthlyCollection };
  }, [analytics]);

  const revenueMixData = useMemo(() => {
    const totals: Record<string, number> = {};
    payments.filter(p => p.status === "paid").forEach(p => {
      const key = `${p.class_name} - ${p.month || 'One-Time'}`;
      totals[key] = (totals[key] || 0) + Number(p.paid_amount);
    });
    return Object.entries(totals).slice(0, 10).map(([name, value]) => ({ name, value }));
  }, [payments]);

  async function handleCreateStructure() {
    if (!structureForm.className) { toast.error("Select a class"); return; }
    if (structureForm.components.length === 0) { toast.error("Add at least one fee component"); return; }
    try {
      if (editingStructure) {
        await feeApi.structures.update(editingStructure.id, {
          class_name: structureForm.className,
          late_fine_per_day: structureForm.lateFinePerDay,
          gst_enabled: structureForm.gstEnabled,
          components: structureForm.components.map(c => ({ name: c.name, amount: c.amount, frequency: c.frequency, is_optional: c.is_optional })),
        });
        toast.success("Structure updated");
      } else {
        await feeApi.structures.create({
          class_name: structureForm.className,
          late_fine_per_day: structureForm.lateFinePerDay,
          gst_enabled: structureForm.gstEnabled,
          components: structureForm.components.map(c => ({ name: c.name, amount: c.amount, frequency: c.frequency, is_optional: c.is_optional })),
        });
        toast.success("Fee structure created. Now generate fees from the Generate tab.");
      }
      setShowCreateStructure(false);
      setEditingStructure(null);
      setStructureForm({ className: "", lateFinePerDay: 50, gstEnabled: false, components: [] });
      f();
    } catch { toast.error("Failed to save structure"); }
  }

  async function handleDuplicateStructure(fromClass: string) {
    const toClass = prompt(`Duplicate ${fromClass} structure to which class?`);
    if (!toClass) return;
    try { await feeApi.structures.duplicate(fromClass, toClass); toast.success(`Duplicated to Class ${toClass}`); f(); } catch { toast.error("Failed"); }
  }

  async function handleDeleteStructure(id: number) {
    if (!confirm("Delete this fee structure? This cannot be undone.")) return;
    try { await feeApi.structures.delete(id); toast.success("Structure deleted"); f(); } catch { toast.error("Failed"); }
  }

  async function handleGenerateFees() {
    if (!generateForm.class_name) { toast.error("Select a class"); return; }
    try {
      const result = await feeApi.generate(generateForm.class_name, generateForm.academic_session) as { created: number };
      toast.success(`Generated ${result.created} fee entries for Class ${generateForm.class_name}`);
      setShowGenerateDialog(false);
      f();
    } catch (e: any) {
      const err = typeof e === "object" && e?.message ? e.message : "Failed to generate fees";
      toast.error(err);
    }
  }

  async function handleRecordPayment() {
    if (!paymentForm.payment_id) return;
    try {
      await feeApi.payments.record({
        payment_id: paymentForm.payment_id,
        payment_method: paymentForm.method,
        transaction_ref: paymentForm.transaction_ref || undefined,
      });
      toast.success(`Payment recorded via ${paymentForm.method}`);
      setShowPaymentDialog(false);
      f();
    } catch (e: any) {
      const err = typeof e === "object" && e?.message ? e.message : "Failed to record payment";
      toast.error(err);
    }
  }

  async function handleCorrectionOrRefund() {
    if (!correctionForm.reason) { toast.error("Enter a reason"); return; }
    try {
      if (correctionForm.type === "correction") {
        await feeApi.payments.requestCorrection(correctionForm.payment_id, correctionForm.reason);
        toast.success("Correction requested. Director must approve.");
      } else {
        await feeApi.payments.requestRefund(correctionForm.payment_id, correctionForm.reason);
        toast.success("Refund requested. Director must approve.");
      }
      setShowCorrectionDialog(false);
      f();
    } catch (e: any) {
      const err = typeof e === "object" && e?.message ? e.message : "Failed";
      toast.error(err);
    }
  }

  async function handleSetClearanceDeadline() {
    if (!clearanceForm.deadline) { toast.error("Select a deadline date"); return; }
    try {
      await feeApi.clearanceDeadline(clearanceForm.student_id, clearanceForm.deadline);
      toast.success(`Clearance deadline set to ${clearanceForm.deadline}`);
      setShowClearanceDialog(false);
      f();
    } catch { toast.error("Failed to set deadline"); }
  }

  async function handleApproveCorrection(id: number) {
    try { await feeApi.payments.approveCorrection(id); toast.success("Correction approved"); f(); } catch { toast.error("Failed"); }
  }
  async function handleApproveRefund(id: number) {
    try { await feeApi.payments.approveRefund(id); toast.success("Refund approved"); f(); } catch { toast.error("Failed"); }
  }

  function openPaymentDialog(p: FeePayment) {
    const fine = Number(p.fine) || 0;
    setPaymentForm({
      payment_id: p.id,
      student_name: p.student_name,
      total_fee: Number(p.total_fee),
      fine,
      method: "CASH",
      transaction_ref: "",
    });
    setShowPaymentDialog(true);
  }

  function openCorrectionDialog(p: FeePayment, type: "correction" | "refund") {
    setCorrectionForm({ payment_id: p.id, type, reason: "" });
    setShowCorrectionDialog(true);
  }

  function openClearanceDialog(p: FeePayment) {
    setClearanceForm({ student_id: 0, student_name: p.student_name, deadline: "" });
    setShowClearanceDialog(true);
  }

  function addComponentToForm() {
    setStructureForm(prev => ({
      ...prev,
      components: [...prev.components, { name: "", amount: 0, frequency: "monthly" as const, isOptional: false, is_active: true } as any],
    }));
  }

  function updateComponentInForm(index: number, field: string, value: unknown) {
    setStructureForm(prev => {
      const comps = [...prev.components];
      comps[index] = { ...comps[index], [field]: value } as any;
      return { ...prev, components: comps };
    });
  }

  function removeComponentFromForm(index: number) {
    setStructureForm(prev => ({
      ...prev, components: prev.components.filter((_, i) => i !== index),
    }));
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading fee data...</div>;
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* === OVERVIEW TAB === */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Finance Dashboard</h2>
            <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="h-4 w-4 mr-1" />Export Report</Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Collected" value={`₹${(statsSummary.totalCollection / 100000).toFixed(1)}L`} icon={DollarSign} accent="success" />
            <StatCard label="Pending Fees" value={`₹${statsSummary.pendingFees.toLocaleString()}`} icon={AlertCircle} accent="warning" />
            <StatCard label="Monthly Collection" value={`₹${statsSummary.monthlyCollection.toLocaleString()}`} icon={Wallet} accent="info" />
            <StatCard label="Total Structures" value={`${structures.length}`} icon={TrendingUp} accent="primary" />
          </div>
          {analytics?.monthly && analytics.monthly.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-4">
              <Card><CardHeader><CardTitle>Monthly Collection Trend</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={analytics.monthly}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" /><YAxis />
                      <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                      <Legend />
                      <Line type="monotone" dataKey="collection" stroke="oklch(0.48 0.18 265)" strokeWidth={3} name="Collection" dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="pending" stroke="oklch(0.7 0.17 50)" strokeWidth={2} name="Pending" strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card><CardHeader><CardTitle>Revenue Mix</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={revenueMixData.length > 0 ? revenueMixData : [{ name: "No Data", value: 1 }]} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                        {revenueMixData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
          {analytics?.class_wise && analytics.class_wise.length > 0 && (
            <Card><CardHeader><CardTitle>Class-wise Collection</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-x-auto">
                  <Table><TableHeader><TableRow><TableHead>Class</TableHead><TableHead className="text-right">Total Fee</TableHead><TableHead className="text-right">Collected</TableHead><TableHead className="text-right">Pending</TableHead><TableHead className="text-right">Collection %</TableHead></TableRow></TableHeader>
                    <TableBody>{analytics.class_wise.map(cw => (
                      <TableRow key={cw.class_name}>
                        <TableCell className="font-medium">Class {cw.class_name}</TableCell>
                        <TableCell className="text-right">₹{Number(cw.total).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-success">₹{Number(cw.collection).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-warning">₹{Number(cw.pending).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{Number(cw.total) > 0 ? ((Number(cw.collection) / Number(cw.total)) * 100).toFixed(1) : "0"}%</TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* === FEE STRUCTURES TAB === */}
        <TabsContent value="structures" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Fee Structures</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowGenerateDialog(true)}><Gauge className="h-4 w-4 mr-1" />Generate Fees</Button>
              <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowCreateStructure(true)}><Plus className="h-4 w-4 mr-1" />Create Structure</Button>
            </div>
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <Table><TableHeader><TableRow><TableHead>Class</TableHead><TableHead>Session</TableHead><TableHead>Components</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{structures.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No fee structures. Create one, then generate fees.</TableCell></TableRow>
              ) : structures.map(fs => (
                <TableRow key={fs.id}>
                  <TableCell className="font-medium">Class {fs.class_name}</TableCell>
                  <TableCell>{fs.academic_session}</TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{fs.components.map(c => <Badge key={c.id} variant="outline" className="text-xs">{c.name} (₹{Number(c.amount).toLocaleString()})</Badge>)}</div></TableCell>
                  <TableCell>{fs.is_active ? <Badge className="bg-success text-success-foreground">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleDuplicateStructure(fs.class_name)}><Copy className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingStructure(fs); setStructureForm({ className: fs.class_name, lateFinePerDay: Number(fs.late_fine_per_day), gstEnabled: fs.gst_enabled, components: fs.components.map(c => ({ name: c.name, amount: Number(c.amount), frequency: c.frequency, isOptional: c.is_optional, is_active: c.is_active } as any)) }); setShowCreateStructure(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteStructure(fs.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* === PAYMENTS TAB === */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={feeClassFilter} onValueChange={setFeeClassFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all_classes">All Classes</SelectItem>
                {[...new Set(payments.map(p => p.class_name))].filter(Boolean).map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={feeMonthFilter} onValueChange={setFeeMonthFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All Months" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all_months">All Months</SelectItem>
                {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={feeStatusFilter} onValueChange={setFeeStatusFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="not_paid">Not Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="not_due">Not Due</SelectItem>
                <SelectItem value="pending_verification">Pending Verification</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{filteredPayments.length} records</span>
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Component/Month</TableHead>
                  <TableHead className="text-right">Fee</TableHead><TableHead className="text-right">Fine</TableHead><TableHead className="text-right">Total Due</TableHead>
                  <TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{filteredPayments.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No matching payments</TableCell></TableRow>
              ) : filteredPayments.map(p => {
                const totalDue = Number(p.total_fee) + Number(p.fine);
                return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.student_name}</TableCell>
                  <TableCell>{p.class_name}-{p.section}</TableCell>
                  <TableCell>{p.fee_component || p.month || "General"}</TableCell>
                  <TableCell className="text-right">₹{Number(p.total_fee).toLocaleString()}</TableCell>
                  <TableCell className="text-right">{Number(p.fine) > 0 ? <span className="text-destructive">₹{Number(p.fine).toLocaleString()}</span> : "-"}</TableCell>
                  <TableCell className="text-right font-medium">₹{totalDue.toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{p.due_date ? new Date(p.due_date).toLocaleDateString("en-IN") : "-"}</TableCell>
                  <TableCell>{statusBadge(p.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {(p.status === "not_paid" || p.status === "overdue" || p.status === "not_due") && (
                        <Button size="sm" variant="ghost" className="text-success" onClick={() => openPaymentDialog(p)} title="Record Payment">
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      )}
                      {p.status === "pending_verification" && (
                        <><Button size="sm" variant="ghost" className="text-success" onClick={() => feeApi.payments.verify(p.id).then(f).catch(() => toast.error("Failed"))}><CheckCircle2 className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => feeApi.payments.reject(p.id).then(f).catch(() => toast.error("Failed"))}><XCircle className="h-4 w-4" /></Button></>
                      )}
                      {p.status === "paid" && (
                        <>
                          <Button size="sm" variant="ghost" className="text-warning" onClick={() => openCorrectionDialog(p, "correction")} title="Request Correction">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-warning" onClick={() => openCorrectionDialog(p, "refund")} title="Request Refund">
                            <Banknote className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {p.correction_status === "correction_requested" && (
                        <Button size="sm" variant="ghost" className="text-success" onClick={() => handleApproveCorrection(p.id)} title="Approve Correction">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      {p.refund_status === "initiated" && (
                        <Button size="sm" variant="ghost" className="text-success" onClick={() => handleApproveRefund(p.id)} title="Approve Refund">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      {p.receipt_number && (
                        <Button size="sm" variant="ghost" title="View Receipt" onClick={() => window.open(`/api/admin/fees/receipt/${p.id}/`, "_blank")}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-warning" onClick={() => openClearanceDialog(p)} title="Set Clearance Deadline">
                        <CalendarDays className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})}</TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* === SCHOLARSHIPS TAB === */}
        <TabsContent value="scholarships" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Scholarships & Concessions</h2>
            <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowScholarshipDialog(true)}><Plus className="h-4 w-4 mr-1" />Grant Scholarship</Button>
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Value</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{scholarships.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No scholarships granted</TableCell></TableRow>
              ) : scholarships.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.student_name}</TableCell>
                  <TableCell>Class {s.class_name}</TableCell>
                  <TableCell>{s.type === "percentage" ? `${s.value}%` : "Fixed"}</TableCell>
                  <TableCell className="text-right">{s.type === "percentage" ? `${s.value}%` : `₹${Number(s.value).toLocaleString()}`}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">{s.reason}</TableCell>
                  <TableCell>{s.is_active ? <Badge className="bg-success text-success-foreground">Active</Badge> : <Badge variant="secondary">Revoked</Badge>}</TableCell>
                  <TableCell>{s.is_active && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => feeApi.scholarships.revoke(s.id).then(f).catch(() => toast.error("Failed"))}><Ban className="h-4 w-4" /></Button>}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* === ACTIVITY LOG TAB === */}
        <TabsContent value="activity" className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><History className="h-5 w-5" /> Finance Activity Log</h2>
          <div className="rounded-lg border overflow-x-auto">
            <Table><TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Action</TableHead><TableHead>Admin</TableHead><TableHead>Student</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>{activityLog.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No activity recorded</TableCell></TableRow>
              ) : activityLog.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs">{new Date(log.created_at).toLocaleString()}</TableCell>
                  <TableCell>{log.action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</TableCell>
                  <TableCell>{log.admin_name}</TableCell>
                  <TableCell>{log.student_name || "-"}</TableCell>
                  <TableCell className="text-right">{Number(log.amount) > 0 ? `₹${Number(log.amount).toLocaleString()}` : "-"}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* CREATE/EDIT FEE STRUCTURE DIALOG */}
      <Dialog open={showCreateStructure} onOpenChange={o => { if (!o) { setShowCreateStructure(false); setEditingStructure(null); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingStructure ? "Edit" : "Create"} Fee Structure</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Class</Label>
                <Select value={structureForm.className} onValueChange={v => setStructureForm(prev => ({ ...prev, className: v }))} disabled={!!editingStructure}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{["9", "10", "11", "12"].map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Late Fine (per day)</Label><Input type="number" value={structureForm.lateFinePerDay} onChange={e => setStructureForm(prev => ({ ...prev, lateFinePerDay: Number(e.target.value) }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="gst" checked={structureForm.gstEnabled} onChange={e => setStructureForm(prev => ({ ...prev, gstEnabled: e.target.checked }))} className="rounded border-input" />
              <Label htmlFor="gst">Enable GST</Label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label className="font-semibold">Fee Components</Label><Button size="sm" variant="outline" onClick={addComponentToForm}><Plus className="h-3 w-3 mr-1" />Add</Button></div>
              {structureForm.components.map((comp, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground">Component {i + 1}</span><Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => removeComponentFromForm(i)}><Trash2 className="h-3 w-3" /></Button></div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="e.g. Tuition Fee" value={comp.name} onChange={e => updateComponentInForm(i, "name", e.target.value)} />
                    <Input type="number" placeholder="Amount" value={comp.amount || ""} onChange={e => updateComponentInForm(i, "amount", Number(e.target.value))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={comp.frequency} onValueChange={v => updateComponentInForm(i, "frequency", v)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="annual">Annual</SelectItem><SelectItem value="one-time">One-Time</SelectItem></SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                      <input type="checkbox" id={`opt_${i}`} checked={comp.isOptional} onChange={e => updateComponentInForm(i, "isOptional", e.target.checked)} className="rounded border-input" />
                      <Label htmlFor={`opt_${i}`} className="text-xs">Optional</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateStructure(false); setEditingStructure(null); }}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleCreateStructure}>{editingStructure ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FEE GENERATION DIALOG */}
      <Dialog open={showGenerateDialog} onOpenChange={o => { if (!o) setShowGenerateDialog(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate Fees for Class</DialogTitle>
          <DialogDescription>Creates fee entries for all students in the selected class based on the active fee structure.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Class</Label>
              <Select value={generateForm.class_name} onValueChange={v => setGenerateForm(prev => ({ ...prev, class_name: v }))}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{structures.map(s => <SelectItem key={s.class_name} value={s.class_name}>Class {s.class_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Academic Session</Label><Input value={generateForm.academic_session} onChange={e => setGenerateForm(prev => ({ ...prev, academic_session: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleGenerateFees}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PAYMENT RECORDING DIALOG */}
      <Dialog open={showPaymentDialog} onOpenChange={o => { if (!o) setShowPaymentDialog(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Record a payment received from the student.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span>Student</span><span className="font-medium">{paymentForm.student_name}</span></div>
              <div className="flex justify-between"><span>Base Fee</span><span>₹{paymentForm.total_fee.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Applicable Fine</span><span className="text-destructive">₹{paymentForm.fine.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Total to Collect</span><span>₹{(paymentForm.total_fee + paymentForm.fine).toLocaleString()}</span></div>
            </div>
            <div className="space-y-1"><Label>Payment Method</Label>
              <Select value={paymentForm.method} onValueChange={v => setPaymentForm(prev => ({ ...prev, method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH"><div className="flex items-center gap-2"><Banknote className="h-4 w-4" />Cash</div></SelectItem>
                  <SelectItem value="BANK"><div className="flex items-center gap-2"><Landmark className="h-4 w-4" />Bank Transfer</div></SelectItem>
                  <SelectItem value="UPI"><div className="flex items-center gap-2"><CreditCard className="h-4 w-4" />UPI</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentForm.method !== "CASH" && (
              <div className="space-y-1"><Label>Transaction Reference (UTR/UPI ID)</Label>
                <Input value={paymentForm.transaction_ref} onChange={e => setPaymentForm(prev => ({ ...prev, transaction_ref: e.target.value }))} placeholder="Enter reference number" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleRecordPayment} disabled={paymentForm.method !== "CASH" && !paymentForm.transaction_ref}>
              <CreditCard className="h-4 w-4 mr-1" />Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CORRECTION/REFUND DIALOG */}
      <Dialog open={showCorrectionDialog} onOpenChange={o => { if (!o) setShowCorrectionDialog(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{correctionForm.type === "correction" ? "Request Payment Correction" : "Request Refund"}</DialogTitle>
          <DialogDescription>This will be sent for Director approval. Original transaction will be preserved.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Reason for {correctionForm.type === "correction" ? "Correction" : "Refund"}</Label>
              <Textarea value={correctionForm.reason} onChange={e => setCorrectionForm(prev => ({ ...prev, reason: e.target.value }))} placeholder="Explain why this is needed" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCorrectionDialog(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleCorrectionOrRefund}>
              {correctionForm.type === "correction" ? "Request Correction" : "Request Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SCHOLARSHIP DIALOG */}
      <Dialog open={showScholarshipDialog} onOpenChange={o => { if (!o) setShowScholarshipDialog(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Grant Scholarship / Concession</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Student ID</Label><Input value={scholarshipForm.studentId} onChange={e => setScholarshipForm(prev => ({ ...prev, studentId: e.target.value }))} placeholder="Enter student ID" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Type</Label>
                <Select value={scholarshipForm.type} onValueChange={v => setScholarshipForm(prev => ({ ...prev, type: v as "percentage" | "fixed" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percentage">Percentage (%)</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Value</Label><Input type="number" value={scholarshipForm.value || ""} onChange={e => setScholarshipForm(prev => ({ ...prev, value: Number(e.target.value) }))} /></div>
            </div>
            <div className="space-y-1"><Label>Reason</Label><Input value={scholarshipForm.reason} onChange={e => setScholarshipForm(prev => ({ ...prev, reason: e.target.value }))} placeholder="e.g. Merit-based, Need-based" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScholarshipDialog(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={async () => {
              if (!scholarshipForm.studentName) { toast.error("Enter student name"); return; }
              try {
                await feeApi.scholarships.grant({
                  student_id: parseInt(scholarshipForm.studentId) || 0,
                  type: scholarshipForm.type,
                  value: scholarshipForm.value,
                  reason: scholarshipForm.reason,
                });
                toast.success("Scholarship granted");
                setShowScholarshipDialog(false);
                setScholarshipForm({ studentId: "", studentName: "", className: "", type: "percentage", value: 0, reason: "" });
                f();
              } catch { toast.error("Failed"); }
            }}>Grant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportDialog open={showExport} onOpenChange={setShowExport} config={feeExportConfig} />
    </>
  );
}

export const Route = createFileRoute("/admin/fees")({
  head: () => ({ meta: [{ title: "Fees & Finance — Admin" }] }),
  component: AdminFeesComponent,
});
