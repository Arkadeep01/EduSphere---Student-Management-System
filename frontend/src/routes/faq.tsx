import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { publicWebsiteApi } from "@/services/websiteApi";
import type { PublicFAQItem } from "@/services/websiteApi";
import { AlertCircle, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { FadeIn } from "@/components/brand/animations";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — EduSphere" }] }),
  component: FAQPage,
});

function FAQPage() {
  const [faqs, setFaqs] = useState<PublicFAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    publicWebsiteApi.faq()
      .then(setFaqs)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <FadeIn>
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">FAQ</Badge>
            <h1 className="text-4xl md:text-5xl font-bold">Frequently Asked <span className="text-gradient-brand">Questions</span></h1>
            <p className="mt-4 text-muted-foreground">Everything you need to know about EduSphere.</p>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4 max-w-3xl">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <AlertCircle className="h-12 w-12 text-destructive/50" />
            <p className="text-muted-foreground">Unable to load FAQs.</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <HelpCircle className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No FAQs available yet.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    </PublicLayout>
  );
}
