import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Coffee, Library, Beaker } from "lucide-react";
import { useState, useEffect } from "react";
import { request } from "@/services/request";

const TEACHER_API = "http://localhost:8000/api/teacher";

interface TimetableEntry {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  class_name: string;
  session_type: string;
  room: string;
  is_library_converted: boolean;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const todayIndex = new Date().getDay();
const todayName = DAY_NAMES[Math.max(0, todayIndex - 1)];

function TeacherTimetableComponent() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<TimetableEntry[]>("/timetable/", undefined, TEACHER_API).then(data => {
      setEntries(data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const byDay: Record<string, TimetableEntry[]> = {};
  DAY_NAMES.forEach(d => byDay[d] = []);
  entries.forEach(e => {
    const dayName = DAY_NAMES[e.day_of_week] || "Mon";
    if (!byDay[dayName]) byDay[dayName] = [];
    byDay[dayName].push(e);
  });

  const timeSlots = [...new Set(entries.map(e => e.start_time))].sort();

  return (
    <PageWrapper>
      <Card><CardContent className="p-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading timetable...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No timetable entries found</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2 min-w-[700px]">
              <div className="font-semibold text-xs text-muted-foreground p-2">Time</div>
              {DAY_NAMES.slice(0, 5).map(day => {
                const isToday = day === todayName;
                return (
                  <div key={day} className={cn("font-semibold text-sm p-2 text-center", isToday && "text-primary")}>
                    {day}{isToday && <span className="block text-[10px] font-normal">Today</span>}
                  </div>
                );
              })}
              {timeSlots.map(time => (
                <div key={time} className="contents">
                  <div className="text-xs text-muted-foreground p-2 font-mono">{time}</div>
                  {DAY_NAMES.slice(0, 5).map(day => {
                    const slot = byDay[day]?.find(e => e.start_time === time);
                    if (!slot) return <div key={day + time} className="p-3 rounded-lg border text-xs bg-muted/30"><span className="text-muted-foreground">—</span></div>;
                    const isLab = slot.session_type?.toLowerCase() === "lab";
                    const isLibrary = slot.is_library_converted;
                    return (
                      <div key={day + time} className={cn(
                        "p-3 rounded-lg border text-xs transition-all",
                        isLab ? "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200" :
                        isLibrary ? "bg-violet-50 dark:bg-violet-950/20 border-violet-200" :
                        "bg-gradient-to-br from-primary/5 to-brand/5"
                      )}>
                        {isLab ? <><Beaker className="h-4 w-4 text-cyan-500" /><p className="font-semibold mt-1">{slot.class_name}</p><Badge variant="secondary" className="text-[8px] h-4 mt-1">Lab</Badge></> :
                         isLibrary ? <><Library className="h-4 w-4 text-violet-500" /><p className="font-semibold mt-1">Library</p><p className="text-muted-foreground">{slot.room}</p></> :
                         <><p className="font-semibold">{slot.class_name}</p><p className="text-muted-foreground">{slot.room}</p></>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent></Card>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/teacher/timetable")({
  head: () => ({ meta: [{ title: "Timetable — Teacher" }] }),
  component: TeacherTimetableComponent,
});
