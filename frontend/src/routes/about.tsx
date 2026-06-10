import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  Eye,
  Heart,
  Award,
  Bell,
  Play,
  Star,
  Trophy,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Building2,
  Medal,
  Landmark,
} from "lucide-react";
import { useState, useRef } from "react";
import { Notifications, RANK_STYLES, TOP_STUDENTS, LEADERSHIP, schoolPhilosophy } from "@/lib/mock-data";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/brand/animations";

// ─── Sub-components ───────────────────────────────────────────────────────────
function NotificationMarquee() {
  return (
    <div className="relative bg-primary/10 border-y border-primary/20 overflow-hidden py-2.5">
      <div className="flex items-center gap-3 w-full overflow-hidden">
        <div className="flex-shrink-0 flex items-center gap-2 pl-4 pr-3 border-r border-primary/30">
          <Bell className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary uppercase tracking-widest whitespace-nowrap">
            Notices
          </span>
        </div>
        <div className="overflow-hidden flex-1 px-8">
          <div
            className="flex whitespace-nowrap"
            style={{ animation: "marquee 40s linear infinite" }}
          >
            {[...Notifications, ...Notifications].map((n, i) => (
              <span
                key={i}
                className="text-sm text-foreground/80 font-medium flex-shrink-0"
              >
                {n}
                <span className="px-10 text-primary/40 flex-shrink-0">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function LeadershipCard({ person }: { person: (typeof LEADERSHIP)[0] }) {
  return (
    <div className="group relative h-full flex flex-col items-center text-center">
      {/* Image ring */}
      <div className="relative flex justify-center mb-5 -mt-2">
        <div className="absolute inset-0 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-primary via-brand to-primary/30 p-[3px] scale-105 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
            <div className="h-36 w-36 rounded-full" />
          </div>
        </div>
        <div className="relative h-36 w-36 rounded-full overflow-hidden ring-4 ring-background shadow-xl">
          <img
            src={person.image}
            alt={person.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-gradient-brand rounded-full p-2 shadow-lg">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 w-full min-h-[210px] flex flex-col shadow-md group-hover:shadow-lg group-hover:border-primary/30 transition-all duration-300 hover-lift">
        <Badge className="mb-2 bg-primary/10 text-primary border-primary/20 text-xs mx-auto">
          {person.role}
        </Badge>
        <h3 className="text-lg font-bold text-foreground">{person.name}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{person.dept}</p>
        <div className="mt-3 pt-3 border-t border-border/40 flex-1">
          <p className="text-xs italic text-muted-foreground leading-relaxed">
            "{person.quote}"
          </p>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs text-muted-foreground font-medium">
            {person.exp} experience
          </span>
        </div>
      </div>
    </div>
  );
}

function VideoSection() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setPlaying(true);
    setTimeout(() => {
      videoRef.current?.play();
    }, 100);
  };

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/40 aspect-video group">
              {!playing ? (
                <>
                  {/* Thumbnail */}
                  <img
                    src="/annual-day-thumbnail.avif"
                    alt="Annual Day 2025"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                    <span className="inline-flex w-fit rounded-full bg-white/15 backdrop-blur-md px-4 py-1 text-xs font-medium text-white mb-4">
                      Annual Day 2025
                    </span>

                    <h2 className="text-3xl md:text-5xl font-bold text-white max-w-3xl leading-tight">
                      Celebrating Excellence, Creativity & Student Achievement
                    </h2>

                    <p className="mt-4 text-white/80 max-w-2xl">
                      Watch highlights from our Annual Day celebrations featuring
                      performances, awards, cultural events and unforgettable
                      moments from students across all grades.
                    </p>
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={handlePlay}
                      className="flex items-center justify-center h-20 w-20 rounded-full bg-white/90 hover:bg-white shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer"
                    >
                      <Play className="h-8 w-8 text-primary ml-1 fill-primary" />
                    </button>
                  </div>
                </>
              ) : (
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source
                    src="/media/annual-day-2025.mp4"
                    type="video/mp4"
                  />
                </video>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function TopStudentsSection() {
  const [activeClass, setActiveClass] = useState(1);
  const classes = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <section className="py-20 container mx-auto px-4">
      <FadeIn className="text-center mb-10">
        <Badge variant="outline" className="mb-3 border-primary/30 text-primary">
          Academic Excellence
        </Badge>
        <h2 className="text-3xl font-bold">Top Students</h2>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
          Celebrating the brightest minds from Class I to XII — our school's pride
          and inspiration.
        </p>
      </FadeIn>

      {/* Class selector tabs */}
      <FadeIn className="flex flex-wrap justify-center gap-2 mb-10">
        {classes.map((cls) => (
          <button
            key={cls}
            onClick={() => setActiveClass(cls)}
            className={`h-9 w-9 rounded-lg text-sm font-semibold transition-all duration-200 border cursor-pointer
              ${activeClass === cls
                ? "bg-primary text-white border-primary shadow-md scale-110"
                : "bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
              }`}
          >
            {cls}
          </button>
        ))}
      </FadeIn>

      {/* Student cards */}
      <div className="max-w-3xl mx-auto">
        <FadeIn className="flex items-center justify-between mb-4 px-1">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Class {activeClass} — Top 3 Performers
          </span>
          <Trophy className="h-5 w-5 text-amber-400" />
        </FadeIn>

        {/* We use activeClass as a key to force stagger re-animation on tab change */}
        <StaggerContainer key={activeClass} className="grid grid-cols-3 gap-4">
          {TOP_STUDENTS[activeClass].map((student, idx) => {
            const rs = RANK_STYLES[idx];
            return (
              <StaggerItem key={student.rank}>
                <div
                  className={`relative rounded-2xl overflow-hidden border border-border/50 bg-card shadow-md hover-lift transition-all duration-300 hover:border-primary/30 hover:shadow-lg h-full ${idx === 0 ? "ring-2 ring-amber-400/40" : ""}`}
                >
                  {/* Rank badge */}
                  <div
                    className={`absolute top-3 left-3 z-10 ${rs.bg} ${rs.text} rounded-full h-7 w-7 flex items-center justify-center text-base font-bold shadow`}
                  >
                    {rs.icon}
                  </div>

                  <div className="p-5 pt-4 flex flex-col items-center text-center gap-3">
                    <div
                      className={`mt-4 h-16 w-16 rounded-full overflow-hidden ring-4 ${idx === 0 ? "ring-amber-400/60" : idx === 1 ? "ring-slate-300/60" : "ring-orange-300/60"} shadow`}
                    >
                      <img
                        src={student.image}
                        alt={student.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight min-h-[40px] flex items-center justify-center">
                        {student.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Class {activeClass}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold ${rs.bg} ${rs.text}`}
                    >
                      {student.score}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Navigation arrows */}
        <FadeIn className="flex justify-center gap-3 mt-8">
          <button
            onClick={() => setActiveClass((c) => Math.max(1, c - 1))}
            disabled={activeClass === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-30 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Prev Class
          </button>
          <button
            onClick={() => setActiveClass((c) => Math.min(12, c + 1))}
            disabled={activeClass === 12}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-30 transition-all cursor-pointer"
          >
            Next Class <ChevronRight className="h-4 w-4" />
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — EduSphere" },
      {
        name: "description",
        content:
          "25 years of educational excellence, modern facilities, and outstanding faculty.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background mt-0 mb-0">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-brand/10 blur-3xl" />

        <div className="max-w-8xl mx-auto px-6 lg:px-12 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT CONTENT */}
            <div className="relative z-30">
              <FadeIn direction="up" delay={0}>
                <Badge
                  variant="outline"
                  className="mb-5 border-primary/30 text-primary"
                >
                  About EduSphere
                </Badge>
              </FadeIn>

              <FadeIn direction="up" delay={0.15}>
                <h1 className="text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                  Nurturing Excellence Through{" "}
                  <span className="text-gradient-brand">
                    Education, Character &
                    Values
                  </span>
                </h1>
              </FadeIn>

              <FadeIn direction="up" delay={0.3}>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Founded in 1991, EduSphere has been dedicated
                  to providing quality education rooted in academic excellence,
                  discipline, leadership, and moral values.
                </p>
              </FadeIn>

              <FadeIn direction="up" delay={0.4}>
                <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl">
                  Surrounded by a serene green campus environment, the school
                  empowers students through modern learning facilities,
                  individual attention, and holistic development.
                </p>
              </FadeIn>

              <FadeIn direction="up" delay={0.55}>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button asChild className="bg-gradient-brand text-white border-0">
                    <Link to={"/guidelines" as any}>
                      Guidelines
                    </Link>
                  </Button>

                  <Button asChild variant="outline">
                    <Link to={"/facilities" as any}>
                      View Facilities
                    </Link>
                  </Button>
                </div>
              </FadeIn>
            </div>

            {/* RIGHT VISUAL */}
            <div className="relative h-[650px] flex items-center justify-center">
              <div className="absolute w-[320px] h-[500px] rounded-[40px] bg-primary/10 rotate-[-10deg] translate-x-[-40px] translate-y-[20px] shadow-xl" />

              {/* Main Image Card */}
              <FadeIn direction="right" delay={0.25} className="relative w-[340px] h-[520px] rounded-[40px] overflow-hidden bg-card shadow-[0_40px_100px_rgba(0,0,0,0.18)] border border-border/50 z-20">
                <img
                  src="/students.avif"
                  alt="Students"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white text-left">
                  <p className="text-sm uppercase tracking-widest opacity-80">
                    Since 1991
                  </p>
                  <h3 className="text-2xl font-bold">
                    Inspiring Future Leaders
                  </h3>
                </div>
              </FadeIn>

              {/* Rating Card */}
              <FadeIn direction="up" delay={0.4} className="absolute bottom-24 -left-2 z-30 rounded-2xl bg-background/90 backdrop-blur-xl border shadow-xl px-5 py-4">
                <div className="text-3xl font-bold text-primary">
                  4.8
                </div>
                <p className="text-sm text-muted-foreground">
                  Student Rating
                </p>
              </FadeIn>

              {/* Success Card */}
              <FadeIn direction="up" delay={0.45} className="absolute top-20 -left-10 z-30 rounded-2xl bg-background/90 backdrop-blur-xl border shadow-xl px-5 py-4">
                <div className="text-3xl font-bold text-primary">
                  100%
                </div>
                <p className="text-sm text-muted-foreground">
                  Board Success
                </p>
              </FadeIn>

              {/* Students Card */}
              <FadeIn direction="up" delay={0.5} className="absolute top-10 right-0 z-30 rounded-2xl bg-background/90 backdrop-blur-xl border shadow-xl px-5 py-4">
                <div className="text-3xl font-bold text-primary">
                  3200+
                </div>
                <p className="text-sm text-muted-foreground">
                  Students
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ── MILESTONES ── */}
      <section className="pb-20 pt-10 bg-muted/20 mt-0">
        <div className="container mx-auto px-4">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 justify-center max-w-7xl mx-auto">
            {[
              { icon: Trophy, value: "1991", label: "Founded" },
              { icon: Award, value: "2008", label: "First State Award" },
              { icon: Building2, value: "2015", label: "Smart Campus Launch" },
              { icon: Medal, value: "2024", label: "Top 10 Ranked School" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={i}>
                  <Card className="h-full max-w-[300px] border-border/60 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl w-full mx-auto">
                    <CardContent className="flex items-center gap-5 p-8">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <div className="text-4xl font-extrabold text-primary leading-none">
                          {item.value}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.label}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ── NOTIFICATION MARQUEE ── */}
      <NotificationMarquee />

      {/* ── MISSION / VISION / VALUES ── */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <FadeIn className="text-center mb-14">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              What Defines EduSphere
            </Badge>
            <h2 className="text-4xl font-bold">
              Education Beyond the Classroom
            </h2>
          </FadeIn>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Purpose */}
            <FadeIn direction="left" className="lg:col-span-2">
              <Card className="rounded-[32px] overflow-hidden border-0 bg-gradient-brand text-white h-full">
                <CardContent className="p-10">
                  <Target className="h-12 w-12 mb-6" />
                  <h3 className="text-3xl font-bold mb-4">
                    {schoolPhilosophy.purpose.title}
                  </h3>
                  <p className="text-white/90 leading-relaxed mb-8">
                    {schoolPhilosophy.purpose.intro}
                  </p>
                  <div className="space-y-5">
                    {schoolPhilosophy.purpose.points.map((item) => (
                      <div
                        key={item.title}
                        className="border-l-2 border-white/30 pl-4"
                      >
                        <h4 className="font-semibold text-white">
                          {item.title}
                        </h4>
                        <p className="text-sm text-white/80 mt-1">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Approach, Foundations, Pillars */}
            <StaggerContainer className="lg:col-span-3 flex flex-col gap-6">
              <StaggerItem>
                <Card className="rounded-[28px] hover-lift h-full">
                  <CardContent className="p-8">
                    <div className="flex gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Eye className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-3 text-left">
                          {schoolPhilosophy.approach.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-left">
                          {schoolPhilosophy.approach.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="rounded-[28px] hover-lift">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Heart className="h-7 w-7 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-bold">
                          {schoolPhilosophy.foundations.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {schoolPhilosophy.foundations.description}
                        </p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {schoolPhilosophy.foundations.items.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-center font-medium"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="rounded-[32px] border-border/50 shadow-md overflow-hidden hover-lift">
                  <CardContent className="p-8">
                    <div className="flex gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Landmark className="h-7 w-7 text-primary" />
                      </div>
                      <div className="mb-8 text-left">
                        <h3 className="text-2xl font-bold">
                          {schoolPhilosophy.pillars.title}
                        </h3>
                        <p className="mt-2 text-muted-foreground">
                          {schoolPhilosophy.pillars.intro}
                        </p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {schoolPhilosophy.pillars.pillars.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-center font-medium"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP ── */}
      <section className="py-20 container mx-auto px-4">
        <FadeIn className="text-center mb-12">
          <Badge
            variant="outline"
            className="mb-3 border-primary/30 text-primary"
          >
            Meet Our Leaders
          </Badge>
          <h2 className="text-3xl font-bold">
            The People Behind <span className="text-gradient-brand">EduSphere</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Guided by experienced visionaries who have dedicated their careers to
            transforming education.
          </p>
        </FadeIn>
        <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {LEADERSHIP.map((person) => (
            <StaggerItem key={person.name}>
              <LeadershipCard person={person} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ── VIDEO ── */}
      <VideoSection />

      {/* ── TOP STUDENTS ── */}
      <TopStudentsSection />
    </PublicLayout>
  );
}