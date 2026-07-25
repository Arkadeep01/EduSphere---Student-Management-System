import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Send, Loader2, Bell } from "lucide-react";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notificationApi } from "@/services/notificationApi";
import { toast } from "sonner";

function TeacherNotificationCreator() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    notification_type: "assignment_announcement",
    title: "",
    message: "",
    priority: "medium",
    target_audience: "specific_class",
    target_class: "",
    expires_at: "",
    send_email: false,
    send_realtime: true,
  });

  const createMutation = useMutation({
    mutationFn: () => notificationApi.create(form),
    onSuccess: () => {
      toast.success("Announcement sent");
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      setForm(s => ({ ...s, title: "", message: "", target_class: "", expires_at: "" }));
    },
    onError: () => toast.error("Failed to send announcement"),
  });

  const handleSubmit = () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (form.target_audience === "specific_class" && !form.target_class.trim()) {
      toast.error("Please specify a target class");
      return;
    }
    createMutation.mutate();
  };

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold">Create Announcement</h2>
          <p className="text-sm text-muted-foreground">Send announcements to your classes and students</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />New Announcement</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.notification_type} onValueChange={v => setForm(s => ({ ...s, notification_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment_announcement">Assignment Announcement</SelectItem>
                    <SelectItem value="subject_announcement">Subject Announcement</SelectItem>
                    <SelectItem value="class_announcement">Class Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(s => ({ ...s, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} placeholder="Announcement title" />
            </div>

            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea value={form.message} onChange={e => setForm(s => ({ ...s, message: e.target.value }))} rows={5} placeholder="Your message..." />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Class (e.g., X-A)</Label>
                <Input value={form.target_class} onChange={e => setForm(s => ({ ...s, target_class: e.target.value }))} placeholder="X-A" />
              </div>
              <div className="space-y-2">
                <Label>Expires At (optional)</Label>
                <Input type="datetime-local" value={form.expires_at} onChange={e => setForm(s => ({ ...s, expires_at: e.target.value }))} />
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full bg-gradient-brand border-0">
              {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Announcement
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/teacher/notification-center/create")({
  head: () => ({ meta: [{ title: "Create Announcement" }] }),
  component: TeacherNotificationCreator,
});