import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, AlertCircle, Wallet, Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { studentGrowth, classCards, feeStatusData } from "@/lib/mock-data";
import { useState } from "react";

const breakdown = [
  { name: "Tuition", value: 65 },
  { name: "Transport", value: 15 },
  { name: "Hostel", value: 12 },
  { name: "Other", value: 8 },
];
const COLORS = ["oklch(0.48 0.18 265)", "oklch(0.65 0.13 230)", "oklch(0.7 0.17 50)", "oklch(0.62 0.16 155)"];

function AdminFeesComponent() {
  const [selectedClass, setSelectedClass] = useState("");
  const [feeFilter, setFeeFilter] = useState<"all" | "paid" | "unpaid">("all");

  const feeData = selectedClass ? feeStatusData[selectedClass] || [] : [];
  const filtered = feeData.filter(f => feeFilter === "all" || f.status === feeFilter);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Collected" value="$284.5k" icon={DollarSign} trend="8.2%" trendUp accent="success" />
        <StatCard label="Pending" value="$18.4k" icon={AlertCircle} accent="warning" />
        <StatCard label="Salaries Paid" value="$92k" icon={Wallet} accent="info" />
        <StatCard label="Net Surplus" value="$172k" icon={TrendingUp} trend="12% growth" trendUp accent="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={studentGrowth}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="month" /><YAxis />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="oklch(0.48 0.18 265)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Revenue Mix</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart><Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
              {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </div>

      <Card className="mt-6"><CardHeader><CardTitle>Fee Report by Class</CardTitle></CardHeader><CardContent>
        <div className="flex items-center gap-3 mb-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>{classCards.map(c => (<SelectItem key={c.name} value={c.name}>Class {c.name}</SelectItem>))}</SelectContent>
          </Select>
          <Select value={feeFilter} onValueChange={(v: "all" | "paid" | "unpaid") => setFeeFilter(v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="unpaid">Unpaid</SelectItem></SelectContent>
          </Select>
          {selectedClass && <span className="text-sm text-muted-foreground">{feeData.filter(f => f.status === "paid").length} paid · {feeData.filter(f => f.status === "unpaid").length} unpaid</span>}
        </div>
        {selectedClass ? (
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Amount</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No matching records</TableCell></TableRow> :
                filtered.map(f => (
                  <TableRow key={f.student}>
                    <TableCell className="font-medium">{f.student}</TableCell>
                    <TableCell>${f.amount}</TableCell>
                    <TableCell>{f.dueDate}</TableCell>
                    <TableCell><Badge variant={f.status === "paid" ? "default" : "secondary"} className={f.status === "paid" ? "bg-success text-success-foreground" : ""}>{f.status}</Badge></TableCell>
                  </TableRow>
                ))
              }</TableBody>
            </Table>
          </div>
        ) : <p className="text-sm text-muted-foreground text-center py-8">Select a class to view fee status</p>}
      </CardContent></Card>
    </>
  );
}

export const Route = createFileRoute("/admin/fees")({
  head: () => ({ meta: [{ title: "Fees & Finance — Admin" }] }),
  component: AdminFeesComponent,
});
