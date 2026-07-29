import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Loader2 } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePublicSubjects } from "@/lib/usePublicData";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/brand/animations";

export const Route = createFileRoute("/courses")({
  head: () => ({ meta: [{ title: "Courses — EduSphere" }, { name: "description", content: "Explore our courses across STEM, humanities, arts, and languages." }] }),
  component: CoursesPage,
});

function CoursesPage() {
  const { data: subjects, isLoading, isError } = usePublicSubjects();
  const [q, setQ] = useState("");
  const [, setTab] = useState("core");
  const filtered = subjects ? subjects.filter((s: Record<string, unknown>) => (s.name as string || "").toLowerCase().includes(q.toLowerCase())) : [];
  const core = filtered.filter((s: Record<string, unknown>) => (s.tier as string || "core") === "core");
  const specialized = filtered.filter((s: Record<string, unknown>) => s.tier === "specialized");
  const enrichment = filtered.filter((s: Record<string, unknown>) => s.tier === "enrichment");

  return (
    <PublicLayout>
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <FadeIn direction="up" delay={0}>
            <h1 className="text-4xl md:text-5xl font-bold">Courses that <span className="text-gradient-brand">spark curiosity</span></h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.15}>
            <p className="mt-4 text-muted-foreground">From core academics to creative arts — find a path that fits.</p>
          </FadeIn>
          <FadeIn direction="up" delay={0.3}>
            <div className="relative mt-8 max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search courses..." value={q} onChange={e => setQ(e.target.value)} />
            </div>
          </FadeIn>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : isError ? (
        <p className="text-center text-muted-foreground py-20">Unable to load courses.</p>
      ) : !subjects || subjects.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No courses available yet.</p>
      ) : (
        <section className="py-12 container mx-auto px-10">
          <Tabs defaultValue="core" onValueChange={setTab}>
            <FadeIn className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="core">Core Subjects</TabsTrigger>
                <TabsTrigger value="specialized">Specialized Programs</TabsTrigger>
                <TabsTrigger value="enrichment">Enrichment</TabsTrigger>
              </TabsList>
            </FadeIn>

            <TabsContent value="core">
              <StaggerContainer className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {core.map((s: Record<string, unknown>) => (
                  <StaggerItem key={s.id as string}>
                    <Card className="hover-lift h-full group rounded-xl border border-border/60 overflow-hidden">
                      <div className="h-2 bg-gradient-brand" />
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="mb-3">Core</Badge>
                        <h3 className="font-semibold text-lg">{s.name as string}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.code as string}</p>
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{(s.description as string) || ""}</p>
                        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {s.tier as string}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </TabsContent>

            <TabsContent value="specialized">
              <StaggerContainer className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {specialized.map((s: Record<string, unknown>) => (
                  <StaggerItem key={s.id as string}>
                    <Card className="hover-lift h-full group rounded-xl border border-border/60 overflow-hidden">
                      <div className="h-2 bg-gradient-brand" />
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="mb-3">Specialized</Badge>
                        <h3 className="font-semibold text-lg">{s.name as string}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.code as string}</p>
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{(s.description as string) || ""}</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </TabsContent>

            <TabsContent value="enrichment">
              <StaggerContainer className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {enrichment.map((s: Record<string, unknown>) => (
                  <StaggerItem key={s.id as string}>
                    <Card className="hover-lift h-full group rounded-xl border border-border/60 overflow-hidden">
                      <div className="h-2 bg-gradient-brand" />
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="mb-3">Enrichment</Badge>
                        <h3 className="font-semibold text-lg">{s.name as string}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.code as string}</p>
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{(s.description as string) || ""}</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </TabsContent>
          </Tabs>
        </section>
      )}
    </PublicLayout>
  );
}
