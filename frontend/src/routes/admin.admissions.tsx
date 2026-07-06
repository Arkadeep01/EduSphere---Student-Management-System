import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, CheckCircle2, XCircle, Eye, FileText, UserPlus, HelpCircle, Grid3X3, Download } from "lucide-react";
import { useState } from "react";
import { admissionSubmissions, admissionStats } from "@/lib/mock-data";
import { getAdmissionApplications, updateAdmissionStatus, updateDocumentVerification } from "@/lib/admission-store";
import type { AdmissionDocEntry } from "@/lib/upload";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard/StatCard";

const statusBadge: Record<string, { variant: "default" | "destructive" | "secondary" | "outline", className: string }> = {
  pending: { variant: "secondary", className: "" },
  approved: { variant: "default", className: "bg-success text-success-foreground" },
  rejected: { variant: "destructive", className: "" },
};

function AdminAdmissionsComponent() {
  const [applications, setApplications] = useState(() => {
    const storeApps = getAdmissionApplications().map(a => ({
      id: a.id,
      name: a.name,
      fathersName: a.fatherName,
      mothersName: a.motherName,
      phoneNumber: a.phoneNumber,
      address: a.address,
      guardianName: a.guardianName,
      guardianRelationship: a.guardianRelationship,
      previousSchool: a.previousSchool,
      board: a.board,
      stream: a.stream,
      marks: a.marks,
      documents: a.documents.map(d => d.label),
      docEntries: a.documents,
      photoFile: a.photoFile,
      submittedAt: a.submittedAt,
      status: a.status as "pending" | "approved" | "rejected",
    }));
    return [...admissionSubmissions, ...storeApps];
  });
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [showRequestInfo, setShowRequestInfo] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  const filtered = applications.filter(s =>
    (s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase()) || s.previousSchool.toLowerCase().includes(q.toLowerCase()))
    && (statusFilter === "all" || s.status === statusFilter)
  );

  const detail = selected ? applications.find(s => s.id === selected) : null;

  const approveApplication = (id: string) => {
    setApplications(prev => prev.map(s => s.id === id ? { ...s, status: "approved" as const } : s));
    toast.success("Application approved. Student account can now be created.");
  };

  const rejectApplication = (id: string) => {
    setApplications(prev => prev.map(s => s.id === id ? { ...s, status: "rejected" as const } : s));
    toast.error("Application rejected");
  };

  const createStudentAccount = () => {
    toast.success("Student account created. Credentials emailed to applicant.");
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Applicants" value={admissionStats.totalApplicants} icon={FileText} accent="primary" />
        <StatCard label="Entrance Appeared" value={admissionStats.entranceAppeared} icon={Eye} accent="info" />
        <StatCard label="Passed" value={admissionStats.passed} icon={CheckCircle2} accent="success" />
        <StatCard label="Failed" value={admissionStats.failed} icon={XCircle} accent="warning" />
        <StatCard label="Pending Verification" value={admissionStats.pendingVerification} icon={HelpCircle} accent="warning" />
        <StatCard label="Selected" value={admissionStats.selected} icon={UserPlus} accent="success" />
        <StatCard label="Rejected" value={admissionStats.rejected} icon={XCircle} accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card><CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by name, ID or school..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} /></div>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Stream</TableHead><TableHead>Board</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">No submissions match your filters</TableCell></TableRow> :
                    filtered.map(s => (
                    <TableRow key={s.id} className={selected === s.id ? "bg-muted/50" : ""}>
                      <TableCell className="font-mono text-xs">{s.id}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell><Badge variant="outline">{s.stream}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.board}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{new Date(s.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant={statusBadge[s.status].variant} className={statusBadge[s.status].className}>{s.status}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelected(s.id)}><Eye className="mr-2 h-4 w-4" />View details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => approveApplication(s.id)}><CheckCircle2 className="mr-2 h-4 w-4 text-success" />Approve</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => rejectApplication(s.id)} className="text-destructive"><XCircle className="mr-2 h-4 w-4" />Reject</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setShowRequestInfo(true); setSelected(s.id); }}><HelpCircle className="mr-2 h-4 w-4" />Request Info</DropdownMenuItem>
                            {s.status === "approved" && <DropdownMenuItem onClick={() => createStudentAccount()}><UserPlus className="mr-2 h-4 w-4" />Create Student Account</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent></Card>
        </div>

        <div>
          {detail ? (
            <div className="space-y-4">
              <Card><CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between"><h3 className="font-semibold text-lg">{detail.name}</h3><Badge variant={statusBadge[detail.status].variant} className={statusBadge[detail.status].className}>{detail.status}</Badge></div>
                <div className="text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">ID</span><span className="font-mono text-xs">{detail.id}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Father</span><span>{detail.fathersName}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Mother</span><span>{detail.mothersName}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Phone</span><span>{detail.phoneNumber}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Stream</span><span>{detail.stream}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Board</span><span>{detail.board}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Previous School</span><span>{detail.previousSchool}</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Address</span><span className="text-xs">{detail.address}</span></div>
                </div>

                <div><h4 className="font-medium text-sm mb-2">Marks</h4>
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Pass</TableHead><TableHead>Obtained</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                      <TableBody>{detail.marks.map(m => (
                        <TableRow key={m.subject}><TableCell>{m.subject}</TableCell><TableCell>{m.pass}</TableCell><TableCell>{m.obtained}</TableCell><TableCell>{m.total}</TableCell></TableRow>
                      ))}</TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2"><h4 className="font-medium text-sm">Documents ({(detail as any).docEntries?.length || detail.documents.length})</h4>
                    <Button size="sm" variant="ghost" onClick={() => setShowDocViewer(true)}><Grid3X3 className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {((detail as any).docEntries || []).length > 0 ? (
                      (detail as any).docEntries.map((d: AdmissionDocEntry) => (
                        <div key={d.id} className="flex items-center gap-1">
                          <Badge variant={d.verified ? "default" : "outline"} className={`text-xs ${d.verified ? "bg-success" : ""}`}>
                            {d.label}
                            {d.verified ? <CheckCircle2 className="h-3 w-3 ml-1" /> : null}
                          </Badge>
                          {d.file && (
                            <>
                              <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => window.open(d.file!.download_url, "_blank")}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-success" onClick={() => { updateDocumentVerification(detail.id, d.id, true); toast.success(`${d.label} verified`); }}>
                                <CheckCircle2 className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-destructive" onClick={() => { updateDocumentVerification(detail.id, d.id, false); toast.error(`${d.label} rejected`); }}>
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      detail.documents.map(d => (
                        <Badge key={d} variant="outline" className="text-xs cursor-pointer" onClick={() => toast.success(`Opening ${d}`)}>{d}</Badge>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  {detail.status !== "approved" && <Button size="sm" className="w-full bg-success hover:bg-success/90" onClick={() => approveApplication(detail.id)}><CheckCircle2 className="mr-2 h-4 w-4" />Approve</Button>}
                  {detail.status !== "rejected" && <Button size="sm" variant="destructive" className="w-full" onClick={() => rejectApplication(detail.id)}><XCircle className="mr-2 h-4 w-4" />Reject</Button>}
                  <Button size="sm" variant="outline" className="w-full" onClick={() => { setShowRequestInfo(true); }}><HelpCircle className="mr-2 h-4 w-4" />Request More Information</Button>
                  {detail.status === "approved" && <Button size="sm" className="w-full bg-gradient-brand border-0" onClick={() => createStudentAccount()}><UserPlus className="mr-2 h-4 w-4" />Create Student Account</Button>}
                </div>
              </CardContent></Card>
            </div>
          ) : (
            <Card><CardContent className="p-12 text-center text-muted-foreground"><Eye className="h-8 w-8 mx-auto mb-3 opacity-40" /><p>Select a submission to view details</p></CardContent></Card>
          )}
        </div>
      </div>

      <Dialog open={showDocViewer} onOpenChange={setShowDocViewer}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto"><DialogHeader><DialogTitle>Document Viewer — {detail?.name}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {((detail as any)?.docEntries || []).length > 0 ? (
              (detail as any).docEntries.map((d: AdmissionDocEntry) => (
                <Card key={d.id} className={d.verified ? "border-success" : ""}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{d.label}</p>
                      {d.verified && <Badge className="bg-success text-xs">Verified</Badge>}
                    </div>
                    {d.file ? (
                      <>
                        <div className="h-32 rounded-lg bg-muted/20 flex items-center justify-center overflow-hidden">
                          {d.file.extension && [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(d.file.extension) ? (
                            <img src={d.file.preview_url} alt={d.file.original_name} className="max-h-full max-w-full object-contain" />
                          ) : d.file.extension === ".pdf" ? (
                            <embed src={d.file.download_url} type="application/pdf" className="w-full h-full" />
                          ) : (
                            <FileText className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-muted-foreground truncate">{d.file.original_name}</p>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => window.open(d.file!.download_url, "_blank")}>
                              <Download className="h-3 w-3" />
                            </Button>
                            {!d.verified && (
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-success" onClick={() => { updateDocumentVerification(detail!.id, d.id, true); toast.success(`${d.label} verified`); }}>
                                <CheckCircle2 className="h-3 w-3" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => { updateDocumentVerification(detail!.id, d.id, false); toast.error(`${d.label} rejected`); }}>
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-xs text-muted-foreground">No file uploaded</div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              detail?.documents.map((d) => (
                <Card key={d} className="cursor-pointer hover:border-primary" onClick={() => toast.success(`Opening ${d}`)}>
                  <CardContent className="p-4 text-center">
                    <div className="h-20 rounded-lg bg-muted flex items-center justify-center mb-2"><FileText className="h-8 w-8 text-muted-foreground" /></div>
                    <p className="text-xs truncate">{d}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRequestInfo} onOpenChange={o => { if (!o) { setShowRequestInfo(false); setRequestMessage(""); } }}>
        <DialogContent><DialogHeader><DialogTitle>Request More Information</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Applicant</Label><p className="text-sm font-medium">{detail?.name}</p></div>
            <div><Label>Message</Label><Textarea placeholder="Describe what additional information is needed..." rows={4} value={requestMessage} onChange={e => setRequestMessage(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setShowRequestInfo(false); setRequestMessage(""); }}>Cancel</Button><Button className="bg-gradient-brand border-0" onClick={() => { toast.success("Request sent to applicant"); setShowRequestInfo(false); setRequestMessage(""); }}>Send</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Route = createFileRoute("/admin/admissions")({
  head: () => ({ meta: [{ title: "Admission Forms — Admin" }] }),
  component: AdminAdmissionsComponent,
});
