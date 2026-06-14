import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { students, teacherSubjectData, classStudents } from "@/lib/mock-data";


const today = new Date().toISOString().split("T")[0];

function AttendanceComponent() {
  const [selectedClass, setSelectedClass] = useState(teacherSubjectData.classes[0]);
  const [selectedDate, setSelectedDate] = useState(today);
  const list = classStudents[selectedClass] || students.slice(0, 10);
  const [present, setPresent] = useState<Record<string, boolean>>(
    Object.fromEntries(list.map((s) => [s.id, true])),
  );
  const [saved, setSaved] = useState(false);

  const presentCount = Object.values(present).filter(Boolean).length;
  const absentCount = Object.values(present).filter((v) => !v).length;

    return (
      <PageWrapper>
      <Card className="mb-4"><CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Class:</span>
            <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setSaved(false); }}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teacherSubjectData.classes.map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Date:</span>
            <input type="date" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSaved(false); }} className="text-sm border rounded-lg px-3 py-1.5 bg-background" />
          </div>
          {saved && <Badge className="bg-success text-success-foreground">Saved</Badge>}
        </div>
      </CardContent></Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {s.name.split(" ").map((x) => x[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant={present[s.id] ? "default" : "outline"}
                      onClick={() => setPresent({ ...present, [s.id]: true })}
                      className={present[s.id] ? "bg-success hover:bg-success/90" : ""}
                    >Present</Button>
                    <Button
                      size="sm"
                      variant={!present[s.id] ? "destructive" : "outline"}
                      onClick={() => setPresent({ ...present, [s.id]: false })}
                    >Absent</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 flex gap-4 text-sm">
        <Badge className="bg-success text-success-foreground">{presentCount} Present</Badge>
        <Badge variant="destructive">{absentCount} Absent</Badge>
        <Badge variant="secondary">{list.length} Total</Badge>
      </div>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/teacher/attendance")({
  head: () => ({ meta: [{ title: "Mark Attendance — Teacher" }] }),
  component: AttendanceComponent,
});
