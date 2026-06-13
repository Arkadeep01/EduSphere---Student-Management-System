import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Calendar as CalIcon } from "lucide-react";

const last30 = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, present: i % 11 !== 0 }));

export const Route = createFileRoute("/student/attendance")({
  head: () => ({ meta: [{ title: "My Attendance — Student" }] }),
  component: () => (
    <>
      <PageHeader title="My Attendance" description="Last 30 days" />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Present" value={`${last30.filter(d => d.present).length}d`} icon={CheckCircle2} accent="success" />
        <StatCard label="Absent" value={`${last30.filter(d => !d.present).length}d`} icon={XCircle} accent="warning" />
        <StatCard label="Attendance %" value={`${Math.round(last30.filter(d => d.present).length / last30.length * 100)}%`} icon={CalIcon} accent="primary" />
      </div>
      <Card className="mt-6"><CardHeader><CardTitle>Calendar</CardTitle></CardHeader><CardContent>
        <div className="grid grid-cols-10 gap-2">
          {last30.map(d => (
            <div key={d.day} className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${d.present ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{d.day}</div>
          ))}
        </div>
      </CardContent></Card>
    </>
  ),
});
