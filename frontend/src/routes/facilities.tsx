import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Bus,
  UtensilsCrossed,
  Microscope,
  Trophy,
  FlaskConical,
  Monitor,
  Atom,
} from "lucide-react";

export const Route = createFileRoute("/facilities")({
  head: () => ({
    meta: [
      { title: "Facilities — EduSphere" },
      {
        name: "description",
        content:
          "World-class facilities supporting academic excellence, creativity, and holistic development.",
      },
    ],
  }),

  component: () => (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-glow py-20">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge
                variant="outline"
                className="mb-4 border-primary/30 text-primary"
              >
                Facilities
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold">
                Designed for Learning,
                <span className="text-gradient-brand">
                  Growth & Discovery
                </span>
              </h1>

              <p className="mt-6 text-lg text-muted-foreground">
                EduSphere provides modern learning environments, advanced
                laboratories, extensive library resources, safe transport
                facilities, and holistic co-curricular opportunities to help
                students excel inside and outside the classroom.
              </p>
            </div>

            <div className="relative">
              <img
                src="facilities/hero.jpg"
                alt="Facilities"
                className="rounded-[40px] shadow-2xl h-[450px] w-full object-cover"
              />

              <div className="absolute -bottom-6 -left-6 bg-background border rounded-3xl p-5 shadow-xl">
                <p className="text-3xl font-bold text-primary">6+</p>
                <p className="text-sm text-muted-foreground">
                  Specialized Labs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">

            <Card className="rounded-[32px] overflow-hidden hover-lift">
              <CardContent className="p-8">
                <Microscope className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-2xl font-bold">
                  Advanced Laboratories
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Physics, Chemistry, Biology, Mathematics, Geography and
                  Computer laboratories equipped with modern instruments,
                  charts and learning aids.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] overflow-hidden hover-lift">
              <CardContent className="p-8">
                <BookOpen className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-2xl font-bold">
                  Knowledge Resource Centre
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Thousands of books, journals, magazines and reference
                  materials supporting independent learning and research.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] overflow-hidden hover-lift">
              <CardContent className="p-8">
                <Bus className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-2xl font-bold">
                  Safe School Transport
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Structured routes, supervised boarding procedures and
                  student-focused transport management.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] overflow-hidden hover-lift">
              <CardContent className="p-8">
                <UtensilsCrossed className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-2xl font-bold">
                  Healthy Vegetarian Canteen
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Nutritious vegetarian meals prepared under hygienic
                  conditions with balanced dietary principles.
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>


      {/* Laborities */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="border-primary/30 text-primary mb-4">
              Learning Spaces
            </Badge>

            <h2 className="text-4xl font-bold">
              Specialized Laboratory Facilities
            </h2>

            <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
              Hands-on learning environments designed to transform theoretical
              concepts into practical understanding.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {[
              { icon: Atom, label: "Physics" },
              { icon: FlaskConical, label: "Chemistry" },
              { icon: Microscope, label: "Biology" },
              { icon: Monitor, label: "Computer" },
              { icon: Trophy, label: "Mathematics" },
              { icon: BookOpen, label: "Geography" },
            ].map((lab) => {
              const Icon = lab.icon;

              return (
                <Card
                  key={lab.label}
                  className="group rounded-3xl hover:-translate-y-2 transition-all duration-300"
                >
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                      <Icon className="h-8 w-8 text-primary group-hover:text-white" />
                    </div>

                    <h3 className="font-semibold">{lab.label}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>


      {/* Library */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div className="relative">
              <div className="absolute -top-6 -left-6 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

              <img
                src="facilities/library.avif"
                alt="Library"
                className="relative rounded-[40px] shadow-2xl h-[500px] w-full object-cover"
              />
            </div>

            <div>
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                Library
              </Badge>

              <h2 className="text-4xl font-bold mb-5">
                Knowledge Resource Centre
              </h2>

              <p className="text-muted-foreground leading-relaxed">
                Our library serves as a gateway to lifelong learning, offering an
                extensive collection of books, academic references, journals,
                magazines, and digital resources.
              </p>

              <p className="mt-4 text-muted-foreground leading-relaxed">
                Designed to support research, critical thinking, and independent
                study, the library provides a calm and inspiring environment where
                students can explore ideas, expand knowledge, and cultivate a love
                for reading.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* House System */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">

          <div className="text-center mb-14">
            <Badge variant="outline" className="border-primary/30 text-primary mb-4">
              House System
            </Badge>

            <h2 className="text-4xl font-bold">
              Building Leadership Through Team Spirit
            </h2>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              {
                name: "Nivedita House",
                motto: "Perseverance",
                color: "from-emerald-500 to-teal-500",
              },
              {
                name: "Matangini House",
                motto: "Dedication",
                color: "from-amber-500 to-orange-500",
              },
              {
                name: "Vivekananda House",
                motto: "Cheerfulness",
                color: "from-indigo-500 to-blue-500",
              },
              {
                name: "Netaji House",
                motto: "Courage",
                color: "from-rose-500 to-red-500",
              },
            ].map((house) => (
              <Card
                key={house.name}
                className={`overflow-hidden border-0 bg-gradient-to-br ${house.color} text-white rounded-[32px]`}
              >
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold">
                    {house.name}
                  </h3>

                  <p className="mt-3 text-white/90">
                    {house.motto}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>


      {/* Transportation */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div>
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                Transport
              </Badge>

              <h2 className="text-4xl font-bold mb-5">
                Safe School Transportation
              </h2>

              <p className="text-muted-foreground leading-relaxed mb-8">
                Dedicated transport services are available across major routes with
                safety-focused boarding procedures and responsible supervision.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Trained Drivers",
                  "Designated Bus Stops",
                  "Supervised Boarding",
                  "Student Safety Protocols",
                  "Parent Coordination",
                ].map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border bg-background p-4 font-medium"
                  >
                    ✓ {point}
                  </div>
                ))}
              </div>
            </div>

            <img
              src="facilities/transport.avif"
              alt="Transport"
              className="rounded-[40px] shadow-2xl h-[500px] w-full object-cover"
            />

          </div>
        </div>
      </section>


      {/* Canteen */}
      <section className="py-24">
        <div className="container mx-auto px-4">

          <div className="relative overflow-hidden rounded-[40px] h-[500px]">
            <img
              src="facilities/canteen.avif"
              alt="Canteen"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/50" />

            <div className="absolute inset-0 flex items-center">
              <div className="max-w-xl p-10 text-white">

                <Badge className="mb-4 bg-white/20 border-0 text-white">
                  School Canteen
                </Badge>

                <h2 className="text-5xl font-bold mb-5">
                  Healthy Vegetarian Dining
                </h2>

                <p className="text-white/90 leading-relaxed">
                  Our canteen promotes balanced nutrition through carefully prepared
                  vegetarian meals. Every meal is designed to support student health,
                  energy, and overall well-being in a hygienic environment.
                </p>

              </div>
            </div>
          </div>

        </div>
      </section>
    </PublicLayout>
  ),
});