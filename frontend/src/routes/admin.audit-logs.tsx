import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { auditLogApi } from "@/services/adminApi";
import { ExportDialog } from "@/components/export";
import { auditLogExportConfig } from "@/components/export/moduleConfigs";

interface AuditLogEntry {
  id: number;
  user: string | null;
  action: string;
  model_name: string;
  object_id: string;
  description: string;
  ip_address: string | null;
  created_at: string;
}

const actionBadge: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  create: { variant: "default", className: "bg-success" },
  update: { variant: "secondary", className: "bg-blue-500" },
  delete: { variant: "destructive", className: "" },
  login: { variant: "outline", className: "border-primary text-primary" },
  logout: { variant: "outline", className: "" },
  export: { variant: "secondary", className: "" },
  upload: { variant: "default", className: "bg-amber-500" },
  download: { variant: "secondary", className: "" },
};

function AdminAuditLogsComponent() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [q, setQ] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [showExport, setShowExport] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const data = await auditLogApi.list();
      setLogs((data as AuditLogEntry[]) || []);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter(l =>
    (l.user?.toLowerCase().includes(q.toLowerCase()) ||
     l.model_name?.toLowerCase().includes(q.toLowerCase()) ||
     l.description?.toLowerCase().includes(q.toLowerCase()))
    && (actionFilter === "all" || l.action === actionFilter)
  );

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>;
  }

  return (
    <>
      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by user, model, or description..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} /></div>
          <Select value={actionFilter} onValueChange={setActionFilter}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All actions</SelectItem><SelectItem value="create">Create</SelectItem><SelectItem value="update">Update</SelectItem><SelectItem value="delete">Delete</SelectItem><SelectItem value="login">Login</SelectItem><SelectItem value="logout">Logout</SelectItem><SelectItem value="export">Export</SelectItem><SelectItem value="upload">Upload</SelectItem><SelectItem value="download">Download</SelectItem></SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="mr-2 h-4 w-4" />Export</Button>
        </div>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Model</TableHead><TableHead>Object ID</TableHead><TableHead>Description</TableHead><TableHead>IP</TableHead><TableHead>Timestamp</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">No audit logs match your filters</TableCell></TableRow> :
                filtered.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.user || "System"}</TableCell>
                  <TableCell><Badge variant={actionBadge[l.action]?.variant || "secondary"} className={actionBadge[l.action]?.className || ""}>{l.action}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{l.model_name}</TableCell>
                  <TableCell className="text-sm">{l.object_id || "--"}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">{l.description || "--"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l.ip_address || "--"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent></Card>

      <ExportDialog open={showExport} onOpenChange={setShowExport} config={auditLogExportConfig} />
    </>
  );
}

export const Route = createFileRoute("/admin/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs — Admin" }] }),
  component: AdminAuditLogsComponent,
});
