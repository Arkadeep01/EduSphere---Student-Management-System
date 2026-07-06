import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem, HoverLift } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Download, Video } from "lucide-react";
import { coreSubjects, specializedSubjects, enrichedSubjects, subjectSelection, assignments, studentSubjectResources, subjectRequestRecords } from "@/lib/mock-data";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type SubjectType = typeof coreSubjects[number];
type RequestStatuses = Record<string, string>;

const MOCK_STUDENT_ID = "STU1000";
const MAX_REQUESTS = 3;

function getSubjectStatus(subject: SubjectType): string {
  if (subject.category === "core") {
    const found = subjectSelection.core.find(s => s.id === subject.id);
    return found?.status || "selected";
  }
  if (subject.category === "specialized") {
    const found = subjectSelection.specialized.find(s => s.id === subject.id);
    return found?.status || "not_selected";
  }
  const found = subjectSelection.enriched.find(s => s.id === subject.id);
  return found?.status || "not_selected";
}

function StudentSubjectsComponent() {
  const [selected, setSelected] = useState(coreSubjects[0]);
  const [requestStatuses, setRequestStatuses] = useState<RequestStatuses>({});
  const [requestsEnabled, setRequestsEnabled] = useState(true);
  const studentRequests = subjectRequestRecords.filter(r => r.studentId === MOCK_STUDENT_ID);
  const [requestCount, setRequestCount] = useState(studentRequests.length);
  const limitReached = requestCount >= MAX_REQUESTS;

  useEffect(() => {
    async function checkToggle() {
      try {
        const { subjectRequestApi } = await import("@/services/adminApi");
        const res = await subjectRequestApi.get();
        setRequestsEnabled(res.enabled);
      } catch {
        setRequestsEnabled(true);
      }
    }
    checkToggle();
  }, []);

  const statusBadge = (status?: string) => {
    if (status === "selected") return <Badge className="bg-success text-success-foreground border-0 text-xs">Selected</Badge>;
    if (status === "request_pending") return <Badge variant="secondary" className="bg-warning/15 text-warning-foreground text-xs">Request Pending</Badge>;
    if (status === "not_selected") return <Badge variant="outline" className="text-xs text-muted-foreground border-dashed">Not Selected</Badge>;
    return null;
  };

  const handleRequestSubject = (subject: SubjectType) => {
    const key = `${subject.category}-${subject.id}`;
    setRequestStatuses(prev => ({ ...prev, [key]: "request_pending" }));
    subjectRequestRecords.push({
      id: `sr${Date.now()}`,
      studentId: MOCK_STUDENT_ID,
      studentName: "Aarav Sharma",
      rollNumber: MOCK_STUDENT_ID,
      class: "10-A",
      section: "A",
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      subjectCategory: subject.category,
      requestedOn: new Date().toISOString().slice(0, 10),
      status: "pending",
    });
    setRequestCount(prev => prev + 1);
    toast.success(`Request sent for ${subject.name}. Waiting for admin approval.`);
  };

  const displayStatus = (subject: SubjectType): string => {
    const key = `${subject.category}-${subject.id}`;
    if (requestStatuses[key]) return requestStatuses[key];
    return getSubjectStatus(subject);
  };

  const canRequest = (subject: SubjectType): boolean => {
    if (!requestsEnabled) return false;
    if (limitReached) return false;
    return displayStatus(subject) === "not_selected";
  };

  const requestDisabledReason = (): string | null => {
    if (!requestsEnabled) return "Subject requests are currently disabled by the administration.";
    if (limitReached) return "Maximum subject request limit reached. Please contact Administration for further changes.";
    return null;
  };

  return (
    <PageWrapper>
      {!requestsEnabled && (
        <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm text-warning-foreground">
          Subject requests are currently disabled by the administration.
        </div>
      )}
      {limitReached && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive-foreground">
          Maximum subject request limit reached. Please contact Administration for further changes.
        </div>
      )}
      {/* Subject Category Tabs */}
      <Tabs defaultValue="core" className="mb-6">
        <TabsList className="mx-auto">
          <TabsTrigger value="core">Core Subjects</TabsTrigger>
          <TabsTrigger value="specialized">Specialized</TabsTrigger>
          <TabsTrigger value="enriched">Enriched</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="mt-4">
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreSubjects.map(s => (
              <StaggerItem key={s.id}><HoverLift><Card onClick={() => setSelected(s)} className={`cursor-pointer overflow-hidden ${selected.id === s.id ? "ring-2 ring-primary" : ""}`}>
                <div className={`h-20 bg-gradient-to-br ${s.color} flex items-center justify-center`}><BookOpen className="h-8 w-8 text-white/80" /></div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">{s.code}</Badge>
                    <Badge className="bg-primary/10 text-primary border-0 text-[10px]">Core</Badge>
                  </div>
                  <h3 className="font-semibold mt-2 text-sm">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{s.teacher}</p>
                  <Progress value={s.progress} className="mt-2 h-1.5" />
                </CardContent>
              </Card></HoverLift></StaggerItem>
            ))}
          </StaggerContainer>
        </TabsContent>

        <TabsContent value="specialized" className="mt-4">
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specializedSubjects.map(s => {
              const status = displayStatus(s);
              return (
                <StaggerItem key={s.id}><HoverLift><Card onClick={() => setSelected(s)} className={`cursor-pointer overflow-hidden ${selected.id === s.id ? "ring-2 ring-primary" : ""}`}>
                  <div className={`h-20 bg-gradient-to-br ${s.color} flex items-center justify-center`}><BookOpen className="h-8 w-8 text-white/80" /></div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px]">{s.code}</Badge>
                      {statusBadge(status)}
                    </div>
                    <h3 className="font-semibold mt-2 text-sm">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.teacher}</p>
                  </CardContent>
                </Card></HoverLift></StaggerItem>
              );
            })}
          </StaggerContainer>
        </TabsContent>

        <TabsContent value="enriched" className="mt-4">
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrichedSubjects.map(s => {
              const status = displayStatus(s);
              return (
                <StaggerItem key={s.id}><HoverLift><Card onClick={() => setSelected(s)} className={`cursor-pointer overflow-hidden ${selected.id === s.id ? "ring-2 ring-primary" : ""}`}>
                  <div className={`h-20 bg-gradient-to-br ${s.color} flex items-center justify-center`}><BookOpen className="h-8 w-8 text-white/80" /></div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px]">{s.code}</Badge>
                      {statusBadge(status)}
                    </div>
                    <h3 className="font-semibold mt-2 text-sm">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.teacher}</p>
                  </CardContent>
                </Card></HoverLift></StaggerItem>
              );
            })}
          </StaggerContainer>
        </TabsContent>
      </Tabs>

      {/* Selected Subject Detail Panel */}
      <Card><CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{selected.name}</h2>
            <p className="text-sm text-muted-foreground">{selected.code} · {selected.teacher}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="capitalize">{selected.category}</Badge>
            {canRequest(selected) && (
              <Button size="sm" onClick={() => handleRequestSubject(selected)} className="bg-gradient-brand border-0">
                Request Subject
              </Button>
            )}
            {displayStatus(selected) === "not_selected" && !canRequest(selected) && (
              <span className="text-xs text-muted-foreground">{requestDisabledReason()}</span>
            )}
          </div>
        </div>
        <Tabs defaultValue="overview">
          <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="notes">Notes</TabsTrigger><TabsTrigger value="assignments">Assignments</TabsTrigger><TabsTrigger value="resources">Resources</TabsTrigger></TabsList>
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{selected.description || "No description available."}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 border rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Subject Type</p>
                <p className="text-sm font-semibold capitalize">{selected.category}</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Assigned Teacher</p>
                <p className="text-sm font-semibold">{selected.teacher}</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-sm font-semibold">{selected.progress}%</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-semibold">{statusBadge(displayStatus(selected))}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Progress</p>
              <Progress value={selected.progress} className="h-2" />
            </div>
          </TabsContent>
          <TabsContent value="notes" className="mt-4 space-y-2">
            {["Intro & Syllabus", "Chapter 1 Notes", "Chapter 2 Summary", "Mid-term Revision"].map(n => (
              <div key={n} className="flex items-center justify-between p-3 border rounded-lg"><div className="flex items-center gap-3"><FileText className="h-4 w-4 text-primary" /><span className="text-sm">{n}</span></div><Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button></div>
            ))}
          </TabsContent>
          <TabsContent value="assignments" className="mt-4 space-y-2">
            {assignments.filter(a => a.subject === selected.name).map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div><span className="text-sm font-medium">{a.title}</span><p className="text-xs text-muted-foreground">Due {a.due}</p></div>
                <Button size="sm" variant="outline">Submit</Button>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="resources" className="mt-4 space-y-2">
            {(studentSubjectResources[selected.name] || []).map(r => {
              const Icon = r.type === "video" ? Video : r.type === "note" ? FileText : FileText;
              return (
                <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3"><Icon className="h-4 w-4 text-primary" /><span className="text-sm">{r.title} <span className="text-xs text-muted-foreground">({r.size})</span></span></div>
                  <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                </div>
              );
            })}
            {(!studentSubjectResources[selected.name] || studentSubjectResources[selected.name].length === 0) && (
              <p className="text-sm text-muted-foreground py-4 text-center">No resources available for this subject.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent></Card>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/student/subjects")({
  head: () => ({ meta: [{ title: "My Subjects — Student" }] }),
  component: StudentSubjectsComponent,
});
