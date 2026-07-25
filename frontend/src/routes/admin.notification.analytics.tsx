import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Bell, CheckCircle, XCircle, Clock, RefreshCw, TrendingUp } from "lucide-react";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notificationApi, type NotificationAnalytics } from "@/services/notificationApi";

function AnalyticsCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: typeof BarChart3; color: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["notification-analytics"],
    queryFn: () => notificationApi.analytics(),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const stats = data as NotificationAnalytics;

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold">Notification Analytics</h2>
          <p className="text-sm text-muted-foreground">Overview of notification delivery and engagement</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnalyticsCard title="Total Notifications" value={stats?.total_notifications || 0} icon={Bell} color="bg-blue-500" />
          <AnalyticsCard title="Active" value={stats?.active || 0} icon={CheckCircle} color="bg-green-500" />
          <AnalyticsCard title="Expired" value={stats?.expired || 0} icon={Clock} color="bg-yellow-500" />
          <AnalyticsCard title="Delivery Rate" value={stats?.delivery_stats ? `${Math.round((stats.delivery_stats.delivered / Math.max(1, stats.delivery_stats.delivered + stats.delivery_stats.failed)) * 100)}%` : "0%"} icon={TrendingUp} color="bg-purple-500" />
        </div>

        {/* Delivery Stats */}
        <Card>
          <CardHeader><CardTitle>Delivery Statistics</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{stats?.delivery_stats?.delivered || 0}</p>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{stats?.delivery_stats?.failed || 0}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{stats?.delivery_stats?.pending || 0}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{stats?.delivery_stats?.retry || 0}</p>
                <p className="text-sm text-muted-foreground">Retry</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader><CardTitle>Priority Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.priority_distribution || []).map((p: { priority: string; count: number }) => (
                <div key={p.priority} className="flex items-center gap-3">
                  <span className="w-20 text-sm capitalize">{p.priority}</span>
                  <div className="flex-1 bg-muted rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, (p.count / Math.max(1, stats?.total_notifications || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{p.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Failures */}
        {stats?.recent_failures?.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Recent Failures</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.recent_failures.map((f: { id: number; notification: string; channel: string; error: string; created_at: string }) => (
                  <div key={f.id} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg text-sm">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{f.notification}</p>
                      <p className="text-muted-foreground text-xs">Channel: {f.channel} | Error: {f.error}</p>
                      <p className="text-muted-foreground text-xs">{new Date(f.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/admin/notification/analytics")({
  head: () => ({ meta: [{ title: "Notification Analytics" }] }),
  component: NotificationAnalyticsPage,
});