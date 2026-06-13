import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exams } from "@/lib/mock-data";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/teacher/profile")({
  head: () => ({ meta: [{ title: "Exams — Teacher" }] }),
  component: () => (
    <>
      <PageHeader title="Exams" description="Upload marks and generate results" actions={<Button size="sm" className="bg-gradient-brand border-0"><Upload className="mr-2 h-4 w-4" />Upload marks</Button>} />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Exam</TableHead><TableHead>Date</TableHead><TableHead>Room</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{exams.map(e => (
            <TableRow key={e.id}><TableCell className="font-medium">{e.name}</TableCell><TableCell>{e.date}</TableCell><TableCell>{e.room}</TableCell><TableCell><Button size="sm" variant="outline">Enter marks</Button></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </>
  ),
});
