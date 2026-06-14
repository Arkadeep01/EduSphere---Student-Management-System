import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem, HoverLift } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { exams } from "@/lib/mock-data";
import { useState, useEffect } from "react";

function StudentExamsComponent() {
  const [examType ] = useState("all");
  const [timeLeft, setTimeLeft] = useState("");

  const nextExam = exams[0];
  useEffect(() => {
    const target = new Date(exams.length > 0 ? `${exams[0].date}T${exams[0].time.replace(" ", "0").padStart(5, "0")}:00` : "2026-06-12T09:00:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) { setTimeLeft("Ongoing"); clearInterval(interval); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      setTimeLeft(`${d}d ${h}h remaining`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = examType === "all" ? exams : exams.filter(e => e.name.toLowerCase().includes(examType));
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);

  return (
    <PageWrapper>
      <Card className="mb-6"><CardContent className="p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-warning" />
        <div><p className="text-sm font-medium">Next Exam: {nextExam.name}</p><p className="text-xs text-muted-foreground">{nextExam.date} · {timeLeft}</p></div>
      </CardContent></Card>

      <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(e => {
          const isPast = new Date(e.date) < today;
          return (
            <StaggerItem key={e.id}><HoverLift><Card className={`overflow-hidden ${isPast ? "opacity-60" : ""}`}>
              <div className="h-1 bg-gradient-brand" />
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <Badge variant={isPast ? "secondary" : "outline"}>{isPast ? "Completed" : "Upcoming"}</Badge>
                  {new Date(e.date).toDateString() === tomorrow.toDateString() && <Badge className="bg-brand/10 text-brand border-0 text-[10px]">Tomorrow</Badge>}
                </div>
                <h3 className="font-semibold text-lg mt-3">{e.name}</h3>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{e.date}</p>
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4" />{e.time} · {e.duration}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{e.room}</p>
                </div>
              </CardContent>
            </Card></HoverLift></StaggerItem>
          );
        })}
      </StaggerContainer>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/student/exams")({
  head: () => ({ meta: [{ title: "Exam Schedule — Student" }] }),
  component: StudentExamsComponent,
});
