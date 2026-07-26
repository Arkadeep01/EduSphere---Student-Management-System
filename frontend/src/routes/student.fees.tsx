import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, CheckCircle2, AlertCircle, Download, Receipt, Upload, Banknote, ScrollText, Landmark, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { feeApi } from "@/services/adminApi";

interface LedgerEntry {
  id: number;
  fee_component: string | null;
  month: string;
  academic_session: string;
  total_fee: string;
  paid_amount: string;
  fine: string;
  paid_at_fine: string;
  due_date: string | null;
  status: string;
  payment_method: string | null;
  transaction_ref: string | null;
  paid_at: string | null;
  receipt_number: string | null;
  correction_status: string;
  refund_status: string;
  clearance_deadline: string | null;
  outstanding: string;
  payable_now: string;
}

interface LedgerData {
  payments: LedgerEntry[];
  summary: {
    total_fee: string;
    paid: string;
    pending: string;
    total_fine: string;
    advance: string;
  };
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-success text-success-foreground" },
  not_paid: { label: "Not Paid", cls: "bg-muted text-muted-foreground" },
  not_due: { label: "Not Due", cls: "bg-secondary text-secondary-foreground" },
  overdue: { label: "Overdue!", cls: "bg-destructive text-destructive-foreground" },
  pending_verification: { label: "Pending", cls: "bg-warning text-warning-foreground" },
  rejected: { label: "Rejected", cls: "bg-destructive text-destructive-foreground" },
};

function statusBadge(status: string) {
  const s = STATUS_MAP[status] || { label: status, cls: "" };
  return <Badge className={s.cls}>{s.label}</Badge>;
}

export const Route = createFileRoute("/student/fees")({
  head: () => ({ meta: [{ title: "Fees — Student" }] }),
  component: () => {
    const [ledger, setLedger] = useState<LedgerData>({ payments: [], summary: { total_fee: "0", paid: "0", pending: "0", total_fine: "0", advance: "0" } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      (async () => {
        try {
          const l = await feeApi.myLedger();
          setLedger(l as LedgerData);
        } catch { toast.error("Failed to load fee data"); }
        finally { setLoading(false); }
      })();
    }, []);

    if (loading) {
      return <PageWrapper><div className="text-center py-8 text-muted-foreground">Loading fee data...</div></PageWrapper>;
    }

    const summary = ledger.summary;
    const pendingEntries = ledger.payments.filter(p => p.status !== "paid");
    const paidEntries = ledger.payments.filter(p => p.status === "paid");

    return (
      <PageWrapper>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StaggerItem><StatCard label="Total Fee" value={`₹${Number(summary.total_fee).toLocaleString()}`} icon={DollarSign} accent="primary" /></StaggerItem>
          <StaggerItem><StatCard label="Total Paid" value={`₹${Number(summary.paid).toLocaleString()}`} icon={CheckCircle2} accent="success" /></StaggerItem>
          <StaggerItem><StatCard label="Pending" value={`₹${Number(summary.pending).toLocaleString()}`} icon={AlertCircle} accent="warning" /></StaggerItem>
          <StaggerItem><StatCard label="Late Fine" value={`₹${Number(summary.total_fine).toLocaleString()}`} icon={AlertTriangle} accent="destructive" /></StaggerItem>
        </StaggerContainer>

        {pendingEntries.length > 0 && (
          <Card className="mt-6 border-warning/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" /> Outstanding Dues
              </CardTitle>
              <CardDescription>Fees that require your attention</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Fine</TableHead>
                    <TableHead className="text-right">Payable Now</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Clearance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingEntries.map((p: LedgerEntry) => (
                    <TableRow key={p.id} className={p.status === "overdue" ? "bg-destructive/5" : ""}>
                      <TableCell className="font-medium">{p.fee_component || p.month || "Fee"}</TableCell>
                      <TableCell className="text-right">₹{Number(p.total_fee).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{Number(p.fine) > 0 ? <span className="text-destructive font-medium">₹{Number(p.fine).toLocaleString()}</span> : "—"}</TableCell>
                      <TableCell className="text-right font-medium">₹{Number(p.payable_now).toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{p.due_date ? new Date(p.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</TableCell>
                      <TableCell>{statusBadge(p.status)}</TableCell>
                      <TableCell className="text-xs">{p.clearance_deadline ? `By ${new Date(p.clearance_deadline).toLocaleDateString("en-IN")}` : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {paidEntries.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Payment History</CardTitle>
              <CardDescription>Your completed fee payments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Fine Paid</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidEntries.map((p: LedgerEntry) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.fee_component || p.month || "Fee"}</TableCell>
                      <TableCell className="text-right">₹{Number(p.paid_amount).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{Number(p.paid_at_fine) > 0 ? <span className="text-destructive">₹{Number(p.paid_at_fine).toLocaleString()}</span> : "—"}</TableCell>
                      <TableCell>{p.payment_method || "—"}</TableCell>
                      <TableCell className="text-xs">{p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</TableCell>
                      <TableCell>
                        {p.receipt_number ? (
                          <Button size="sm" variant="ghost" onClick={() => window.open(`/api/admin/fees/receipt/${p.id}/`, "_blank")}>
                            <Download className="h-4 w-4 mr-1" />{p.receipt_number.slice(-8)}
                          </Button>
                        ) : "—"}
                      </TableCell>
                      <TableCell>{statusBadge(p.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {ledger.payments.length === 0 && (
          <Card className="mt-6">
            <CardContent className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium text-muted-foreground">No Fee Records</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">Fees have not been generated for your class yet. Contact the admin office.</p>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4">
          <CardHeader><CardTitle>Fee Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="border rounded-lg p-3"><p className="text-muted-foreground text-xs">Total Fee</p><p className="text-lg font-bold">₹{Number(summary.total_fee).toLocaleString()}</p></div>
              <div className="border rounded-lg p-3"><p className="text-muted-foreground text-xs">Total Paid</p><p className="text-lg font-bold text-success">₹{Number(summary.paid).toLocaleString()}</p></div>
              <div className="border rounded-lg p-3"><p className="text-muted-foreground text-xs">Pending</p><p className="text-lg font-bold text-warning">₹{Number(summary.pending).toLocaleString()}</p></div>
              <div className="border rounded-lg p-3"><p className="text-muted-foreground text-xs">Late Fine</p><p className="text-lg font-bold text-destructive">₹{Number(summary.total_fine).toLocaleString()}</p></div>
              <div className="border rounded-lg p-3"><p className="text-muted-foreground text-xs">Advance</p><p className="text-lg font-bold text-blue-600">₹{Number(summary.advance).toLocaleString()}</p></div>
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  },
});
