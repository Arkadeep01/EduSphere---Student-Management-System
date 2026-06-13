import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin } from "lucide-react";
import { events } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Events — Admin" }] }),
  component: () => (
    <>
      <PageHeader title="Events & Holidays" description="Manage school calendar" actions={<Button size="sm" className="bg-gradient-brand border-0"><Plus className="mr-2 h-4 w-4" />New Event</Button>} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(e => (
          <Card key={e.id} className="hover-lift overflow-hidden">
            <div className="h-1 bg-gradient-brand" />
            <CardContent className="p-5">
              <Badge variant="outline">{e.type}</Badge>
              <h3 className="font-semibold text-lg mt-3">{e.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{e.description}</p>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{e.date}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{e.location}</p>
              </div>
              <div className="mt-4 flex gap-2"><Button size="sm" variant="outline" className="flex-1">Edit</Button><Button size="sm" variant="ghost" className="text-destructive">Delete</Button></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  ),
});
