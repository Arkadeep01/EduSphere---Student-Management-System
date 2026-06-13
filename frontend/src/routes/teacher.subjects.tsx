import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Upload, Plus, FileText, Video, Download } from "lucide-react";
import { subjects, assignments } from "@/lib/mock-data";

export const Route = createFileRoute("/teacher/subjects")({
  head: () => ({ meta: [{ title: "My Subjects — Teacher" }] }),
  component: () => (
    <>
      <PageHeader title="My Subjects" description="Manage notes, assignments and resources" />
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {subjects.slice(0, 3).map(s => (
          <Card key={s.id} className="hover-lift overflow-hidden">
            <div className={`h-24 bg-gradient-to-br ${s.color} flex items-center justify-center`}><BookOpen className="h-10 w-10 text-white/80" /></div>
            <CardContent className="p-5">
              <Badge variant="secondary">{s.code}</Badge>
              <h3 className="font-semibold text-lg mt-2">{s.name}</h3>
              <Progress value={s.progress} className="mt-3" />
              <p className="text-xs text-muted-foreground mt-1">{s.progress}% syllabus covered</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card><CardContent className="p-6">
        <Tabs defaultValue="overview">
          <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="notes">Notes</TabsTrigger><TabsTrigger value="assignments">Assignments</TabsTrigger><TabsTrigger value="resources">Resources</TabsTrigger><TabsTrigger value="submissions">Submissions</TabsTrigger></TabsList>
          <TabsContent value="overview" className="mt-4"><p className="text-sm text-muted-foreground">Quick summary of {subjects[0].name} — 6 modules, 12 lessons, 32 enrolled students.</p></TabsContent>
          <TabsContent value="notes" className="mt-4 space-y-3">
            <Button size="sm" className="bg-gradient-brand border-0"><Plus className="mr-2 h-4 w-4" />Create note</Button>
            {["Chapter 1: Algebra", "Chapter 2: Geometry", "Chapter 3: Trigonometry"].map(n => (
              <div key={n} className="flex items-center justify-between p-3 border rounded-lg"><div className="flex items-center gap-3"><FileText className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{n}</span></div><Button size="sm" variant="ghost">Edit</Button></div>
            ))}
          </TabsContent>
          <TabsContent value="assignments" className="mt-4 space-y-3">
            <Button size="sm" className="bg-gradient-brand border-0"><Plus className="mr-2 h-4 w-4" />New assignment</Button>
            {assignments.slice(0, 3).map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div><p className="font-medium text-sm">{a.title}</p><p className="text-xs text-muted-foreground">Due {a.due} · {a.submissions}/{a.total} submitted</p></div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="resources" className="mt-4 space-y-3">
            <Button size="sm" className="bg-gradient-brand border-0"><Upload className="mr-2 h-4 w-4" />Upload resource</Button>
            {[["Lecture recording 01", Video], ["Reference PDF", FileText], ["Practice sheet", FileText]].map(([n, I], i) => {
              const Icon = I as typeof Video;
              return <div key={i} className="flex items-center justify-between p-3 border rounded-lg"><div className="flex items-center gap-3"><Icon className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{n as string}</span></div><Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button></div>;
            })}
          </TabsContent>
          <TabsContent value="submissions" className="mt-4"><p className="text-sm text-muted-foreground">18 of 32 students have submitted the latest assignment.</p></TabsContent>
        </Tabs>
      </CardContent></Card>
    </>
  ),
});
