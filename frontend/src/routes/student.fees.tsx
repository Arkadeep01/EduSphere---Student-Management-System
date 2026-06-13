import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { fees } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/student/fees")({
  head: () => ({ meta: [{ title: "Fees — Student" }] }),
  component: () => (
    <>
      <PageHeader title="Fees" description="Payment history and pending dues" />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Paid" value="$4,800" icon={CheckCircle2} accent="success" />
        <StatCard label="Pending" value="$2,400" icon={AlertCircle} accent="warning" />
        <StatCard label="Annual Fee" value="$7,200" icon={DollarSign} accent="primary" />
      </div>
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
    </>
  ),
});
