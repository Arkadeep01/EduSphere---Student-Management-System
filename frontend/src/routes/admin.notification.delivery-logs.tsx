import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { notificationApi, type DeliveryLog } from "@/services/notificationApi";

const statusColors: Record<string, string> = {
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  retry: "bg-blue-100 text-blue-800",
};

const statusIcons: Record<string, typeof CheckCircle> = {
  delivered: CheckCircle,
  failed: XCircle,
  pending: Clock,
  retry: RefreshCw,
};

function DeliveryLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["delivery-logs"],
    queryFn: () => notificationApi.deliveryLogs(),
  });

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold">Delivery Logs</h2>
          <p className="text-sm text-muted-foreground">Track email and notification delivery</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : !data?.length ? (
          <Card><CardContent className="text-center py-12 text-muted-foreground">
            <RefreshCw className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No delivery logs yet</p>
          </CardContent></Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Notification</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Retries</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data as DeliveryLog[]).map((log: DeliveryLog) => {
                    const StatusIcon = statusIcons[log.status] || Clock;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium text-sm">{log.notification_title}</TableCell>
                        <TableCell className="text-sm">{log.recipient_email}</TableCell>
                        <TableCell className="text-sm capitalize">{log.channel}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${statusColors[log.status] || ""} text-xs`}>
                            <StatusIcon className="h-3 w-3 mr-1 inline" />
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {log.error_message || "—"}
                        </TableCell>
                        <TableCell className="text-sm">{log.retry_count}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/admin/notification/delivery-logs")({
  head: () => ({ meta: [{ title: "Delivery Logs" }] }),
  component: DeliveryLogsPage,
});