import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { publicWebsiteApi } from "@/services/websiteApi";
import type { PublicSlots, PublicFacilityItem } from "@/services/websiteApi";
import { AlertCircle, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { StaggerContainer, StaggerItem } from "@/components/brand/animations";

export const Route = createFileRoute("/facilities")({
  head: () => ({ meta: [{ title: "Facilities — EduSphere" }] }),
  component: FacilitiesPage,
});

function FacilitiesPage() {
  const [slots, setSlots] = useState<PublicSlots | null>(null);
  const [facilities, setFacilities] = useState<PublicFacilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      publicWebsiteApi.slots().then(setSlots).catch(() => {}),
      publicWebsiteApi.facilities(),
    ])
      .then(([, fac]) => setFacilities(fac))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const heroImg = slots?.["facilities_hero"] ? (slots["facilities_hero"] as { image_url: string }).image_url : null;
  // const _facImg = (name: string) => facilities.find(f => f.name === name)?.image || null;

  if (loading) {
    return (
      <PublicLayout>
        <section className="bg-hero-glow py-16">
          <div className="container mx-auto px-4 text-center">
            <Skeleton className="h-12 w-64 mx-auto" />
          </div>
        </section>
        <section className="py-16 container mx-auto px-4">
          <Skeleton className="h-64 w-full rounded-xl" />
        </section>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <section className="py-20 flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive/50" />
          <p className="text-muted-foreground">Unable to load facilities information.</p>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative h-64 overflow-hidden">
        {heroImg ? (
          <img src={heroImg} alt="Facilities" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <Building2 className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white">
            <Badge variant="outline" className="border-white/30 text-white mb-3">Facilities</Badge>
            <h1 className="text-4xl md:text-5xl font-bold">Our <span className="text-gradient-brand">Facilities</span></h1>
          </div>
        </div>
      </section>

      {/* Facility Cards from DB */}
      {facilities.length > 0 ? (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <StaggerContainer className="grid md:grid-cols-2 gap-8">
              {facilities.map((f) => (
                <StaggerItem key={f.id}>
                  <Card className="hover-lift overflow-hidden h-full">
                    {f.image && (
                      <div className="h-48 overflow-hidden">
                        <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{f.name}</h3>
                      {f.description && <p className="text-sm text-muted-foreground">{f.description}</p>}
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      ) : (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-col items-center gap-3">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No facilities configured yet.</p>
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
