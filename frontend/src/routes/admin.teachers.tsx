import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Mail } from "lucide-react";
import { teachers } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/teachers")({
  head: () => ({ meta: [{ title: "Teachers — Admin" }] }),
  component: () => (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {teachers.map(t => (
          <Card key={t.id} className="hover-lift"><CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12"><AvatarFallback className="bg-gradient-brand text-white">{t.name.split(" ").map(s => s[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.subject}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <Badge variant="outline">{t.classes} classes</Badge>
              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{t.rating}</span>
            </div>
            <Button size="sm" variant="outline" className="w-full mt-3"><Mail className="mr-2 h-3 w-3" />Message</Button>
          </CardContent></Card>
        ))}
      </div>
    </>
  ),
});
