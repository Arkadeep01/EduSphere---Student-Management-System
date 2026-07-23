import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { request } from "@/services/request";

const STUDENT_API = "http://localhost:8000/api/student";

interface TimetableItem {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject: number;
  subject_name: string;
  room: string;
  is_library_session: boolean;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const todayIndex = new Date().getDay();
const todayName = DAY_NAMES[Math.max(0, todayIndex - 1)];

function StudentTimetableComponent() {
  const [entries, setEntries] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<TimetableItem[]>("/timetable/", undefined, STUDENT_API).then(data => {
      setEntries(data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const byDay: Record<string, TimetableItem[]> = {};
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
                    {day}{isToday && <span className="block text-[10px] font-normal text-primary">Today</span>}
                  </div>
                );
              })}
              {timeSlots.map(time => (
                <div key={time} className="contents">
                  <div className="text-xs text-muted-foreground p-2 font-mono">{time}</div>
                  {DAY_NAMES.slice(0, 5).map(day => {
                    const slot = byDay[day]?.find(e => e.start_time === time);
                    if (!slot) return <div key={day + time} className="p-3 rounded-lg border text-xs bg-muted/30"><span className="text-muted-foreground">—</span></div>;
                    const isLab = slot.is_library_session;
                    return (
                      <div key={day + time} className={cn(
                        "p-3 rounded-lg border text-xs transition-all",
                        isLab ? "bg-violet-50 dark:bg-violet-950/20 border-violet-200" :
                        "bg-gradient-to-br from-primary/5 to-brand/5"
                      )}>
                        <p className="font-semibold">{slot.subject_name}</p>
                        <p className="text-muted-foreground">{slot.room}</p>
                        {isLab && <Badge variant="secondary" className="mt-1 text-[8px] h-4">Library</Badge>}
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

export const Route = createFileRoute("/student/timetable")({
  head: () => ({ meta: [{ title: "Timetable — Student" }] }),
  component: StudentTimetableComponent,
});
