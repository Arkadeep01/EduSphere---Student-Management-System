import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, Send, Loader2 } from "lucide-react";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notificationApi } from "@/services/notificationApi";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const NOTIFICATION_TYPES = [
  { value: "assignment_announcement", label: "Assignment Announcement" },
  { value: "subject_announcement", label: "Subject Announcement" },
  { value: "class_announcement", label: "Class Announcement" },
  { value: "school_announcement", label: "School Announcement" },
  { value: "holiday_notice", label: "Holiday Notice" },
  { value: "circular", label: "Circular" },
  { value: "event", label: "Event" },
  { value: "emergency", label: "Emergency Notice" },
  { value: "exam_announcement", label: "Exam Announcement" },
];

const TARGET_AUDIENCES = [
  { value: "all_students", label: "All Students" },
  { value: "all_teachers", label: "All Teachers" },
  { value: "all_staff", label: "All Staff" },
  { value: "specific_class", label: "Specific Class" },
  { value: "specific_subject", label: "Specific Subject" },
  { value: "entire_school", label: "Entire School" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

function NotificationCreator() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    notification_type: "school_announcement",
    title: "",
    message: "",
    priority: "medium",
    target_audience: "all_students",
    target_class: "",
    target_subject: "",
    expires_at: "",
    send_email: true,
    send_realtime: true,
  });

  const createMutation = useMutation({
    mutationFn: () => notificationApi.create(form),
    onSuccess: () => {
      toast.success("Notification created and sent");
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      setForm(s => ({ ...s, title: "", message: "", expires_at: "" }));
    },
    onError: () => toast.error("Failed to create notification"),
  });

  const handleSubmit = () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    createMutation.mutate();
  };

  const isTeacher = user?.role === "teacher";

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold">Create Notification</h2>
          <p className="text-sm text-muted-foreground">Send announcements and notifications to students and staff</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />New Notification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Notification Type</Label>
                <Select
                  value={form.notification_type}
                  onValueChange={v => setForm(s => ({ ...s, notification_type: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(isTeacher ? NOTIFICATION_TYPES.filter(t => ["assignment_announcement", "subject_announcement", "class_announcement"].includes(t.value)) : NOTIFICATION_TYPES).map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(s => ({ ...s, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
                placeholder="Enter notification title"
              />
            </div>

            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={form.message}
                onChange={e => setForm(s => ({ ...s, message: e.target.value }))}
                rows={5}
                placeholder="Enter your notification message..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  value={form.target_audience}
                  onValueChange={v => setForm(s => ({ ...s, target_audience: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(isTeacher ? TARGET_AUDIENCES.filter(t => ["all_students", "specific_class"].includes(t.value)) : TARGET_AUDIENCES).map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expires At (optional)</Label>
                <Input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={e => setForm(s => ({ ...s, expires_at: e.target.value }))}
                />
              </div>
            </div>

            {form.target_audience === "specific_class" && (
              <div className="space-y-2">
                <Label>Target Class (e.g., X-A)</Label>
                <Input
                  value={form.target_class}
                  onChange={e => setForm(s => ({ ...s, target_class: e.target.value }))}
                  placeholder="X-A"
                />
              </div>
            )}

            {form.target_audience === "specific_subject" && (
              <div className="space-y-2">
                <Label>Target Subject</Label>
                <Input
                  value={form.target_subject}
                  onChange={e => setForm(s => ({ ...s, target_subject: e.target.value }))}
                  placeholder="Mathematics"
                />
              </div>
            )}

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.send_email}
                  onChange={e => setForm(s => ({ ...s, send_email: e.target.checked }))}
                  className="rounded"
                />
                Send Email
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.send_realtime}
                  onChange={e => setForm(s => ({ ...s, send_realtime: e.target.checked }))}
                  className="rounded"
                />
                Real-time Notification
              </label>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="w-full bg-gradient-brand border-0"
            >
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Notification
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/admin/notification/create")({
  head: () => ({ meta: [{ title: "Create Notification" }] }),
  component: NotificationCreator,
});