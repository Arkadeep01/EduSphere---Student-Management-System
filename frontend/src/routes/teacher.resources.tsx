import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem, HoverLift } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Video, Download, Search, File } from "lucide-react";
import { teacherSubjectData } from "@/lib/mock-data";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const resourceIcons: Record<string, typeof FileText> = {
  note: FileText,
  video: Video,
  document: File,
  reference: FileText,
};

function TeacherResourcesComponent() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const resources = teacherSubjectData.resources;
  const types = ["all", ...new Set(resources.map(r => r.type))];

  const filtered = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <PageWrapper>
      <Card className="mb-4"><CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1">
            {types.map(t => (
              <Button key={t} size="sm" variant={typeFilter === t ? "default" : "outline"} onClick={() => setTypeFilter(t)} className="capitalize text-xs">{t}</Button>
            ))}
          </div>
        </div>
      </CardContent></Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Resources ({resources.length})</TabsTrigger>
          <TabsTrigger value="note">Notes ({resources.filter(r => r.type === "note").length})</TabsTrigger>
          <TabsTrigger value="video">Videos ({resources.filter(r => r.type === "video").length})</TabsTrigger>
          <TabsTrigger value="document">Documents ({resources.filter(r => r.type === "document").length})</TabsTrigger>
        </TabsList>

        {["all", "note", "video", "document"].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(tab === "all" ? filtered : filtered.filter(r => r.type === tab)).map(r => {
                const Icon = resourceIcons[r.type] || FileText;
                return (
                  <StaggerItem key={r.id}>
                    <HoverLift>
                      <Card className="">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <Badge variant="secondary" className="capitalize text-[10px]">{r.type}</Badge>
                          </div>
                          <h3 className="font-semibold mt-3 text-sm">{r.title}</h3>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">{r.size}</span>
                            <Button size="sm" variant="ghost" onClick={() => toast.success(`Downloading ${r.title}`)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </HoverLift>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </TabsContent>
        ))}
      </Tabs>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/teacher/resources")({
  head: () => ({ meta: [{ title: "Resources — Teacher" }] }),
  component: TeacherResourcesComponent,
});