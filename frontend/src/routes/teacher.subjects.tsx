import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem, HoverLift } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Upload, FileText, Video, Download, CheckCircle2, ChevronDown, ChevronRight, Layers, Users, CheckCircle, Plus, FileUp, Eye, X, Replace } from "lucide-react";
import { teacherSubjectData, teacherProfileData, classSubjectProgress } from "@/lib/mock-data";
import type { ChapterResource, ClassChapterStatus } from "@/lib/mock-data";
import { validateFile, formatFileSize, ALLOWED_RESOURCE_TYPES, MAX_RESOURCE_SIZE_BYTES, ALLOWED_SCRIPT_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/upload";
import type { UploadedFileInfo } from "@/lib/upload";
import { setSyllabus } from "@/lib/syllabus-store";
import { addSharedResource } from "@/lib/resource-store";
import { useState, useRef } from "react";
import { toast } from "sonner";

type ModuleInfo = {
  id: string;
  title: string;
  completed: boolean;
  subtopics: string[];
};

type ChapterInfo = {
  id: string;
  title: string;
  completed: boolean;
  lessons: number;
  completedLessons: number;
  modules: ModuleInfo[];
  resources: ChapterResource[];
  syllabus?: UploadedFileInfo;
};

function calcChapterProgress(ch: ChapterInfo): number {
  if (ch.modules.length === 0) return ch.completed ? 100 : 0;
  const done = ch.modules.filter(m => m.completed).length;
  return Math.round((done / ch.modules.length) * 100);
}

function calcSubjectProgress(chapters: ChapterInfo[]): number {
  const total = chapters.reduce((sum, ch) => sum + ch.modules.length, 0);
  const done = chapters.reduce((sum, ch) => sum + ch.modules.filter(m => m.completed).length, 0);
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function mergeClassChapters(
  master: ChapterInfo[],
  classStatus?: ClassChapterStatus[]
): ChapterInfo[] {
  if (!classStatus) return master;
  return master.map(mch => {
    const cs = classStatus.find(c => c.id === mch.id);
    if (!cs) return mch;
    const mergedModules = mch.modules.map(mm => {
      const ms = cs.modules.find(m => m.id === mm.id);
      return ms ? { ...mm, completed: ms.completed } : mm;
    });
    const doneCount = mergedModules.filter(m => m.completed).length;
    return {
      ...mch,
      completed: cs.completed,
      modules: mergedModules,
      completedLessons: doneCount,
      syllabus: cs.syllabus,
      resources: [...mch.resources, ...cs.resources],
    };
  });
}

function SubjectChaptersTab({
  chapters,
  onToggleModule,
  classView,
  onUploadSyllabus,
  onUploadResource,
  syllabusRef,
}: {
  chapters: ChapterInfo[];
  onToggleModule: (chId: string, modId: string) => void;
  classView?: string;
  onUploadSyllabus?: (chId: string, file: File) => void;
  onUploadResource?: (chId: string) => void;
  syllabusRef?: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div className="mt-4 space-y-3">
      {chapters.map(ch => {
        const chProgress = calcChapterProgress(ch);
        const isExpanded = expanded[ch.id];
        return (
          <Card key={ch.id} className="overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
              onClick={() => setExpanded(prev => ({ ...prev, [ch.id]: !prev[ch.id] }))}
            >
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                {ch.completed ? <CheckCircle2 className="h-5 w-5 text-success" /> : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />}
                <div>
                  <p className="text-sm font-medium">{ch.title}</p>
                  <p className="text-xs text-muted-foreground">{ch.modules.filter(m => m.completed).length}/{ch.modules.length} modules completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={chProgress} className="w-20 h-1.5" />
                <span className="text-xs text-muted-foreground w-8 text-right">{chProgress}%</span>
              </div>
            </div>
            {isExpanded && (
              <div className="px-4 pb-4 space-y-2 border-t">
                {ch.modules.map(mod => (
                  <div key={mod.id} className="flex items-start gap-3 pl-9 pt-2">
                    <button
                      onClick={() => onToggleModule(ch.id, mod.id)}
                      className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                        mod.completed ? "bg-success border-success text-white" : "border-muted-foreground/40"
                      }`}
                    >
                      {mod.completed && <CheckCircle className="h-3 w-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${mod.completed ? "text-muted-foreground line-through" : ""}`}>{mod.title}</p>
                      {mod.subtopics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {mod.subtopics.map(st => (
                            <span key={st} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{st}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {classView && (
                  <div className="pl-9 pt-2 border-t space-y-2">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {ch.syllabus ? (
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-muted-foreground">{ch.syllabus.original_name}</span>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => window.open(ch.syllabus!.download_url)}>
                            <Eye className="h-3 w-3 mr-1" />View
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" asChild>
                            <a href={ch.syllabus.download_url} download={ch.syllabus.original_name}>
                              <Download className="h-3 w-3 mr-1" />Download
                            </a>
                          </Button>
                          <input
                            ref={el => { if (syllabusRef) syllabusRef.current[ch.id] = el; }}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f && onUploadSyllabus) onUploadSyllabus(ch.id, f);
                              if (e.target) e.target.value = "";
                            }}
                          />
                          <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => syllabusRef?.current[ch.id]?.click()}>
                            <Replace className="h-3 w-3 mr-1" />Replace
                          </Button>
                        </div>
                      ) : (
                        <>
                          <input
                            ref={el => { if (syllabusRef) syllabusRef.current[ch.id] = el; }}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f && onUploadSyllabus) onUploadSyllabus(ch.id, f);
                              if (e.target) e.target.value = "";
                            }}
                          />
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => syllabusRef?.current[ch.id]?.click()}>
                            <FileUp className="h-3 w-3 mr-1" />Upload Syllabus
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">Class Resources</p>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => onUploadResource?.(ch.id)}>
                        <Plus className="h-3 w-3 mr-1" />Add
                      </Button>
                    </div>
                    {ch.resources.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {ch.resources.map(r => {
                          const Icon = r.type === "video" ? Video : r.type === "note" ? FileText : FileText;
                          return (
                            <div key={r.id} className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50 text-xs">
                              <Icon className="h-3 w-3 text-primary" />
                              <span>{r.title}</span>
                              <span className="text-muted-foreground">({r.size})</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                {!classView && ch.resources.length > 0 && (
                  <div className="pl-9 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Chapter Resources</p>
                    <div className="flex flex-wrap gap-2">
                      {ch.resources.map(r => {
                        const Icon = r.type === "video" ? Video : r.type === "note" ? FileText : FileText;
                        return (
                          <div key={r.id} className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50 text-xs">
                            <Icon className="h-3 w-3 text-primary" />
                            <span>{r.title}</span>
                            <span className="text-muted-foreground">({r.size})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const Route = createFileRoute("/teacher/subjects")({
  head: () => ({ meta: [{ title: "My Subject — Teacher" }] }),
  component: () => {
    const [chapters, setChapters] = useState<ChapterInfo[]>(teacherSubjectData.chapters as ChapterInfo[]);
    const [classProgress, setClassProgress] = useState<Record<string, ClassChapterStatus[]>>(classSubjectProgress);
    const [selectedClass, setSelectedClass] = useState<string>("all");
    const syllabusRef = useRef<Record<string, HTMLInputElement | null>>({});
    const resourceFileRef = useRef<HTMLInputElement>(null);
    const [pendingResourceChapter, setPendingResourceChapter] = useState<string | null>(null);
    const subject = teacherSubjectData;

    const displayChapters = selectedClass === "all"
      ? chapters
      : mergeClassChapters(chapters, classProgress[selectedClass]);

    const displayProgress = calcSubjectProgress(displayChapters);
    const completedChapters = displayChapters.filter(c => c.completed).length;

    function handleToggleModule(chId: string, modId: string) {
      if (selectedClass === "all") {
        setChapters(prev => prev.map(ch => {
          if (ch.id !== chId) return ch;
          const newModules = ch.modules.map(m =>
            m.id === modId ? { ...m, completed: !m.completed } : m
          );
          const allDone = newModules.every(m => m.completed);
          const completedCount = newModules.filter(m => m.completed).length;
          return {
            ...ch,
            modules: newModules,
            completed: allDone,
            completedLessons: completedCount,
            lessons: newModules.length,
          };
        }));
        const ch = chapters.find(c => c.id === chId);
        const mod = ch?.modules.find(m => m.id === modId);
        if (mod) {
          toast.success(`${mod.completed ? "Unmarked" : "Marked"} "${mod.title}"`);
        }
      } else {
        setClassProgress(prev => {
          const classData = prev[selectedClass];
          if (!classData) return prev;
          const updated = classData.map(ch => {
            if (ch.id !== chId) return ch;
            const newMods = ch.modules.map(m =>
              m.id === modId ? { ...m, completed: !m.completed } : m
            );
            return { ...ch, modules: newMods, completed: newMods.every(m => m.completed) };
          });
          return { ...prev, [selectedClass]: updated };
        });
        const ch = displayChapters.find(c => c.id === chId);
        const mod = ch?.modules.find(m => m.id === modId);
        if (mod) {
          toast.success(`${mod.completed ? "Unmarked" : "Marked"} "${mod.title}" (${selectedClass})`);
        }
      }
    }

    function handleUploadSyllabus(chId: string, file: File) {
      const error = validateFile(file, ALLOWED_SCRIPT_TYPES, MAX_FILE_SIZE_BYTES);
      if (error) {
        toast.error(error);
        return;
      }
      const url = URL.createObjectURL(file);
      const uploadInfo: UploadedFileInfo = {
        id: `syll_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        filename: file.name,
        original_name: file.name,
        extension: ".pdf",
        size: file.size,
        uploaded_at: new Date().toISOString(),
        uploaded_by: teacherProfileData?.personal?.fullName || "Dr. Anika Rao",
        download_url: url,
        preview_url: url,
      };
      setSyllabus({
        subjectCode: subject.code,
        subjectName: subject.name,
        className: selectedClass,
        chapterId: chId,
        fileName: file.name,
        fileUrl: url,
        uploadedAt: new Date().toISOString(),
      });
      setClassProgress(prev => {
        const classData = prev[selectedClass];
        if (!classData) return prev;
        const updated = classData.map(ch =>
          ch.id === chId ? { ...ch, syllabus: uploadInfo } : ch
        );
        return { ...prev, [selectedClass]: updated };
      });
      toast.success(`Syllabus uploaded for ${selectedClass}`);
    }

    function handleUploadResource(chId: string) {
      setPendingResourceChapter(chId);
      resourceFileRef.current?.click();
    }

    function handleResourceFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
      const f = e.target.files?.[0];
      if (!f || !pendingResourceChapter) return;
      const error = validateFile(f, ALLOWED_RESOURCE_TYPES, MAX_RESOURCE_SIZE_BYTES);
      if (error) {
        toast.error(error);
        e.target.value = "";
        setPendingResourceChapter(null);
        return;
      }
      const url = URL.createObjectURL(f);
      const title = f.name.replace(/\.[^/.]+$/, "");
      const newRes: ChapterResource = {
        id: `${pendingResourceChapter}r-${Date.now()}`,
        title,
        type: "document" as const,
        size: formatSize(f.size),
        fileSize: f.size,
        fileUrl: url,
        uploadedAt: new Date().toISOString(),
      };
      addSharedResource({
        ...newRes,
        assignedClasses: [selectedClass],
        uploadedBy: teacherProfileData?.personal?.fullName || subject.teacher,
        subject: subject.name,
      });
      setClassProgress(prev => {
        const classData = prev[selectedClass];
        if (!classData) return prev;
        const updated = classData.map(ch =>
          ch.id === pendingResourceChapter ? { ...ch, resources: [...ch.resources, newRes] } : ch
        );
        return { ...prev, [selectedClass]: updated };
      });
      toast.success(`Resource added to ${selectedClass}`);
      e.target.value = "";
      setPendingResourceChapter(null);
    }

    return (
      <PageWrapper>
        <input
          ref={resourceFileRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.zip"
          className="hidden"
          onChange={handleResourceFileSelect}
        />
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StaggerItem><Card><CardContent className="p-4 text-center">
            <Layers className="h-5 w-5 mx-auto text-primary" />
            <p className="text-2xl font-bold mt-2">{subject.classes.length}</p>
            <p className="text-xs text-muted-foreground">Classes</p>
          </CardContent></Card></StaggerItem>
          <StaggerItem><Card><CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-brand" />
            <p className="text-2xl font-bold mt-2">{subject.totalStudents}</p>
            <p className="text-xs text-muted-foreground">Students</p>
          </CardContent></Card></StaggerItem>
          <StaggerItem><Card><CardContent className="p-4 text-center">
            <BookOpen className="h-5 w-5 mx-auto text-info" />
            <p className="text-2xl font-bold mt-2">{completedChapters}/{displayChapters.length}</p>
            <p className="text-xs text-muted-foreground">Chapters</p>
          </CardContent></Card></StaggerItem>
          <StaggerItem><Card><CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto text-success" />
            <p className="text-2xl font-bold mt-2">{subject.evaluations.completed}/{subject.evaluations.total}</p>
            <p className="text-xs text-muted-foreground">Evaluations</p>
          </CardContent></Card></StaggerItem>
        </StaggerContainer>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Subject Progress {selectedClass !== "all" && `— ${selectedClass}`}</span>
              <span className="text-sm font-bold">{displayProgress}%</span>
            </div>
            <Progress value={displayProgress} className="h-2.5" />
          </CardContent>
        </Card>

        {/* Class Selector */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground mr-1">View:</span>
          <Button
            size="sm"
            variant={selectedClass === "all" ? "default" : "outline"}
            onClick={() => setSelectedClass("all")}
            className="h-8 text-xs"
          >
            All Classes
          </Button>
          {subject.classes.map(cls => (
            <Button
              key={cls}
              size="sm"
              variant={selectedClass === cls ? "default" : "outline"}
              onClick={() => setSelectedClass(cls)}
              className="h-8 text-xs"
            >
              {cls}
            </Button>
          ))}
        </div>

        <Card className="mt-4"><CardContent className="p-6">
          <Tabs defaultValue="chapters">
            <TabsList>
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
            </TabsList>

            <TabsContent value="chapters">
                <SubjectChaptersTab
                  chapters={displayChapters}
                  onToggleModule={handleToggleModule}
                  classView={selectedClass !== "all" ? selectedClass : undefined}
                  onUploadSyllabus={selectedClass !== "all" ? handleUploadSyllabus : undefined}
                  onUploadResource={selectedClass !== "all" ? handleUploadResource : undefined}
                  syllabusRef={syllabusRef}
                />
            </TabsContent>

            <TabsContent value="classes" className="mt-4">
              <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subject.classes.map(cls => (
                  <StaggerItem key={cls}>
                    <HoverLift>
                      <Card
                        className={`cursor-pointer ${selectedClass === cls ? "ring-2 ring-primary" : ""}`}
                        onClick={() => setSelectedClass(cls)}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Layers className="h-5 w-5 text-primary" /></div>
                          <div><p className="font-semibold">{cls}</p><p className="text-xs text-muted-foreground">{subject.name}</p></div>
                        </CardContent>
                      </Card>
                    </HoverLift>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </TabsContent>

            <TabsContent value="resources" className="mt-4 space-y-3">
              <Button size="sm" className="bg-gradient-brand border-0"><Upload className="mr-2 h-4 w-4" />Upload resource</Button>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                {displayChapters.flatMap(ch =>
                  ch.resources.map(r => {
                    const Icon = r.type === "video" ? Video : r.type === "note" ? FileText : FileText;
                    return (
                      <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="h-4 w-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{r.title}</p>
                            <p className="text-xs text-muted-foreground">{r.size} · {ch.title}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" asChild={!!r.fileUrl}>
                          {r.fileUrl ? (
                            <a href={r.fileUrl} download={r.title}><Download className="h-4 w-4" /></a>
                          ) : (
                            <button><Download className="h-4 w-4" /></button>
                          )}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="evaluations" className="mt-4">
              <Card><CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div><p className="text-2xl font-bold">{subject.evaluations.pending}</p><p className="text-xs text-muted-foreground">Pending Evaluation</p></div>
                  <div><p className="text-2xl font-bold text-success">{subject.evaluations.completed}</p><p className="text-xs text-muted-foreground">Completed</p></div>
                  <div><p className="text-2xl font-bold text-primary">{subject.evaluations.total}</p><p className="text-xs text-muted-foreground">Total</p></div>
                </div>
                <Progress value={(subject.evaluations.completed / subject.evaluations.total) * 100} className="h-2" />
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </CardContent></Card>
      </PageWrapper>
    );
  },
});
