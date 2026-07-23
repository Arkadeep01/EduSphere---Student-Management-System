import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, DollarSign, FileText, FileCheck, Bell } from "lucide-react";
import { notificationCategories } from "@/lib/mock-data";
import { API_BASE } from "@/services/request";

const categoryIcons: Record<string, typeof Calendar> = {
  "Timetable Updates": Calendar,
  "Fee Notifications": DollarSign,
  "Exam Schedule Updates": FileText,
  "Assignment Updates": FileCheck,
  "General": Bell,
};

const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

function StudentNotificationsComponent() {
  const { data: realNotifs } = useQuery({
    queryKey: ["student", "notifications"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/student/notifications/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("Failed");
      return r.json() as Promise<Array<Record<string, unknown>>>;
    },
    enabled: !!token,
  });

  const categories = realNotifs && realNotifs.length > 0
    ? groupIntoCategories(realNotifs)
    : notificationCategories;

  return (
    <PageWrapper>
      <StaggerContainer className="grid md:grid-cols-2 gap-4">
        {categories.map(cat => {
          const Icon = categoryIcons[cat.category] || Bell;
          const catUnread = cat.items.filter(i => i.unread).length;
          return (
            <StaggerItem key={cat.category}><Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{cat.category}</span>
                  {catUnread > 0 && <Badge className="bg-brand text-brand-foreground">{catUnread} new</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cat.items.map(item => (
                  <div key={item.id} className={`p-3 rounded-lg border text-sm transition-colors ${item.unread ? "bg-muted/50 border-primary/20" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${item.unread ? "text-foreground" : "text-muted-foreground"}`}>{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.message}</p>
                      </div>
                      {item.unread && <span className="h-2 w-2 rounded-full bg-brand shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{item.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card></StaggerItem>
          );
        })}
      </StaggerContainer>
    </PageWrapper>
  );
}

function groupIntoCategories(notifs: Array<Record<string, unknown>>) {
  const grouped: Record<string, { id: string; title: string; message: string; time: string; unread: boolean }[]> = {};
  for (const n of notifs) {
    const cat = (n.notification_type as string) || "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({
      id: String(n.id),
      title: String(n.title || ""),
      message: String(n.message || ""),
      time: String(n.created_at || ""),
      unread: !n.is_read,
    });
  }
  return Object.entries(grouped).map(([category, items]) => ({ category, items }));
}

export const Route = createFileRoute("/student/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Student" }] }),
  component: StudentNotificationsComponent,
});
