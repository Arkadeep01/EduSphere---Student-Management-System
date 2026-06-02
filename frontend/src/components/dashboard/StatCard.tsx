import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  accent?: "primary" | "brand" | "success" | "warning" | "info";
}

const accentMap = {
  primary: "bg-primary/10 text-primary",
  brand: "bg-brand/10 text-brand",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning-foreground",
  info: "bg-info/10 text-info",
};

export function StatCard({ label, value, icon: Icon, trend, trendUp, accent = "primary" }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card hover-lift animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={cn("mt-1 text-xs font-medium", trendUp ? "text-success" : "text-destructive")}>
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5", accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
