import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem, HoverLift } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Layers, Clock, Library, Coffee, BookOpen, Calendar, User, MapPin } from "lucide-react";
import { teacherSubjectData, teacherTimetable, librarySlots, classStudents, classTeacherAssignments, type LibrarySlot } from "@/lib/mock-data";
import { ClassDetailSection } from "@/components/teacher/ClassDetailSection";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/teacher/classes")({
  head: () => ({ meta: [{ title: "My Classes — Teacher" }] }),
  component: () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [slots, setSlots] = useState<LibrarySlot[]>(librarySlots);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);

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

    function handleBookSlot(slot: LibrarySlot) {
      setSlots(prev => prev.map(s =>
        s.id === slot.id
          ? { ...s, available: false, bookedBy: teacherSubjectData.teacher, subject: teacherSubjectData.name, class: slot.class || "N/A", section: "-" }
          : s
      ));
      toast.success(`Library session booked for ${slot.day} (${slot.start} – ${slot.end})`);
    }

    const availableSlots = slots.filter(s => s.available);
    const bookedSlots = slots.filter(s => !s.available);

    function getClassInfo(cls: string) {
      const students = classStudents[cls] || [];
      const baseClass = cls.split("-")[0];
      const section = cls.split("-")[1] || "A";
      const ct = classTeacherAssignments.find(t => t.class === baseClass);
      const timetableEntries = teacherTimetable.flatMap(d =>
        d.slots.filter(s => s[1] === cls)
      );
      const timings = timetableEntries.length > 0
        ? `${formatTime12(timetableEntries[0][0])} – ${formatTime12(timetableEntries[timetableEntries.length - 1][0].replace(/^\d+/, h => `${+h + 1}`))}`
        : "N/A";
      const room = timetableEntries[0]?.[3] || "N/A";
      return {
        name: cls,
        section,
        subject: teacherSubjectData.name,
        totalStudents: students.length,
        classTeacher: ct?.teacher || "N/A",
        timings,
        room,
      };
    }

    return (
      <PageWrapper>
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
                const sectionCount = students.length > 0 ? [...new Set(students.map(s => s.class.split("-")[1] || "A"))].length : 0;
                return (
                  <StaggerItem key={cls}>
                    <HoverLift>
                      <Card
                        className={`overflow-hidden cursor-pointer transition-all duration-200 ${
                          selectedClass === cls ? "ring-2 ring-primary shadow-lg" : ""
                        }`}
                        onClick={() => setSelectedClass(selectedClass === cls ? null : cls)}
                      >
                        <div className="h-1 bg-gradient-brand" />
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Layers className="h-5 w-5" /></div>
                            <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />{students.length}</Badge>
                          </div>
                          <h3 className="font-semibold text-lg mt-3">{cls}</h3>
                          <p className="text-sm text-muted-foreground">{teacherSubjectData.name}</p>
                          <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                            <span>{sectionCount} section{sectionCount > 1 ? "s" : ""}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </HoverLift>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            {selectedClass && (
              <ClassDetailSection
                classInfo={getClassInfo(selectedClass)}
                onClose={() => setSelectedClass(null)}
              />
            )}
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

          <TabsContent value="library" className="mt-4 space-y-6">
            <Card><CardHeader><CardTitle>Book a Library Session</CardTitle></CardHeader><CardContent>
              <p className="text-sm text-muted-foreground mb-4">Available library slots. Booked slots are shown below.</p>
              {availableSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No available library slots at this time.</p>
              ) : (
                <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableSlots.map(slot => (
                    <StaggerItem key={slot.id}>
                      <HoverLift>
                        <Card className="cursor-pointer border-success/30">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Library className="h-4 w-4 text-success" />
                              <Badge className="bg-success/10 text-success border-0">{slot.day}</Badge>
                              <Badge variant="outline" className="text-[10px]">Available</Badge>
                            </div>
                            <p className="text-sm font-medium"><Calendar className="h-3 w-3 inline mr-1" />{slot.date}</p>
                            <p className="text-xs text-muted-foreground"><Clock className="h-3 w-3 inline mr-1" />{slot.start} – {slot.end}</p>
                            <p className="text-xs text-muted-foreground"><MapPin className="h-3 w-3 inline mr-1" />{slot.room}</p>
                            <Button size="sm" className="mt-3 w-full bg-gradient-brand border-0" onClick={() => handleBookSlot(slot)}>Book Slot</Button>
                          </CardContent>
                        </Card>
                      </HoverLift>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </CardContent></Card>

            {bookedSlots.length > 0 && (
              <Card><CardHeader><CardTitle>Booked Library Sessions</CardTitle></CardHeader><CardContent>
                <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bookedSlots.map(slot => (
                    <StaggerItem key={slot.id}>
                      <Card className="border-violet-300 bg-violet-50/50 dark:bg-violet-950/10">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Library className="h-4 w-4 text-violet-500" />
                            <Badge variant="secondary">{slot.day}</Badge>
                            <Badge className="bg-violet-500/10 text-violet-600 border-0 text-[10px]">Booked</Badge>
                          </div>
                          <p className="text-sm font-medium"><Calendar className="h-3 w-3 inline mr-1" />{slot.date}</p>
                          <p className="text-xs text-muted-foreground"><Clock className="h-3 w-3 inline mr-1" />{slot.start} – {slot.end}</p>
                          <p className="text-xs text-muted-foreground"><MapPin className="h-3 w-3 inline mr-1" />{slot.room}</p>
                          <div className="mt-2 pt-2 border-t text-xs space-y-1">
                            {slot.bookedBy && <p><User className="h-3 w-3 inline mr-1" />{slot.bookedBy}</p>}
                            {slot.subject && <p><BookOpen className="h-3 w-3 inline mr-1" />{slot.subject}</p>}
                            {slot.class && <p><Layers className="h-3 w-3 inline mr-1" />{slot.class}{slot.section ? ` · Section ${slot.section}` : ""}</p>}
                            <p className="text-muted-foreground">{slot.start} – {slot.end} · {slot.room}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </CardContent></Card>
            )}
          </TabsContent>
        </Tabs>
      </PageWrapper>
    );
  },
});
