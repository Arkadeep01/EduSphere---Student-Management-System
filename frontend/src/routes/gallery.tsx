import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { usePublicGallery } from "@/lib/usePublicData";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/brand/animations";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — EduSphere" },
      { name: "description", content: "Moments from campus life." },
    ],
  }),

  component: () => {
    const { data: images, isLoading, isError } = usePublicGallery();
    return (
      <PublicLayout>
        <section className="bg-hero-glow py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <FadeIn direction="up" delay={0}>
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Gallery</Badge>
            </FadeIn>
            <FadeIn direction="up" delay={0.15}>
              <h1 className="text-4xl md:text-5xl font-bold">Campus <span className="text-gradient-brand">Moments</span></h1>
            </FadeIn>
          </div>
        </section>

        <section className="py-16 container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : isError ? (
            <p className="text-center text-muted-foreground py-20">Unable to load gallery.</p>
          ) : !images || images.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No gallery images available yet.</p>
          ) : (
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((img) => (
                <StaggerItem key={img.id}>
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="aspect-4/3 rounded-xl relative overflow-hidden hover-lift cursor-pointer group">
                        <img
                          src={img.image}
                          alt={img.alt_text || img.label}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-4">
                          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">{img.label}</span>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <img src={img.image} alt={img.label} className="w-full h-auto rounded-lg" />
                      {img.caption && <p className="mt-2 text-sm text-muted-foreground">{img.caption}</p>}
                    </DialogContent>
                  </Dialog>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </section>
      </PublicLayout>
    );
  },
});
