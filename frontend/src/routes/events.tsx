import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin } from "lucide-react";
import { events } from "@/lib/mock-data";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/brand/animations";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — EduSphere" }, { name: "description", content: "Upcoming events at EduSphere." }] }),
  component: () => (
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
        <Tabs defaultValue="all">
          <FadeIn className="flex justify-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Academic">Academic</TabsTrigger>
              <TabsTrigger value="Sports">Sports</TabsTrigger>
              <TabsTrigger value="Cultural">Cultural</TabsTrigger>
            </TabsList>
          </FadeIn>

          {["all", "Academic", "Sports", "Cultural"].map(t => (
            <TabsContent key={t} value={t}>
              <StaggerContainer key={t} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {events.filter(e => t === "all" || e.type === t).map(e => (
                  <StaggerItem key={e.id}>
                    <Card className="hover-lift overflow-hidden h-full flex flex-col justify-between">
                      <div>
                        <div className="h-2 bg-gradient-brand" />
                        <CardContent className="p-6">
                          <Badge variant="outline">{e.type}</Badge>
                          <h3 className="font-semibold text-lg mt-3">{e.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{e.description}</p>
                        </CardContent>
                      </div>

                      <div className="px-6 pb-6 mt-auto">
                        <div className="space-y-1 text-sm text-muted-foreground pt-4 border-t">
                          <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(e.date).toDateString()}</p>
                          <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{e.location}</p>
                        </div>
                        <Button size="sm" className="mt-4 w-full" variant="outline">Add to calendar</Button>
                      </div>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </PublicLayout>
  ),
});
