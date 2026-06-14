import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem, HoverLift } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Upload, FileText, Video, Download, CheckCircle2, Users, Layers } from "lucide-react";
import { teacherSubjectData } from "@/lib/mock-data";

export const Route = createFileRoute("/teacher/subjects")({
  head: () => ({ meta: [{ title: "My Subject — Teacher" }] }),
  component: () => {
    const subject = teacherSubjectData;
    const completedChapters = subject.chapters.filter(c => c.completed).length;

    return (
      <PageWrapper>
        {/* Subject Info Cards */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StaggerItem><Card><CardContent className="p-4 text-center">
            <Layers className="h-5 w-5 mx-auto text-primary" />
            <p className="text-2xl font-bold mt-2">{subject.classes.length}</p>
            <p className="text-xs text-muted-foreground">Classes</p>
          </CardContent></Card></StaggerItem>
          <StaggerItem><Card><CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-brand" />
            <p className="text-2xl font-bold mt-2">{subject.totalStudents}</p>
            <p className="text-xs text-muted-foreground">Students</p>
          </CardContent></Card></StaggerItem>
          <StaggerItem><Card><CardContent className="p-4 text-center">
            <BookOpen className="h-5 w-5 mx-auto text-info" />
            <p className="text-2xl font-bold mt-2">{completedChapters}/{subject.chapters.length}</p>
            <p className="text-xs text-muted-foreground">Chapters</p>
          </CardContent></Card></StaggerItem>
          <StaggerItem><Card><CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto text-success" />
            <p className="text-2xl font-bold mt-2">{subject.evaluations.completed}/{subject.evaluations.total}</p>
            <p className="text-xs text-muted-foreground">Evaluations</p>
          </CardContent></Card></StaggerItem>
        </StaggerContainer>

        {/* Main Details */}
        <Card><CardContent className="p-6">
          <Tabs defaultValue="chapters">
            <TabsList>
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
            </TabsList>

            <TabsContent value="chapters" className="mt-4 space-y-3">
              {subject.chapters.map(ch => (
                <div key={ch.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {ch.completed ? <CheckCircle2 className="h-5 w-5 text-success" /> : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />}
                    <div><p className="text-sm font-medium">{ch.title}</p><p className="text-xs text-muted-foreground">{ch.completedLessons}/{ch.lessons} lessons completed</p></div>
                  </div>
                  <Progress value={ch.completed ? 100 : (ch.completedLessons / ch.lessons) * 100} className="w-24 h-1.5" />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="classes" className="mt-4">
              <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subject.classes.map(cls => (
                  <StaggerItem key={cls}>
                    <HoverLift>
                      <Card className="cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Layers className="h-5 w-5 text-primary" /></div>
                          <div><p className="font-semibold">{cls}</p><p className="text-xs text-muted-foreground">{subject.name}</p></div>
                        </CardContent>
                      </Card>
                    </HoverLift>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </TabsContent>

            <TabsContent value="resources" className="mt-4 space-y-3">
              <Button size="sm" className="bg-gradient-brand border-0"><Upload className="mr-2 h-4 w-4" />Upload resource</Button>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                {subject.resources.map(r => {
                  const Icon = r.type === "video" ? Video : r.type === "note" ? FileText : FileText;
                  return (
                    <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <div className="min-w-0"><p className="text-sm font-medium truncate">{r.title}</p><p className="text-xs text-muted-foreground">{r.size} · {r.class}</p></div>
                      </div>
                      <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="evaluations" className="mt-4">
              <Card><CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div><p className="text-2xl font-bold">{subject.evaluations.pending}</p><p className="text-xs text-muted-foreground">Pending Evaluation</p></div>
                  <div><p className="text-2xl font-bold text-success">{subject.evaluations.completed}</p><p className="text-xs text-muted-foreground">Completed</p></div>
                  <div><p className="text-2xl font-bold text-primary">{subject.evaluations.total}</p><p className="text-xs text-muted-foreground">Total</p></div>
                </div>
                <Progress value={(subject.evaluations.completed / subject.evaluations.total) * 100} className="h-2" />
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </CardContent></Card>
      </PageWrapper>
    );
  },
});
