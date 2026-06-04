import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — EduSphere" }, { name: "description", content: "Get in touch with our admissions and support teams." }] }),
  component: () => (
    <PublicLayout>
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Contact</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Let's <span className="text-gradient-brand">talk</span></h1>
        </div>
      </section>
      <section className="py-16 container mx-auto px-4 grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[
            { i: Mail, t: "Email", v: "hello@edusphere.edu" },
            { i: Phone, t: "Phone", v: "+1 (555) 010-2025" },
            { i: MapPin, t: "Address", v: "123 Education Blvd, Knowledge City, 02141" },
          ].map(c => (
            <Card key={c.t} className="hover-lift"><CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><c.i className="h-5 w-5" /></div>
              <div><p className="text-sm text-muted-foreground">{c.t}</p><p className="font-medium">{c.v}</p></div>
            </CardContent></Card>
          ))}
        </div>
        <Card className="shadow-elegant"><CardContent className="p-6">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Message sent! We'll reply soon."); }}>
            <h3 className="text-xl font-bold">Send a message</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Name</Label><Input required /></div>
              <div><Label>Email</Label><Input type="email" required /></div>
            </div>
            <div><Label>Subject</Label><Input required /></div>
            <div><Label>Message</Label><Textarea rows={5} required /></div>
            <Button type="submit" className="w-full bg-gradient-brand border-0 hover:opacity-90">Send Message</Button>
          </form>
        </CardContent></Card>
      </section>
    </PublicLayout>
  ),
});
