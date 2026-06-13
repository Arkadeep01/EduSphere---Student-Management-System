import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Mail, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { contactSubmissions } from "@/lib/mock-data";
import { toast } from "sonner";

function AdminContactsComponent() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = contactSubmissions.filter(s =>
    (s.name.toLowerCase().includes(q.toLowerCase()) || s.email.toLowerCase().includes(q.toLowerCase()) || s.subject.toLowerCase().includes(q.toLowerCase()))
    && (statusFilter === "all" || s.status === statusFilter)
  );
  const total = contactSubmissions.length;
  const unread = contactSubmissions.filter(s => s.status === "unread").length;

  return (
    <>
      <PageHeader title="Contact Submissions" description={`${unread} unread · ${total} total`}
        actions={<Button size="sm" variant="outline"><Mail className="mr-2 h-4 w-4" />Mark All Read</Button>} />
      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by name, email or subject..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All status</SelectItem><SelectItem value="unread">Unread</SelectItem><SelectItem value="read">Read</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Subject</TableHead><TableHead>Message</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">No submissions match your filters</TableCell></TableRow> :
                filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  <TableCell>{s.subject}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{s.message}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{new Date(s.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant={s.status === "unread" ? "default" : "secondary"} className={s.status === "unread" ? "bg-primary" : ""}>{s.status}</Badge></TableCell>
                  <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => toast.success("Marked as read")}><Eye className="mr-2 h-4 w-4" />Mark as read</DropdownMenuItem><DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent></Card>
    </>
  );
}

export const Route = createFileRoute("/admin/contacts")({
  head: () => ({ meta: [{ title: "Contact Submissions — Admin" }] }),
  component: AdminContactsComponent,
});
