import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { request } from "@/services/request";
import { useAuth } from "@/context/AuthContext";

const TEACHER_API = "http://localhost:8000/api/teacher";

interface StudentItem {
  id: number;
  roll_number?: string;
  user: { first_name: string; last_name: string };
  class_assigned: string;
}

function AttendanceComponent() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [present, setPresent] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    request<string[]>("/classes/", undefined, TEACHER_API).then(data => {
      const list = data || [];
      setClasses(list.map((c: any) => c.class_name || c));
      if (list.length > 0) setSelectedClass(list[0].class_name || list[0]);
    }).catch(() => {
      toast.error("Failed to load classes");
    });
  }, []);

  const fetchStudents = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const data = await request<StudentItem[]>(`/classes/${selectedClass}/students/`, undefined, TEACHER_API);
      setStudents(data || []);
      const allPresent = Object.fromEntries((data || []).map(s => [s.id, true]));
      setPresent(allPresent);
      setSaved(false);
    } catch {
      toast.error("Failed to load students");
    }
  }, [selectedClass]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const presentCount = Object.values(present).filter(Boolean).length;
  const absentCount = Object.values(present).filter(v => !v).length;

  const handleSave = async () => {
    setSubmitting(true);
    const records = students.map(s => ({
      student: s.id,
      date: selectedDate,
      status: present[s.id] ? "present" : "absent",
    }));
    try {
      await request("/attendance/mark/", {
        method: "POST",
        body: JSON.stringify({ records }),
      }, TEACHER_API);
      setSaved(true);
      toast.success(`Attendance saved for ${presentCount} present, ${absentCount} absent`);
    } catch {
      toast.error("Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

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
                {classes.map(cls => (
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
                <TableHead>Roll No</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {s.user.first_name?.[0]}{s.user.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{s.user.first_name} {s.user.last_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.roll_number || `STU${s.id}`}</TableCell>
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

      <div className="mt-4 flex items-center gap-4 text-sm">
        <Badge className="bg-success text-success-foreground">{presentCount} Present</Badge>
        <Badge variant="destructive">{absentCount} Absent</Badge>
        <Badge variant="secondary">{students.length} Total</Badge>
        <Button size="sm" className="ml-auto bg-gradient-brand border-0" onClick={handleSave} disabled={submitting}>
          {submitting ? "Saving..." : "Save Attendance"}
        </Button>
      </div>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/teacher/attendance")({
  head: () => ({ meta: [{ title: "Mark Attendance — Teacher" }] }),
  component: AttendanceComponent,
});
