import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Calendar, MapPin, Clock } from "lucide-react";
import { exams } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/exams")({
  head: () => ({ meta: [{ title: "Examinations — Admin" }] }),
  component: () => (
    <>
      <PageHeader title="Examinations" description="Schedule, results, and promotions" actions={<><Button variant="outline" size="sm">Publish Results</Button><Button size="sm" className="bg-gradient-brand border-0"><Plus className="mr-2 h-4 w-4" />Create Exam</Button></>} />
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
