import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, BookOpen, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { teacherChapterApi, teacherClassProgressApi, teacherResourceApi } from "@/services/teacherApi";

interface Chapter { id: number; subject: number; title: string; description: string; order: number; progress_weight: number; topics: Topic[]; created_at: string; }
interface Topic { id: number; chapter: number; title: string; description: string; order: number; is_completed: boolean; }
interface ClassProgress { id: number; chapter: number; chapter_title: string; class_name: string; completed_topics: number; total_topics: number; percentage: number; }

export const Route = createFileRoute("/teacher/subjects")({
  head: () => ({ meta: [{ title: "Subjects — Teacher" }] }),
  component: () => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [progress, setProgress] = useState<ClassProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
    const [showChapterDialog, setShowChapterDialog] = useState(false);
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const [chapterForm, setChapterForm] = useState({ title: "", description: "", order: 0, progress_weight: 0 });
    const [showTopicDialog, setShowTopicDialog] = useState(false);
    const [topicChapterId, setTopicChapterId] = useState<number | null>(null);
    const [topicForm, setTopicForm] = useState({ title: "", description: "", order: 0 });

    const fetchData = async () => {
      try {
        const [c, p] = await Promise.all([
          teacherChapterApi.list(),
          teacherClassProgressApi.list(),
        ]);
        setChapters(c as Chapter[]);
        setProgress(p as ClassProgress[]);
      } catch { toast.error("Failed to load data"); }
      finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    async function handleSaveChapter() {
      if (!chapterForm.title) { toast.error("Title is required"); return; }
      try {
        if (editingChapter) {
          await teacherChapterApi.update(editingChapter.id, chapterForm);
          toast.success("Chapter updated");
        } else {
          await teacherChapterApi.create(chapterForm);
          toast.success("Chapter created");
        }
        setShowChapterDialog(false);
        setEditingChapter(null);
        setChapterForm({ title: "", description: "", order: 0, progress_weight: 0 });
        fetchData();
      } catch { toast.error("Failed to save"); }
    }

    async function handleDeleteChapter(id: number) {
      try { await teacherChapterApi.delete(id); toast.success("Chapter deleted"); fetchData(); } catch { toast.error("Failed"); }
    }

    async function handleSaveTopic() {
      if (!topicForm.title || !topicChapterId) { toast.error("Title is required"); return; }
      try {
        await teacherChapterApi.addTopic(topicChapterId, topicForm);
        toast.success("Topic added");
        setShowTopicDialog(false);
        setTopicForm({ title: "", description: "", order: 0 });
        fetchData();
      } catch { toast.error("Failed"); }
    }

    async function toggleTopicCompletion(chapterId: number, topic: Topic) {
      try {
        await teacherChapterApi.updateTopic(chapterId, topic.id, { is_completed: !topic.is_completed });
        fetchData();
      } catch { toast.error("Failed"); }
    }

    if (loading) return <div className="text-center py-8 text-muted-foreground">Loading subjects...</div>;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">My Subject Syllabus</h2>
          <Button size="sm" className="bg-gradient-brand border-0" onClick={() => { setEditingChapter(null); setChapterForm({ title: "", description: "", order: 0, progress_weight: 0 }); setShowChapterDialog(true); }}>
            <Plus className="h-4 w-4 mr-1" />Add Chapter
          </Button>
        </div>

        {chapters.length === 0 ? (
          <Card><CardContent className="text-center py-12 text-muted-foreground">No chapters yet. Create your first chapter.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {chapters.map((ch, ci) => (
              <Card key={ch.id}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30" onClick={() => setExpandedChapter(expandedChapter === ch.id ? null : ch.id)}>
                    <div className="flex items-center gap-2">
                      {expandedChapter === ch.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="font-medium">{ch.title}</span>
                      <Badge variant="outline" className="text-xs">{ch.topics?.length || 0} topics</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        {progress.filter(p => p.chapter === ch.id).map(p => (
                          <Badge key={p.id} variant="outline" className="text-[9px]">{p.class_name}: {p.percentage}%</Badge>
                        ))}
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={e => { e.stopPropagation(); setEditingChapter(ch); setChapterForm({ title: ch.title, description: ch.description, order: ch.order, progress_weight: ch.progress_weight }); setShowChapterDialog(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={e => { e.stopPropagation(); handleDeleteChapter(ch.id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {expandedChapter === ch.id && (
                    <div className="border-t px-3 py-2">
                      {(!ch.topics || ch.topics.length === 0) ? (
                        <p className="text-xs text-muted-foreground py-2">No topics yet</p>
                      ) : (
                        <div className="space-y-1">
                          {ch.topics.map(t => (
                            <div key={t.id} className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleTopicCompletion(ch.id, t)}>
                                  {t.is_completed ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                                </button>
                                <span className={`text-sm ${t.is_completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Pencil className="h-3 w-3" /></Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={async () => { try { await teacherChapterApi.deleteTopic(ch.id, t.id); fetchData(); toast.success("Topic deleted"); } catch { toast.error("Failed"); } }}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button size="sm" variant="ghost" className="mt-1 h-7" onClick={() => { setTopicChapterId(ch.id); setTopicForm({ title: "", description: "", order: 0 }); setShowTopicDialog(true); }}>
                        <Plus className="h-3 w-3 mr-1" />Add Topic
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showChapterDialog} onOpenChange={o => { if (!o) { setShowChapterDialog(false); setEditingChapter(null); } }}>
          <DialogContent><DialogHeader><DialogTitle>{editingChapter ? "Edit" : "Add"} Chapter</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label>Title</Label><Input value={chapterForm.title} onChange={e => setChapterForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Description</Label><Input value={chapterForm.description} onChange={e => setChapterForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Order</Label><Input type="number" value={chapterForm.order} onChange={e => setChapterForm(p => ({ ...p, order: Number(e.target.value) }))} /></div>
                <div className="space-y-1"><Label>Progress Weight</Label><Input type="number" value={chapterForm.progress_weight} onChange={e => setChapterForm(p => ({ ...p, progress_weight: Number(e.target.value) }))} /></div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { setShowChapterDialog(false); setEditingChapter(null); }}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={handleSaveChapter}>{editingChapter ? "Update" : "Create"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showTopicDialog} onOpenChange={o => { if (!o) setShowTopicDialog(false); }}>
          <DialogContent><DialogHeader><DialogTitle>Add Topic</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label>Title</Label><Input value={topicForm.title} onChange={e => setTopicForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Description</Label><Input value={topicForm.description} onChange={e => setTopicForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Order</Label><Input type="number" value={topicForm.order} onChange={e => setTopicForm(p => ({ ...p, order: Number(e.target.value) }))} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowTopicDialog(false)}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={handleSaveTopic}>Add</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
});
