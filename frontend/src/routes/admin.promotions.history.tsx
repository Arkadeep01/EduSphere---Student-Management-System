import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Clock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { promotionApi } from "@/services/promotionApi";
import { API_BASE } from "@/services/request";

const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

interface HistorySearch {
  student_id?: string;
}

function AdminPromotionHistoryComponent() {
  const search = useSearch({ from: "/admin/promotions/history" as any }) as HistorySearch;
  const [studentQuery, setStudentQuery] = useState(search.student_id || "");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    search.student_id ? parseInt(search.student_id) : null
  );

  const { data: studentsData } = useQuery({
    queryKey: ["admin", "students", "search", studentQuery],
    queryFn: async () => {
      if (!studentQuery) return [];
      const r = await fetch(`${API_BASE}/api/admin/students/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error("Failed to fetch");
      const all: Array<Record<string, unknown>> = await r.json();
      return all.filter(
        (s: any) =>
          (s.full_name || "").toLowerCase().includes(studentQuery.toLowerCase()) ||
          (s.roll_number || "").toLowerCase().includes(studentQuery.toLowerCase())
      );
    },
    enabled: !!token && studentQuery.length > 0,
  });

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["admin", "promotion-history", selectedStudentId],
    queryFn: () => (selectedStudentId ? promotionApi.getHistory(selectedStudentId) : null),
    enabled: !!selectedStudentId,
  });

  const history = historyData?.history || [];
  const selectedStudent = Array.isArray(studentsData)
    ? studentsData.find((s: any) => s.id === selectedStudentId)
    : null;

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      promoted: "bg-green-100 text-green-700",
      repeated: "bg-blue-100 text-blue-700",
      detained: "bg-red-100 text-red-700",
      completed: "bg-purple-100 text-purple-700",
      left: "bg-gray-100 text-gray-700",
    };
    return variants[status] || "bg-gray-100 text-gray-700";
  };

  async function handleSearch() {
    if (!studentsData || !Array.isArray(studentsData)) return;
    const match = studentsData[0] as any;
    if (match) {
      setSelectedStudentId(match.id);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Student Promotion History</h2>
          <p className="text-sm text-muted-foreground">
            {selectedStudent
              ? `Viewing history for ${(selectedStudent as any).full_name || (selectedStudent as any).user?.email}`
              : "Search for a student to view promotion history"}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student name or roll number..."
                className="pl-9"
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
          {Array.isArray(studentsData) && studentsData.length > 0 && studentQuery && (
            <div className="mt-3 space-y-1">
              {studentsData.slice(0, 5).map((s: any) => (
                <button
                  key={s.id}
                  className={`w-full text-left p-2 rounded text-sm hover:bg-muted transition-colors ${
                    selectedStudentId === s.id ? "bg-primary/10 font-medium" : ""
                  }`}
                  onClick={() => {
                    setSelectedStudentId(s.id);
                    setStudentQuery(s.full_name || s.user?.email || "");
                  }}
                >
                  {s.full_name || `${s.user?.first_name || ""} ${s.user?.last_name || ""}`.trim()}
                  <span className="text-muted-foreground ml-2">· {s.roll_number || ""}</span>
                  <span className="text-muted-foreground ml-2">· Class {s.class_assigned}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : selectedStudentId && history.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-lg font-medium">No promotion history found</p>
            <p className="text-sm mt-1">This student has no promotion records yet.</p>
          </CardContent>
        </Card>
      ) : history.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Academic Session</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.session_name}</TableCell>
                    <TableCell>{entry.class_name}</TableCell>
                    <TableCell>{entry.section || "—"}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusBadge(entry.status)}`} variant="outline">
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.percentage !== null ? `${entry.percentage}%` : "—"}</TableCell>
                    <TableCell>{entry.rank !== null ? `#${entry.rank}` : "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {entry.remarks || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

export const Route = createFileRoute("/admin/promotions/history")({
  head: () => ({ meta: [{ title: "Promotion History — Admin" }] }),
  component: AdminPromotionHistoryComponent,
});