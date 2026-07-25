import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, Plus, Save, Loader2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { notificationApi, type NotificationSchedule } from "@/services/notificationApi";
import { toast } from "sonner";

const SCHEDULE_TYPES = [
  { value: "assignment_deadline", label: "Assignment Reminder" },
  { value: "exam_announcement", label: "Exam Reminder" },
  { value: "fee_reminder", label: "Fee Reminder" },
  { value: "event", label: "Event Reminder" },
  { value: "holiday_notice", label: "Holiday Reminder" },
  { value: "results_published", label: "Result Reminder" },
];

function SchedulesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editForm, setEditForm] = useState<Partial<NotificationSchedule>>({
    notification_type: "fee_reminder",
    reminder_interval_hours: 24,
    is_active: true,
    priority: "medium",
    target_audience: "",
  });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["notification-schedules"],
    queryFn: () => notificationApi.schedules.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => notificationApi.schedules.create(editForm as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-schedules"] });
      toast.success("Schedule created");
      setShowCreate(false);
    },
    onError: () => toast.error("Failed to create schedule"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      notificationApi.schedules.update(id, { is_active } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-schedules"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationApi.schedules.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-schedules"] });
      toast.success("Schedule deleted");
    },
  });

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Scheduled Notifications</h2>
            <p className="text-sm text-muted-foreground">Configure automatic reminder schedules</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />New Schedule
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : !schedules?.length ? (
          <Card><CardContent className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No schedules configured</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />Create Schedule
            </Button>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {(schedules as NotificationSchedule[]).map((s: NotificationSchedule) => (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.notification_type.replace(/_/g, " ")}</span>
                      <Badge variant={s.is_active ? "default" : "secondary"} className="text-[10px]">
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{s.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Every {s.reminder_interval_hours} hours
                      {s.target_audience ? ` | Target: ${s.target_audience}` : ""}
                      {s.last_run_at ? ` | Last run: ${new Date(s.last_run_at).toLocaleString()}` : " | Never run"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleMutation.mutate({ id: s.id, is_active: !s.is_active })}
                    >
                      {s.is_active ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader><DialogTitle>New Schedule</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Notification Type</Label>
                <Select value={editForm.notification_type} onValueChange={v => setEditForm(f => ({ ...f, notification_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SCHEDULE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reminder Interval (hours)</Label>
                <Input
                  type="number"
                  value={editForm.reminder_interval_hours || 24}
                  onChange={e => setEditForm(f => ({ ...f, reminder_interval_hours: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={editForm.priority} onValueChange={v => setEditForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.is_active ?? true}
                  onCheckedChange={v => setEditForm(f => ({ ...f, is_active: v }))}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate()}>
                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/admin/notification/schedules")({
  head: () => ({ meta: [{ title: "Scheduled Notifications" }] }),
  component: SchedulesPage,
});