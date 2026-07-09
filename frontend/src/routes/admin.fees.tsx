import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DollarSign, TrendingUp, AlertCircle, Wallet, CheckCircle2, XCircle, RotateCcw, Plus, Pencil, Trash2, Copy, Eye, Download, Ban, Clock, History, CalendarDays, Receipt, UserCheck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { toast } from "sonner";
import { ExportDialog } from "@/components/export";
import { feeExportConfig } from "@/components/export/moduleConfigs";
import {
  getFinanceSummary, getMonthlyCollectionData, getClassWiseCollection,
  getFeeStructures, getFeeStructureByClass, addFeeStructure, updateFeeStructure, deleteFeeStructure, duplicateFeeStructure,
  getAllFeePayments, getFeePaymentsByClass, getFeePaymentsByMonth,
  updatePaymentStatus, initiateRefund, completeRefund,
  getAdmissionFeeRecords, verifyAdmissionFee, rejectAdmissionFee,
  getTeacherSalaries, payTeacherSalary,
  getScholarships, addScholarship, revokeScholarship,
  getDueDateCalendar, getActivityLog,
  generateReceiptNumber,
  type FeeStructure, type FeeComponent, type FeePayment, type ScholarshipOrConcession, type PaymentStatus,
  type AdmissionFeeRecord, type TeacherSalary,
} from "@/lib/fee-store";

const COLORS = ["oklch(0.48 0.18 265)", "oklch(0.65 0.13 230)", "oklch(0.7 0.17 50)", "oklch(0.62 0.16 155)", "oklch(0.55 0.15 340)", "oklch(0.5 0.1 200)"];

const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

function statusBadge(status: PaymentStatus) {
  const map: Record<PaymentStatus, { label: string; cls: string }> = {
    paid: { label: "Paid", cls: "bg-success text-success-foreground" },
    not_paid: { label: "Not Paid", cls: "bg-muted text-muted-foreground" },
    pending_verification: { label: "Pending", cls: "bg-warning text-warning-foreground" },
    rejected: { label: "Rejected", cls: "bg-destructive text-destructive-foreground" },
  };
  const s = map[status];
  return <Badge className={s.cls}>{s.label}</Badge>;
}

function AdminFeesComponent() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showExport, setShowExport] = useState(false);

  // Fee Structure state
  const [showCreateStructure, setShowCreateStructure] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [structureForm, setStructureForm] = useState<{ className: string; lateFinePerDay: number; gstEnabled: boolean; components: Omit<FeeComponent, "id">[] }>({ className: "", lateFinePerDay: 50, gstEnabled: false, components: [] });

  // Fee payments filters
  const [feeClassFilter, setFeeClassFilter] = useState("");
  const [feeMonthFilter, setFeeMonthFilter] = useState("");
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>("all");

  // Verification dialog
  const [verifyDialog, setVerifyDialog] = useState<{ open: boolean; payment: FeePayment | null }>({ open: false, payment: null });

  // Refund dialog
  const [refundDialog, setRefundDialog] = useState<{ open: boolean; payment: FeePayment | null }>({ open: false, payment: null });

  // Admission fee verification
  const [admissionFeeVerify, setAdmissionFeeVerify] = useState<{ open: boolean; record: AdmissionFeeRecord | null }>({ open: false, record: null });

  // Scholarship
  const [showScholarshipDialog, setShowScholarshipDialog] = useState(false);
  const [scholarshipForm, setScholarshipForm] = useState<{ studentId: string; studentName: string; className: string; type: "percentage" | "fixed"; value: number; reason: string }>({ studentId: "", studentName: "", className: "", type: "percentage", value: 0, reason: "" });

  // Salary pay dialog
  const [salaryPayDialog, setSalaryPayDialog] = useState<{ open: boolean; salary: TeacherSalary | null }>({ open: false, salary: null });

  // data
  const summary = useMemo(() => getFinanceSummary(), []);
  const monthlyData = useMemo(() => getMonthlyCollectionData(), []);
  const classWiseData = useMemo(() => getClassWiseCollection(), []);
  const feeStructures = useMemo(() => getFeeStructures(), []);
  const allPayments = useMemo(() => getAllFeePayments(), []);
  const admissionFeeRecords = useMemo(() => getAdmissionFeeRecords(), []);
  const scholarships = useMemo(() => getScholarships(), []);
  const salaries = useMemo(() => getTeacherSalaries(), []);
  const calendar = useMemo(() => getDueDateCalendar(), []);
  const activityLog = useMemo(() => getActivityLog(), []);

  const filteredPayments = useMemo(() => {
    let list = allPayments;
    if (feeClassFilter) list = list.filter(p => p.className === feeClassFilter);
    if (feeMonthFilter) list = list.filter(p => p.month === feeMonthFilter);
    if (feeStatusFilter !== "all") list = list.filter(p => p.status === feeStatusFilter);
    return list;
  }, [allPayments, feeClassFilter, feeMonthFilter, feeStatusFilter]);

  const revenueMixData = useMemo(() => {
    const totals: Record<string, number> = {};
    allPayments.filter(p => p.status === "paid").forEach(p => {
      p.components.forEach(c => {
        totals[c.name] = (totals[c.name] || 0) + c.amount;
      });
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [allPayments]);

  function handleCreateStructure() {
    const className = structureForm.className;
    if (!className) { toast.error("Select a class"); return; }
    if (structureForm.components.length === 0) { toast.error("Add at least one fee component"); return; }
    const totalMonthly = structureForm.components.filter(c => c.frequency === "monthly").reduce((s, c) => s + c.amount, 0);
    const totalAnnual = totalMonthly * 12 + structureForm.components.filter(c => c.frequency === "annual").reduce((s, c) => s + c.amount, 0);
    const newFs: FeeStructure = {
      id: `fs_${Date.now()}`,
      className,
      academicSession: "2026-27",
      components: structureForm.components.map((c, i) => ({ ...c, id: `fc_${Date.now()}_${i}` })),
      totalMonthly,
      totalAnnual,
      lateFinePerDay: structureForm.lateFinePerDay,
      gstEnabled: structureForm.gstEnabled,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addFeeStructure(newFs);
    setShowCreateStructure(false);
    setStructureForm({ className: "", lateFinePerDay: 50, gstEnabled: false, components: [] });
    toast.success("Fee structure created");
  }

  function handleDuplicateStructure(fromClass: string) {
    const toClass = prompt(`Duplicate ${fromClass} structure to which class?`);
    if (!toClass) return;
    const result = duplicateFeeStructure(fromClass, toClass);
    if (result) toast.success(`Duplicated to Class ${toClass}`);
    else toast.error("Source structure not found");
  }

  function handleVerifyPayment(payment: FeePayment) {
    setVerifyDialog({ open: true, payment });
  }

  function confirmVerifyPayment() {
    if (!verifyDialog.payment) return;
    updatePaymentStatus(verifyDialog.payment.id, "paid", "Admin", generateReceiptNumber());
    setVerifyDialog({ open: false, payment: null });
    toast.success("Payment verified");
  }

  function handleRejectPayment(payment: FeePayment) {
    updatePaymentStatus(payment.id, "rejected", "Admin");
    toast.success("Payment rejected");
  }

  function handleInitiateRefund(payment: FeePayment) {
    initiateRefund(payment.id, "Admin");
    setRefundDialog({ open: false, payment: null });
    toast.success("Refund initiated");
  }

  function handleCompleteRefund(payment: FeePayment) {
    completeRefund(payment.id, "Admin");
    toast.success("Refund completed");
  }

  function handleVerifyAdmissionFee(record: AdmissionFeeRecord) {
    verifyAdmissionFee(record.id, "Admin");
    setAdmissionFeeVerify({ open: false, record: null });
    toast.success("Admission fee verified");
  }

  function handleRejectAdmissionFee(record: AdmissionFeeRecord) {
    rejectAdmissionFee(record.id, "Admin");
    toast.success("Admission fee rejected");
  }

  function handleAddScholarship() {
    if (!scholarshipForm.studentName) { toast.error("Enter student name"); return; }
    const newScholarship: ScholarshipOrConcession = {
      id: `sch_${Date.now()}`,
      studentId: scholarshipForm.studentId,
      studentName: scholarshipForm.studentName,
      className: scholarshipForm.className,
      type: scholarshipForm.type,
      value: scholarshipForm.value,
      reason: scholarshipForm.reason,
      approvedBy: "Admin",
      approvedAt: new Date().toISOString(),
      isActive: true,
      history: [{ action: "Granted", timestamp: new Date().toISOString(), admin: "Admin" }],
    };
    addScholarship(newScholarship);
    setShowScholarshipDialog(false);
    setScholarshipForm({ studentId: "", studentName: "", className: "", type: "percentage", value: 0, reason: "" });
    toast.success("Scholarship granted");
  }

  function handlePaySalary(salary: TeacherSalary) {
    payTeacherSalary(salary.id);
    setSalaryPayDialog({ open: false, salary: null });
    toast.success("Salary paid");
  }

  function addComponentToForm() {
    setStructureForm(prev => ({
      ...prev,
      components: [...prev.components, { name: "", amount: 0, frequency: "monthly" as const, isOptional: false, isActive: true }],
    }));
  }

  function updateComponentInForm(index: number, field: string, value: unknown) {
    setStructureForm(prev => {
      const comps = [...prev.components];
      comps[index] = { ...comps[index], [field]: value } as FeeComponent;
      return { ...prev, components: comps };
    });
  }

  function removeComponentFromForm(index: number) {
    setStructureForm(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }));
  }

  const feeStructureChart = useMemo(() => {
    return feeStructures.map(fs => ({
      name: `Class ${fs.className}`,
      monthly: fs.totalMonthly,
      annual: fs.totalAnnual,
    }));
  }, [feeStructures]);

  return (
    <>
      {activeTab !== "overview" && (
        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="h-4 w-4 mr-1" />Export</Button>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="admission">Admission Fees</TabsTrigger>
          <TabsTrigger value="salary">Salaries</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* === OVERVIEW TAB === */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Finance Dashboard</h2>
            <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="h-4 w-4 mr-1" />Export Report</Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Collected" value={`₹${(summary.totalCollection / 100000).toFixed(1)}L`} icon={DollarSign} trend={`${((summary.monthlyCollection / (summary.totalCollection || 1)) * 100).toFixed(1)}% this month`} trendUp accent="success" />
            <StatCard label="Pending Fees" value={`₹${summary.pendingFees.toLocaleString()}`} icon={AlertCircle} accent="warning" />
            <StatCard label="Salaries Paid" value={`₹${(summary.salaryPaid / 100000).toFixed(1)}L`} icon={Wallet} accent="info" />
            <StatCard label="Net Surplus" value={`₹${(summary.netSurplus / 100000).toFixed(1)}L`} icon={TrendingUp} trend={summary.netSurplus > 0 ? "Positive" : "Negative"} trendUp={summary.netSurplus > 0} accent="primary" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Monthly Collection Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="collection" stroke="oklch(0.48 0.18 265)" strokeWidth={3} name="Collection" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="pending" stroke="oklch(0.7 0.17 50)" strokeWidth={2} name="Pending" strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Revenue Mix</CardTitle></CardHeader>
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

          <Card>
            <CardHeader><CardTitle>Class-wise Collection</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-right">Total Fee</TableHead>
                      <TableHead className="text-right">Collected</TableHead>
                      <TableHead className="text-right">Pending</TableHead>
                      <TableHead className="text-right">Collection %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classWiseData.map(cw => (
                      <TableRow key={cw.className}>
                        <TableCell className="font-medium">Class {cw.className}</TableCell>
                        <TableCell className="text-right">₹{cw.total.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-success">₹{cw.collection.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-warning">₹{cw.pending.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{cw.total > 0 ? ((cw.collection / cw.total) * 100).toFixed(1) : "0"}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Fee Structure Comparison</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={feeStructureChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="monthly" stroke="oklch(0.48 0.18 265)" strokeWidth={3} name="Monthly" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="annual" stroke="oklch(0.65 0.13 230)" strokeWidth={3} name="Annual" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === FEE STRUCTURES TAB === */}
        <TabsContent value="structures" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Fee Structures</h2>
            <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowCreateStructure(true)}><Plus className="h-4 w-4 mr-1" />Create Structure</Button>
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="text-right">Annual</TableHead>
                  <TableHead className="text-right">Fine/Day</TableHead>
                  <TableHead>Components</TableHead>
                  <TableHead>GST</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeStructures.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No fee structures. Create one.</TableCell></TableRow>
                ) : feeStructures.map(fs => (
                  <TableRow key={fs.id}>
                    <TableCell className="font-medium">Class {fs.className}</TableCell>
                    <TableCell>{fs.academicSession}</TableCell>
                    <TableCell className="text-right">₹{fs.totalMonthly.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{fs.totalAnnual.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{fs.lateFinePerDay}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {fs.components.map(c => <Badge key={c.id} variant="outline" className="text-xs">{c.name}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>{fs.gstEnabled ? <Badge className="bg-success text-success-foreground">Enabled</Badge> : <Badge variant="outline">Off</Badge>}</TableCell>
                    <TableCell>{fs.isActive ? <Badge className="bg-success text-success-foreground">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleDuplicateStructure(fs.className)}><Copy className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingStructure(fs); setStructureForm({ className: fs.className, lateFinePerDay: fs.lateFinePerDay, gstEnabled: fs.gstEnabled, components: fs.components.map(c => ({ name: c.name, amount: c.amount, frequency: c.frequency, isOptional: c.isOptional, isActive: c.isActive })) }); setShowCreateStructure(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { deleteFeeStructure(fs.id); toast.success("Structure deleted"); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* === PAYMENTS TAB === */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={feeClassFilter} onValueChange={setFeeClassFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {["9", "10", "11", "12"].map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={feeMonthFilter} onValueChange={setFeeMonthFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All Months" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Months</SelectItem>
                {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={feeStatusFilter} onValueChange={setFeeStatusFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="not_paid">Not Paid</SelectItem>
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
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Total Fee</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Fine</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Refund</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No matching payments</TableCell></TableRow>
                ) : filteredPayments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.studentName}</TableCell>
                    <TableCell>{p.className}-{p.section}</TableCell>
                    <TableCell>{p.month}</TableCell>
                    <TableCell className="text-right">₹{p.totalFee.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{p.paidAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-warning">₹{p.pendingAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{p.fine > 0 ? <span className="text-destructive">₹{p.fine.toLocaleString()}</span> : "-"}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                    <TableCell>
                      {p.refundStatus === "initiated" ? <Badge className="bg-warning text-warning-foreground">Initiated</Badge> :
                       p.refundStatus === "completed" ? <Badge className="bg-success text-success-foreground">Completed</Badge> :
                       <span className="text-xs text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {p.status === "pending_verification" && (
                          <>
                            <Button size="sm" variant="ghost" className="text-success" onClick={() => handleVerifyPayment(p)}><CheckCircle2 className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRejectPayment(p)}><XCircle className="h-4 w-4" /></Button>
                          </>
                        )}
                        {p.status === "paid" && p.refundStatus === "none" && p.advancePayment > 0 && (
                          <Button size="sm" variant="ghost" className="text-warning" onClick={() => setRefundDialog({ open: true, payment: p })}><RotateCcw className="h-4 w-4" /></Button>
                        )}
                        {p.refundStatus === "initiated" && (
                          <Button size="sm" variant="ghost" className="text-success" onClick={() => handleCompleteRefund(p)}><CheckCircle2 className="h-4 w-4" /></Button>
                        )}
                        {p.receiptNumber && <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* === ADMISSION FEES TAB === */}
        <TabsContent value="admission" className="space-y-4">
          <h2 className="text-lg font-semibold">Admission Fee Records</h2>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admissionFeeRecords.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No records</TableCell></TableRow>
                ) : admissionFeeRecords.map(rec => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">{rec.studentName}</TableCell>
                    <TableCell>{rec.admissionNumber}</TableCell>
                    <TableCell>{rec.className}</TableCell>
                    <TableCell className="text-right">₹{rec.admissionFee.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{rec.amountPaid.toLocaleString()}</TableCell>
                    <TableCell>{rec.paymentMethod ? (rec.paymentMethod === "bank_transfer" ? "Bank Transfer" : rec.paymentMethod === "cash" ? "Cash" : "Online") : "-"}</TableCell>
                    <TableCell>
                      {rec.verificationStatus === "paid" ? <Badge className="bg-success text-success-foreground">Paid</Badge> :
                       rec.verificationStatus === "pending_verification" ? <Badge className="bg-warning text-warning-foreground">Pending</Badge> :
                       <Badge variant="secondary">Not Paid</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {rec.verificationStatus === "pending_verification" && (
                          <>
                            <Button size="sm" variant="ghost" className="text-success" onClick={() => handleVerifyAdmissionFee(rec)}><CheckCircle2 className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRejectAdmissionFee(rec)}><XCircle className="h-4 w-4" /></Button>
                          </>
                        )}
                        {rec.receiptNumber && <Button size="sm" variant="ghost"><Receipt className="h-4 w-4" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* === SALARY TAB === */}
        <TabsContent value="salary" className="space-y-4">
          <h2 className="text-lg font-semibold">Teacher Salaries</h2>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Basic</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaries.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No salary records</TableCell></TableRow>
                ) : salaries.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.teacherName}</TableCell>
                    <TableCell>{s.employeeId}</TableCell>
                    <TableCell>{s.position}</TableCell>
                    <TableCell>{s.month}</TableCell>
                    <TableCell className="text-right">₹{s.basicSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{s.totalSalary.toLocaleString()}</TableCell>
                    <TableCell>{s.isPaid ? <Badge className="bg-success text-success-foreground">Paid</Badge> : <Badge variant="secondary">Unpaid</Badge>}</TableCell>
                    <TableCell>
                      {!s.isPaid && (
                        <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setSalaryPayDialog({ open: true, salary: s })}>
                          <Wallet className="h-4 w-4 mr-1" />Pay
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scholarships.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No scholarships granted</TableCell></TableRow>
                ) : scholarships.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.studentName}</TableCell>
                    <TableCell>Class {s.className}</TableCell>
                    <TableCell>{s.type === "percentage" ? `${s.value}%` : "Fixed"}</TableCell>
                    <TableCell className="text-right">{s.type === "percentage" ? `${s.value}%` : `₹${s.value.toLocaleString()}`}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{s.reason}</TableCell>
                    <TableCell>{s.isActive ? <Badge className="bg-success text-success-foreground">Active</Badge> : <Badge variant="secondary">Revoked</Badge>}</TableCell>
                    <TableCell>
                      {s.isActive && (
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { revokeScholarship(s.id); toast.success("Scholarship revoked"); }}>
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* === CALENDAR TAB === */}
        <TabsContent value="calendar" className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Due Date Calendar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {calendar.map(c => (
              <Card key={c.className}>
                <CardHeader className="pb-2"><CardTitle className="text-base">Class {c.className}</CardTitle><CardDescription>Due: {c.dueDate}</CardDescription></CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Month</span><span className="font-medium">{c.month}</span></div>
                    <div className="flex justify-between"><span>Total Students</span><span className="font-medium">{c.totalStudents}</span></div>
                    <div className="flex justify-between"><span>Paid</span><span className="font-medium text-success">{c.paidCount}</span></div>
                    <div className="flex justify-between"><span>Pending</span><span className="font-medium text-warning">{c.pendingCount}</span></div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: `${c.totalStudents > 0 ? (c.paidCount / c.totalStudents) * 100 : 0}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* === ACTIVITY LOG TAB === */}
        <TabsContent value="activity" className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><History className="h-5 w-5" /> Finance Activity Log</h2>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLog.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No activity recorded</TableCell></TableRow>
                ) : activityLog.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.admin}</TableCell>
                    <TableCell>{log.student || "-"}</TableCell>
                    <TableCell className="text-right">{log.amount > 0 ? `₹${log.amount.toLocaleString()}` : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* === CREATE/EDIT FEE STRUCTURE DIALOG === */}
      <Dialog open={showCreateStructure} onOpenChange={o => { if (!o) { setShowCreateStructure(false); setEditingStructure(null); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingStructure ? "Edit" : "Create"} Fee Structure</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Class</Label>
                <Select value={structureForm.className} onValueChange={v => setStructureForm(prev => ({ ...prev, className: v }))} disabled={!!editingStructure}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {["9", "10", "11", "12"].map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Late Fine (per day)</Label>
                <Input type="number" value={structureForm.lateFinePerDay} onChange={e => setStructureForm(prev => ({ ...prev, lateFinePerDay: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="gst" checked={structureForm.gstEnabled} onChange={e => setStructureForm(prev => ({ ...prev, gstEnabled: e.target.checked }))} className="rounded border-input" />
                <Label htmlFor="gst">Enable GST</Label>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Fee Components</Label>
                <Button size="sm" variant="outline" onClick={addComponentToForm}><Plus className="h-3 w-3 mr-1" />Add</Button>
              </div>
              {structureForm.components.map((comp, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Component {i + 1}</span>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => removeComponentFromForm(i)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Name (e.g. Tuition Fee)" value={comp.name} onChange={e => updateComponentInForm(i, "name", e.target.value)} />
                    <Input type="number" placeholder="Amount" value={comp.amount || ""} onChange={e => updateComponentInForm(i, "amount", Number(e.target.value))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={comp.frequency} onValueChange={v => updateComponentInForm(i, "frequency", v)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="one-time">One-Time</SelectItem>
                      </SelectContent>
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
            <Button className="bg-gradient-brand border-0" onClick={handleCreateStructure}>
              {editingStructure ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === VERIFY PAYMENT DIALOG === */}
      <Dialog open={verifyDialog.open} onOpenChange={o => { if (!o) setVerifyDialog({ open: false, payment: null }); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Verify Payment</DialogTitle></DialogHeader>
          {verifyDialog.payment && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Student</span><span className="font-medium">{verifyDialog.payment.studentName}</span></div>
              <div className="flex justify-between"><span>Month</span><span className="font-medium">{verifyDialog.payment.month}</span></div>
              <div className="flex justify-between"><span>Amount Paid</span><span className="font-medium">₹{verifyDialog.payment.paidAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Method</span><span className="font-medium">{verifyDialog.payment.paymentMethod === "bank_transfer" ? "Bank Transfer" : "Cash"}</span></div>
              {verifyDialog.payment.transactionRef && <div className="flex justify-between"><span>Transaction Ref</span><span className="font-medium">{verifyDialog.payment.transactionRef}</span></div>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialog({ open: false, payment: null })}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={confirmVerifyPayment}><CheckCircle2 className="h-4 w-4 mr-1" />Confirm & Verify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === REFUND DIALOG === */}
      <Dialog open={refundDialog.open} onOpenChange={o => { if (!o) setRefundDialog({ open: false, payment: null }); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Initiate Refund</DialogTitle></DialogHeader>
          {refundDialog.payment && (
            <div className="space-y-2 text-sm">
              <p>This will initiate a refund of <strong>₹{refundDialog.payment.advancePayment.toLocaleString()}</strong> advance payment for {refundDialog.payment.studentName}.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialog({ open: false, payment: null })}>Cancel</Button>
            <Button className="bg-warning text-warning-foreground border-0" onClick={() => refundDialog.payment && handleInitiateRefund(refundDialog.payment)}>Initiate Refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === SCHOLARSHIP DIALOG === */}
      <Dialog open={showScholarshipDialog} onOpenChange={o => { if (!o) setShowScholarshipDialog(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Grant Scholarship / Concession</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Student Name</Label>
              <Input value={scholarshipForm.studentName} onChange={e => setScholarshipForm(prev => ({ ...prev, studentName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Student ID</Label>
                <Input value={scholarshipForm.studentId} onChange={e => setScholarshipForm(prev => ({ ...prev, studentId: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Class</Label>
                <Select value={scholarshipForm.className} onValueChange={v => setScholarshipForm(prev => ({ ...prev, className: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["9", "10", "11", "12"].map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={scholarshipForm.type} onValueChange={v => setScholarshipForm(prev => ({ ...prev, type: v as "percentage" | "fixed" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Value</Label>
                <Input type="number" value={scholarshipForm.value || ""} onChange={e => setScholarshipForm(prev => ({ ...prev, value: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Reason</Label>
              <Input value={scholarshipForm.reason} onChange={e => setScholarshipForm(prev => ({ ...prev, reason: e.target.value }))} placeholder="e.g. Merit-based, Need-based" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScholarshipDialog(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleAddScholarship}>Grant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === PAY SALARY DIALOG === */}
      <Dialog open={salaryPayDialog.open} onOpenChange={o => { if (!o) setSalaryPayDialog({ open: false, salary: null }); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pay Salary</DialogTitle></DialogHeader>
          {salaryPayDialog.salary && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Teacher</span><span className="font-medium">{salaryPayDialog.salary.teacherName}</span></div>
              <div className="flex justify-between"><span>Month</span><span className="font-medium">{salaryPayDialog.salary.month}</span></div>
              <div className="flex justify-between"><span>Basic Salary</span><span className="font-medium">₹{salaryPayDialog.salary.basicSalary.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Total</span><span className="font-bold">₹{salaryPayDialog.salary.totalSalary.toLocaleString()}</span></div>
              <p className="text-xs text-muted-foreground mt-2">Salary will be paid via bank transfer.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSalaryPayDialog({ open: false, salary: null })}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={() => salaryPayDialog.salary && handlePaySalary(salaryPayDialog.salary)}><Wallet className="h-4 w-4 mr-1" />Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === EXPORT DIALOG === */}
      <ExportDialog open={showExport} onOpenChange={setShowExport} config={feeExportConfig} />
    </>
  );
}

export const Route = createFileRoute("/admin/fees")({
  head: () => ({ meta: [{ title: "Fees & Finance — Admin" }] }),
  component: AdminFeesComponent,
});
