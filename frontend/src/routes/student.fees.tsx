import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { fees, feeBreakdown } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/student/fees")({
  head: () => ({ meta: [{ title: "Fees — Student" }] }),
  component: () => (
    <PageWrapper>
      <StaggerContainer className="grid grid-cols-3 gap-4">
        <StaggerItem><StatCard label="Total Paid" value={`$${feeBreakdown.paid.toLocaleString()}`} icon={CheckCircle2} accent="success" /></StaggerItem>
        <StaggerItem><StatCard label="Pending" value={`$${feeBreakdown.pending.toLocaleString()}`} icon={AlertCircle} accent="warning" /></StaggerItem>
        <StaggerItem><StatCard label="Annual Fee" value={`$${feeBreakdown.annual.toLocaleString()}`} icon={DollarSign} accent="primary" /></StaggerItem>
      </StaggerContainer>
      <Card className="mt-6"><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Term</TableHead><TableHead>Amount</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{fees.map(f => (
            <TableRow key={f.id}>
              <TableCell className="font-medium">{f.term}</TableCell>
              <TableCell>${f.amount}</TableCell>
              <TableCell>{f.date}</TableCell>
              <TableCell><Badge variant={f.status === "paid" ? "default" : "secondary"} className={f.status === "paid" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>{f.status}</Badge></TableCell>
              <TableCell>{f.status === "paid" ? <Button size="sm" variant="ghost"><Download className="h-4 w-4 mr-1" />Receipt</Button> : <Button size="sm" onClick={() => toast.success("Redirecting to payment...")} className="bg-gradient-brand border-0">Pay now</Button>}</TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </PageWrapper>
  ),
});
