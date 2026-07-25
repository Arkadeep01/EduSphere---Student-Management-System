import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Bell, CheckCheck, Trash2, Search, Filter, ChevronLeft, ChevronRight,
  Loader2, MailOpen, Mail, AlertTriangle, Info, ArrowUpCircle, Calendar,
} from "lucide-react";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { notificationApi, type NotificationItem, type NotificationListResponse } from "@/services/notificationApi";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const priorityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
  medium: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
  low: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300",
};

const typeFilters = [
  { value: "", label: "All Types" },
  { value: "assignment_created", label: "Assignments" },
  { value: "assignment_deadline", label: "Deadlines" },
  { value: "results_published", label: "Results" },
  { value: "rechecked_result", label: "Rechecked Results" },
  { value: "fee_generated", label: "Fees" },
  { value: "fee_reminder", label: "Fee Reminders" },
  { value: "school_announcement", label: "Announcements" },
  { value: "event", label: "Events" },
  { value: "emergency", label: "Emergency" },
  { value: "exam_announcement", label: "Exams" },
  { value: "holiday_notice", label: "Holidays" },
  { value: "circular", label: "Circulars" },
];

function NotificationCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [readFilter, setReadFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { setPage(1); }, [typeFilter, readFilter, priorityFilter, debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ["user-notifications", page, typeFilter, readFilter, priorityFilter, debouncedSearch],
    queryFn: () => notificationApi.list({
      notification_type: typeFilter || undefined,
      read_status: readFilter || undefined,
      priority: priorityFilter || undefined,
      page,
      page_size: 20,
      search: debouncedSearch || undefined,
    }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      toast.success("All notifications marked as read");
    },
  });

  const deleteReadMutation = useMutation({
    mutationFn: () => notificationApi.deleteRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      toast.success("Read notifications deleted");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });

  const totalPages = data?.total_pages || 1;

  return (
    <PageWrapper>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              {data?.total || 0} notifications
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()}>
              <CheckCheck className="mr-2 h-4 w-4" />Mark All Read
            </Button>
            <Button variant="outline" size="sm" onClick={() => deleteReadMutation.mutate()}>
              <Trash2 className="mr-2 h-4 w-4" />Delete Read
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                {typeFilters.map(f => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Notification List */}
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : !data?.results?.length ? (
          <Card><CardContent className="text-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No notifications found</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-2">
            {data.results.map((item) => (
              <Card
                key={item.id}
                className={`transition-colors cursor-pointer hover:bg-accent/50 ${item.read_status === "unread" ? "border-primary/30 bg-primary/5" : ""}`}
                onClick={() => markReadMutation.mutate(item.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.read_status === "unread" ? (
                          <Mail className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <MailOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className={`text-sm font-medium truncate ${item.read_status === "unread" ? "text-foreground" : "text-muted-foreground"}`}>
                          {item.title}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6 line-clamp-2">{item.message}</p>
                      <div className="flex items-center gap-2 mt-2 ml-6">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[item.priority] || ""}`}>
                          {item.priority_display}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {item.type_display}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages} ({data.total} total)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/student/notification-center")({
  head: () => ({ meta: [{ title: "Notification Center" }] }),
  component: NotificationCenter,
});

export default NotificationCenter;