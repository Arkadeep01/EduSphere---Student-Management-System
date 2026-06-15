import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, MoreHorizontal, Eye, Trash2, Mail, Phone, CheckCircle2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { contactSubmissionsFull } from "@/lib/mock-data";
import { toast } from "sonner";

const statusBadge: Record<string, { variant: "default" | "secondary" | "outline" | "destructive", className: string }> = {
  unread: { variant: "default", className: "bg-primary" },
  read: { variant: "secondary", className: "" },
  pending: { variant: "outline", className: "border-warning text-warning" },
  resolved: { variant: "default", className: "bg-success" },
};

function AdminContactsComponent() {
  const [submissions, setSubmissions] = useState(contactSubmissionsFull);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEmailModal, setShowEmailModal] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const filtered = submissions.filter(s =>
    (s.name.toLowerCase().includes(q.toLowerCase()) || s.email.toLowerCase().includes(q.toLowerCase()) || s.subject.toLowerCase().includes(q.toLowerCase()))
    && (statusFilter === "all" || s.status === statusFilter)
  );

  const updateStatus = (id: string, status: "read" | "resolved" | "pending") => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    toast.success(`Marked as ${status}`);
  };

  const deleteSubmission = (id: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== id));
    toast.success("Submission deleted");
  };

  return (
    <>
      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by name, email or subject..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All status</SelectItem><SelectItem value="unread">Unread</SelectItem><SelectItem value="read">Read</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="resolved">Resolved</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Subject</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">No submissions match your filters</TableCell></TableRow> :
                filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{s.email}</TableCell>
                  <TableCell className="text-sm">{s.phone}</TableCell>
                  <TableCell className="max-w-[160px] truncate">{s.subject}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{new Date(s.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant={statusBadge[s.status].variant} className={statusBadge[s.status].className}>{s.status}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateStatus(s.id, "read")}><Eye className="mr-2 h-4 w-4" />Mark as read</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowEmailModal(s.id)}><Mail className="mr-2 h-4 w-4" />Send Email</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`tel:${s.phone}`)}><Phone className="mr-2 h-4 w-4" />Call Contact</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(s.id, "resolved")}><CheckCircle2 className="mr-2 h-4 w-4 text-success" />Mark Resolved</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(s.id, "pending")}><RotateCcw className="mr-2 h-4 w-4 text-warning" />Mark Pending</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteSubmission(s.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent></Card>

      <Dialog open={!!showEmailModal} onOpenChange={o => { if (!o) setShowEmailModal(null); }}>
        <DialogContent><DialogHeader><DialogTitle>Send Email</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>To</Label><p className="text-sm font-medium">{submissions.find(s => s.id === showEmailModal)?.email}</p></div>
            <div><Label>Subject</Label><Input defaultValue={`Re: ${submissions.find(s => s.id === showEmailModal)?.subject || ""}`} /></div>
            <div><Label>Message</Label><Textarea placeholder="Type your reply..." rows={5} value={replyMessage} onChange={e => setReplyMessage(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setShowEmailModal(null); setReplyMessage(""); }}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Email sent"); setShowEmailModal(null); setReplyMessage(""); }}>Send</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Route = createFileRoute("/admin/contacts")({
  head: () => ({ meta: [{ title: "Contact Submissions — Admin" }] }),
  component: AdminContactsComponent,
});
