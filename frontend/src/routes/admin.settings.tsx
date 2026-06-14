import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: () => (
    <>
      <Tabs defaultValue="general">
        <TabsList><TabsTrigger value="general">General</TabsTrigger><TabsTrigger value="branding">Branding</TabsTrigger><TabsTrigger value="notifications">Notifications</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger></TabsList>
        <TabsContent value="general"><Card><CardContent className="p-6 space-y-4 max-w-2xl">
          <div><Label>School name</Label><Input defaultValue="EduSphere Academy" /></div>
          <div><Label>Admin email</Label><Input defaultValue="admin@edusphere.edu" /></div>
          <div><Label>Academic year</Label><Input defaultValue="2026-27" /></div>
          <Button onClick={() => toast.success("Settings saved")} className="bg-gradient-brand border-0">Save changes</Button>
        </CardContent></Card></TabsContent>
        <TabsContent value="branding"><Card><CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">Customize your school's colors and logo.</p>
          <div className="flex gap-3">{["#4f46e5", "#0891b2", "#f97316", "#10b981"].map(c => <button key={c} className="h-12 w-12 rounded-lg border-2 border-transparent hover:border-foreground" style={{ background: c }} />)}</div>
        </CardContent></Card></TabsContent>
        <TabsContent value="notifications"><Card><CardContent className="p-6 space-y-4">
          {["Email alerts", "Push notifications", "Weekly summary", "Fee reminders"].map(n => <div key={n} className="flex items-center justify-between border-b pb-3"><span className="text-sm">{n}</span><Switch defaultChecked /></div>)}
        </CardContent></Card></TabsContent>
        <TabsContent value="security"><Card><CardContent className="p-6 space-y-4 max-w-2xl">
          <div><Label>Current password</Label><Input type="password" /></div>
          <div><Label>New password</Label><Input type="password" /></div>
          <Button onClick={() => toast.success("Password updated")} className="bg-gradient-brand border-0">Update password</Button>
        </CardContent></Card></TabsContent>
      </Tabs>
    </>
  ),
});
