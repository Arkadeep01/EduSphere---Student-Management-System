import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admissions")({
  head: () => ({ meta: [{ title: "Admissions — EduSphere" }, { name: "description", content: "Apply for admission. Simple 3-step process for the 2026-27 academic year." }] }),
  component: AdmissionsPage,
});

function AdmissionsPage() {
  const [submitted, setSubmitted] = useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Application received! We'll contact you within 48 hours.");
  };
  return (
    <PublicLayout>
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Admissions Open</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Join the EduSphere family</h1>
          <p className="mt-4 text-lg text-muted-foreground">2026-27 academic year applications now open</p>
        </div>
      </section>
      <section className="py-16 container mx-auto px-4 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">How it works</h2>
          {[
            ["1", "Submit application", "Fill the online form with student details"],
            ["2", "Entrance assessment", "On-campus aptitude test & interview"],
            ["3", "Receive offer", "Decision within 7 business days"],
          ].map(([n, t, d]) => (
            <div key={n} className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-gradient-brand text-white flex items-center justify-center font-bold shrink-0">{n}</div>
              <div><h3 className="font-semibold">{t}</h3><p className="text-sm text-muted-foreground">{d}</p></div>
            </div>
          ))}
        </div>
        <Card className="lg:col-span-3 shadow-elegant">
          <CardContent className="p-6">
            {submitted ? (
              <div className="text-center py-10">
                <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
                <h3 className="text-2xl font-bold mt-4">Application submitted!</h3>
                <p className="text-muted-foreground mt-2">We'll reach out via email shortly.</p>
                <Button className="mt-6" onClick={() => setSubmitted(false)}>Submit another</Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <h3 className="text-xl font-bold">Application Form</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label htmlFor="firstName">First name</Label><Input id="firstName" required /></div>
                  <div><Label htmlFor="lastName">Last name</Label><Input id="lastName" required /></div>
                </div>
                <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required /></div>
                <div><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" required /></div>
                <div><Label htmlFor="grade">Applying for grade</Label>
                  <select id="grade" required className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30">
                    <option value="" disabled>Select grade</option>
                    {Array.from({ length: 12 }).map((_, i) => <option key={i} value={`${i + 1}`}>Grade {i + 1}</option>)}
                  </select>
                </div>
                <div><Label htmlFor="message">Why EduSphere?</Label><Textarea id="message" rows={3} /></div>
                <Button type="submit" className="w-full bg-gradient-brand border-0 hover:opacity-90">Submit Application</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </PublicLayout>
  );
}
