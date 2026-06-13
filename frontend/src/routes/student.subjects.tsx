import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Download, Video } from "lucide-react";
import { subjects } from "@/lib/mock-data";
import { useState } from "react";

function StudentSubjectsComponent() {
  const [selected, setSelected] = useState(subjects[0]);
  return (
      <>
        <PageHeader title="My Subjects" description="Notes, assignments and resources" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {subjects.map(s => (
            <Card key={s.id} onClick={() => setSelected(s)} className={`hover-lift cursor-pointer overflow-hidden ${selected.id === s.id ? "ring-2 ring-primary" : ""}`}>
              <div className={`h-24 bg-gradient-to-br ${s.color} flex items-center justify-center`}><BookOpen className="h-10 w-10 text-white/80" /></div>
              <CardContent className="p-5">
                <Badge variant="secondary">{s.code}</Badge>
                <h3 className="font-semibold mt-2">{s.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.teacher}</p>
                <Progress value={s.progress} className="mt-3 h-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card><CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">{selected.name}</h2>
          <Tabs defaultValue="overview">
            <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="notes">Notes</TabsTrigger><TabsTrigger value="assignments">Assignments</TabsTrigger><TabsTrigger value="resources">Resources</TabsTrigger></TabsList>
            <TabsContent value="overview" className="mt-4 space-y-3"><p className="text-sm text-muted-foreground">{selected.teacher} · {selected.code} · {selected.progress}% complete</p></TabsContent>
            <TabsContent value="notes" className="mt-4 space-y-2">
              {["Intro & Syllabus", "Chapter 1 Notes", "Chapter 2 Summary", "Mid-term Revision"].map(n => (
                <div key={n} className="flex items-center justify-between p-3 border rounded-lg"><div className="flex items-center gap-3"><FileText className="h-4 w-4 text-primary" /><span className="text-sm">{n}</span></div><Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button></div>
              ))}
            </TabsContent>
            <TabsContent value="assignments" className="mt-4 space-y-2">
              {["Problem set 1", "Lab report 2"].map(a => (
                <div key={a} className="flex items-center justify-between p-3 border rounded-lg"><span className="text-sm">{a}</span><Button size="sm" variant="outline">Submit</Button></div>
              ))}
            </TabsContent>
            <TabsContent value="resources" className="mt-4 space-y-2">
              {[["Recorded Lecture 01", Video], ["Reference Book PDF", FileText], ["Practice worksheet", FileText]].map(([n, I], i) => {
                const Icon = I as typeof Video;
                return <div key={i} className="flex items-center justify-between p-3 border rounded-lg"><div className="flex items-center gap-3"><Icon className="h-4 w-4 text-primary" /><span className="text-sm">{n as string}</span></div><Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button></div>;
              })}
            </TabsContent>
          </Tabs>
        </CardContent></Card>
      </>
    );

}

export const Route = createFileRoute("/student/subjects")({
  head: () => ({ meta: [{ title: "My Subjects — Student" }] }),
  component: StudentSubjectsComponent,
});
