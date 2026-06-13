import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { exams } from "@/lib/mock-data";

export const Route = createFileRoute("/student/exams")({
  head: () => ({ meta: [{ title: "Exam Schedule — Student" }] }),
  component: () => (
    <>
      <PageHeader title="Exam Schedule" description="Your upcoming examinations" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map(e => (
          <Card key={e.id} className="hover-lift overflow-hidden">
            <div className="h-1 bg-gradient-brand" />
            <CardContent className="p-5">
              <Badge variant="outline">Midterm</Badge>
              <h3 className="font-semibold text-lg mt-3">{e.name}</h3>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{e.date}</p>
                <p className="flex items-center gap-2"><Clock className="h-4 w-4" />{e.time} · {e.duration}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{e.room}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  ),
});
