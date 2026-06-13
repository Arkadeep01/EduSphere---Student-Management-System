import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { timetable } from "@/lib/mock-data";

export const Route = createFileRoute("/student/timetable")({
  head: () => ({ meta: [{ title: "Timetable — Student" }] }),
  component: () => (
    <>
      <PageHeader title="My Timetable" description="Weekly class schedule" />
      <Card><CardContent className="p-4 overflow-x-auto">
        <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2 min-w-[700px]">
          <div className="font-semibold text-xs text-muted-foreground p-2">Time</div>
          {timetable.map(d => <div key={d.day} className="font-semibold text-sm p-2 text-center">{d.day}</div>)}
          {["08:00", "09:00", "10:00", "11:30"].map(time => (
            <div key={time} className="contents">
              <div className="text-xs text-muted-foreground p-2 font-mono">{time}</div>
              {timetable.map(d => {
                const slot = d.slots.find(s => s[0] === time);
                return (
                  <div key={d.day + time} className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-brand/5 border text-xs">
                    {slot ? <><p className="font-semibold">{slot[1]}</p><p className="text-muted-foreground">{slot[2]}</p><p className="text-muted-foreground/70">{slot[3]}</p></> : <span className="text-muted-foreground">—</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent></Card>
    </>
  ),
});
