/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GraduationCap, BookOpen, Users, ArrowRight, ChevronLeft, ChevronRight, Sparkles, Calendar, MapPin, Star, Quote, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { stats, teachers, students, events, testimonials, galleryImages, faqs, feedbacks } from "@/lib/mock-data";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/brand/animations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduSphere — Modern Student Management System" },
      { name: "description", content: "Empowering education with intelligent dashboards, real-time analytics, and seamless collaboration between students, teachers, and administrators." },
    ],
  }),
  component: Index,
});

function Index() {
  return <PublicLayout><HomePage /></PublicLayout>;
}

function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const dur = 1200, start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.floor(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end]);
  return <span>{n.toLocaleString()}{suffix}</span>;
}

function FeedbackSlider() {
  const [idx, setIdx] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);

  const go = (d: 1 | -1) => {
    if (flipping) return;
    setDir(d);
    setFlipping(true);
    setTimeout(() => {
      setIdx(p => (p + d + feedbacks.length) % feedbacks.length);
      setFlipping(false);
    }, 300);
  };

  useEffect(() => {
    const t = setInterval(() => go(1), 5000);
    return () => clearInterval(t);
  }, [flipping]);

  const fb = feedbacks[idx];

  return (
    <div className="flex flex-col gap-5">
      <div style={{ perspective: "900px" }}>
        <div
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.30s cubic-bezier(0.4,0,0.2,1)",
            transform: flipping ? `rotateY(${dir === 1 ? -90 : 90}deg)` : "rotateY(0deg)",
          }}
        >
          <Card>
            <CardContent className="p-6 flex flex-col gap-4" style={{ minHeight: "200px" }}>
              <Quote className="h-7 w-7 text-primary/30" />
              <p className="text-sm leading-relaxed flex-1">"{fb.quote}"</p>
              <div className="flex items-center gap-3 pt-3 border-t">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-brand text-primary-foreground text-xs font-semibold">
                    {fb.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{fb.author}</p>
                  <p className="text-xs text-muted-foreground">{fb.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          {feedbacks.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (i === idx) return;
                setDir(i > idx ? 1 : -1);
                setFlipping(true);
                setTimeout(() => { setIdx(i); setFlipping(false); }, 300);
              }}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === idx ? "24px" : "8px",
                height: "8px",
                background: i === idx ? "hsl(var(--primary))" : "hsl(var(--border))",
              }}
              aria-label={`Feedback ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => go(-1)} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" className="h-9 w-9 rounded-full" onClick={() => go(1)} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-137.5 overflow-hidden">
        <img src="/campus-image.jpg" alt="Campus" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container mx-auto px-6 h-full flex items-center max-w-7xl">
          <div className="max-w-xl text-white">
            <FadeIn direction="up" delay={0}>
              <p className="uppercase tracking-widest mb-2 text-primary font-semibold">
                EduSphere University
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={0.15}>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Together We'll Explore New Things
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={0.3}>
              <p className="mt-6 text-lg text-white/90">
                We believe everyone should have the opportunity
                to create progress through technology and education.
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={0.45}>
              <div className="flex gap-4">
                <Button className="mt-5" asChild>
                  <Link to={"/courses" as any}>Read Courses</Link>
                </Button>
                <Button className="mt-5 text-muted-foreground" variant="outline" asChild>
                  <Link to={"/guidelines" as any}>Guidelines</Link>
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Achievements / strip */}
      <section className="relative -mt-5 z-20">
        <div className="container mx-auto px-4">
          <StaggerContainer className="grid md:grid-cols-3 bg-card text-card-foreground shadow-xl rounded-lg border overflow-hidden">
            <StaggerItem>
              <div className="p-8 border-r h-full hover:bg-muted/30 transition-colors">
                <GraduationCap className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg">
                  Admission Open
                </h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Applications for 2026 are now open.
                </p>
                <Link to="/admissions" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                  Learn More →
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="p-8 border-r h-full hover:bg-muted/30 transition-colors">
                <BookOpen className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg">
                  Academic Programs
                </h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Undergraduate and postgraduate programs.
                </p>
                <Link to="/courses" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                  Learn More →
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="p-8 h-full hover:bg-muted/30 transition-colors">
                <Users className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg">
                  Student Facilities
                </h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Library, Laboratories and support.
                </p>
                <Link to={"/facilities" as any} className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                  Learn More →
                </Link>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left" className="flex justify-center">
              <div className="relative w-full max-w-130 px-6 py-8">
                {/* Large Background Circle & Nested Circle */}
                <div className="absolute -bottom-6 -left-6 sm:-bottom-12 sm:-left-28 w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-primary/20 dark:border-primary/10 -z-10 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border border-brand/30 dark:border-brand/20" />
                </div>

                {/* Small solid accent dots */}
                <div className="absolute top-1/4 -right-2 w-3 h-3 rounded-full bg-primary/60 pointer-events-none animate-pulse" />
                <div className="absolute bottom-24 -left-8 w-4 h-4 rounded-full bg-brand/50 pointer-events-none z-20" />

                {/* Collage Layout */}
                <div className="flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                  {/* Left Column (two small images stacked in a masonry layout) */}
                  <div className="sm:col-span-5 flex flex-col gap-6 w-full order-last sm:order-0">
                    {/* Top Small Image */}
                    <div className="relative group overflow-hidden rounded-3xl shadow-xl aspect-9/5 w-full sm:w-[155%] -ml-14 z-10">
                      <img
                        src="/Colleagues.avif"
                        alt="Students collaborating"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                    {/* Bottom Small Image */}
                    <div className="relative group overflow-hidden rounded-3xl shadow-xl aspect-2/3 w-[95%] sm:w-[120%] sm:-ml-8 z-10 sm:translate-y-4">
                      <img
                        src="/group.avif"
                        alt="University campus"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>

                  {/* Right Column (large featured image) */}
                  <div className="sm:col-span-7 relative">
                    {/* Accent Circle */}
                    <div className="absolute -top-8 -right-8 z-30 pointer-events-none">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-[5px] border-primary border-l-transparent" />
                        <div className="absolute inset-2 rounded-full border-[5px] border-primary border-l-transparent" />
                      </div>
                    </div>
                    <div className="sm:col-span-7 relative group overflow-hidden rounded-2xl shadow-xl w-full h-70 sm:h-87.5 md:h-100">
                      <img
                        src="/featuredStudent.avif"
                        alt="Featured student"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div>
                <span className="text-primary font-semibold">
                  About EduSphere
                </span>

                <h2 className="text-5xl font-bold mt-4">
                  Admissions For Various Academic Disciplines
                </h2>

                <p className="mt-6 text-muted-foreground">
                  We provide quality education through innovative
                  teaching methods and modern facilities.
                </p>

                <ul className="space-y-4 mt-8">
                  <li>✓ Access to all courses</li>
                  <li>✓ Learn the best skills</li>
                  <li>✓ Placement assistance</li>
                  <li>✓ Industry-ready curriculum</li>
                </ul>

                <Button className="mt-8" asChild>
                  <Link to={"/admissions" as any}>Read More</Link>
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-card text-card-foreground rounded-md shadow-sm border">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4">
              <StaggerItem>
                <div className="flex items-center gap-3 p-6 border-r h-full">
                  <Trophy className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      <Counter end={stats.students} />+
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Students Enrolled
                    </p>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="flex items-center gap-3 p-6 border-r h-full">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      <Counter end={stats.teachers} />+
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qualified Teachers
                    </p>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="flex items-center gap-3 p-6 border-r h-full">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      <Counter end={stats.subjects} />+
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Subjects Offered
                    </p>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="flex items-center gap-3 p-6 h-full">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      <Counter end={stats.classes} />+
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Academic Classes
                    </p>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Featured teachers */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <FadeIn className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-3">Our People</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Featured Faculty</h2>
              <p className="mt-2 text-muted-foreground">Educators who inspire, mentor and lead.</p>
            </div>
            <Button asChild variant="ghost"><Link to={"/teachers" as any}>View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </FadeIn>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teachers.slice(0, 4).map((t) => (
              <StaggerItem key={t.id}>
                <Card className="hover-lift overflow-hidden h-full">
                  <div className="h-32 bg-gradient-brand opacity-90" />
                  <CardContent className="p-5 -mt-10">
                    <Avatar className="h-16 w-16 border-4 border-card">
                      <AvatarFallback className="bg-primary text-primary-foreground">{t.name.split(" ").map(s => s[0]).slice(0, 2).join("")}</AvatarFallback>
                    </Avatar>
                    <h3 className="mt-3 font-semibold">{t.name}</h3>
                    <p className="text-sm text-muted-foreground">{t.subject}</p>
                    <div className="mt-3 flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-warning text-warning" /> {t.rating} · {t.experience} yrs
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Top students */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <FadeIn>
            <Badge variant="secondary" className="mb-3">Achievers</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-10">Top Performing Students</h2>
          </FadeIn>
          <StaggerContainer className="grid md:grid-cols-3 gap-4">
            {students.slice(0, 3).map((s, i) => (
              <StaggerItem key={s.id}>
                <Card className="hover-lift h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16"><AvatarFallback className="bg-gradient-brand text-white text-lg">{s.name.split(" ").map(x => x[0]).join("")}</AvatarFallback></Avatar>
                      <Badge className="absolute -bottom-1 -right-1 bg-warning text-warning-foreground">#{i + 1}</Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold">{s.name}</h3>
                      <p className="text-sm text-muted-foreground">Class {s.class}</p>
                      <p className="text-sm mt-1">GPA <span className="font-semibold text-primary">{s.gpa}</span></p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Events */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <FadeIn className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-3">What's Happening</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Upcoming Events</h2>
            </div>
            <Button asChild variant="ghost"><Link to={"/events" as any}>All events <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </FadeIn>
          <StaggerContainer className="grid md:grid-cols-3 gap-4">
            {events.slice(0, 3).map(e => (
              <StaggerItem key={e.id}>
                <Card className="hover-lift overflow-hidden h-full flex flex-col">
                  <div className="h-2 bg-gradient-brand" />
                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <Badge variant="outline" className="mb-3">{e.type}</Badge>
                      <h3 className="font-semibold text-lg">{e.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>
                    </div>
                    <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground pt-4 border-t">
                      <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(e.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
                      <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{e.location}</span>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <FadeIn>
            <Badge variant="secondary" className="mb-3">World-class</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-10">Our Facilities</h2>
          </FadeIn>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { t: "Smart Classrooms", d: "Interactive whiteboards & AV systems" },
              { t: "STEM Labs", d: "Physics, Chemistry, Biology, Robotics" },
              { t: "Digital Library", d: "50,000+ books & online journals" },
              { t: "Sports Complex", d: "Indoor courts, gym, swimming pool" },
            ].map(f => (
              <StaggerItem key={f.t}>
                <Card className="hover-lift h-full">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-gradient-brand flex items-center justify-center mb-3">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold">{f.t}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{f.d}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Loved by our community</h2>
          </FadeIn>
          <StaggerContainer className="grid md:grid-cols-3 gap-4">
            {testimonials.map(t => (
              <StaggerItem key={t.name}>
                <Card className="hover-lift h-full flex flex-col justify-between">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <Quote className="h-6 w-6 text-primary/40 mb-3" />
                      <p className="text-sm">"{t.quote}"</p>
                    </div>
                    <div className="mt-4 flex items-center gap-3 pt-4 border-t">
                      <Avatar><AvatarFallback className="bg-primary/10 text-primary">{t.initials}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-3">Moments</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Campus Gallery</h2>
            </div>
            <Button asChild variant="ghost"><Link to={"/gallery" as any}>View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {galleryImages.slice(0, 6).map(g => (
              <StaggerItem key={g.id}>
                <div className="aspect-4/3 rounded-xl relative overflow-hidden hover-lift cursor-pointer group">
                  <img
                    src={g.image}
                    alt={g.label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-4 z-10">
                    <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">{g.label}</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <FadeIn className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-3">Got Questions?</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
              <p className="mt-2 text-muted-foreground">Everything you need to know about joining EduSphere.</p>
            </div>
            <Button asChild variant="ghost">
              <Link to={"/faq" as any}>View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* LEFT — accordion + student image */}
            <FadeIn direction="left" delay={0.1}>
              <div>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqs.map(([q, a], i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="relative mt-8 rounded-2xl overflow-hidden h-52 bg-muted">
                  <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 pointer-events-none">
                    <p className="text-xs uppercase tracking-widest text-primary/60 font-semibold mb-1">Student Life</p>
                    <p className="text-2xl font-bold leading-tight">
                      Shaping futures,<br />one student at a time.
                    </p>
                  </div>
                  <img
                    src="/featuredStudent.avif"
                    alt="EduSphere student"
                    className="absolute bottom-0 right-0 h-full w-44 object-cover object-top"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute bottom-4 left-6 z-10">
                    <Button size="sm" asChild>
                      <Link to={"/faq" as any}>Read More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* RIGHT — feedback flip slider */}
            <FadeIn direction="right" delay={0.2}>
              <div>
                <div className="mb-5">
                  <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">Community Voices</p>
                  <h3 className="text-2xl font-bold">What our community says</h3>
                  <p className="text-muted-foreground text-sm mt-1">Real stories from students, parents &amp; educators.</p>
                </div>
                <FeedbackSlider />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <Card className="overflow-hidden border-0 shadow-elegant">
              <div className="bg-gradient-brand p-12 md:p-16 text-center text-white">
                <h2 className="text-3xl md:text-5xl font-bold">Ready to begin your journey?</h2>
                <p className="mt-4 text-white/90 max-w-xl mx-auto">Join 1,200+ students shaping their futures at EduSphere.</p>
                <div className="mt-8 flex justify-center gap-3 flex-wrap">
                  <Button asChild size="lg" variant="secondary"><Link to={"/admissions" as any}>Start your application</Link></Button>
                  <Button asChild size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10"><Link to={"/contact" as any}>Talk to us</Link></Button>
                </div>
              </div>
            </Card>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
