import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const faqs = [
  ["What are the admission requirements?", "We accept applications for grades 1-12. Each level has age requirements and an entrance assessment."],
  ["What is the fee structure?", "Annual fees range from $2,400 to $9,600 depending on grade. Scholarships are available."],
  ["Do you offer transport?", "Yes, with over 20 routes covering most neighborhoods in the metro area."],
  ["What extracurriculars are available?", "Over 30 clubs spanning robotics, music, sports, debate, and the arts."],
  ["Is there boarding?", "We offer hostel facilities for grades 9-12. Limited seats — early application encouraged."],
  ["How can parents track progress?", "Through the EduSphere parent portal with real-time grades, attendance and announcements."],
];

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — EduSphere" }, { name: "description", content: "Answers to common questions." }] }),
  component: () => (
    <PublicLayout>
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">FAQ</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Frequently asked <span className="text-gradient-brand">questions</span></h1>
        </div>
      </section>
      <section className="py-16 container mx-auto px-4 max-w-3xl">
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map(([q, a], i) => (
            <AccordionItem key={i} value={`f${i}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </PublicLayout>
  ),
});
