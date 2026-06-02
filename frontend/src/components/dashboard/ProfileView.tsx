import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function ProfileView() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="My Profile" description="Manage your account" />
      <Card className="mb-4"><CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Avatar className="h-20 w-20"><AvatarFallback className="bg-gradient-brand text-white text-2xl">{user?.avatarInitials}</AvatarFallback></Avatar>
        <div><h2 className="text-2xl font-bold">{user?.name}</h2><p className="text-muted-foreground">{user?.email}</p><p className="text-sm text-primary capitalize mt-1">{user?.role}</p></div>
      </CardContent></Card>
      <Tabs defaultValue="personal">
        <TabsList><TabsTrigger value="personal">Personal</TabsTrigger><TabsTrigger value="documents">Documents</TabsTrigger><TabsTrigger value="notifications">Notifications</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger></TabsList>
        <TabsContent value="personal"><Card><CardContent className="p-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
          <div><Label>Full name</Label><Input defaultValue={user?.name} /></div>
          <div><Label>Email</Label><Input defaultValue={user?.email} /></div>
          <div><Label>Phone</Label><Input defaultValue="+1 555 0101" /></div>
          <div><Label>Address</Label><Input defaultValue="123 Education Blvd" /></div>
          <div className="sm:col-span-2"><Button onClick={() => toast.success("Profile updated")} className="bg-gradient-brand border-0">Save</Button></div>
        </CardContent></Card></TabsContent>
        <TabsContent value="documents"><Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">No documents uploaded yet.</p><Button variant="outline" className="mt-3">Upload document</Button></CardContent></Card></TabsContent>
        <TabsContent value="notifications"><Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Email & push notification preferences.</p></CardContent></Card></TabsContent>
        <TabsContent value="security"><Card><CardContent className="p-6 space-y-3 max-w-2xl">
          <div><Label>Current password</Label><Input type="password" /></div>
          <div><Label>New password</Label><Input type="password" /></div>
          <Button onClick={() => toast.success("Password changed")} className="bg-gradient-brand border-0">Change password</Button>
        </CardContent></Card></TabsContent>
      </Tabs>
    </>
  );
}
