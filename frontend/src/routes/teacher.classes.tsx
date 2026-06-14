import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem, HoverLift } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Layers, Clock, Library, Coffee } from "lucide-react";
import { teacherSubjectData, teacherTimetable, librarySlots, classStudents } from "@/lib/mock-data";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/teacher/classes")({
  head: () => ({ meta: [{ title: "My Classes — Teacher" }] }),
  component: () => {
    const [activeTab, setActiveTab] = useState("overview");

    const allTimeSlots = [...new Set(teacherTimetable.flatMap(d => d.slots.map(s => s[0])))];
    const earliestTime = allTimeSlots.reduce((min, t) => t < min ? t : min, "99:99");
    const latestTime = allTimeSlots.reduce((max, t) => t > max ? t : max, "00:00");
    const formatTime12 = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
    };
    const workingHours = `${formatTime12(earliestTime)} – ${formatTime12(latestTime)}`;
    const recessSlots = teacherTimetable.flatMap(d => d.slots.filter(s => s[1] === "Recess"));
    const recessStart = recessSlots[0]?.[0] || "";
    const recessTimeText = recessStart ? `${formatTime12(recessStart)} – ${formatTime12(`${+recessStart.split(":")[0] + 1}:${recessStart.split(":")[1]}`)}` : "";
    const sessionTypesList = [...new Set(teacherTimetable.flatMap(d => d.slots.filter(s => s[1] !== "Recess").map(s => s[1]).filter(t => t !== "Lab" && t !== "Library")))].length > 0 ? "Regular" : "";
    const hasLab = teacherTimetable.some(d => d.slots.some(s => s[1] === "Lab"));
    const hasLibrary = teacherTimetable.some(d => d.slots.some(s => s[1] === "Library"));
    const classTypes = [sessionTypesList, ...(hasLab ? ["Lab"] : []), ...(hasLibrary ? ["Library"] : [])].filter(Boolean).join(", ");

    return (
      <PageWrapper>
        {/* Working Hours Banner */}
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-brand/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Working Hours: {workingHours}</p>
              <p className="text-xs text-muted-foreground">Recess: {recessTimeText} · Classes include {classTypes} sessions</p>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Class Overview</TabsTrigger>
            <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="library">Library Conversion</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherSubjectData.classes.map(cls => {
                const students = classStudents[cls] || [];
                return (
                  <StaggerItem key={cls}>
                    <HoverLift>
                      <Card className="overflow-hidden cursor-pointer">
                        <div className="h-1 bg-gradient-brand" />
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Layers className="h-5 w-5" /></div>
                            <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />{students.length}</Badge>
                          </div>
                          <h3 className="font-semibold text-lg mt-3">{cls}</h3>
                          <p className="text-sm text-muted-foreground">{teacherSubjectData.name}</p>
                        </CardContent>
                      </Card>
                    </HoverLift>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </TabsContent>

          <TabsContent value="schedule" className="mt-4">
            <Card><CardContent className="p-4 overflow-x-auto">
              <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2 min-w-[700px]">
                <div className="font-semibold text-xs text-muted-foreground p-2">Time</div>
                {teacherTimetable.map(d => <div key={d.day} className="font-semibold text-sm p-2 text-center">{d.day}</div>)}
                {allTimeSlots.map(time => (
                  <div key={time} className="contents">
                    <div className="text-xs text-muted-foreground p-2 font-mono">{time}</div>
                    {teacherTimetable.map(d => {
                      const slot = d.slots.find(s => s[0] === time);
                      if (!slot) return <div key={d.day + time} className="p-3 rounded-lg border text-xs bg-muted/30"><span className="text-muted-foreground">—</span></div>;
                      const isRecess = slot[1] === "Recess";
                      const isLab = slot[1] === "Lab";
                      const isLibrary = slot[1] === "Library";
                      return (
                        <div key={d.day + time} className={`p-3 rounded-lg border text-xs ${
                          isRecess ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200" :
                          isLab ? "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200" :
                          isLibrary ? "bg-violet-50 dark:bg-violet-950/20 border-violet-200" :
                          "bg-gradient-to-br from-primary/5 to-brand/5"
                        }`}>
                          {isRecess ? <><Coffee className="h-4 w-4 mx-auto text-amber-500" /><p className="font-medium text-center mt-1">Recess</p></> :
                           isLab ? <><p className="font-semibold">{slot[3]}</p><Badge variant="secondary" className="text-[8px] h-4">Lab</Badge></> :
                           isLibrary ? <><Library className="h-4 w-4 text-violet-500" /><p className="font-semibold">{slot[3]}</p><Badge variant="secondary" className="text-[8px] h-4">Library</Badge></> :
                           <><p className="font-semibold">{slot[1]}</p><p className="text-muted-foreground">{slot[2]}</p><p className="text-muted-foreground/70">{slot[3]}</p></>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="library" className="mt-4">
            <Card><CardHeader><CardTitle>Convert Class to Library Session</CardTitle></CardHeader><CardContent>
              <p className="text-sm text-muted-foreground mb-4">Select a class slot to convert to a library session. Only available library slots are shown.</p>
              <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {librarySlots.filter(s => s.available).map(slot => (
                  <StaggerItem key={slot.id}>
                    <HoverLift>
                      <Card className="cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Library className="h-4 w-4 text-violet-500" />
                            <Badge variant="secondary">{slot.day}</Badge>
                          </div>
                          <p className="text-sm font-medium">{slot.date}</p>
                          <p className="text-xs text-muted-foreground">{slot.start} – {slot.end} · {slot.room}</p>
                          <Button size="sm" className="mt-3 w-full bg-gradient-brand border-0" onClick={() => toast.success(`Library session booked for ${slot.day}`)}>Book Slot</Button>
                        </CardContent>
                      </Card>
                    </HoverLift>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </PageWrapper>
    );
  },
});
