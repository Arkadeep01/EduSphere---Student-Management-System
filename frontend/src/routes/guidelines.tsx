import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Brain, ShieldCheck, Globe2 } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/brand/animations";

export const Route = createFileRoute("/guidelines")({
  head: () => ({
    meta: [
      { title: "Guidelines — EduSphere" },
      {
        name: "description",
        content:
          "Educational philosophy, values, and guiding principles of EduSphere.",
      },
    ],
  }),

  component: () => (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <FadeIn direction="up" delay={0}>
            <Badge
              variant="outline"
              className="mb-4 border-primary/30 text-primary"
            >
              Guidelines
            </Badge>
          </FadeIn>

          <FadeIn direction="up" delay={0.15}>
            <h1 className="text-4xl md:text-5xl font-bold">
              Education Guided by{" "}
              <span className="text-gradient-brand">
                Technology & Values
              </span>
            </h1>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <p className="mt-6 text-lg text-muted-foreground">
              EduSphere combines modern educational innovation with timeless
              principles of responsibility, character, and ethical leadership.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Guidelines */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <StaggerContainer className="grid lg:grid-cols-2 gap-6">
            {/* 1 */}
            <StaggerItem>
              <Card className="rounded-3xl hover-lift h-full">
                <CardContent className="p-8">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <BookOpen className="h-7 w-7 text-primary" />
                  </div>

                  <h2 className="text-2xl font-bold mb-4 text-left">
                    Bridging Technology and Ethics
                  </h2>

                  <p className="text-muted-foreground leading-relaxed text-left">
                    While modern educational frameworks often emphasize technical
                    and material skills, EduSphere recognizes the importance of
                    moral and ethical development. Our platform integrates
                    high-quality science and technology education with a deep
                    understanding of responsibility, integrity, and conscious
                    decision-making, creating a complete educational ecosystem for
                    future-ready citizens.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* 2 */}
            <StaggerItem>
              <Card className="rounded-3xl hover-lift h-full">
                <CardContent className="p-8">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <Brain className="h-7 w-7 text-primary" />
                  </div>

                  <h2 className="text-2xl font-bold mb-4 text-left">
                    Holistic Growth in Formative Years
                  </h2>

                  <p className="text-muted-foreground leading-relaxed text-left">
                    Our objective is to nurture highly educated, purpose-driven
                    students who understand the impact of their actions on society.
                    Through advanced educational technology and personalized
                    learning experiences, EduSphere helps develop analytical,
                    empathetic, and collaborative minds capable of contributing
                    positively to a peaceful global community.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* 3 */}
            <StaggerItem>
              <Card className="rounded-3xl hover-lift h-full">
                <CardContent className="p-8">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <ShieldCheck className="h-7 w-7 text-primary" />
                  </div>

                  <h2 className="text-2xl font-bold mb-4 text-left">
                    Character as a Practical Science
                  </h2>

                  <p className="text-muted-foreground leading-relaxed text-left">
                    Character development is treated as an essential component of
                    education. Through integrated monitoring, mentorship, and
                    student support systems, EduSphere promotes discipline,
                    mindfulness, accountability, respect for others, and positive
                    habits that extend far beyond academic performance.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* 4 */}
            <StaggerItem>
              <Card className="rounded-3xl hover-lift h-full">
                <CardContent className="p-8">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <Globe2 className="h-7 w-7 text-primary" />
                  </div>

                  <h2 className="text-2xl font-bold mb-4 text-left">
                    Preserving Global Heritage
                  </h2>

                  <p className="text-muted-foreground leading-relaxed text-left">
                    EduSphere encourages students to embrace universal ethical
                    principles, cultural awareness, and a strong sense of duty.
                    Inspired by timeless traditions and enduring wisdom, we seek
                    to cultivate responsible global citizens who preserve valuable
                    intellectual and cultural heritage while contributing
                    meaningfully to the future.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>
    </PublicLayout>
  ),
});