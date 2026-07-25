import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { promotionApi, type PromotionRule } from "@/services/promotionApi";

function AdminPromotionRulesComponent() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<PromotionRule | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    from_class: "",
    min_percentage: 40,
    min_attendance_percentage: 75,
    max_failed_subjects: 0,
    is_active: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "promotion-rules"],
    queryFn: () => promotionApi.getRules(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<PromotionRule>) => promotionApi.createRule(data),
    onSuccess: () => {
      toast.success("Promotion rule created");
      queryClient.invalidateQueries({ queryKey: ["admin", "promotion-rules"] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create rule"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PromotionRule> }) => promotionApi.updateRule(id, data),
    onSuccess: () => {
      toast.success("Promotion rule updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "promotion-rules"] });
      setShowEditDialog(false);
      setEditingRule(null);
    },
    onError: () => toast.error("Failed to update rule"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => promotionApi.deleteRule(id),
    onSuccess: () => {
      toast.success("Promotion rule deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "promotion-rules"] });
    },
    onError: () => toast.error("Failed to delete rule"),
  });

  const rules = data?.rules || [];

  function resetForm() {
    setFormData({ name: "", from_class: "", min_percentage: 40, min_attendance_percentage: 75, max_failed_subjects: 0, is_active: true });
  }

  function openEdit(rule: PromotionRule) {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      from_class: rule.from_class,
      min_percentage: Number(rule.min_percentage),
      min_attendance_percentage: Number(rule.min_attendance_percentage),
      max_failed_subjects: rule.max_failed_subjects,
      is_active: rule.is_active,
    });
    setShowEditDialog(true);
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Promotion Rules</h2>
          <p className="text-sm text-muted-foreground">{rules.length} rule(s) configured</p>
        </div>
        <Button size="sm" className="bg-gradient-brand border-0" onClick={() => { resetForm(); setShowCreateDialog(true); }}>
          <Plus className="mr-2 h-4 w-4" />Add Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No promotion rules configured</p>
            <p className="text-sm mt-1">Create rules to define automatic promotion criteria for each class.</p>
            <Button className="mt-4" onClick={() => { resetForm(); setShowCreateDialog(true); }}><Plus className="mr-2 h-4 w-4" />Create First Rule</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Min Percentage</TableHead>
                  <TableHead>Min Attendance</TableHead>
                  <TableHead>Max Failed Subjects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.from_class}</TableCell>
                    <TableCell>{rule.min_percentage}%</TableCell>
                    <TableCell>{rule.min_attendance_percentage}%</TableCell>
                    <TableCell>{rule.max_failed_subjects}</TableCell>
                    <TableCell>
                      <Badge variant={rule.is_active ? "outline" : "secondary"} className={rule.is_active ? "bg-green-100 text-green-700" : ""}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(rule)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => {
                          if (confirm(`Delete rule "${rule.name}"?`)) deleteMutation.mutate(rule.id);
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Promotion Rule</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Class 10 Promotion Rule" />
            </div>
            <div className="space-y-2">
              <Label>From Class</Label>
              <Input value={formData.from_class} onChange={(e) => setFormData((p) => ({ ...p, from_class: e.target.value }))} placeholder="e.g., 10" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Min %</Label>
                <Input type="number" value={formData.min_percentage} onChange={(e) => setFormData((p) => ({ ...p, min_percentage: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Min Attendance</Label>
                <Input type="number" value={formData.min_attendance_percentage} onChange={(e) => setFormData((p) => ({ ...p, min_attendance_percentage: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Max Failed</Label>
                <Input type="number" value={formData.max_failed_subjects} onChange={(e) => setFormData((p) => ({ ...p, max_failed_subjects: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData((p) => ({ ...p, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" disabled={createMutation.isPending || !formData.name || !formData.from_class}
              onClick={() => createMutation.mutate(formData)}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Promotion Rule</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>From Class</Label>
              <Input value={formData.from_class} onChange={(e) => setFormData((p) => ({ ...p, from_class: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Min %</Label>
                <Input type="number" value={formData.min_percentage} onChange={(e) => setFormData((p) => ({ ...p, min_percentage: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Min Attendance</Label>
                <Input type="number" value={formData.min_attendance_percentage} onChange={(e) => setFormData((p) => ({ ...p, min_attendance_percentage: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Max Failed</Label>
                <Input type="number" value={formData.max_failed_subjects} onChange={(e) => setFormData((p) => ({ ...p, max_failed_subjects: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData((p) => ({ ...p, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" disabled={updateMutation.isPending}
              onClick={() => {
                if (editingRule) updateMutation.mutate({ id: editingRule.id, data: formData });
              }}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Update Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Route = createFileRoute("/admin/promotions/rules")({
  head: () => ({ meta: [{ title: "Promotion Rules — Admin" }] }),
  component: AdminPromotionRulesComponent,
});