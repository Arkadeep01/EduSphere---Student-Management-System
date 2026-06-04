import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { galleryImages } from "@/lib/mock-data";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery — EduSphere" }, { name: "description", content: "Moments from campus life." }] }),
  component: () => (
    <PublicLayout>
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Gallery</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Campus <span className="text-gradient-brand">moments</span></h1>
        </div>
      </section>
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...galleryImages, ...galleryImages].map((g, i) => (
            <Dialog key={i}>
              <DialogTrigger asChild>
                <button className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${g.gradient} relative overflow-hidden hover-lift group`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-4">
                    <span className="text-white font-medium opacity-0 group-hover:opacity-100">{g.label}</span>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl p-0 overflow-hidden">
                <div className={`aspect-video bg-gradient-to-br ${g.gradient} flex items-center justify-center`}>
                  <span className="text-white text-3xl font-bold">{g.label}</span>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </section>
    </PublicLayout>
  ),
});
