import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin } from "lucide-react";
import { events } from "@/lib/mock-data";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — EduSphere" }, { name: "description", content: "Upcoming events at EduSphere." }] }),
  component: () => (
    <PublicLayout>
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Events</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">What's happening at <span className="text-gradient-brand">EduSphere</span></h1>
        </div>
      </section>
      <section className="py-16 container mx-auto px-4">
        <Tabs defaultValue="all">
          <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="Academic">Academic</TabsTrigger><TabsTrigger value="Sports">Sports</TabsTrigger><TabsTrigger value="Cultural">Cultural</TabsTrigger></TabsList>
          {["all", "Academic", "Sports", "Cultural"].map(t => (
            <TabsContent key={t} value={t}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {events.filter(e => t === "all" || e.type === t).map(e => (
                  <Card key={e.id} className="hover-lift overflow-hidden">
                    <div className="h-2 bg-gradient-brand" />
                    <CardContent className="p-6">
                      <Badge variant="outline">{e.type}</Badge>
                      <h3 className="font-semibold text-lg mt-3">{e.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{e.description}</p>
                      <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(e.date).toDateString()}</p>
                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{e.location}</p>
                      </div>
                      <Button size="sm" className="mt-4 w-full" variant="outline">Add to calendar</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </PublicLayout>
  ),
});
