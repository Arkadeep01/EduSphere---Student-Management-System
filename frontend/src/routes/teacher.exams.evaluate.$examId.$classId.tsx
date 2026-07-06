import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { teacherExamData } from "@/lib/mock-data";
import type { PaperData, QMark } from "@/lib/mock-data";
import {
  ArrowLeft, Eye, Download, ZoomIn, ZoomOut, RotateCw,
  ChevronLeft, ChevronRight, Maximize, Minimize, Save, Send,
  FileText, CheckCircle2, Clock, XCircle, ScrollText,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

function PaperEvaluationPage() {
  const navigate = useNavigate();
  const { examId, classId } = Route.useParams();
  const classData = teacherExamData.find(c => c.examId === examId && c.className === classId);
  const [data, setData] = useState(classData);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [marksInput, setMarksInput] = useState<Record<string, Record<string, string>>>({});
  const [remarksInput, setRemarksInput] = useState<Record<string, string>>({});
  const [notesInput, setNotesInput] = useState<Record<string, string>>({});
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!data) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <p className="text-lg font-semibold">Exam not found</p>
          <p className="text-sm text-muted-foreground">No data for exam "{examId}" in class "{classId}".</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate({ to: "/teacher/exams" })}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Exams
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const papers = data.papers;
  const selectedPaper = selectedPaperId ? papers.find(p => p.id === selectedPaperId) : null;
  const evaluatedCount = papers.filter(p => p.status === "completed").length;
  const draftCount = papers.filter(p => p.status === "draft").length;
  const pendingCount = papers.filter(p => p.status === "pending").length;

  function getPaperMarks(paperId: string): Record<string, string> {
    return marksInput[paperId] || {};
  }

  function setPaperMarks(paperId: string, qId: string, value: string) {
    setMarksInput(prev => ({
      ...prev,
      [paperId]: { ...(prev[paperId] || {}), [qId]: value },
    }));
  }

  function calcTotal(paper: PaperData): number {
    const paperMarks = getPaperMarks(paper.id);
    return paper.questions.reduce((sum, q) => {
      const val = paperMarks[q.id];
      if (val !== undefined && val !== "") return sum + Number(val);
      if (q.obtained !== null) return sum + q.obtained;
      return sum;
    }, 0);
  }

  function handleSaveDraft(paper: PaperData) {
    const paperMarks = getPaperMarks(paper.id);
    const updatedQs = paper.questions.map(q => ({
      ...q,
      obtained: paperMarks[q.id] !== undefined && paperMarks[q.id] !== "" ? Number(paperMarks[q.id]) : q.obtained,
    }));
    const qMarks = updatedQs.filter(q => q.obtained !== null).reduce((s, q) => s + (q.obtained ?? 0), 0);
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        papers: prev.papers.map(p =>
          p.id === paper.id ? {
            ...p,
            questions: updatedQs,
            draftMarks: qMarks,
            draftRemarks: remarksInput[paper.id] || p.draftRemarks,
            status: "draft" as const,
          } : p
        ),
      };
    });
    toast.success(`Draft saved for ${paper.studentName}`);
  }

  function handleUploadMarks(paper: PaperData) {
    const paperMarks = getPaperMarks(paper.id);
    const updatedQs = paper.questions.map(q => ({
      ...q,
      obtained: paperMarks[q.id] !== undefined && paperMarks[q.id] !== "" ? Number(paperMarks[q.id]) : q.obtained,
    }));
    const finalMarks = updatedQs.reduce((s, q) => s + (q.obtained ?? 0), 0);
    setData(prev => {
      if (!prev) return prev;
      const newPapers = prev.papers.map(p =>
        p.id === paper.id ? {
          ...p,
          questions: updatedQs,
          marksObtained: finalMarks,
          draftMarks: null,
          remarks: remarksInput[paper.id] || p.remarks,
          draftRemarks: "",
          status: "completed" as const,
          evaluatedAt: new Date().toISOString().slice(0, 10),
        } : p
      );
      const newEvaluated = newPapers.filter(p => p.status === "completed").length;
      const newStatus = newEvaluated >= prev.submittedCount ? "completed" as const : "evaluating" as const;
      return {
        ...prev,
        papers: newPapers,
        evaluatedCount: newEvaluated,
        status: newStatus,
      };
    });
    toast.success(`Marks uploaded for ${paper.studentName}`);
    setSelectedPaperId(null);
  }

  const progressVal = data.submittedCount > 0 ? (evaluatedCount / data.submittedCount) * 100 : 0;

  if (selectedPaper) {
    const totalCalc = calcTotal(selectedPaper);
    return (
      <PageWrapper>
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPaperId(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <div className="text-sm">
            <span className="font-medium">{selectedPaper.studentName}</span>
            <span className="text-muted-foreground"> · {selectedPaper.rollNumber} · {data.examName} · {data.className}</span>
          </div>
        </div>

        <div className={`grid ${fullscreen ? "grid-cols-1" : "lg:grid-cols-5"} gap-4`}>
          {/* Left - Script Viewer */}
          <Card className={fullscreen ? "" : "lg:col-span-3"}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-2 border-b bg-muted/30">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setZoom(z => Math.min(z + 25, 200))}><ZoomIn className="h-3.5 w-3.5" /></Button>
                  <span className="text-xs w-10 text-center">{zoom}%</span>
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setZoom(z => Math.max(z - 25, 25))}><ZoomOut className="h-3.5 w-3.5" /></Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setRotation(r => (r + 90) % 360)}><RotateCw className="h-3.5 w-3.5" /></Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button variant="ghost" size="sm" className="h-7 px-2"><ChevronLeft className="h-3.5 w-3.5" /></Button>
                  <span className="text-xs">1/1</span>
                  <Button variant="ghost" size="sm" className="h-7 px-2"><ChevronRight className="h-3.5 w-3.5" /></Button>
                </div>
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setFullscreen(f => !f)}>
                  {fullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="flex items-center justify-center bg-muted/10" style={{ minHeight: fullscreen ? "70vh" : "400px" }}>
                <div className="text-center p-8" style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}>
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium mt-4">Answer Script Preview</p>
                  <p className="text-xs text-muted-foreground">{selectedPaper.studentName} · {data.examName}</p>
                  <div className="flex gap-2 justify-center mt-4">
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />View Script</Button>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Download</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right - Evaluation Workspace */}
          <Card className={fullscreen ? "mt-4" : "lg:col-span-2"}>
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-primary" />
                  Question-wise Marks
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground px-1">
                    <span>Question</span><span className="text-right">Max</span><span className="text-right">Obtained</span>
                  </div>
                  {selectedPaper.questions.map(q => (
                    <div key={q.id} className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-sm">{q.label}</span>
                      <span className="text-sm text-right text-muted-foreground">{q.maxMarks}</span>
                      <Input
                        type="number"
                        className="h-8 text-sm text-right"
                        min={0}
                        max={q.maxMarks}
                        placeholder="—"
                        value={getPaperMarks(selectedPaper.id)[q.id] ?? q.obtained ?? ""}
                        onChange={e => setPaperMarks(selectedPaper.id, q.id, e.target.value)}
                      />
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-2 items-center pt-2 border-t font-semibold">
                    <span className="text-sm">Total</span>
                    <span className="text-sm text-right text-muted-foreground">{selectedPaper.totalMarks}</span>
                    <span className="text-sm text-right text-primary">{totalCalc}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs">Remarks</Label>
                <Textarea
                  className="min-h-[60px] text-sm mt-1"
                  placeholder="Add remarks..."
                  value={remarksInput[selectedPaper.id] ?? selectedPaper.remarks ?? ""}
                  onChange={e => setRemarksInput(prev => ({ ...prev, [selectedPaper.id]: e.target.value }))}
                />
              </div>

              <div>
                <Label className="text-xs">Temporary Notes</Label>
                <Textarea
                  className="min-h-[60px] text-sm mt-1"
                  placeholder="Private notes (not shared with student)..."
                  value={notesInput[selectedPaper.id] ?? ""}
                  onChange={e => setNotesInput(prev => ({ ...prev, [selectedPaper.id]: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => handleSaveDraft(selectedPaper)}>
                  <Save className="h-4 w-4 mr-2" />Save Draft
                </Button>
                <Button className="flex-1 bg-gradient-brand border-0" onClick={() => handleUploadMarks(selectedPaper)}>
                  <Send className="h-4 w-4 mr-2" />Upload Marks
                </Button>
              </div>

              {selectedPaper.status === "completed" && (
                <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-xs text-success-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
                  Evaluated on {selectedPaper.evaluatedAt}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate({ to: "/teacher/exams" })}>
        <ArrowLeft className="h-4 w-4 mr-2" />Back to Exams
      </Button>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{data.examName}</h2>
              <p className="text-sm text-muted-foreground">
                {data.className} · Section {data.section} · {data.subject} · {data.examDate}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{data.totalStudents}</p>
                <p className="text-[10px] text-muted-foreground">Total Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{data.submittedCount}</p>
                <p className="text-[10px] text-muted-foreground">Submitted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{evaluatedCount}</p>
                <p className="text-[10px] text-muted-foreground">Evaluated</p>
              </div>
              <div>{statusBadge(data.status)}</div>
            </div>
          </div>
          <Progress value={progressVal} className="h-2 mt-4" />
          <p className="text-xs text-muted-foreground mt-1">{evaluatedCount}/{data.submittedCount} scripts evaluated ({Math.round(progressVal)}%)</p>
        </CardContent>
      </Card>

      {/* Status summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card><CardContent className="p-3 text-center">
          <XCircle className="h-4 w-4 mx-auto text-warning" />
          <p className="text-lg font-bold text-warning mt-1">{pendingCount}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Clock className="h-4 w-4 mx-auto text-primary" />
          <p className="text-lg font-bold text-primary mt-1">{draftCount}</p>
          <p className="text-[10px] text-muted-foreground">Draft</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <CheckCircle2 className="h-4 w-4 mx-auto text-success" />
          <p className="text-lg font-bold text-success mt-1">{evaluatedCount}</p>
          <p className="text-[10px] text-muted-foreground">Completed</p>
        </CardContent></Card>
      </div>

      {/* Student table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Submission</TableHead>
                <TableHead>Answer Script</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {papers.map(p => {
                const pm = getPaperMarks(p.id);
                const displayMarks = p.status === "completed" ? p.marksObtained : p.status === "draft" ? p.draftMarks : null;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs text-muted-foreground">{p.rollNumber}</TableCell>
                    <TableCell className="font-medium">{p.studentName}</TableCell>
                    <TableCell>
                      {p.submissionStatus === "submitted" ? (
                        <Badge variant="outline" className="text-xs text-success border-success/30">Submitted</Badge>
                      ) : p.submissionStatus === "absent" ? (
                        <Badge variant="outline" className="text-xs text-destructive border-destructive/30">Absent</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedPaperId(p.id)}>
                          <Eye className="h-3 w-3 mr-1" />View
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Download className="h-3 w-3 mr-1" />Download
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {displayMarks !== null ? (
                        <span className={`font-semibold ${p.status === "completed" ? "text-success" : "text-primary"}`}>
                          {displayMarks}/{p.totalMarks}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.status === "completed" ? (
                        <Badge className="bg-success text-success-foreground border-0 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>
                      ) : p.status === "draft" ? (
                        <Badge className="bg-primary border-0 text-xs"><Clock className="h-3 w-3 mr-1" />Draft</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.status !== "completed" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedPaperId(p.id)}>
                          {p.status === "draft" ? "Continue" : "Review"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

const statusBadge = (status: string) => {
  if (status === "completed") return <Badge className="bg-success text-success-foreground border-0 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
  if (status === "evaluating") return <Badge className="bg-primary border-0 text-xs"><Clock className="h-3 w-3 mr-1" />Evaluating</Badge>;
  return <Badge variant="outline" className="text-xs"><XCircle className="h-3 w-3 mr-1" />Pending</Badge>;
};

export const Route = createFileRoute("/teacher/exams/evaluate/$examId/$classId")({
  head: () => ({ meta: [{ title: "Evaluate Paper — Teacher" }] }),
  component: PaperEvaluationPage,
});
