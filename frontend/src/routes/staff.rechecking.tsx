import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSearch, Loader2, AlertCircle, Search, Clock, CheckCircle2, TrendingUp, Layers } from "lucide-react";
import { API_BASE } from "@/services/request";

interface RecheckingRequest {
  id: number;
  student_name: string;
  exam_name: string;
  subject_name: string;
  status: string;
  marks_obtained_original: string | null;
  total_marks_original: string | null;
  marks_obtained_revised: string | null;
  total_marks_revised: string | null;
  is_revised: boolean;
  requested_at: string;
  completed_at: string | null;
}

const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

const statusBadge: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  pending_approval: { variant: "secondary", className: "bg-amber-100 text-amber-800" },
  approved: { variant: "default", className: "bg-blue-100 text-blue-800" },
  re_evaluating: { variant: "default", className: "bg-purple-100 text-purple-800" },
  comparing: { variant: "default", className: "bg-cyan-100 text-cyan-800" },
  completed: { variant: "default", className: "bg-green-100 text-green-800" },
  rejected: { variant: "destructive", className: "" },
  closed: { variant: "outline", className: "" },
};

function StaffRecheckingPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff-rechecking", statusFilter, search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));
      const r = await fetch(`${API_BASE}/api/staff/rechecking/?${params}`, { headers });
      if (!r.ok) throw new Error("Failed");
      return r.json() as Promise<{ results: RecheckingRequest[]; total: number; page: number; page_size: number; total_pages: number }>;
    },
    enabled: !!token,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (isError) {
    return <div className="flex flex-col items-center justify-center min-h-[40vh] text-destructive gap-2">
      <AlertCircle className="h-8 w-8" /><p>Failed to load rechecking data</p>
    </div>;
  }

  const stats = [
    { label: "Total", value: data?.total ?? 0, icon: Layers, color: "text-blue-600" },
    { label: "Pending", value: data?.results.filter(r => r.status === "pending_approval").length ?? 0, icon: Clock, color: "text-amber-600" },
    { label: "Completed", value: data?.results.filter(r => r.status === "completed").length ?? 0, icon: CheckCircle2, color: "text-green-600" },
    { label: "Revised", value: data?.results.filter(r => r.is_revised).length ?? 0, icon: TrendingUp, color: "text-cyan-600" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Rechecking Overview</h2>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className={`rounded-full p-2 bg-muted ${s.color}`}><s.icon className="h-4 w-4" /></div>
            <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="re_evaluating">Re-evaluating</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(data?.results ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <FileSearch className="h-10 w-10 opacity-40" />
            <p className="font-medium">No Rechecking Data</p>
            <p className="text-sm">Rechecking requests will appear here once submitted.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Student</TableHead><TableHead>Exam</TableHead><TableHead>Subject</TableHead>
                <TableHead>Original</TableHead><TableHead>Revised</TableHead><TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {data!.results.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.student_name}</TableCell>
                    <TableCell>{r.exam_name}</TableCell>
                    <TableCell>{r.subject_name}</TableCell>
                    <TableCell className="text-sm">{r.marks_obtained_original ?? "--"}/{r.total_marks_original ?? "--"}</TableCell>
                    <TableCell className="text-sm">
                      {r.status === "completed" ? (
                        <span className={r.is_revised ? "text-green-600 font-medium" : "text-muted-foreground"}>
                          {r.marks_obtained_revised ?? "--"}/{r.total_marks_revised ?? "--"}
                        </span>
                      ) : "--"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadge[r.status]?.variant || "secondary"} className={statusBadge[r.status]?.className || ""}>
                        {r.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.requested_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(data?.total_pages ?? 1) > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground">Page {page} of {data?.total_pages} ({data?.total} total)</p>
                <div className="flex gap-2">
                  <button className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                  <button className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50" disabled={page >= (data?.total_pages ?? 1)} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/staff/rechecking")({
  head: () => ({ meta: [{ title: "Rechecking — Staff" }] }),
  component: StaffRecheckingPage,
});