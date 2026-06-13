import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { results } from "@/lib/mock-data";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/student/results")({
  head: () => ({ meta: [{ title: "Results — Student" }] }),
  component: () => {
    const total = results.reduce((s, r) => s + r.marks, 0);
    const max = results.reduce((s, r) => s + r.total, 0);
    return (
      <>
        <PageHeader title="My Results" description={`Total: ${total}/${max} · GPA 3.82 · Rank #4`} />
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2"><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Marks</TableHead><TableHead>Total</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
              <TableBody>{results.map(r => (
                <TableRow key={r.subject}><TableCell className="font-medium">{r.subject}</TableCell><TableCell>{r.marks}</TableCell><TableCell>{r.total}</TableCell><TableCell><Badge className="bg-gradient-brand text-white border-0">{r.grade}</Badge></TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Subject Profile</CardTitle></CardHeader><CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={results}>
                <PolarGrid /><PolarAngleAxis dataKey="subject" className="text-xs" /><PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar dataKey="marks" stroke="oklch(0.48 0.18 265)" fill="oklch(0.48 0.18 265)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </div>
      </>
    );
  },
});
