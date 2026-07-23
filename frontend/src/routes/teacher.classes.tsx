import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, StaggerContainer, StaggerItem, HoverLift } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Layers, Clock, BookOpen, User, MapPin } from "lucide-react";
import { ClassDetailSection } from "@/components/teacher/ClassDetailSection";
import { useState } from "react";
import { API_BASE } from "@/services/request";

const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
const headers = token ? { Authorization: `Bearer ${token}` } : {};

function useTeacherData<T>(key: string[], url: string) {
  return useQuery<T>({ queryKey: key, queryFn: async () => { const r = await fetch(url, { headers }); if (!r.ok) throw new Error("Failed"); return r.json(); }, enabled: !!token });
}

export const Route = createFileRoute("/teacher/classes")({
  head: () => ({ meta: [{ title: "My Classes — Teacher" }] }),
  component: () => {
    const [activeTab, setActiveTab] = useState("overview");

    const { data: classesData, isLoading: loadingClasses } = useTeacherData<any[]>(["teacher", "classes"], `${API_BASE}/api/teacher/classes/`);
    const { data: timetable } = useTeacherData<any[]>(["teacher", "timetable"], `${API_BASE}/api/teacher/timetable/`);
    const { data: library } = useTeacherData<any[]>(["teacher", "library-bookings"], `${API_BASE}/api/teacher/library-bookings/`);
    const { data: evalQueue } = useTeacherData<any[]>(["teacher", "eval-queue"], `${API_BASE}/api/teacher/evaluation/queue/`);

    const classNames = classesData?.map(c => c.class_name as string) ?? [];

    const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weeklyTimetable = dayLabels.map(day => {
      const dayIndex = dayLabels.indexOf(day);
      const entries = (timetable || []).filter((t: any) => t.day_of_week === dayIndex);
      return { day, entries };
    });

    function getClassInfo(cls: string) {
      const matches = (timetable || []).filter((t: any) => t.class_name === cls);
      const timings = matches.length > 0 ? `${matches[0].start_time} – ${matches[matches.length - 1].end_time}` : "N/A";
      const rooms = [...new Set(matches.map((t: any) => t.room).filter(Boolean))];
      return { name: cls, timings, room: rooms[0] || "N/A", periods: matches.length };
    }

    if (loadingClasses) return <PageWrapper><div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div></PageWrapper>;

    return (
      <PageWrapper>
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-brand/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div><h2 className="text-lg font-bold">My Classes</h2><p className="text-sm text-muted-foreground mt-1">{classNames.length} class{classNames.length > 1 ? "es" : ""} assigned</p></div>
            <div className="flex gap-4 text-sm">
              <div className="text-center"><p className="text-xl font-bold text-primary">{classNames.length}</p><p className="text-xs text-muted-foreground">Classes</p></div>
              <div className="text-center"><p className="text-xl font-bold text-success">{evalQueue?.filter((e: any) => e.evaluation_status === "completed").length || 0}</p><p className="text-xs text-muted-foreground">Evaluated</p></div>
              <div className="text-center"><p className="text-xl font-bold text-warning">{evalQueue?.filter((e: any) => e.evaluation_status === "pending").length || 0}</p><p className="text-xs text-muted-foreground">Pending</p></div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview"><Layers className="h-4 w-4 mr-1" />Overview</TabsTrigger>
            <TabsTrigger value="timetable"><Clock className="h-4 w-4 mr-1" />Timetable</TabsTrigger>
            <TabsTrigger value="library"><BookOpen className="h-4 w-4 mr-1" />Library</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classNames.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-muted-foreground">No classes assigned</div>
              ) : classNames.map(cls => {
                const info = getClassInfo(cls);
                return (
                  <StaggerItem key={cls}>
                    <HoverLift><Card className="cursor-pointer" onClick={() => setActiveTab("timetable")}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div><h3 className="font-semibold text-lg">{cls}</h3><p className="text-xs text-muted-foreground mt-1">{info.periods} periods/day</p></div>
                          <Badge variant="outline">{info.room}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{info.timings}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{info.room}</span>
                        </div>
                      </CardContent>
                    </Card></HoverLift>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </TabsContent>

          <TabsContent value="timetable">
            <Card><CardContent className="p-0">
              {weeklyTimetable.map(({ day, entries }) => (
                <div key={day} className="border-b last:border-b-0">
                  <div className="px-4 py-2 bg-muted/30 font-medium text-sm">{day}</div>
                  {entries.length === 0 ? (
                    <div className="px-4 py-2 text-xs text-muted-foreground">No classes</div>
                  ) : entries.map((e: any, i: number) => (
                    <div key={i} className="px-4 py-2 flex items-center justify-between text-sm border-t border-border/50">
                      <span className="font-medium">{e.class_name}</span>
                      <span className="text-xs text-muted-foreground">{e.start_time} – {e.end_time}</span>
                      <span className="text-xs text-muted-foreground">{e.room || ""}</span>
                      <Badge variant="outline" className="text-[9px]">{e.session_type}</Badge>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="library">
            <Card><CardContent className="p-4">
              {(library || []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>No library bookings</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(library as any[]).map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between border rounded-lg p-3 text-sm">
                      <div><p className="font-medium">{b.room}</p><p className="text-xs text-muted-foreground">{b.date}</p></div>
                      <span className="text-xs">{b.start_time} – {b.end_time}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </PageWrapper>
    );
  },
});
