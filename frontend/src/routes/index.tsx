import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  GraduationCap, BookOpen, Trophy, Users, ArrowRight, Sparkles,
  Calendar, MapPin, Star, CheckCircle2, Quote
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
      <section className="relative overflow-hidden bg-hero-glow">
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 text-primary"><Sparkles className="h-3 w-3" /> The future of school management</Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                Where learning meets <span className="text-gradient-brand">brilliant design</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                EduSphere brings together students, teachers, and administrators in one beautifully crafted platform — from attendance and assignments to exams and analytics.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-gradient-brand border-0 hover:opacity-90 shadow-elegant"><Link to={"/admissions" as any}>Apply for Admission <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                <Button asChild size="lg" variant="outline"><Link to={"/login" as any}>Sign in to portal</Link></Button>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> 50+ accredited courses</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Modern campus</div>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="absolute inset-0 bg-gradient-brand opacity-20 blur-3xl rounded-full" />
              <div className="relative grid grid-cols-2 gap-4">
                {[
                  { label: "Active Students", val: stats.students, icon: Users, color: "from-indigo-500 to-blue-500" },
                  { label: "Expert Teachers", val: stats.teachers, icon: GraduationCap, color: "from-blue-500 to-cyan-500" },
                  { label: "Courses Offered", val: stats.subjects, icon: BookOpen, color: "from-orange-500 to-red-500" },
                  { label: "Years Excellence", val: 25, icon: Trophy, color: "from-purple-500 to-indigo-500" },
                ].map((s) => (
                  <Card key={s.label} className="hover-lift">
                    <CardContent className="p-6">
                      <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${s.color} text-white mb-3`}>
                        <s.icon className="h-5 w-5" />
                      </div>
                      <div className="text-3xl font-bold"><Counter end={s.val} suffix={s.label === "Years Excellence" ? "+" : "+"} /></div>
                      <div className="text-sm text-muted-foreground">{s.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements / strip */}
      <section className="border-y bg-card">
        <div className="container mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { k: "94%", v: "Average attendance" },
            { k: "8.6/10", v: "Student satisfaction" },
            { k: "120+", v: "Awards won 2025" },
            { k: "98%", v: "College placement" },
          ].map((a) => (
            <div key={a.v} className="text-center">
              <div className="text-3xl font-bold text-gradient-brand">{a.k}</div>
              <div className="text-sm text-muted-foreground mt-1">{a.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured teachers */}
      <section className="py-20">
        <div className="container mx-auto px-4">
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
        <div className="container mx-auto px-4">
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
        <div className="container mx-auto px-4">
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
        <div className="container mx-auto px-4">
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
        <div className="container mx-auto px-4">
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
