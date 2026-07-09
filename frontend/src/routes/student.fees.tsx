import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DollarSign, CheckCircle2, AlertCircle, Download, Receipt, Upload, Banknote, ScrollText, Landmark, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getStudentFeeLedger, getScholarships, getFeeStructureByClass, getPaymentById, recordOfflinePayment, generateReceiptNumber, type FeePayment, type PaymentMethod } from "@/lib/fee-store";
import { getPaymentProvider } from "@/lib/payment-provider";

const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: "Paid", cls: "bg-success text-success-foreground" },
    not_paid: { label: "Not Paid", cls: "bg-muted text-muted-foreground" },
    pending_verification: { label: "Pending", cls: "bg-warning text-warning-foreground" },
    rejected: { label: "Rejected", cls: "bg-destructive text-destructive-foreground" },
  };
  const s = map[status] || { label: status, cls: "" };
  return <Badge className={s.cls}>{s.label}</Badge>;
}

export const Route = createFileRoute("/student/fees")({
  head: () => ({ meta: [{ title: "Fees — Student" }] }),
  component: () => {
    const currentStudentId = "STU10_1";
    const currentStudentName = "Aarav Sharma";
    const currentClass = "10";

    const ledger = useMemo(() => getStudentFeeLedger(currentStudentId), []);
    const structure = useMemo(() => getFeeStructureByClass(currentClass), []);
    const scholarships = useMemo(() => getScholarships().filter(s => s.studentId === currentStudentId && s.isActive), []);

    const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; payment: FeePayment | null; method: PaymentMethod }>({ open: false, payment: null, method: "bank_transfer" });
    const [transactionRef, setTransactionRef] = useState("");

    const paymentProvider = getPaymentProvider();

    async function handleOnlinePayment(payment: FeePayment) {
      const result = await paymentProvider.processPayment({
        amount: payment.pendingAmount,
        studentId: currentStudentId,
        studentName: currentStudentName,
        month: payment.month,
        academicSession: "2026-27",
        description: `Fee payment for ${payment.month}`,
      });
      if (result.error) {
        toast.error(result.error, { duration: 5000 });
      }
    }

    function handleOfflinePayment(payment: FeePayment, method: PaymentMethod) {
      setPaymentDialog({ open: true, payment, method });
    }

    function submitOfflinePayment() {
      if (!paymentDialog.payment) return;
      recordOfflinePayment({
        studentId: currentStudentId,
        month: paymentDialog.payment.month,
        amount: paymentDialog.payment.pendingAmount,
        paymentMethod: paymentDialog.method,
        transactionRef: paymentDialog.method === "bank_transfer" ? transactionRef : undefined,
      });
      setPaymentDialog({ open: false, payment: null, method: "bank_transfer" });
      setTransactionRef("");
      toast.success("Payment submitted for verification");
    }

    function handleDownloadReceipt(payment: FeePayment) {
      toast.success(`Receipt ${payment.receiptNumber} downloaded`);
    }

    const activeMonths = MONTHS.slice(0, 4);
    const paymentSchedule = useMemo(() => {
      return activeMonths.map(month => {
        const existing = ledger.payments.find(p => p.month === month);
        if (existing) return existing;
        return {
          id: `pending_${month}`,
          studentId: currentStudentId,
          studentName: currentStudentName,
          className: currentClass,
          section: "A",
          admissionNumber: "ADM23001",
          month,
          academicSession: "2026-27",
          totalFee: structure?.totalMonthly || 0,
          paidAmount: 0,
          pendingAmount: structure?.totalMonthly || 0,
          fine: 0,
          gst: 0,
          scholarshipAmount: 0,
          dueDate: new Date(2026, MONTHS.indexOf(month) + 3, 10).toISOString().split("T")[0],
          status: "not_paid" as const,
          paymentMethod: null,
          transactionRef: null,
          paidAt: null,
          verifiedBy: null,
          verifiedAt: null,
          receiptNumber: null,
          components: structure?.components.filter(c => c.frequency === "monthly" && c.isActive).map(c => ({ name: c.name, amount: c.amount })) || [],
          advancePayment: 0,
          refundStatus: "none" as const,
          refundInitiatedAt: null,
          refundCompletedAt: null,
        };
      });
    }, [ledger, structure]);

    return (
      <PageWrapper>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StaggerItem><StatCard label="Total Paid" value={`₹${ledger.summary.paid.toLocaleString()}`} icon={CheckCircle2} accent="success" /></StaggerItem>
          <StaggerItem><StatCard label="Pending" value={`₹${ledger.summary.pending.toLocaleString()}`} icon={AlertCircle} accent="warning" /></StaggerItem>
          <StaggerItem><StatCard label="Annual Fee" value={`₹${structure?.totalAnnual.toLocaleString() || "0"}`} icon={DollarSign} accent="primary" /></StaggerItem>
        </StaggerContainer>

        {scholarships.length > 0 && (
          <Card className="mt-4 border-success/30 bg-success/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge className="bg-success text-success-foreground">Scholarship</Badge>
                {scholarships.map(s => (
                  <span key={s.id}>{s.studentName} — {s.type === "percentage" ? `${s.value}% concession` : `₹${s.value.toLocaleString()} concession`}{s.reason ? ` (${s.reason})` : ""}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!paymentProvider.isAvailable() && (
          <Card className="mt-4 border-warning/30 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-warning-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Online payment is not available. Please use Bank Transfer or Cash.</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5" /> Fee Ledger</CardTitle><CardDescription>Your monthly fee schedule and payment status</CardDescription></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentSchedule.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.month}</TableCell>
                    <TableCell className="text-right">₹{p.totalFee.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{p.paidAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{p.pendingAmount > 0 ? <span className="text-warning">₹{p.pendingAmount.toLocaleString()}</span> : <span className="text-success">₹0</span>}</TableCell>
                    <TableCell>{new Date(p.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {p.status === "not_paid" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleOfflinePayment(p, "bank_transfer")}>
                              <Landmark className="h-3 w-3 mr-1" />Bank
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleOfflinePayment(p, "cash")}>
                              <Banknote className="h-3 w-3 mr-1" />Cash
                            </Button>
                            <Button size="sm" className="bg-gradient-brand border-0" onClick={() => handleOnlinePayment(p)} disabled={!paymentProvider.isAvailable()}>
                              Pay Online
                            </Button>
                          </>
                        )}
                        {p.status === "pending_verification" && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Awaiting verification</span>
                        )}
                        {p.status === "paid" && p.receiptNumber && (
                          <Button size="sm" variant="ghost" onClick={() => handleDownloadReceipt(p)}>
                            <Download className="h-4 w-4 mr-1" />Receipt
                          </Button>
                        )}
                        {p.status === "rejected" && (
                          <Badge variant="secondary" className="text-xs">Rejected — Contact Admin</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment History */}
        {ledger.payments.length > 0 && (
          <Card className="mt-4">
            <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Payment History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.payments.filter(p => p.status === "paid").map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs">{p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}</TableCell>
                      <TableCell>{p.month}</TableCell>
                      <TableCell className="text-right">₹{p.paidAmount.toLocaleString()}</TableCell>
                      <TableCell>{p.paymentMethod?.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase()) || "-"}</TableCell>
                      <TableCell>{p.receiptNumber || "-"}</TableCell>
                      <TableCell>{statusBadge(p.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Payment Summary */}
        <Card className="mt-4">
          <CardHeader><CardTitle>Fee Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="border rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Total Fee</p>
                <p className="text-lg font-bold">₹{ledger.summary.totalFee.toLocaleString()}</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Total Paid</p>
                <p className="text-lg font-bold text-success">₹{ledger.summary.paid.toLocaleString()}</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Total Pending</p>
                <p className="text-lg font-bold text-warning">₹{ledger.summary.pending.toLocaleString()}</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Advance Balance</p>
                <p className="text-lg font-bold text-blue-600">₹{ledger.summary.advancePayment.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offline Payment Dialog */}
        <Dialog open={paymentDialog.open} onOpenChange={o => { if (!o) { setPaymentDialog({ open: false, payment: null, method: "bank_transfer" }); setTransactionRef(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{paymentDialog.method === "bank_transfer" ? "Bank Transfer" : "Cash Payment"}</DialogTitle>
              <DialogDescription>Submit your payment for admin verification</DialogDescription>
            </DialogHeader>
            {paymentDialog.payment && (
              <div className="space-y-3">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between"><span>Month</span><span className="font-medium">{paymentDialog.payment.month}</span></div>
                  <div className="flex justify-between"><span>Amount Due</span><span className="font-bold">₹{paymentDialog.payment.pendingAmount.toLocaleString()}</span></div>
                </div>
                {paymentDialog.method === "bank_transfer" && (
                  <div className="space-y-1">
                    <Label>Transaction Reference (UTR/NEFT/IMPS)</Label>
                    <Input value={transactionRef} onChange={e => setTransactionRef(e.target.value)} placeholder="Enter transaction reference number" />
                  </div>
                )}
                {paymentDialog.method === "cash" && (
                  <p className="text-sm text-muted-foreground">Submit cash payment to the admin office. An admin will verify and confirm the payment.</p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setPaymentDialog({ open: false, payment: null, method: "bank_transfer" }); setTransactionRef(""); }}>Cancel</Button>
              <Button className="bg-gradient-brand border-0" onClick={submitOfflinePayment} disabled={paymentDialog.method === "bank_transfer" && !transactionRef}>
                <Upload className="h-4 w-4 mr-1" />Submit for Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageWrapper>
    );
  },
});
