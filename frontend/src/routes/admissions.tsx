import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, FileText, ClipboardCheck, Users, BookOpen, CreditCard, Clock, Calendar, CheckCircle2, ChevronRight } from "lucide-react";
import { documentsList, importantDates, admissionInfo } from "@/lib/mock-data";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/brand/animations";

export const admissionSteps = [
  {
    icon: <ClipboardCheck className="h-6 w-6" />,
    title: "Online Registration",
    description:
      "Fill out the online application form with your personal and academic details. Create your applicant profile to get started.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Document Upload",
    description:
      "Upload scanned copies of all required documents including mark sheets, certificates, and identification proof.",
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Application Fee",
    description:
      "Pay the non-refundable application fee of $50 through our secure online payment gateway.",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Entrance Examination",
    description:
      "Appear for the scheduled entrance exam covering general aptitude and subject-specific knowledge.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Personal Interview",
    description:
      "Shortlisted candidates will be invited for a personal interview with the admissions panel.",
  },
  {
    icon: <GraduationCap className="h-6 w-6" />,
    title: "Final Admission",
    description:
      "Receive your admission letter and complete enrollment by paying the first semester tuition fee.",
  },
];

export const quickInfo = [
  {
    icon: <Clock className="h-5 w-5" />,
    label: "Processing Time",
    value: "2–3 Weeks",
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    label: "Application Fee",
    value: "$50 (Non-refundable)",
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "Intake Capacity",
    value: "240 Students",
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    label: "Programs Offered",
    value: "12 Courses",
  },
];

export const Route = createFileRoute("/admissions")({
  head: () => ({ meta: [{ title: "Admissions — EduSphere" }, { name: "description", content: "Apply for admission. Simple 3-step process for the 2026-27 academic year." }] }),
  component: AdmissionsPage,
});

function AdmissionsPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-glow py-28">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="container mx-auto px-4 text-center max-w-5xl relative">
          <FadeIn direction="up" delay={0}>
            <Badge
              variant="outline"
              className="mb-5 border-primary/30 text-primary"
            >
              Admissions Open 2026–27
            </Badge>
          </FadeIn>

          <FadeIn direction="up" delay={0.15}>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Begin Your Child's
              <span className="block text-gradient-brand">
                Learning Journey
              </span>
            </h1>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Join a school that combines academic excellence, character development,
              technology-driven learning, and holistic growth to prepare students for
              a successful future.
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.45}>
            <Button size="lg" className="mt-10 bg-gradient-brand border-0">
              <Link to={"/admissionForms" as any}>
                Apply For Admission
              </Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* Quick Info */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickInfo.map((item) => (
              <StaggerItem key={item.label}>
                <div className="text-center group">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {item.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-primary mt-3">
                    {item.value}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.label}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Admission Procedure */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Step by Step
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Admission Procedure
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Follow these simple steps to complete your application. Our team
              is here to assist you at every stage.
            </p>
          </FadeIn>

          <div className="mt-16">
            <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {admissionSteps.map((step, index) => (
                <StaggerItem key={step.title}>
                  <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:-translate-y-1">
                    <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {step.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Documents Required */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeIn direction="left">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Be Prepared
                </span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Documents Required
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Please ensure you have the following documents ready in
                  digital format (PDF/JPG, max 2MB each) before starting your
                  application.
                </p>
                <div className="mt-8 rounded-2xl border border-border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                    <Calendar className="h-5 w-5 text-primary" />
                    Important Dates
                  </h3>
                  <div className="space-y-3">
                    {importantDates.map((item) => (
                      <div
                        key={item.event}
                        className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {item.event}
                        </span>
                        <span className="text-sm text-primary font-semibold">
                          {item.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.15}>
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <FileText className="h-5 w-5 text-primary" />
                  Checklist
                </h3>
                <ul className="space-y-4">
                  {documentsList.map((doc) => (
                    <li
                      key={doc}
                      className="flex items-start gap-3 text-sm text-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/20">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>Note:</strong> All documents must be attested by a
                    gazetted officer or the issuing institution. Incomplete
                    applications will not be processed.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Eligibility & Other Info */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Good to Know
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Other Information
            </h2>
          </FadeIn>

          <StaggerContainer className="mt-16 grid gap-8 md:grid-cols-3">
            {admissionInfo.map((section) => (
              <StaggerItem key={section.title}>
                <div className="rounded-2xl border border-border bg-card p-6 h-full">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${section.color === "emerald"
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : section.color === "blue"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                        : "bg-violet-100 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400"
                      }`}
                  >
                    {section.icon === "eligibility" && (
                      <CheckCircle2 className="h-6 w-6" />
                    )}

                    {section.icon === "fees" && (
                      <GraduationCap className="h-6 w-6" />
                    )}

                    {section.icon === "reservation" && (
                      <Users className="h-6 w-6" />
                    )}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {section.title}
                  </h3>

                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2"
                      >
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Why EduSphere */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <Badge variant="outline">
              Why EduSphere
            </Badge>

            <h2 className="text-4xl font-bold mt-4">
              More Than Just Academics
            </h2>
          </FadeIn>

          <StaggerContainer className="grid lg:grid-cols-3 gap-8">
            <StaggerItem>
              <Card className="rounded-[32px] hover-lift h-full">
                <CardContent className="p-8">
                  <BookOpen className="h-10 w-10 text-primary mb-5" />
                  <h3 className="text-xl font-bold">
                    Academic Excellence
                  </h3>
                  <p className="mt-3 text-muted-foreground">
                    Strong curriculum designed for future readiness.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="rounded-[32px] hover-lift h-full">
                <CardContent className="p-8">
                  <Users className="h-10 w-10 text-primary mb-5" />
                  <h3 className="text-xl font-bold">
                    Character Development
                  </h3>
                  <p className="mt-3 text-muted-foreground">
                    Values, discipline and leadership beyond the classroom.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="rounded-[32px] hover-lift h-full">
                <CardContent className="p-8">
                  <GraduationCap className="h-10 w-10 text-primary mb-5" />
                  <h3 className="text-xl font-bold">
                    Future Focused
                  </h3>
                  <p className="mt-3 text-muted-foreground">
                    Technology-enabled learning and innovation driven education.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>
    </PublicLayout>
  );
}
