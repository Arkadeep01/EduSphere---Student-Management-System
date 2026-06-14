import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Users } from "lucide-react";

const classes = ["10-A", "10-B", "10-C", "9-A", "9-B", "11-A", "11-B", "12-A", "8-A", "8-B", "7-A", "7-B"];

export const Route = createFileRoute("/admin/classes")({
  head: () => ({ meta: [{ title: "Classes — Admin" }] }),
  component: () => (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {classes.map((c, i) => (
          <Card key={c} className="hover-lift overflow-hidden">
            <div className="h-1 bg-gradient-brand" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Layers className="h-5 w-5" /></div>
                <Badge variant="secondary">{20 + i} students</Badge>
              </div>
              <h3 className="mt-3 font-semibold text-lg">Class {c}</h3>
              <p className="text-sm text-muted-foreground mt-1">Class teacher: Dr. {["Rao", "Khan", "Miller", "Cruz"][i % 4]}</p>
              <div className="mt-4 flex items-center text-xs text-muted-foreground"><Users className="h-3 w-3 mr-1" />6 subjects</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  ),
});
