import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Clock, Users } from "lucide-react";
import { subjects } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/courses")({
  head: () => ({ meta: [{ title: "Courses — EduSphere" }, { name: "description", content: "Explore 50+ courses across STEM, humanities, arts, and languages." }] }),
  component: CoursesPage,
});

function CoursesPage() {
  const [q, setQ] = useState("");
  const filtered = subjects.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <PublicLayout>
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Courses that <span className="text-gradient-brand">spark curiosity</span></h1>
          <p className="mt-4 text-muted-foreground">From core academics to creative arts — find a path that fits.</p>
          <div className="relative mt-8 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search courses..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
      </section>
      <section className="py-12 container mx-auto px-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <Card key={s.id}  className="hover-lift overflow-hidden p-0 gap-0">
              <div className={`h-32 bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <BookOpen className="h-12 w-12 text-white/80" />
              </div>
              <CardContent className="p-5">
                <Badge variant="secondary">{s.code}</Badge>
                <h3 className="font-semibold text-lg mt-2">{s.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">By {s.teacher}</p>
                <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />4 modules</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />32 students</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="col-span-full text-center text-muted-foreground py-10">No courses found.</p>}
        </div>
      </section>
    </PublicLayout>
  );
}
