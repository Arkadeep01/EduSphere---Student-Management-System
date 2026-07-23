import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { studentExamApi } from "@/services/studentApi";

interface Exam {
  id: number; name: string; date: string; time: string | null;
  room: string; duration: string; status: string; classes: string[];
}

export const Route = createFileRoute("/student/exams")({
  head: () => ({ meta: [{ title: "Exams — Student" }] }),
  component: () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      studentExamApi.list()
        .then(d => setExams(d as Exam[]))
        .catch(() => toast.error("Failed to load exams"))
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-8 text-muted-foreground">Loading exams...</div>;

    const nextExam = exams.filter(e => e.status !== "archived")[0];
    const daysLeft = nextExam ? Math.max(0, Math.ceil((new Date(nextExam.date).getTime() - Date.now()) / 86400000)) : 0;

    return (
      <div className="space-y-6">
        <div><h2 className="text-xl font-bold">Examination Schedule</h2></div>
        {nextExam && (
          <Card className="bg-gradient-brand border-0 text-white">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wider opacity-80">Next Exam</p>
              <p className="text-lg font-bold mt-1">{nextExam.name}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{nextExam.date}</span>
                {nextExam.time && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{nextExam.time}</span>}
                {nextExam.room && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{nextExam.room}</span>}
                {nextExam.duration && <span>{nextExam.duration}</span>}
              </div>
              <div className="mt-3 flex items-center gap-2"><div className="text-3xl font-bold">{daysLeft}</div><div className="text-xs opacity-80">days left</div></div>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {exams.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground col-span-2">No exams scheduled</div>
          ) : exams.map(exam => (
            <Card key={exam.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div><h3 className="font-semibold">{exam.name}</h3><p className="text-xs text-muted-foreground mt-1">{exam.classes?.join(", ")}</p></div>
                  <Badge variant={exam.status === "published" ? "default" : "secondary"}>{exam.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{exam.date}</span>
                  {exam.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exam.time}</span>}
                  {exam.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{exam.room}</span>}
                  {exam.duration && <span>{exam.duration}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  },
});
