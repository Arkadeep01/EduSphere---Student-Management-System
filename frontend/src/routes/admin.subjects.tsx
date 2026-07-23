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
import { Plus, Search, Pencil, Trash2, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { subjectAdminApi, type SubjectItem } from "@/services/adminApi";

const TIER_LABELS: Record<string, string> = {
  core: "Core",
  specialized: "Specialized",
  enrichment: "Enrichment",
};

const TIER_COLORS: Record<string, string> = {
  core: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  specialized: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  enrichment: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

const COLOR_OPTIONS = [
  { value: "from-blue-500 to-indigo-500", label: "Blue" },
  { value: "from-green-500 to-emerald-500", label: "Green" },
  { value: "from-red-500 to-rose-500", label: "Red" },
  { value: "from-purple-500 to-violet-500", label: "Purple" },
  { value: "from-amber-500 to-orange-500", label: "Amber" },
  { value: "from-teal-500 to-cyan-500", label: "Teal" },
  { value: "from-pink-500 to-fuchsia-500", label: "Pink" },
  { value: "from-slate-500 to-gray-500", label: "Slate" },
];

const EMPTY_FORM = { name: "", code: "", tier: "core", teacher_name: "", description: "", color: "from-blue-500 to-indigo-500" };

function AdminSubjectsComponent() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<SubjectItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<SubjectItem | null>(null);

  const fetchSubjects = async () => {
    try {
      const data = await subjectAdminApi.list();
      setSubjects(data || []);
    } catch {
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const filtered = subjects.filter(s =>
    (s.name.toLowerCase().includes(q.toLowerCase()) || s.code.toLowerCase().includes(q.toLowerCase()))
    && (tierFilter === "all" || s.tier === tierFilter)
  );

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowDialog(true);
  }

  function openEdit(s: SubjectItem) {
    setEditing(s);
    setForm({ name: s.name, code: s.code, tier: s.tier, teacher_name: s.teacher_name, description: s.description, color: s.color });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.code.trim()) { toast.error("Name and code are required"); return; }
    setSaving(true);
    try {
      if (editing) {
        await subjectAdminApi.update(editing.id, form);
        toast.success("Subject updated");
      } else {
        await subjectAdminApi.create(form);
        toast.success("Subject created");
      }
      setShowDialog(false);
      fetchSubjects();
    } catch {
      toast.error(editing ? "Failed to update subject" : "Failed to create subject");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await subjectAdminApi.delete(id);
      toast.success("Subject deleted");
      setDeleteConfirm(null);
      fetchSubjects();
    } catch {
      toast.error("Failed to delete subject");
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading subjects...</div>;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{subjects.length} subjects</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-gradient-brand border-0" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />Add Subject
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search subjects..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All tiers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            {Object.entries(TIER_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card><CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No subjects found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{s.code}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TIER_COLORS[s.tier] || ""}`}>
                      {TIER_LABELS[s.tier] || s.tier}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.teacher_name || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-8 rounded bg-gradient-to-r ${s.color}`} />
                      <span className="text-xs text-muted-foreground">{s.color}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteConfirm(s)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>

      <Dialog open={showDialog} onOpenChange={o => { if (!o) setShowDialog(false); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Subject" : "Add Subject"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Mathematics" /></div>
              <div className="space-y-2"><Label>Code *</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="MATH101" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tier</Label>
                <Select value={form.tier} onValueChange={v => setForm(p => ({ ...p, tier: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIER_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Color</Label>
                <Select value={form.color} onValueChange={v => setForm(p => ({ ...p, color: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-6 rounded bg-gradient-to-r ${c.value}`} />
                          <span>{c.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Teacher Name</Label><Input value={form.teacher_name} onChange={e => setForm(p => ({ ...p, teacher_name: e.target.value }))} placeholder="Dr. Smith" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Subject description..." rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" disabled={saving} onClick={handleSave}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={o => { if (!o) setDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Subject</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{deleteConfirm?.name}</strong> ({deleteConfirm?.code})? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}

export const Route = createFileRoute("/admin/subjects")({
  head: () => ({ meta: [{ title: "Subject Management — Admin" }] }),
  component: AdminSubjectsComponent,
});
