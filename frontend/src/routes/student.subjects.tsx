import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ChevronRight, CheckCircle2, Circle, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { studentSubjectApi, studentChapterApi } from "@/services/studentApi";
import { subjectRequestApi } from "@/services/adminApi";

interface Subject { id: number; name: string; code: string; tier: string; teacher_name: string; description: string; color: string; progress: number; }
interface Chapter { id: number; title: string; topics: { id: number; title: string; is_completed: boolean }[]; }

export const Route = createFileRoute("/student/subjects")({
  head: () => ({ meta: [{ title: "Subjects — Student" }] }),
  component: () => {
    const { user } = useAuth();
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
    const [mySubjectsList, setMySubjectsList] = useState<Subject[]>([]);
    const [pendingSubjectIds, setPendingSubjectIds] = useState<number[]>([]);
    const [requestEnabled, setRequestEnabled] = useState(false);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [activeTab, setActiveTab] = useState("list");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      (async () => {
        try {
          const [all, my, reqCtrl] = await Promise.all([
            studentSubjectApi.listAll().catch(() => []),
            studentSubjectApi.mySubjects().catch(() => ({ assigned: [], pending: [] })),
            subjectRequestApi.get().catch(() => ({ enabled: false })),
          ]);
          setAllSubjects(all as Subject[] || []);
          setMySubjectsList((my as any)?.assigned || []);
          setPendingSubjectIds((my as any)?.pending?.map((p: any) => p.subject) || []);
          setRequestEnabled(reqCtrl?.enabled || false);
        } catch { toast.error("Failed to load subjects"); }
        finally { setLoading(false); }
      })();
    }, []);

    const loadChapters = async (subjectId: number) => {
      try {
        const c = await studentChapterApi.list(subjectId);
        setChapters(c as Chapter[]);
      } catch { toast.error("Failed to load chapters"); }
    };

    const handleSelectSubject = (s: Subject) => {
      setSelectedSubject(s);
      loadChapters(s.id);
      setActiveTab("detail");
    };

    const handleRequestSubject = async (subjectId: number) => {
      try {
        await studentSubjectApi.select([subjectId]);
        toast.success("Subject request submitted");
        setPendingSubjectIds(prev => [...prev, subjectId]);
      } catch { toast.error("Failed to request subject"); }
    };

    const coreSubjects = allSubjects.filter(s => s.tier === "core");
    const specializedSubjects = allSubjects.filter(s => s.tier === "specialized" && !mySubjectsList.find(m => m.id === s.id));
    const enrichmentSubjects = allSubjects.filter(s => s.tier === "enrichment" && !mySubjectsList.find(m => m.id === s.id));

    if (loading) return <div className="text-center py-8 text-muted-foreground">Loading subjects...</div>;

    return (
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="list"><BookOpen className="h-4 w-4 mr-1" />My Subjects</TabsTrigger>
            {selectedSubject && <TabsTrigger value="detail">{selectedSubject.name}</TabsTrigger>}
            <TabsTrigger value="browse">Browse All</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mySubjectsList.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No subjects assigned yet</p>
                  {requestEnabled && <Button className="mt-3" variant="outline" onClick={() => setActiveTab("browse")}>Browse Subjects</Button>}
                </div>
              ) : mySubjectsList.map(s => (
                <Card key={s.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSelectSubject(s)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div><h3 className="font-semibold">{s.name}</h3><p className="text-xs text-muted-foreground">{s.code}</p></div>
                      <Badge variant="outline" className={`text-[9px] ${s.tier === "core" ? "border-primary" : s.tier === "specialized" ? "border-info" : "border-warning"}`}>{s.tier}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{s.teacher_name}</p>
                    <div className="mt-3 w-full bg-muted rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${s.progress || 0}%` }} /></div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">{s.progress || 0}% complete</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="detail">
            {selectedSubject && (
              <div className="space-y-4">
                <Card className="bg-gradient-brand border-0 text-white">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold">{selectedSubject.name}</h3>
                    <p className="text-sm opacity-80 mt-1">{selectedSubject.description}</p>
                    <div className="flex gap-3 mt-2 text-xs opacity-70"><span>Code: {selectedSubject.code}</span><span>Teacher: {selectedSubject.teacher_name}</span></div>
                  </CardContent>
                </Card>
                <Card><CardHeader><CardTitle>Syllabus</CardTitle></CardHeader>
                  <CardContent>
                    {chapters.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No syllabus available yet</p>
                    ) : (
                      <div className="space-y-3">
                        {chapters.map(ch => (
                          <div key={ch.id} className="border rounded-lg p-3">
                            <h4 className="font-medium text-sm">{ch.title}</h4>
                            {ch.topics && ch.topics.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {ch.topics.map(t => (
                                  <div key={t.id} className="flex items-center gap-2 text-xs">
                                    {t.is_completed ? <CheckCircle2 className="h-3 w-3 text-success" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
                                    <span className={t.is_completed ? "line-through text-muted-foreground" : ""}>{t.title}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse">
            {!requestEnabled ? (
              <Card><CardContent className="p-4 text-center text-muted-foreground"><AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-40" /><p>Subject requests are currently disabled</p></CardContent></Card>
            ) : (
              <div className="space-y-6">
                {coreSubjects.length > 0 && (
                  <div><h3 className="font-semibold mb-2">Core Subjects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {coreSubjects.filter(s => !mySubjectsList.find(m => m.id === s.id)).map(s => (
                        <Card key={s.id}><CardContent className="p-3 flex items-center justify-between">
                          <div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{s.code}</p></div>
                          <Badge>Enrolled</Badge>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                )}
                {specializedSubjects.length > 0 && (
                  <div><h3 className="font-semibold mb-2">Specialized Subjects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {specializedSubjects.map(s => (
                        <Card key={s.id}><CardContent className="p-3 flex items-center justify-between">
                          <div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{s.code}</p></div>
                          <Button size="sm" variant="outline" disabled={pendingSubjectIds.includes(s.id)} onClick={() => handleRequestSubject(s.id)}>
                            {pendingSubjectIds.includes(s.id) ? "Requested" : "Request"}
                          </Button>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                )}
                {enrichmentSubjects.length > 0 && (
                  <div><h3 className="font-semibold mb-2">Enrichment Subjects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {enrichmentSubjects.map(s => (
                        <Card key={s.id}><CardContent className="p-3 flex items-center justify-between">
                          <div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{s.code}</p></div>
                          <Button size="sm" variant="outline" disabled={pendingSubjectIds.includes(s.id)} onClick={() => handleRequestSubject(s.id)}>
                            {pendingSubjectIds.includes(s.id) ? "Requested" : "Request"}
                          </Button>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  },
});
