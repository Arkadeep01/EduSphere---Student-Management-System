import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { teachers } from "@/lib/mock-data";

export const Route = createFileRoute("/teachers")({
  head: () => ({ meta: [{ title: "Faculty — EduSphere" }, { name: "description", content: "Meet our world-class educators." }] }),
  component: () => (
    <PublicLayout>
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Our Faculty</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Educators who <span className="text-gradient-brand">inspire</span></h1>
        </div>
      </section>
      <section className="py-16 container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teachers.map(t => (
            <Card key={t.id} className="hover-lift overflow-hidden">
              <div className="h-28 bg-gradient-brand opacity-90" />
              <CardContent className="p-5 -mt-10">
                <Avatar className="h-16 w-16 border-4 border-card"><AvatarFallback className="bg-primary text-primary-foreground">{t.name.split(" ").map(s => s[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
                <h3 className="mt-3 font-semibold">{t.name}</h3>
                <p className="text-sm text-muted-foreground">{t.subject}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t.experience} yrs</span>
                  <span className="flex items-center gap-1 text-sm"><Star className="h-3 w-3 fill-warning text-warning" /> {t.rating}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  ),
});
