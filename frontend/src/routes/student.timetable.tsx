import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timetable } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const todayName = new Date().toLocaleDateString("en-US", { weekday: "short" });
const currentTime = `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`;

export const Route = createFileRoute("/student/timetable")({
  head: () => ({ meta: [{ title: "Timetable — Student" }] }),
  component: () => (
    <PageWrapper>
      <Card><CardContent className="p-4 overflow-x-auto">
        <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2 min-w-[700px]">
          <div className="font-semibold text-xs text-muted-foreground p-2">Time</div>
          {timetable.map(d => {
            const isToday = d.day === todayName;
            return (
              <div key={d.day} className={cn("font-semibold text-sm p-2 text-center", isToday && "text-primary")}>
                {d.day}{isToday && <span className="block text-[10px] font-normal text-primary">Today</span>}
              </div>
            );
          })}
          {[...new Set(timetable.flatMap(d => d.slots.map(s => s[0])))].map(time => {
            const isCurrentSlot = time === currentTime.slice(0, 5);
            return (
              <div key={time} className="contents">
                <div className={cn("text-xs p-2 font-mono", isCurrentSlot ? "text-primary font-bold" : "text-muted-foreground")}>{time}</div>
                {timetable.map(d => {
                  const slot = d.slots.find(s => s[0] === time);
                  const isToday = d.day === todayName;
                  const isLab = slot?.[1] === "Lab" || slot?.[2]?.includes("Practical");
                  return (
                    <div key={d.day + time} className={cn(
                      "p-3 rounded-lg border text-xs transition-all",
                      isToday && isCurrentSlot && slot ? "ring-2 ring-primary bg-primary/5" : "bg-gradient-to-br from-primary/5 to-brand/5",
                      isToday && !slot && "bg-muted/30"
                    )}>
                      {slot ? <><p className="font-semibold">{slot[1]}</p><p className="text-muted-foreground">{slot[2]}</p><p className="text-muted-foreground/70">{slot[3]}</p>{isLab && <Badge variant="secondary" className="mt-1 text-[8px] h-4">Lab</Badge>}</> : <span className="text-muted-foreground">—</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </CardContent></Card>
    </PageWrapper>
  ),
});
