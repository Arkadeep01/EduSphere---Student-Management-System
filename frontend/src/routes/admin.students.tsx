import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Download, Filter } from "lucide-react";
import { useState } from "react";
import { students } from "@/lib/mock-data";

function AdminStudentsComponent() {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");
  const filtered = students.filter(s =>
    (s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase()))
    && (cls === "all" || s.class === cls)
  );
  return (
      <>
        <PageHeader title="Students" description={`${filtered.length} of ${students.length} students`}
          actions={<><Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button><Button size="sm" className="bg-gradient-brand border-0"><Plus className="mr-2 h-4 w-4" />Add Student</Button></>} />
        <Card><CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by name or ID..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} /></div>
            <Select value={cls} onValueChange={setCls}><SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All classes</SelectItem>{[...new Set(students.map(s => s.class))].map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>ID</TableHead><TableHead>Class</TableHead><TableHead>Attendance</TableHead><TableHead>GPA</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">No students match your filters</TableCell></TableRow> :
                  filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{s.name.split(" ").map(x => x[0]).join("")}</AvatarFallback></Avatar><div><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.email}</p></div></div></TableCell>
                    <TableCell className="font-mono text-xs">{s.id}</TableCell>
                    <TableCell><Badge variant="outline">{s.class}</Badge></TableCell>
                    <TableCell>{s.attendance}%</TableCell>
                    <TableCell className="font-medium">{s.gpa}</TableCell>
                    <TableCell><Badge variant={s.status === "Active" ? "default" : "secondary"} className={s.status === "Active" ? "bg-success text-success-foreground" : ""}>{s.status}</Badge></TableCell>
                    <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem>View profile</DropdownMenuItem><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent></Card>
      </>
    );

}

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: [{ title: "Students — Admin" }] }),
  component: AdminStudentsComponent,
});
