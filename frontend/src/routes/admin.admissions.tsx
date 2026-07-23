import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, CheckCircle2, XCircle, Eye, FileText, UserPlus, HelpCircle, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { admissionAdminApi } from "@/services/adminApi";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExportDialog } from "@/components/export";
import { admissionExportConfig } from "@/components/export/moduleConfigs";

interface ApplicationItem {
  id: number;
  applicant_name: string;
  applicant_email: string;
  father_name: string;
  mother_name: string;
  phone_number: string;
  address: string;
  previous_school: string;
  previous_board: string;
  stream: string;
  entrance_test_score: string | null;
  entrance_test_total: string | null;
  marks_json: any[];
  status: string;
  submitted_at: string;
}

interface StatsData {
  totalApplicants: number;
  entranceAppeared: number;
  passed: number;
  failed: number;
  pendingVerification: number;
  selected: number;
  rejected: number;
}

const statusBadge: Record<string, { variant: "default" | "destructive" | "secondary" | "outline"; className: string }> = {
  pending: { variant: "secondary", className: "" },
  approved: { variant: "default", className: "bg-success text-success-foreground" },
  rejected: { variant: "destructive", className: "" },
};

function AdminAdmissionsComponent() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<number | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showRequestInfo, setShowRequestInfo] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [apps, st] = await Promise.all([
        admissionAdminApi.list(),
        admissionAdminApi.stats(),
      ]);
      setApplications(apps as ApplicationItem[] || []);
      setStats(st as StatsData);
    } catch {
      toast.error("Failed to load admissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = applications.filter(s =>
    (s.applicant_name?.toLowerCase().includes(q.toLowerCase()) || s.id?.toString().includes(q))
    && (statusFilter === "all" || s.status === statusFilter)
  );

  const detail = selected ? applications.find(s => s.id === selected) : null;

  const approveApplication = async (id: number) => {
    try {
      await admissionAdminApi.approve(id);
      setApplications(prev => prev.map(s => s.id === id ? { ...s, status: "approved" } : s));
      toast.success("Application approved");
    } catch { toast.error("Failed to approve"); }
  };

  const rejectApplication = async (id: number) => {
    try {
      await admissionAdminApi.reject(id);
      setApplications(prev => prev.map(s => s.id === id ? { ...s, status: "rejected" } : s));
      toast.error("Application rejected");
    } catch { toast.error("Failed to reject"); }
  };

  const createStudentAccount = async (id: number) => {
    try {
      await admissionAdminApi.createStudent(id);
      toast.success("Student account created. Credentials emailed to applicant.");
    } catch { toast.error("Failed to create student account"); }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading admissions...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Applicants" value={stats?.totalApplicants ?? "--"} icon={FileText} accent="primary" />
        <StatCard label="Passed" value={stats?.passed ?? "--"} icon={CheckCircle2} accent="success" />
        <StatCard label="Pending" value={stats?.pendingVerification ?? "--"} icon={HelpCircle} accent="warning" />
        <StatCard label="Rejected" value={stats?.rejected ?? "--"} icon={XCircle} accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card><CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by name or ID..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} /></div>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Stream</TableHead><TableHead>Board</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">No submissions match your filters</TableCell></TableRow> :
                    filtered.map(s => (
                    <TableRow key={s.id} className={selected === s.id ? "bg-muted/50" : ""}>
                      <TableCell className="font-mono text-xs">{s.id}</TableCell>
                      <TableCell className="font-medium">{s.applicant_name}</TableCell>
                      <TableCell><Badge variant="outline">{s.stream || "--"}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.previous_board || "--"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{new Date(s.submitted_at).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant={statusBadge[s.status]?.variant || "secondary"} className={statusBadge[s.status]?.className || ""}>{s.status}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelected(s.id)}><Eye className="mr-2 h-4 w-4" />View details</DropdownMenuItem>
                            {s.status === "pending" && <DropdownMenuItem onClick={() => approveApplication(s.id)}><CheckCircle2 className="mr-2 h-4 w-4 text-success" />Approve</DropdownMenuItem>}
                            {s.status === "pending" && <DropdownMenuItem onClick={() => rejectApplication(s.id)} className="text-destructive"><XCircle className="mr-2 h-4 w-4" />Reject</DropdownMenuItem>}
                            {s.status === "approved" && <DropdownMenuItem onClick={() => createStudentAccount(s.id)}><UserPlus className="mr-2 h-4 w-4" />Create Student Account</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent></Card>
        </div>

        <div>
          {detail ? (
            <div className="space-y-4">
              <Card><CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between"><h3 className="font-semibold text-lg">{detail.applicant_name}</h3><Badge variant={statusBadge[detail.status]?.variant || "secondary"} className={statusBadge[detail.status]?.className || ""}>{detail.status}</Badge></div>
                <div className="text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Email</span><span>{detail.applicant_email}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Father</span><span>{detail.father_name || "--"}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Mother</span><span>{detail.mother_name || "--"}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Phone</span><span>{detail.phone_number || "--"}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Stream</span><span>{detail.stream || "--"}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Board</span><span>{detail.previous_board || "--"}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Previous School</span><span>{detail.previous_school || "--"}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Address</span><span className="text-xs">{detail.address || "--"}</span></div>
                </div>

                {detail.marks_json?.length > 0 && (
                  <div><h4 className="font-medium text-sm mb-2">Marks</h4>
                    <div className="rounded-lg border overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Pass</TableHead><TableHead>Obtained</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                        <TableBody>{detail.marks_json.map((m: any, i: number) => (
                          <TableRow key={i}><TableCell>{m.subject}</TableCell><TableCell>{m.pass}</TableCell><TableCell>{m.obtained}</TableCell><TableCell>{m.total}</TableCell></TableRow>
                        ))}</TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2">
                  {detail.status === "pending" && <>
                    <Button size="sm" className="w-full bg-success hover:bg-success/90" onClick={() => approveApplication(detail.id)}><CheckCircle2 className="mr-2 h-4 w-4" />Approve</Button>
                    <Button size="sm" variant="destructive" className="w-full" onClick={() => rejectApplication(detail.id)}><XCircle className="mr-2 h-4 w-4" />Reject</Button>
                  </>}
                  {detail.status === "approved" && <Button size="sm" className="w-full bg-gradient-brand border-0" onClick={() => createStudentAccount(detail.id)}><UserPlus className="mr-2 h-4 w-4" />Create Student Account</Button>}
                  <Button size="sm" variant="outline" className="w-full" onClick={() => { setShowRequestInfo(true); }}><HelpCircle className="mr-2 h-4 w-4" />Request More Information</Button>
                </div>
              </CardContent></Card>
            </div>
          ) : (
            <Card><CardContent className="p-12 text-center text-muted-foreground"><Eye className="h-8 w-8 mx-auto mb-3 opacity-40" /><p>Select a submission to view details</p></CardContent></Card>
          )}
        </div>
      </div>

      <Dialog open={showRequestInfo} onOpenChange={o => { if (!o) { setShowRequestInfo(false); setRequestMessage(""); } }}>
        <DialogContent><DialogHeader><DialogTitle>Request More Information</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Applicant</Label><p className="text-sm font-medium">{detail?.applicant_name}</p></div>
            <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Describe what additional information is needed..." rows={4} value={requestMessage} onChange={e => setRequestMessage(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setShowRequestInfo(false); setRequestMessage(""); }}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Request sent to applicant"); setShowRequestInfo(false); setRequestMessage(""); }}>Send</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportDialog open={showExport} onOpenChange={setShowExport} config={admissionExportConfig} />
    </>
  );
}

export const Route = createFileRoute("/admin/admissions")({
  head: () => ({ meta: [{ title: "Admission Forms — Admin" }] }),
  component: AdminAdmissionsComponent,
});
