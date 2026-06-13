import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertCircle, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { studentGrowth } from "@/lib/mock-data";

const breakdown = [
  { name: "Tuition", value: 65 },
  { name: "Transport", value: 15 },
  { name: "Hostel", value: 12 },
  { name: "Other", value: 8 },
];
const COLORS = ["oklch(0.48 0.18 265)", "oklch(0.65 0.13 230)", "oklch(0.7 0.17 50)", "oklch(0.62 0.16 155)"];

export const Route = createFileRoute("/admin/fees")({
  head: () => ({ meta: [{ title: "Fees & Finance — Admin" }] }),
  component: () => (
    <>
      <PageHeader title="Fees & Finance" description="Collections, pending payments, and reports" />
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
    </>
  ),
});
