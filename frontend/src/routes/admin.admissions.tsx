import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, CheckCircle2, XCircle, Eye } from "lucide-react";
import { useState } from "react";
import { admissionSubmissions } from "@/lib/mock-data";
import { toast } from "sonner";

const statusBadge: Record<string, { variant: "default" | "destructive" | "secondary" | "outline", className: string }> = {
  pending: { variant: "secondary", className: "" },
  approved: { variant: "default", className: "bg-success text-success-foreground" },
  rejected: { variant: "destructive", className: "" },
};

function AdminAdmissionsComponent() {
  const [q, setQ] = useState("");
  const [streamFilter, setStreamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = admissionSubmissions.filter(s =>
    (s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase()) || s.previousSchool.toLowerCase().includes(q.toLowerCase()))
    && (streamFilter === "all" || s.stream === streamFilter)
    && (statusFilter === "all" || s.status === statusFilter)
  );

  const detail = selected ? admissionSubmissions.find(s => s.id === selected) : null;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card><CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by name, ID or school..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} /></div>
              <Select value={streamFilter} onValueChange={setStreamFilter}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All streams</SelectItem><SelectItem value="Science">Science</SelectItem><SelectItem value="Commerce">Commerce</SelectItem><SelectItem value="Arts">Arts</SelectItem></SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Stream</TableHead><TableHead>Board</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">No submissions match your filters</TableCell></TableRow> :
                    filtered.map(s => (
                    <TableRow key={s.id} className={selected === s.id ? "bg-muted/50" : ""}>
                      <TableCell className="font-mono text-xs">{s.id}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell><Badge variant="outline">{s.stream}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.board}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{new Date(s.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant={statusBadge[s.status].variant} className={statusBadge[s.status].className}>{s.status}</Badge></TableCell>
                      <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setSelected(s.id)}><Eye className="mr-2 h-4 w-4" />View details</DropdownMenuItem><DropdownMenuItem onClick={() => { toast.success(`${s.name}'s application approved`); }}><CheckCircle2 className="mr-2 h-4 w-4 text-success" />Approve</DropdownMenuItem><DropdownMenuItem onClick={() => { toast.error(`${s.name}'s application rejected`); }} className="text-destructive"><XCircle className="mr-2 h-4 w-4" />Reject</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent></Card>
        </div>

        <div>
          {detail ? (
            <Card><CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between"><h3 className="font-semibold text-lg">{detail.name}</h3><Badge variant={statusBadge[detail.status].variant} className={statusBadge[detail.status].className}>{detail.status}</Badge></div>
              <div className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">ID</span><span className="font-mono text-xs">{detail.id}</span></div>
                <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Father</span><span>{detail.fathersName}</span></div>
                <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Mother</span><span>{detail.mothersName}</span></div>
                <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Phone</span><span>{detail.phoneNumber}</span></div>
                <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Stream</span><span>{detail.stream}</span></div>
                <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Board</span><span>{detail.board}</span></div>
                <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Previous School</span><span>{detail.previousSchool}</span></div>
                <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Guardian</span><span>{detail.guardianName} ({detail.guardianRelationship})</span></div>
                <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Address</span><span className="text-xs">{detail.address}</span></div>
                <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Submitted</span><span>{new Date(detail.submittedAt).toLocaleDateString()}</span></div>
              </div>

              <div><h4 className="font-medium text-sm mb-2">Marks</h4>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Obtained</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                    <TableBody>{detail.marks.map(m => (
                      <TableRow key={m.subject}><TableCell>{m.subject}</TableCell><TableCell>{m.obtained}</TableCell><TableCell>{m.total}</TableCell></TableRow>
                    ))}</TableBody>
                  </Table>
                </div>
              </div>

              <div><h4 className="font-medium text-sm mb-2">Documents ({detail.documents.length})</h4>
                <div className="flex flex-wrap gap-2">{detail.documents.map(d => (
                  <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
                ))}</div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 bg-success hover:bg-success/90" onClick={() => { toast.success(`Approved ${detail.name}`); }}><CheckCircle2 className="mr-2 h-4 w-4" />Approve</Button>
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => { toast.error(`Rejected ${detail.name}`); }}><XCircle className="mr-2 h-4 w-4" />Reject</Button>
              </div>
            </CardContent></Card>
          ) : (
            <Card><CardContent className="p-12 text-center text-muted-foreground"><Eye className="h-8 w-8 mx-auto mb-3 opacity-40" /><p>Select a submission to view details</p></CardContent></Card>
          )}
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/admin/admissions")({
  head: () => ({ meta: [{ title: "Admission Forms — Admin" }] }),
  component: AdminAdmissionsComponent,
});
