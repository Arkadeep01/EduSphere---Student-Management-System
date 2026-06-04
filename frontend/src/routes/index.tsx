import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  GraduationCap, BookOpen, Users, ArrowRight,
  Sparkles, Calendar, MapPin, Star, Quote, Trophy
} from "lucide-react";
import { useEffect, useState } from "react";
import { stats, teachers, students, events, testimonials, galleryImages } from "@/lib/mock-data";

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

// Render the public home page via the layout's Outlet — we mount it as Index
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

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[500px]">
        <img src="/campus-image.jpg" alt="Campus" className="absolute inset-0 w-full h-full object-cover" />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 container mx-auto px-6 h-full flex items-center max-w-7xl">
          <div className="max-w-xl text-white">
            <p className="uppercase tracking-widest mb-2">
              EduSphere University
            </p>

            <h1 className="text-5xl mx:text-7xl font-bold">
              Together We'll Explore New Things
            </h1>

            <p className="mt-6 text-lg text-white/90">
              We believe everyone should have the opportunity
              to create progress through technology and education.
            </p>

            <Button className="mt-5">
              <Link to={"/courses" as any}>Read Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Achievements / strip */}
      <section className="relative -mt-20 z-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 bg-card text-card-foreground shadow-xl rounded-lg border overflow-hidden">

            <div className="p-8 border-r">
              <GraduationCap className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg">
                Admission Open
              </h3>
              <p className="text-muted-foreground mt-2">
                Applications for 2026 are now open.
              </p>
              <Link to="/admissions">
                Learn More →
              </Link>
            </div>

            <div className="p-8 border-r">
              <BookOpen className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg">
                Academic Programs
              </h3>
              <p className="text-muted-foreground mt-2">
                Undergraduate and postgraduate programs.
              </p>
              <Link to="/courses">
                Learn More →
              </Link>
            </div>

            <div className="p-8">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg">
                Student Services
              </h3>
              <p className="text-muted-foreground mt-2">
                Scholarships, placements and support.
              </p>
              <Link to={"/services" as any}>
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Admission Process */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <div className="relative w-full max-w-[520px] px-6 py-8">
                {/* Large Background Circle & Nested Circle at Left Bottom */}
                <div className="absolute -bottom-6 -left-6 sm:-bottom-12 sm:-left-28 w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-primary/20 dark:border-primary/10 -z-10 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border border-brand/30 dark:border-brand/20" />
                </div>

                {/* Small solid accent dots */}
                <div className="absolute top-1/4 -right-2 w-3 h-3 rounded-full bg-primary/60 pointer-events-none animate-pulse" />
                <div className="absolute bottom-24 -left-8 w-4 h-4 rounded-full bg-brand/50 pointer-events-none z-20" />

                {/* Collage Layout */}
                <div className="flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">

                  {/* Left Column (two small images stacked in a masonry layout) */}
                  <div className="sm:col-span-5 flex flex-col gap-6 w-full order-last sm:order-none">
                    {/* Top Small Image (Horizontally larger) */}
                    <div className="relative group overflow-hidden rounded-3xl shadow-xl aspect-[9/5] w-full sm:w-[155%] -ml-14 z-10">
                      <img
                        src="/Colleagues.avif"
                        alt="Students collaborating"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                    {/* Bottom Small Image (Vertically extended downwards) */}
                    <div className="relative group overflow-hidden rounded-3xl shadow-xl aspect-[2/3] w-[95%] sm:w-[120%] sm:-ml-8 z-10 sm:translate-y-4">
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
                    <div className="sm:col-span-7 relative group overflow-hidden rounded-2xl shadow-xl w-full h-[280px] sm:h-[350px] md:h-[400px]">
                      <img
                        src="/featuredStudent.avif"
                        alt="Featured student"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

              <Button className="mt-8">
                <Link to={"/admissions" as any}>Read More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-card text-card-foreground rounded-md shadow-sm border">
            <div className="grid grid-cols-2 md:grid-cols-4">
              <div className="flex items-center gap-3 p-6 border-r">
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

              <div className="flex items-center gap-3 p-6 border-r">
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

              <div className="flex items-center gap-3 p-6 border-r">
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

              <div className="flex items-center gap-3 p-6">
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
            </div>
          </div>
        </div>
      </section>

      {/* Featured teachers */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-3">Our People</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Featured Faculty</h2>
              <p className="mt-2 text-muted-foreground">Educators who inspire, mentor and lead.</p>
            </div>
            <Button asChild variant="ghost"><Link to={"/teachers" as any}>View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teachers.slice(0, 4).map((t) => (
              <Card key={t.id} className="hover-lift overflow-hidden">
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
            ))}
          </div>
        </div>
      </section>

      {/* Top students */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <Badge variant="secondary" className="mb-3">Achievers</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-10">Top Performing Students</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {students.slice(0, 3).map((s, i) => (
              <Card key={s.id} className="hover-lift">
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
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-3">What's Happening</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Upcoming Events</h2>
            </div>
            <Button asChild variant="ghost"><Link to={"/events" as any}>All events <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {events.slice(0, 3).map(e => (
              <Card key={e.id} className="hover-lift overflow-hidden">
                <div className="h-2 bg-gradient-brand" />
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3">{e.type}</Badge>
                  <h3 className="font-semibold text-lg">{e.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>
                  <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(e.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{e.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <Badge variant="secondary" className="mb-3">World-class</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-10">Our Facilities</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { t: "Smart Classrooms", d: "Interactive whiteboards & AV systems" },
              { t: "STEM Labs", d: "Physics, Chemistry, Biology, Robotics" },
              { t: "Digital Library", d: "50,000+ books & online journals" },
              { t: "Sports Complex", d: "Indoor courts, gym, swimming pool" },
            ].map(f => (
              <Card key={f.t} className="hover-lift">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-gradient-brand flex items-center justify-center mb-3">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold">{f.t}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{f.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Loved by our community</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map(t => (
              <Card key={t.name} className="hover-lift">
                <CardContent className="p-6">
                  <Quote className="h-6 w-6 text-primary/40 mb-3" />
                  <p className="text-sm">{t.quote}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar><AvatarFallback className="bg-primary/10 text-primary">{t.initials}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-3">Moments</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Campus Gallery</h2>
            </div>
            <Button asChild variant="ghost"><Link to={"/gallery" as any}>View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {galleryImages.slice(0, 6).map(g => (
              <div key={g.id} className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${g.gradient} relative overflow-hidden hover-lift cursor-pointer group`}>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-4">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">{g.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
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
        </div>
      </section>
    </>
  );
}
