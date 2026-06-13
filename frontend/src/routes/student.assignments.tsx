import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { assignments } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/student/assignments")({
  head: () => ({ meta: [{ title: "Assignments — Student" }] }),
  component: () => (
    <>
      <PageHeader title="My Assignments" description="Track and submit your work" />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Subject</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{assignments.map(a => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.title}</TableCell>
              <TableCell>{a.subject}</TableCell>
              <TableCell>{a.due}</TableCell>
              <TableCell><Badge variant={a.status === "graded" ? "default" : "secondary"} className={a.status === "graded" ? "bg-success text-success-foreground" : ""}>{a.status}</Badge></TableCell>
              <TableCell>{a.status === "pending" ? <Button size="sm" onClick={() => toast.success("Assignment submitted!")} className="bg-gradient-brand border-0">Submit</Button> : <Button size="sm" variant="outline">View</Button>}</TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </>
  ),
});
