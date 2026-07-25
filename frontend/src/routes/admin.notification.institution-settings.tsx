import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Settings, Save, Loader2, Upload } from "lucide-react";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notificationApi, type InstitutionSettings } from "@/services/notificationApi";
import { toast } from "sonner";

function InstitutionSettingsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Partial<InstitutionSettings>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["institution-settings"],
    queryFn: () => notificationApi.institutionSettings.get(),
    onSuccess: (d) => setSettings(d as InstitutionSettings),
  } as any);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<InstitutionSettings>) => notificationApi.institutionSettings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution-settings"] });
      toast.success("Settings saved");
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Institution Settings</h2>
            <p className="text-sm text-muted-foreground">Configure your institution branding and contact details</p>
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Settings
          </Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Institution Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institution Name</Label>
                    <Input value={settings.institution_name || ""} onChange={e => setSettings(s => ({ ...s, institution_name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Principal Name</Label>
                    <Input value={settings.principal_name || ""} onChange={e => setSettings(s => ({ ...s, principal_name: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea value={settings.address || ""} onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Email Footer</Label>
                  <Textarea value={settings.email_footer || ""} onChange={e => setSettings(s => ({ ...s, email_footer: e.target.value }))} rows={2} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Brand Colors</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={settings.brand_color_primary || "#2563eb"} onChange={e => setSettings(s => ({ ...s, brand_color_primary: e.target.value }))} className="w-12 p-1" />
                    <Input value={settings.brand_color_primary || ""} onChange={e => setSettings(s => ({ ...s, brand_color_primary: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={settings.brand_color_secondary || "#1e40af"} onChange={e => setSettings(s => ({ ...s, brand_color_secondary: e.target.value }))} className="w-12 p-1" />
                    <Input value={settings.brand_color_secondary || ""} onChange={e => setSettings(s => ({ ...s, brand_color_secondary: e.target.value }))} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={settings.phone || ""} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={settings.email || ""} onChange={e => setSettings(s => ({ ...s, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={settings.website || ""} onChange={e => setSettings(s => ({ ...s, website: e.target.value }))} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Social Media Links</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input value={settings.facebook || ""} onChange={e => setSettings(s => ({ ...s, facebook: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Twitter</Label>
                  <Input value={settings.twitter || ""} onChange={e => setSettings(s => ({ ...s, twitter: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input value={settings.instagram || ""} onChange={e => setSettings(s => ({ ...s, instagram: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input value={settings.linkedin || ""} onChange={e => setSettings(s => ({ ...s, linkedin: e.target.value }))} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/admin/notification/institution-settings")({
  head: () => ({ meta: [{ title: "Institution Settings" }] }),
  component: InstitutionSettingsPage,
});