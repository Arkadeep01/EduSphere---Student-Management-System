import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Plus, CheckCircle2, Archive, Image } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { request } from "@/services/request";

interface EventItem {
  id: number;
  title: string;
  description: string;
  event_type: string;
  date: string;
  venue: string;
  location: string;
  status: string;
  banner: string | null;
}

const statusBadge: Record<string, { variant: "default" | "secondary" | "outline"; className: string }> = {
  draft: { variant: "secondary", className: "" },
  published: { variant: "default", className: "bg-success" },
  archived: { variant: "outline", className: "" },
};

function AdminEventsComponent() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", venue: "", event_type: "academic" });
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const data = await request<EventItem[]>("/events/");
      setEvents(data || []);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const publishEvent = async (id: number) => {
    try {
      await request(`/events/${id}/publish/`, { method: "POST" });
      toast.success("Event published");
      fetchEvents();
    } catch { toast.error("Failed to publish event"); }
  };

  const archiveEvent = async (id: number) => {
    try {
      await request(`/events/${id}/archive/`, { method: "POST" });
      toast.success("Event archived");
      fetchEvents();
    } catch { toast.error("Failed to archive event"); }
  };

  const deleteEvent = async (id: number) => {
    try {
      await request(`/events/${id}/`, { method: "DELETE" });
      toast.success("Event deleted");
      fetchEvents();
    } catch { toast.error("Failed to delete event"); }
  };

  const handleCreate = async () => {
    if (!form.title || !form.date) { toast.error("Title and date are required"); return; }
    try {
      await request("/events/", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          date: form.date,
          venue: form.venue,
          event_type: form.event_type,
        }),
      });
      toast.success("Event created");
      setShowCreate(false);
      setForm({ title: "", description: "", date: "", venue: "", event_type: "academic" });
      fetchEvents();
    } catch { toast.error("Failed to create event"); }
  };

  const handleUpdate = async () => {
    if (!editingEvent) return;
    try {
      await request(`/events/${editingEvent.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editingEvent.title,
          description: editingEvent.description,
          date: editingEvent.date,
          venue: editingEvent.venue,
        }),
      });
      toast.success("Event updated");
      setEditingEvent(null);
      fetchEvents();
    } catch { toast.error("Failed to update event"); }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading events...</div>;
  }

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
                <Badge variant="outline">{e.event_type || e.event_type}</Badge>
                <Badge variant={statusBadge[e.status]?.variant || "secondary"} className={statusBadge[e.status]?.className || ""}>{e.status}</Badge>
              </div>
              <h3 className="font-semibold text-lg mt-2">{e.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{e.description}</p>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{e.date}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{e.venue || e.location}</p>
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
            <div className="space-y-2"><Label>Title</Label><Input placeholder="Event title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Event description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div><div className="space-y-2"><Label>Venue</Label><Input placeholder="Event location" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} /></div></div>
            <div className="space-y-2"><Label>Type</Label>
              <Select value={form.event_type} onValueChange={v => setForm({ ...form, event_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="ceremony">Ceremony</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingEvent} onOpenChange={o => { if (!o) setEditingEvent(null); }}>
        <DialogContent><DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Title</Label><Input value={editingEvent?.title || ""} onChange={e => setEditingEvent(prev => prev ? { ...prev, title: e.target.value } : null)} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={editingEvent?.description || ""} onChange={e => setEditingEvent(prev => prev ? { ...prev, description: e.target.value } : null)} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Date</Label><Input type="date" value={editingEvent?.date || ""} onChange={e => setEditingEvent(prev => prev ? { ...prev, date: e.target.value } : null)} /></div><div className="space-y-2"><Label>Venue</Label><Input value={editingEvent?.venue || ""} onChange={e => setEditingEvent(prev => prev ? { ...prev, venue: e.target.value } : null)} /></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditingEvent(null)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={handleUpdate}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Events — Admin" }] }),
  component: AdminEventsComponent,
});
