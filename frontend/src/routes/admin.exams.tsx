import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, MapPin, Clock } from "lucide-react";
import { exams } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/exams")({
  head: () => ({ meta: [{ title: "Examinations — Admin" }] }),
  component: () => (
    <>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Exam</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Room</TableHead><TableHead>Duration</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{exams.map(e => (
            <TableRow key={e.id}>
              <TableCell className="font-medium">{e.name}</TableCell>
              <TableCell><span className="flex items-center gap-1 text-sm"><Calendar className="h-3 w-3" />{e.date}</span></TableCell>
              <TableCell><span className="flex items-center gap-1 text-sm"><Clock className="h-3 w-3" />{e.time}</span></TableCell>
              <TableCell><span className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3" />{e.room}</span></TableCell>
              <TableCell>{e.duration}</TableCell>
              <TableCell><Badge variant="outline">Scheduled</Badge></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </>
  ),
});
