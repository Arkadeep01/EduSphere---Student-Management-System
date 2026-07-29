import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, Save, Loader2, Eye } from "lucide-react";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { notificationApi, type EmailTemplate } from "@/services/notificationApi";
import { toast } from "sonner";

function EmailTemplatesPage() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EmailTemplate>>({});

  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: () => notificationApi.emailTemplates.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EmailTemplate> }) =>
      notificationApi.emailTemplates.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Template updated");
      setEditMode(false);
    },
    onError: () => toast.error("Failed to update template"),
  });

  const previewMutation = useMutation({
    mutationFn: (id: number) => notificationApi.emailTemplates.preview(id, {
      user_name: "John Doe",
      user_email: "john@example.com",
      title: "Sample Title",
      message: "This is a sample message for preview purposes.",
    }),
    onSuccess: (data) => {
      setPreviewHtml(data.html);
      setShowPreview(true);
    },
  });

  const handleEdit = (tmpl: EmailTemplate) => {
    setSelectedTemplate(tmpl);
    setEditForm({ subject: tmpl.subject, body_html: tmpl.body_html, body_text: tmpl.body_text });
    setEditMode(true);
  };

  const handleSave = () => {
    if (!selectedTemplate || !editForm.subject || !editForm.body_html) {
      toast.error("Subject and HTML body are required");
      return;
    }
    updateMutation.mutate({ id: selectedTemplate.id, data: editForm });
  };

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-sm text-muted-foreground">Manage email notification templates</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(templates || []).map((tmpl: EmailTemplate) => (
              <Card key={tmpl.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      {tmpl.name.replace(/_/g, " ")}
                    </span>
                    <Badge variant={tmpl.is_active ? "default" : "secondary"} className="text-[10px]">
                      {tmpl.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground truncate mb-3">{tmpl.subject}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleEdit(tmpl)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => previewMutation.mutate(tmpl.id)}>
                      <Eye className="mr-1 h-3 w-3" />Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editMode} onOpenChange={setEditMode}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Template: {selectedTemplate?.name?.replace(/_/g, " ")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={editForm.subject || ""}
                  onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>HTML Body</Label>
                <Textarea
                  value={editForm.body_html || ""}
                  onChange={e => setEditForm(f => ({ ...f, body_html: e.target.value }))}
                  rows={12}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label>Plain Text (fallback)</Label>
                <Textarea
                  value={editForm.body_text || ""}
                  onChange={e => setEditForm(f => ({ ...f, body_text: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>Email Preview</DialogTitle></DialogHeader>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 text-xs text-muted-foreground border-b">
                Subject: {selectedTemplate?.subject || "Preview"}
              </div>
              <div className="p-0">
                <iframe
                  srcDoc={previewHtml}
                  title="Email Preview"
                  className="w-full border-0"
                  style={{ height: "400px" }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreview(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/admin/notification/email-templates")({
  head: () => ({ meta: [{ title: "Email Templates" }] }),
  component: EmailTemplatesPage,
});