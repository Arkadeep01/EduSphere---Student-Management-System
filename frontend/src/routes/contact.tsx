import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send, Check, Quote, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { motion, AnimatePresence } from "framer-motion";

export function SchoolMap() {
  return (
    <Map className="h-full w-full" center={[91.2822039, 23.8610131]} zoom={15}>
      <MapMarker longitude={91.2822039} latitude={23.8610131}>
        <MarkerContent>
          <div className="flex flex-col items-center">
            {/* Label */}
            <a
              onClick={() => window.open("https://www.google.com/maps/place/Sri+Krishna+Mission+School/@23.861018,91.279629,17z/data=!4m6!3m5!1s0x3753f6af16817653:0x534e85641ba1f6af!8m2!3d23.8610131!4d91.2822039!16s%2Fg%2F11b88jgv32?entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D", "_blank")}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 px-2 py-1 rounded-md bg-background/90 border border-border shadow-md text-xs font-semibold text-foreground whitespace-nowrap hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors duration-200 cursor-pointer"
              style={{ animation: "floatUpDown 1.8s ease-in-out infinite" }}
            >
              Sri Krishna Mission School
            </a>

            {/* Pin */}
            <div className="flex flex-col items-center" style={{ animation: "floatUpDown 1.8s ease-in-out infinite" }}>
              <div className="relative flex items-center justify-center">
                <div className="absolute h-10 w-10 rounded-full bg-primary/30 animate-ping" />
                <div className="absolute h-6 w-6 rounded-full bg-primary/50 border-2 border-primary" />
                <div className="h-3 w-3 rounded-full bg-primary border-2 border-background shadow-lg z-10" />
              </div>
              <div className="w-0.5 h-3 bg-primary" />
            </div>
          </div>

          <style>{`
            @keyframes floatUpDown {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
            }
          `}</style>
        </MarkerContent>
      </MapMarker>
    </Map>
  );
}

function ConfettiBurst() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    y: Math.random() * -180 - 40,
    rotate: Math.random() * 360,
    scale: Math.random() * 0.6 + 0.4,
    color: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"][
      Math.floor(Math.random() * 6)
    ],
    shape: Math.random() > 0.5 ? "circle" : "rect",
  }));

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            width: p.shape === "circle" ? 8 : 10,
            height: p.shape === "circle" ? 8 : 6,
            borderRadius: p.shape === "circle" ? "50%" : 2,
            backgroundColor: p.color,
          }}
          initial={{ opacity: 1, x: 0, y: 0, scale: p.scale, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: p.x,
            y: p.y,
            scale: [p.scale, p.scale * 1.2, 0],
            rotate: p.rotate,
          }}
          transition={{
            duration: 0.9,
            ease: "easeOut",
            times: [0, 0.6, 1],
          }}
        />
      ))}
    </div>
  );
}
export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — EduSphere" }, { name: "description", content: "Get in touch with our admissions and support teams." }] }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setSending(true);

    await new Promise(
      resolve => setTimeout(resolve, 700)
    );

    setSending(false);
    setSent(true);

    toast.success(
      "Message sent successfully!"
    );

    setTimeout(() => {
      setSent(false);
    }, 2000);
  };

  return (
    <PublicLayout>
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb04">
            We're here tp <span className="text-gradient-brand">help you grow</span>
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 text-lg md:text-base max-w-2xl mx-auto text-sm">
            Have questions about our courses, admissions, or campus resources? Get in touch with out support team and start shaping your learning journey today.
          </p>
        </div>
      </section>

      {/* Mission + Image */}
      <section className="py-16 container mx-auto px-10 py-20">
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="bg-white rounded-3xl border p-10">
            <span className="uppercase text-primary font-semibold tracking-widest">
              EduSphere Information
            </span>

            <h2 className="text-4xl font-bold mt-3 mb-8">
              Stay Connected With Us
            </h2>

            <div className="space-y-8">
              <div className="flex gap-4">
                <MapPin className="text-primary" />

                <div>
                  <h3 className="font-semibold">Location</h3>

                  <p className="text-muted-foreground">
                    Sri Krishna Mission School
                    <br />
                    Agartala, Tripura (West)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Mail className="text-primary" />

                <div>
                  <h3 className="font-semibold">Email</h3>

                  <p className="text-muted-foreground">
                    contact@edusphere.edu
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Phone className="text-primary" />

                <div>
                  <h3 className="font-semibold">Phone</h3>

                  <p className="text-muted-foreground">
                    +91 98765 43210
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl bg-primary text-white p-8">
              <h3 className="text-2xl font-bold">
                25+ Years of Excellence
              </h3>

              <p className="mt-3 text-white/90">
                Empowering future leaders through innovation,
                academic excellence, and holistic growth.
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="relative">
            <img
              src="/campus.avif"
              alt="Campus"
              className="rounded-3xl object-cover w-full h-[500px]"
            />

            <div className="absolute top-30 -left-10 bg-slate-800 text-white rounded-2xl p-6 max-w-xs shadow-3xl border-[0.25rem] border-white">
              <Quote className="h-8 w-8 text-cyan-400 mb-3 " />

              <p className="text-sm leading-relaxed text-sm">
                EduSphere continues to inspire generations of learners with a
                commitment to innovation and academic excellence.
              </p>

              <div className="mt-4">
                <h4 className="font-semibold">Director's Message</h4>
                <span className="text-xs text-slate-400">
                  Academic Leadership
                </span>
              </div>
            </div>
          </div>
        </section>
      </section>



      {/* Map and Contact Form */}
      <section className="container mx-auto px-6 py-20">
        <div className="relative">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Map */}
            <div className="overflow-hidden rounded-[40px] h-[450px] md:h-[550px] lg:h-[650px] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              <SchoolMap />
            </div>

            {/* Contact Card */}
            <div className="lg:absolute right-95 lg:top-1/2 lg:-translate-y-1/2 w-full lg:left-[45%] lg:w-[200px] xl:w-[700px]  mt-8 lg:mt-0 z-20">
              <Card className="border-0 overflow-hidden bg-card/95  shadow-[0_20px_80px_rgba(0,0,0,0.18)] rounded-[32px]">
                <CardContent className="p-6 md:p-8 lg:p-10">
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <h3 className="text-xl font-bold">Send a message</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-2"><Label className="mt-2">Name</Label><Input required /></div>
                      <div className="space-y-2"><Label className="mt-2">Email</Label><Input type="email" required /></div>
                    </div>
                    <div className="space-y-2"><Label>Subject</Label><Input required /></div>
                    <div className="space-y-2"><Label>Message</Label><Textarea rows={5} required /></div>
                    <motion.div className="relative">
                      <Button
                        type="submit"
                        disabled={sending || sent}
                        className="relative overflow-hidden w-full h-12 bg-gradient-brand border-0 transition-all duration-300"
                      >
                        <AnimatePresence mode="wait">

                          {/* Idle */}
                          {!sending && !sent && (
                            <motion.span
                              key="idle"
                              className="flex items-center gap-2"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Send size={16} />
                              Send Message
                            </motion.span>
                          )}

                          {/* Sending — spinner + icon */}
                          {sending && (
                            <motion.span
                              key="sending"
                              className="flex items-center gap-2"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.2 }}
                            >
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="flex items-center justify-center"
                              >
                                <Loader2 size={16} />
                              </motion.div>
                              Sending...
                            </motion.span>
                          )}

                          {/* Sent */}
                          {sent && (
                            <motion.span
                              key="sent"
                              className="flex items-center gap-2"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                            >
                              <Check size={16} />
                              Message Sent!
                            </motion.span>
                          )}

                        </AnimatePresence>
                      </Button>

                      {/* Confetti burst */}
                      {sent && <ConfettiBurst />}
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
