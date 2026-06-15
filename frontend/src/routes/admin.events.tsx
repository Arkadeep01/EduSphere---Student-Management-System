import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Plus, CheckCircle2, Archive, Image } from "lucide-react";
import { eventsFull } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";

const statusBadge: Record<string, { variant: "default" | "secondary" | "outline", className: string }> = {
  draft: { variant: "secondary", className: "" },
  published: { variant: "default", className: "bg-success" },
  archived: { variant: "outline", className: "" },
};

function AdminEventsComponent() {
  const [events, setEvents] = useState(eventsFull);
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState<typeof eventsFull[0] | null>(null);

  const publishEvent = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "published" as const } : e));
    toast.success("Event published");
  };

  const archiveEvent = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "archived" as const } : e));
    toast.success("Event archived");
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    toast.success("Event deleted");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-bold">Events</h2><p className="text-sm text-muted-foreground">{events.filter(e => e.status === "published").length} published · {events.filter(e => e.status === "draft").length} drafts</p></div>
        <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Create Event</Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(e => (
          <Card key={e.id} className="hover-lift overflow-hidden">
            <div className="h-1 bg-gradient-brand" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{e.type}</Badge>
                <Badge variant={statusBadge[e.status].variant} className={statusBadge[e.status].className}>{e.status}</Badge>
              </div>
              <h3 className="font-semibold text-lg mt-2">{e.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{e.description}</p>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{e.date}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{e.location}</p>
              </div>
              {e.banner && <div className="mt-3 rounded-lg overflow-hidden h-20 bg-muted"><img src={e.banner} alt={e.title} className="w-full h-full object-cover" /></div>}
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingEvent(e)}>Edit</Button>
                {e.status === "draft" && <Button size="sm" variant="ghost" className="text-success" onClick={() => publishEvent(e.id)}><CheckCircle2 className="h-4 w-4" /></Button>}
                {e.status === "published" && <Button size="sm" variant="ghost" onClick={() => archiveEvent(e.id)}><Archive className="h-4 w-4" /></Button>}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteEvent(e.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input placeholder="Event title" /></div>
            <div><Label>Description</Label><Textarea placeholder="Event description" rows={3} /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Date</Label><Input type="date" /></div><div><Label>Venue</Label><Input placeholder="Event location" /></div></div>
            <div><Label>Type</Label><select className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm"><option>Academic</option><option>Sports</option><option>Cultural</option><option>Meeting</option><option>Ceremony</option><option>Workshop</option></select></div>
            <div><Label>Banner Image</Label><div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground cursor-pointer"><Image className="h-5 w-5 mx-auto mb-1" /><p>Upload banner image</p></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Event created"); setShowCreate(false); }}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingEvent} onOpenChange={o => { if (!o) setEditingEvent(null); }}>
        <DialogContent><DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input defaultValue={editingEvent?.title} /></div>
            <div><Label>Description</Label><Textarea defaultValue={editingEvent?.description} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Date</Label><Input type="date" defaultValue={editingEvent?.date} /></div><div><Label>Venue</Label><Input defaultValue={editingEvent?.location} /></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditingEvent(null)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Event updated"); setEditingEvent(null); }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Events — Admin" }] }),
  component: AdminEventsComponent,
});
