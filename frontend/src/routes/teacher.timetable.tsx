import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { teacherTimetable } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Coffee, Library, Beaker } from "lucide-react";

const todayName = new Date().toLocaleDateString("en-US", { weekday: "short" });
const timeSlots = [...new Set(teacherTimetable.flatMap(d => d.slots.map(s => s[0])))];

export const Route = createFileRoute("/teacher/timetable")({
  head: () => ({ meta: [{ title: "Timetable — Teacher" }] }),
  component: () => (
    <PageWrapper>
      <Card><CardContent className="p-4 overflow-x-auto">
        <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2 min-w-[700px]">
          <div className="font-semibold text-xs text-muted-foreground p-2">Time</div>
          {teacherTimetable.map(d => {
            const isToday = d.day === todayName;
            return (
              <div key={d.day} className={cn("font-semibold text-sm p-2 text-center", isToday && "text-primary")}>
                {d.day}{isToday && <span className="block text-[10px] font-normal">Today</span>}
              </div>
            );
          })}
          {timeSlots.map(time => (
            <div key={time} className="contents">
              <div className="text-xs text-muted-foreground p-2 font-mono">{time}</div>
              {teacherTimetable.map(d => {
                const slot = d.slots.find(s => s[0] === time);
                if (!slot) return <div key={d.day + time} className="p-3 rounded-lg border text-xs bg-muted/30"><span className="text-muted-foreground">—</span></div>;
                const isRecess = slot[1] === "Recess";
                const isLab = slot[1] === "Lab";
                const isLibrary = slot[1] === "Library";
                return (
                  <div key={d.day + time} className={cn(
                    "p-3 rounded-lg border text-xs transition-all",
                    isRecess ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200" :
                    isLab ? "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200" :
                    isLibrary ? "bg-violet-50 dark:bg-violet-950/20 border-violet-200" :
                    "bg-gradient-to-br from-primary/5 to-brand/5"
                  )}>
                    {isRecess ? <><Coffee className="h-4 w-4 mx-auto text-amber-500" /><p className="font-medium text-center mt-1 text-amber-600">Recess</p></> :
                     isLab ? <><Beaker className="h-4 w-4 text-cyan-500" /><p className="font-semibold mt-1">{slot[3]}</p><Badge variant="secondary" className="text-[8px] h-4 mt-1">Lab</Badge></> :
                     isLibrary ? <><Library className="h-4 w-4 text-violet-500" /><p className="font-semibold mt-1">Library Session</p><p className="text-muted-foreground">{slot[3]}</p></> :
                     <><p className="font-semibold">{slot[1]}</p><p className="text-muted-foreground">{slot[2]}</p><p className="text-muted-foreground/70">{slot[3]}</p></>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent></Card>
    </PageWrapper>
  ),
});
