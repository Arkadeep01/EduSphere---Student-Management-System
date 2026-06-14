import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, FileText, FileCheck, Bell } from "lucide-react";
import { notificationCategories } from "@/lib/mock-data";
import { useState } from "react";

const categoryIcons: Record<string, typeof Calendar> = {
  "Timetable Updates": Calendar,
  "Fee Notifications": DollarSign,
  "Exam Schedule Updates": FileText,
  "Assignment Updates": FileCheck,
  "General": Bell,
};

function StudentNotificationsComponent() {
  const [categories] = useState(notificationCategories);

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

export const Route = createFileRoute("/student/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Student" }] }),
  component: StudentNotificationsComponent,
});