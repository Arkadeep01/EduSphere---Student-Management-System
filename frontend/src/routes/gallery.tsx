import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { galleryImages } from "@/lib/mock-data";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/brand/animations";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — EduSphere" },
      {
        name: "description",
        content: "Moments from campus life.",
      },
    ],
  }),

  component: () => (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <FadeIn direction="up" delay={0}>
            <Badge
              variant="outline"
              className="mb-4 border-primary/30 text-primary"
            >
              Gallery
            </Badge>
          </FadeIn>

          <FadeIn direction="up" delay={0.15}>
            <h1 className="text-4xl md:text-5xl font-bold">
              Campus <span className="text-gradient-brand">Moments</span>
            </h1>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <p className="mt-4 text-muted-foreground">
              A glimpse into academics, culture, sports, innovation and student life.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Masonry Gallery */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <StaggerContainer className="columns-1 md:columns-2 xl:columns-3 gap-5">
            {galleryImages.map((g) => (
              <StaggerItem
                key={g.id}
                className="mb-5 break-inside-avoid"
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="group w-full overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <div className={`relative ${g.height}`}>
                        <img
                          src={g.image}
                          alt={g.label}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                          <h3 className="text-white text-lg font-semibold">
                            {g.label}
                          </h3>
                        </div>
                      </div>
                    </button>
                  </DialogTrigger>

                  <DialogContent className="max-w-5xl p-0 overflow-hidden">
                    <img
                      src={g.image}
                      alt={g.label}
                      className="w-full max-h-[85vh] object-contain"
                    />
                  </DialogContent>
                </Dialog>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </PublicLayout>
  ),
});