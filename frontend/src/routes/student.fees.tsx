import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DollarSign, CheckCircle2, AlertCircle, Download, Receipt, Upload, Banknote, ScrollText, Landmark, Clock } from "lucide-react";
import { toast } from "sonner";
import { feeApi } from "@/services/adminApi";

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
    const [ledger, setLedger] = useState<{ payments: any[]; summary: { total_fee: number; paid: number; pending: number; advance: number } }>({ payments: [], summary: { total_fee: 0, paid: 0, pending: 0, advance: 0 } });
    const [structure, setStructure] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; month: string; pendingAmount: number; method: string }>({ open: false, month: "", pendingAmount: 0, method: "bank_transfer" });
    const [transactionRef, setTransactionRef] = useState("");

    useEffect(() => {
      (async () => {
        try {
          const [l, s] = await Promise.all([
            feeApi.myLedger(),
            feeApi.structures.list(),
          ]);
          setLedger(l as any);
          if (Array.isArray(s) && s.length > 0) setStructure(s[0]);
        } catch { toast.error("Failed to load fee data"); }
        finally { setLoading(false); }
      })();
    }, []);

    const activeMonths = MONTHS.slice(0, 4);
    const paymentSchedule = useMemo(() => {
      return activeMonths.map(month => {
        const existing = ledger.payments.find((p: any) => p.month === month);
        if (existing) return existing;
        return {
          id: `pending_${month}`, month,
          total_fee: structure?.components?.filter((c: any) => c.frequency === "monthly").reduce((s: number, c: any) => s + Number(c.amount), 0) || 0,
          paid_amount: 0, status: "not_paid", due_date: new Date(2026, MONTHS.indexOf(month) + 3, 10).toISOString().split("T")[0],
          receipt_number: null,
        };
      });
    }, [ledger, structure]);

    async function handleOfflinePayment(month: string, amount: number, method: string) {
      setPaymentDialog({ open: true, month, pendingAmount: amount, method });
    }

    async function submitOfflinePayment() {
      try {
        await feeApi.recordOffline({
          month: paymentDialog.month,
          amount: paymentDialog.pendingAmount,
          payment_method: paymentDialog.method,
          transaction_ref: paymentDialog.method === "bank_transfer" ? transactionRef : undefined,
        });
        toast.success("Payment submitted for verification");
        setPaymentDialog({ open: false, month: "", pendingAmount: 0, method: "bank_transfer" });
        setTransactionRef("");
        const l = await feeApi.myLedger();
        setLedger(l as any);
      } catch { toast.error("Failed to submit payment"); }
    }

    if (loading) {
      return <PageWrapper><div className="text-center py-8 text-muted-foreground">Loading fee data...</div></PageWrapper>;
    }

    return (
      <PageWrapper>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StaggerItem><StatCard label="Total Paid" value={`₹${ledger.summary.paid.toLocaleString()}`} icon={CheckCircle2} accent="success" /></StaggerItem>
          <StaggerItem><StatCard label="Pending" value={`₹${ledger.summary.pending.toLocaleString()}`} icon={AlertCircle} accent="warning" /></StaggerItem>
          <StaggerItem><StatCard label="Total Fee" value={`₹${ledger.summary.total_fee.toLocaleString()}`} icon={DollarSign} accent="primary" /></StaggerItem>
        </StaggerContainer>

        <Card className="mt-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5" /> Fee Ledger</CardTitle><CardDescription>Your monthly fee schedule and payment status</CardDescription></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentSchedule.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.month}</TableCell>
                    <TableCell className="text-right">₹{Number(p.total_fee).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{Number(p.paid_amount) > 0 ? <span className="text-success">₹{Number(p.paid_amount).toLocaleString()}</span> : "—"}</TableCell>
                    <TableCell>{p.due_date ? new Date(p.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {p.status === "not_paid" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleOfflinePayment(p.month, Number(p.total_fee), "bank_transfer")}>
                              <Landmark className="h-3 w-3 mr-1" />Bank
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleOfflinePayment(p.month, Number(p.total_fee), "cash")}>
                              <Banknote className="h-3 w-3 mr-1" />Cash
                            </Button>
                          </>
                        )}
                        {p.status === "pending_verification" && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Awaiting verification</span>
                        )}
                        {p.status === "paid" && p.receipt_number && (
                          <Button size="sm" variant="ghost"><Download className="h-4 w-4 mr-1" />Receipt</Button>
                        )}
                        {p.status === "rejected" && <Badge variant="secondary" className="text-xs">Rejected — Contact Admin</Badge>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {ledger.payments.length > 0 && (
          <Card className="mt-4">
            <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Payment History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Date</TableHead><TableHead>Month</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Method</TableHead><TableHead>Receipt</TableHead><TableHead>Status</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.payments.filter((p: any) => p.status === "paid").map((p: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}</TableCell>
                      <TableCell>{p.month}</TableCell>
                      <TableCell className="text-right">₹{Number(p.paid_amount).toLocaleString()}</TableCell>
                      <TableCell>{p.payment_method?.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase()) || "-"}</TableCell>
                      <TableCell>{p.receipt_number || "-"}</TableCell>
                      <TableCell>{statusBadge(p.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4">
          <CardHeader><CardTitle>Fee Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="border rounded-lg p-3"><p className="text-muted-foreground text-xs">Total Fee</p><p className="text-lg font-bold">₹{ledger.summary.total_fee.toLocaleString()}</p></div>
              <div className="border rounded-lg p-3"><p className="text-muted-foreground text-xs">Total Paid</p><p className="text-lg font-bold text-success">₹{ledger.summary.paid.toLocaleString()}</p></div>
              <div className="border rounded-lg p-3"><p className="text-muted-foreground text-xs">Total Pending</p><p className="text-lg font-bold text-warning">₹{ledger.summary.pending.toLocaleString()}</p></div>
              <div className="border rounded-lg p-3"><p className="text-muted-foreground text-xs">Advance Balance</p><p className="text-lg font-bold text-blue-600">₹{ledger.summary.advance.toLocaleString()}</p></div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={paymentDialog.open} onOpenChange={o => { if (!o) { setPaymentDialog({ open: false, month: "", pendingAmount: 0, method: "bank_transfer" }); setTransactionRef(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{paymentDialog.method === "bank_transfer" ? "Bank Transfer" : "Cash Payment"}</DialogTitle>
              <DialogDescription>Submit your payment for admin verification</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span>Month</span><span className="font-medium">{paymentDialog.month}</span></div>
                <div className="flex justify-between"><span>Amount Due</span><span className="font-bold">₹{paymentDialog.pendingAmount.toLocaleString()}</span></div>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => { setPaymentDialog({ open: false, month: "", pendingAmount: 0, method: "bank_transfer" }); setTransactionRef(""); }}>Cancel</Button>
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
