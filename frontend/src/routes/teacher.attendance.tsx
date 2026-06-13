import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { students } from "@/lib/mock-data";
import { toast } from "sonner";
import { Save } from "lucide-react";

function AttendanceComponent() {
  const list = students.slice(0, 10);
  const [present, setPresent] = useState<Record<string, boolean>>(
    Object.fromEntries(list.map((s) => [s.id, true])),
  );
  return (
    <>
      <PageHeader
        title="Mark Attendance"
        description="Class 10-A · Today"
        actions={
          <Button
            size="sm"
            className="bg-gradient-brand border-0"
            onClick={() => toast.success("Attendance saved")}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        }
      />
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
                          {s.name
                            .split(" ")
                            .map((x) => x[0])
                            .join("")}
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
                      className={
                        present[s.id] ? "bg-success hover:bg-success/90" : ""
                      }
                    >
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={!present[s.id] ? "destructive" : "outline"}
                      onClick={() => setPresent({ ...present, [s.id]: false })}
                    >
                      Absent
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="mt-4 flex gap-4 text-sm">
        <Badge className="bg-success text-success-foreground">
          {Object.values(present).filter(Boolean).length} Present
        </Badge>
        <Badge variant="destructive">
          {Object.values(present).filter((v) => !v).length} Absent
        </Badge>
      </div>
    </>
  );
}

export const Route = createFileRoute("/teacher/attendance")({
  head: () => ({ meta: [{ title: "Mark Attendance — Teacher" }] }),
  component: AttendanceComponent,
});
