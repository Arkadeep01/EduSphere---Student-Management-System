import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, RotateCcw } from "lucide-react";
import { promotionApi } from "@/services/promotionApi";

function AdminPromotionLogsComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "promotion-logs"],
    queryFn: () => promotionApi.getLogs(),
  });

  const logs = data?.logs || [];

  const actionBadge = (action: string) => {
    const variants: Record<string, string> = {
      promote: "bg-green-100 text-green-700 hover:bg-green-100",
      repeat: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      detain: "bg-red-100 text-red-700 hover:bg-red-100",
      bulk_promote: "bg-purple-100 text-purple-700 hover:bg-purple-100",
      rollback: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    };
    return variants[action] || "bg-gray-100 text-gray-700 hover:bg-gray-100";
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Promotion Logs</h2>
          <p className="text-sm text-muted-foreground">{logs.length} total entries</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <RotateCcw className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-lg font-medium">No promotion logs yet</p>
            <p className="text-sm mt-1">Promotion actions will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Processed By</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {log.student.name?.split(" ").map((x: string) => x[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-sm">{log.student.name}</span>
                          <p className="text-xs text-muted-foreground">{log.student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.from_class}{log.from_section ? ` - ${log.from_section}` : ""}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.to_class}{log.to_section ? ` - ${log.to_section}` : ""}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${actionBadge(log.action)}`} variant="outline">
                        {log.action === "bulk_promote" ? "Bulk Promote" : log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.processed_by?.name || "System"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{log.reason || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export const Route = createFileRoute("/admin/promotions/logs")({
  head: () => ({ meta: [{ title: "Promotion Logs — Admin" }] }),
  component: AdminPromotionLogsComponent,
});