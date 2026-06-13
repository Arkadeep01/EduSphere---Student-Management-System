import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Layers } from "lucide-react";

const classes = [
  { id: "10-A", name: "Class 10-A", students: 32, subject: "Mathematics" },
  { id: "10-B", name: "Class 10-B", students: 30, subject: "Mathematics" },
  { id: "9-A", name: "Class 9-A", students: 34, subject: "Mathematics" },
  { id: "9-B", name: "Class 9-B", students: 31, subject: "Mathematics" },
  { id: "11-A", name: "Class 11-A", students: 28, subject: "Calculus" },
  { id: "11-B", name: "Class 11-B", students: 27, subject: "Calculus" },
];

export const Route = createFileRoute("/teacher/classes")({
  head: () => ({ meta: [{ title: "My Classes — Teacher" }] }),
  component: () => (
    <>
      <PageHeader title="My Classes" description="Classes you're teaching this term" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(c => (
          <Card key={c.id} className="hover-lift overflow-hidden">
            <div className="h-1 bg-gradient-brand" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Layers className="h-5 w-5" /></div>
                <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />{c.students}</Badge>
              </div>
              <h3 className="font-semibold text-lg mt-3">{c.name}</h3>
              <p className="text-sm text-muted-foreground">{c.subject}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  ),
});
