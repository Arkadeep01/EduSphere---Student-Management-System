import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { assignments } from "@/lib/mock-data";

export const Route = createFileRoute("/teacher/assignments")({
  head: () => ({ meta: [{ title: "Assignments — Teacher" }] }),
  component: () => (
    <>
      <PageHeader title="Assignments" description="Create, review and grade student work" actions={<Button size="sm" className="bg-gradient-brand border-0"><Plus className="mr-2 h-4 w-4" />New assignment</Button>} />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Subject</TableHead><TableHead>Due</TableHead><TableHead>Submissions</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{assignments.map(a => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.title}</TableCell>
              <TableCell>{a.subject}</TableCell>
              <TableCell>{a.due}</TableCell>
              <TableCell>{a.submissions}/{a.total}</TableCell>
              <TableCell><Badge variant={a.status === "graded" ? "default" : "secondary"} className={a.status === "graded" ? "bg-success text-success-foreground" : ""}>{a.status}</Badge></TableCell>
              <TableCell><Button size="sm" variant="outline">Review</Button></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </>
  ),
});
