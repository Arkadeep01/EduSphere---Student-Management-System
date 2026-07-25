import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, FileText, Plus, Play, ChevronRight, BarChart3, Award, Download, ExternalLink, TrendingUp, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { resultApi, examApi } from "@/services/resultApi";
import type { ResultPublication, StudentResult } from "@/services/resultApi";

const statusBadge: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  draft: { variant: "secondary", className: "bg-muted text-muted-foreground" },
  review: { variant: "default", className: "bg-warning text-white" },
  approved: { variant: "default", className: "bg-info text-white" },
  published: { variant: "default", className: "bg-success text-white" },
};

function AdminResultsComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPub, setSelectedPub] = useState<ResultPublication | null>(null);
  const [showCreatePub, setShowCreatePub] = useState(false);
  const [createExamId, setCreateExamId] = useState("");
  const [tab, setTab] = useState("publications");

  const { data: publications, isLoading: pubsLoading, error: pubsError } = useQuery({
    queryKey: ["admin", "publications"],
    queryFn: () => resultApi.listPublications(),
  });

  const { data: exams } = useQuery({
    queryKey: ["admin", "exams"],
    queryFn: () => examApi.list(),
  });

  const { data: studentResults, isLoading: resultsLoading } = useQuery({
    queryKey: ["admin", "results", selectedPub?.id],
    queryFn: () => resultApi.getStudentResults(selectedPub!.id),
    enabled: !!selectedPub && tab === "results",
  });

  const { data: subjectRanks } = useQuery({
    queryKey: ["admin", "subject-ranks", selectedPub?.id],
    queryFn: () => resultApi.getSubjectRanks(selectedPub!.id),
    enabled: !!selectedPub && tab === "ranks",
  });

  const createMutation = useMutation({
    mutationFn: (examId: number) => resultApi.createPublication(examId),
    onSuccess: (data) => {
      toast.success("Publication created");
      setShowCreatePub(false);
      setCreateExamId("");
      queryClient.invalidateQueries({ queryKey: ["admin", "publications"] });
      setSelectedPub(data);
      setTab("results");
    },
    onError: () => toast.error("Failed to create publication"),
  });

  const generateMutation = useMutation({
    mutationFn: (pubId: number) => resultApi.generateResults(pubId),
    onSuccess: () => {
      toast.success("Results generated");
      queryClient.invalidateQueries({ queryKey: ["admin", "results", selectedPub?.id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "publications"] });
    },
    onError: () => toast.error("Failed to generate results"),
  });

  const transitionMutation = useMutation({
    mutationFn: ({ pubId, target }: { pubId: number; target: string }) => resultApi.transitionWorkflow(pubId, target),
    onSuccess: () => {
      toast.success("Workflow transitioned");
      queryClient.invalidateQueries({ queryKey: ["admin", "publications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "publication", selectedPub?.id] });
    },
    onError: () => toast.error("Failed to transition workflow"),
  });

  const bulkPublishMutation = useMutation({
    mutationFn: (pubId: number) => resultApi.bulkPublish(pubId),
    onSuccess: (data) => {
      toast.success(`${data.published_count} results published`);
      queryClient.invalidateQueries({ queryKey: ["admin", "publications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "results", selectedPub?.id] });
    },
    onError: () => toast.error("Failed to bulk publish"),
  });

  const rankMutation = useMutation({
    mutationFn: (pubId: number) => resultApi.computeRanks(pubId),
    onSuccess: () => {
      toast.success("Ranks computed");
      queryClient.invalidateQueries({ queryKey: ["admin", "subject-ranks", selectedPub?.id] });
    },
    onError: () => toast.error("Failed to compute ranks"),
  });

  if (pubsLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (pubsError) return <div className="flex items-center justify-center min-h-[60vh] text-destructive gap-2"><AlertCircle className="h-5 w-5" />Failed to load publications</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Result Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/results/grade-boundaries" })}>
            <BarChart3 className="mr-2 h-4 w-4" />Grade Boundaries
          </Button>
          <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowCreatePub(true)}>
            <Plus className="mr-2 h-4 w-4" />New Publication
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="results" disabled={!selectedPub}>Results</TabsTrigger>
          <TabsTrigger value="ranks" disabled={!selectedPub}>Ranks</TabsTrigger>
        </TabsList>

        <TabsContent value="publications" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Locked</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!publications || publications.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        No publications yet. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : publications.map((pub) => (
                    <TableRow key={pub.id} className={selectedPub?.id === pub.id ? "bg-muted/50" : ""}>
                      <TableCell className="font-medium">{pub.exam_name}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadge[pub.workflow_status]?.variant || "secondary"}
                          className={statusBadge[pub.workflow_status]?.className || ""}>
                          {pub.workflow_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{pub.student_count}</TableCell>
                      <TableCell>{pub.is_locked ? <Badge variant="destructive">Locked</Badge> : <Badge variant="outline">Open</Badge>}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(pub.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedPub(pub); setTab("results"); }}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-4">
          {selectedPub && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedPub.exam_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Status: <Badge variant={statusBadge[selectedPub.workflow_status]?.variant || "secondary"}
                          className={statusBadge[selectedPub.workflow_status]?.className || ""}>{selectedPub.workflow_status}</Badge>
                        {selectedPub.is_locked && <Badge variant="destructive" className="ml-2">Locked</Badge>}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedPub.workflow_status === "draft" && !selectedPub.is_locked && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => generateMutation.mutate(selectedPub.id)} disabled={generateMutation.isPending}>
                            {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                            Generate
                          </Button>
                          <Button size="sm" variant="default" onClick={() => transitionMutation.mutate({ pubId: selectedPub.id, target: "review" })} disabled={transitionMutation.isPending}>
                            Send to Review
                          </Button>
                        </>
                      )}
                      {selectedPub.workflow_status === "review" && !selectedPub.is_locked && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => transitionMutation.mutate({ pubId: selectedPub.id, target: "draft" })} disabled={transitionMutation.isPending}>
                            Revert to Draft
                          </Button>
                          <Button size="sm" variant="default" onClick={() => transitionMutation.mutate({ pubId: selectedPub.id, target: "approved" })} disabled={transitionMutation.isPending}>
                            Approve
                          </Button>
                        </>
                      )}
                      {selectedPub.workflow_status === "approved" && !selectedPub.is_locked && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => transitionMutation.mutate({ pubId: selectedPub.id, target: "review" })} disabled={transitionMutation.isPending}>
                            Send Back to Review
                          </Button>
                          <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => bulkPublishMutation.mutate(selectedPub.id)} disabled={bulkPublishMutation.isPending}>
                            {bulkPublishMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />}
                            Publish
                          </Button>
                        </>
                      )}
                      {selectedPub.workflow_status === "published" && (
                        <Button size="sm" variant="outline" onClick={() => rankMutation.mutate(selectedPub.id)} disabled={rankMutation.isPending}>
                          <Award className="h-4 w-4 mr-1" />Compute Ranks
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardContent className="p-0">
                  {resultsLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : !studentResults || studentResults.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No results generated yet. Click "Generate" to compute results.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Roll No</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Pass</TableHead>
                          <TableHead>Merit Rank</TableHead>
                          <TableHead>Class Rank</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentResults.map((sr) => (
                          <TableRow key={sr.id}>
                            <TableCell className="font-medium">{sr.student_name}</TableCell>
                            <TableCell className="text-sm">{sr.roll_number}</TableCell>
                            <TableCell className="text-sm">{sr.class_assigned}</TableCell>
                            <TableCell>
                              <span className={sr.percentage >= 40 ? "text-success font-medium" : "text-destructive font-medium"}>
                                {sr.percentage?.toFixed(2)}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={sr.is_pass ? "bg-success text-white border-0" : "bg-destructive text-white border-0"}>
                                {sr.grade}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {sr.is_pass ? <Badge variant="outline" className="text-success border-success">Pass</Badge> : <Badge variant="outline" className="text-destructive border-destructive">Fail</Badge>}
                            </TableCell>
                            <TableCell>{sr.merit_rank ? `#${sr.merit_rank}` : "--"}</TableCell>
                            <TableCell>{sr.class_rank ? `#${sr.class_rank}` : "--"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button size="sm" variant="ghost" className="h-7 px-2" title="Report Card" onClick={() => window.open(resultApi.getReportCardPDF(sr.id))}>
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2" title="Transcript" onClick={() => window.open(resultApi.getTranscriptPDF(sr.id))}>
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {selectedPub.workflow_status === "published" && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(resultApi.getMarksheetPDF(selectedPub.id))}>
                    <Download className="mr-2 h-4 w-4" />Download Marksheet
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ranks" className="mt-4">
          {selectedPub && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Top Students</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!subjectRanks || subjectRanks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                            <Award className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            No ranks computed yet. Publish results then click "Compute Ranks".
                          </TableCell>
                        </TableRow>
                      ) : subjectRanks.map((sr) => (
                        <TableRow key={sr.subject_id}>
                          <TableCell className="font-medium">{sr.subject_name}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {sr.rankings.slice(0, 3).map((r) => (
                                <Badge key={r.student_id} variant="secondary" className="text-xs">
                                  #{r.rank} (ID: {r.student_id}) - {r.marks} marks
                                </Badge>
                              ))}
                              {sr.rankings.length > 3 && <Badge variant="outline" className="text-xs">+{sr.rankings.length - 3} more</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{sr.rankings.length} students</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showCreatePub} onOpenChange={setShowCreatePub}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Result Publication</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Exam</label>
            <Select value={createExamId} onValueChange={setCreateExamId}>
              <SelectTrigger><SelectValue placeholder="Choose an exam" /></SelectTrigger>
              <SelectContent>
                {(exams || []).map((ex) => (
                  <SelectItem key={ex.id} value={ex.id.toString()}>{ex.name} ({ex.status})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePub(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" disabled={!createExamId || createMutation.isPending} onClick={() => createMutation.mutate(parseInt(createExamId))}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/admin/results")({
  head: () => ({ meta: [{ title: "Results — Admin" }] }),
  component: AdminResultsComponent,
});