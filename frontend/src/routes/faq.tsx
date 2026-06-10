import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { faqs } from "@/lib/mock-data";
import { FadeIn } from "@/components/brand/animations";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — EduSphere" }, { name: "description", content: "Answers to common questions." }] }),
  component: () => (
    <PublicLayout>
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <FadeIn direction="up" delay={0}>
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">FAQ</Badge>
          </FadeIn>
          <FadeIn direction="up" delay={0.15}>
            <h1 className="text-4xl md:text-5xl font-bold">Frequently asked <span className="text-gradient-brand">questions</span></h1>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4 max-w-3xl">
        <FadeIn direction="up" delay={0.3}>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map(([q, a], i) => (
              <AccordionItem key={i} value={`f${i}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </section>
    </PublicLayout>
  ),
});