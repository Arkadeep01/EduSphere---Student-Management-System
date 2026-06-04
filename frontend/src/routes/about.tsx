import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Heart, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — EduSphere" }, { name: "description", content: "25 years of educational excellence, modern facilities, and outstanding faculty." }] }),
  component: () => (
    <PublicLayout>
      <section className="bg-hero-glow py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">About EduSphere</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Shaping curious minds since <span className="text-gradient-brand">2001</span></h1>
          <p className="mt-6 text-lg text-muted-foreground">For 25 years, EduSphere has nurtured students into thoughtful, creative, and confident leaders.</p>
        </div>
      </section>
      <section className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { i: Target, t: "Our Mission", d: "Deliver world-class education that empowers every student to reach their potential." },
            { i: Eye, t: "Our Vision", d: "Be the most innovative learning community shaping global citizens." },
            { i: Heart, t: "Our Values", d: "Integrity, curiosity, empathy, and excellence in everything we do." },
          ].map(v => (
            <Card key={v.t} className="hover-lift"><CardContent className="p-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-brand flex items-center justify-center mb-4"><v.i className="h-6 w-6 text-white" /></div>
              <h3 className="text-xl font-semibold">{v.t}</h3>
              <p className="mt-2 text-muted-foreground">{v.d}</p>
            </CardContent></Card>
          ))}
        </div>
      </section>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Milestones</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[["2001", "Founded"], ["2008", "First state award"], ["2015", "Smart campus"], ["2024", "Top 10 ranked"]].map(([y, t]) => (
              <Card key={y} className="text-center hover-lift"><CardContent className="p-6">
                <Award className="h-8 w-8 mx-auto text-brand" />
                <div className="text-3xl font-bold mt-3 text-gradient-brand">{y}</div>
                <p className="text-sm text-muted-foreground mt-1">{t}</p>
              </CardContent></Card>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  ),
});
