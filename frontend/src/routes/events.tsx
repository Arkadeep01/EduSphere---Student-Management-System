import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import { usePublicEvents } from "@/lib/usePublicData";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { useState } from "react";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — EduSphere" }, { name: "description", content: "Upcoming events at EduSphere." }] }),
  component: () => {
    const { data: events, isLoading, isError } = usePublicEvents();
    const [filter, setFilter] = useState("all");
    const filtered = events ? (filter === "all" ? events : events.filter((e: Record<string, unknown>) => (e.event_type as string || "").toLowerCase() === filter)) : [];

    return (
      <PublicLayout>
        <section className="bg-hero-glow py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <FadeIn direction="up" delay={0}>
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Events</Badge>
            </FadeIn>
            <FadeIn direction="up" delay={0.15}>
              <h1 className="text-4xl md:text-5xl font-bold">What's happening at <span className="text-gradient-brand">EduSphere</span></h1>
            </FadeIn>
          </div>
        </section>

        <section className="py-16 container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : isError ? (
            <p className="text-center text-muted-foreground py-20">Unable to load events.</p>
          ) : !events || events.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No upcoming events scheduled.</p>
          ) : (
            <>
              <FadeIn className="flex justify-center mb-8">
                <Tabs defaultValue="all" onValueChange={setFilter}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="sports">Sports</TabsTrigger>
                    <TabsTrigger value="cultural">Cultural</TabsTrigger>
                  </TabsList>
                </Tabs>
              </FadeIn>
              <StaggerContainer className="grid md:grid-cols-3 gap-4">
                {filtered.map((e: Record<string, unknown>) => (
                  <StaggerItem key={e.id as string}>
                    <Card className="hover-lift overflow-hidden h-full flex flex-col">
                      <div className="h-2 bg-gradient-brand" />
                      <CardContent className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <Badge variant="outline" className="mb-3">{(e.event_type as string) || "Event"}</Badge>
                          <h3 className="font-semibold text-lg">{e.title as string}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">{(e.description as string) || ""}</p>
                        </div>
                        <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground pt-4 border-t">
                          {(e.date as string) ? <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(e.date as string).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span> : null}
                          {(e.location as string) ? <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{e.location as string}</span> : null}
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </>
          )}
        </section>
      </PublicLayout>
    );
  },
});
