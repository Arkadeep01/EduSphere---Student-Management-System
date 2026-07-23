import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Plus, Send, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { notificationBroadcastApi, type NotificationBroadcast } from "@/services/adminApi";

const RECIPIENT_LABELS: Record<string, string> = {
  all_students: "All Students",
  all_teachers: "All Teachers",
  specific_students: "Specific Students",
  specific_teachers: "Specific Teachers",
  class: "Specific Class",
};

const STATUS_BADGE: Record<string, { variant: "default" | "secondary" | "outline"; className: string }> = {
  draft: { variant: "secondary", className: "" },
  sent: { variant: "default", className: "bg-success" },
  scheduled: { variant: "outline", className: "" },
};

const EMPTY_FORM = { title: "", message: "", recipient_type: "all_students", target_class: "" };

const CLASS_OPTIONS = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12",
];

function AdminNotificationsComponent() {
  const [broadcasts, setBroadcasts] = useState<NotificationBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);

  const fetchBroadcasts = async () => {
    try {
      const data = await notificationBroadcastApi.list();
      setBroadcasts(data || []);
    } catch {
      toast.error("Failed to load broadcasts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBroadcasts(); }, []);

  function resetForm() {
    setForm(EMPTY_FORM);
    setShowCreate(false);
  }

  async function handleCreate() {
    if (!form.title.trim() || !form.message.trim()) { toast.error("Title and message are required"); return; }
    setSaving(true);
    try {
      await notificationBroadcastApi.create(form);
      toast.success("Broadcast created");
      resetForm();
      fetchBroadcasts();
    } catch {
      toast.error("Failed to create broadcast");
    } finally {
      setSaving(false);
    }
  }

  async function handleSend(id: number) {
    setSendingId(id);
    try {
      await notificationBroadcastApi.send(id);
      toast.success("Broadcast sent");
      fetchBroadcasts();
    } catch {
      toast.error("Failed to send broadcast");
    } finally {
      setSendingId(null);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading notifications...</div>;
  }

  const drafts = broadcasts.filter(b => b.status === "draft");
  const sent = broadcasts.filter(b => b.status === "sent");

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{broadcasts.length} broadcasts ({drafts.length} draft)</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchBroadcasts}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
          <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />New Broadcast
          </Button>
        </div>
      </div>

      {broadcasts.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="mb-2">No broadcasts have been created yet.</p>
          <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />Create your first broadcast
          </Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-6">
          {drafts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Drafts ({drafts.length})</h3>
              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drafts.map(b => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.title}</TableCell>
                        <TableCell><span className="text-sm">{RECIPIENT_LABELS[b.recipient_type] || b.recipient_type}{b.target_class ? ` — ${b.target_class}` : ""}</span></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" className="bg-gradient-brand border-0 h-8" disabled={sendingId === b.id} onClick={() => handleSend(b.id)}>
                            {sendingId === b.id ? "Sending..." : <><Send className="mr-2 h-3.5 w-3.5" />Send</>}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent></Card>
            </div>
          )}

          {sent.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Sent ({sent.length})</h3>
              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sent.map(b => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.title}</TableCell>
                        <TableCell><span className="text-sm">{RECIPIENT_LABELS[b.recipient_type] || b.recipient_type}{b.target_class ? ` — ${b.target_class}` : ""}</span></TableCell>
                        <TableCell><Badge variant={STATUS_BADGE[b.status]?.variant || "outline"} className={STATUS_BADGE[b.status]?.className || ""}>{b.status}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{b.sent_at ? new Date(b.sent_at).toLocaleString() : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent></Card>
            </div>
          )}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={o => { if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>New Broadcast</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Exam Schedule Update" /></div>
            <div className="space-y-2"><Label>Message *</Label><Textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Dear students, the exam schedule has been updated..." rows={4} /></div>
            <div className="space-y-2"><Label>Recipients</Label>
              <Select value={form.recipient_type} onValueChange={v => setForm(p => ({ ...p, recipient_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(RECIPIENT_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.recipient_type === "class" && (
              <div className="space-y-2"><Label>Target Class</Label>
                <Select value={form.target_class} onValueChange={v => setForm(p => ({ ...p, target_class: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" disabled={saving} onClick={handleCreate}>{saving ? "Creating..." : "Create Broadcast"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({ meta: [{ title: "Notification Broadcast — Admin" }] }),
  component: AdminNotificationsComponent,
});
