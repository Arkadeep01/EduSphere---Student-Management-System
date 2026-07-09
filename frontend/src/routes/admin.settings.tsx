import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, Image, Upload, Trash2, ArrowUp, ArrowDown, Plus, Video } from "lucide-react";
import { siteContent } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";

function AdminSettingsComponent() {
  const [content, setContent] = useState(siteContent);

  return (
    <>
      <Tabs defaultValue="about">
        <TabsList className="mb-4"><TabsTrigger value="about">About Page</TabsTrigger><TabsTrigger value="gallery">Gallery</TabsTrigger><TabsTrigger value="home">Home Page</TabsTrigger><TabsTrigger value="admission">Admission Page</TabsTrigger></TabsList>

        <TabsContent value="about">
          <div className="space-y-4">
            <Card><CardContent className="p-5 space-y-4">
              <h3 className="font-semibold">About Content</h3>
              <div className="space-y-2"><Label>Content</Label><Textarea defaultValue={content.about.content} rows={5} /></div>
            </CardContent></Card>

            <Card><CardContent className="p-5 space-y-4">
              <h3 className="font-semibold">Featured Video</h3>
              <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Video URL</Label><Input defaultValue={content.about.video} /></div><div className="space-y-2"><Label>Video Title</Label><Input defaultValue={content.about.videoTitle} /></div></div>
            </CardContent></Card>

            <Card><CardContent className="p-5 space-y-4">
              <h3 className="font-semibold">Featured Students</h3>
              {content.about.featuredStudents.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg border">
                  <Avatar><AvatarFallback>{s.name.split(" ").map(x => x[0]).join("")}</AvatarFallback></Avatar>
                  <div className="flex-1"><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.achievement}</p></div>
                  <Badge variant="outline">{s.class}</Badge>
                </div>
              ))}
              <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" />Add Student</Button>
            </CardContent></Card>

            <Card><CardContent className="p-5 space-y-4">
              <h3 className="font-semibold">Top Students</h3>
              <Table><TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead>Percentage</TableHead></TableRow></TableHeader>
                <TableBody>{content.about.topStudents.map(s => (
                  <TableRow key={s.rank}><TableCell>#{s.rank}</TableCell><TableCell className="font-medium">{s.name}</TableCell><TableCell>{s.class}</TableCell><TableCell>{s.percentage}%</TableCell></TableRow>
                ))}</TableBody>
              </Table>
            </CardContent></Card>

            <Button className="bg-gradient-brand border-0" onClick={() => toast.success("About page settings saved")}>Save Changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="gallery">
          <Card><CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Gallery Images</h3>
              <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" />Upload Images</Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {content.gallery.images.map(img => (
                <Card key={img.id} className="overflow-hidden group">
                  <div className="h-28 bg-muted relative">
                    <img src={img.image} alt={img.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 text-white"><ArrowUp className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 text-white"><ArrowDown className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between"><p className="text-xs truncate">{img.label}</p>
                      {img.featured && <Star className="h-3 w-3 fill-warning text-warning" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Order: {img.order}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button className="bg-gradient-brand border-0" onClick={() => toast.success("Gallery settings saved")}>Save Changes</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="home">
          <Card><CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Home Page Featured Images</h3>
              <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" />Add Image</Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {content.home.featuredImages.map(img => (
                <Card key={img.id} className="overflow-hidden">
                  <div className="h-32 bg-muted"><img src={img.image} alt={img.label} className="w-full h-full object-cover" /></div>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between"><p className="text-sm font-medium truncate">{img.label}</p>
                      <Star className={`h-4 w-4 ${img.starred ? "fill-warning text-warning" : "text-muted-foreground"} cursor-pointer`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-6 px-1"><ArrowUp className="h-3 w-3" /></Button>
                      <span className="text-xs text-muted-foreground">Order: {img.order}</span>
                      <Button size="sm" variant="ghost" className="h-6 px-1"><ArrowDown className="h-3 w-3" /></Button>
                    </div>
                    <Button size="sm" variant="ghost" className="w-full text-destructive h-7 text-xs"><Trash2 className="mr-1 h-3 w-3" />Remove</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button className="bg-gradient-brand border-0" onClick={() => toast.success("Home page settings saved")}>Save Changes</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="admission">
          <div className="space-y-4">
            <Card><CardContent className="p-5 space-y-4">
              <h3 className="font-semibold">Banner Information</h3>
              <div className="space-y-2"><Label>Banner Text</Label><Input defaultValue={content.admission.bannerInfo} /></div>
              <div className="space-y-2"><Label>Application Fee ($)</Label><Input type="number" defaultValue={content.admission.fee} /></div>
              <div className="space-y-2"><Label>Intake Capacity</Label><Input type="number" defaultValue={content.admission.intakeCapacity} /></div>
            </CardContent></Card>

            <Card><CardContent className="p-5 space-y-4">
              <h3 className="font-semibold">Important Dates</h3>
              <Table><TableHeader><TableRow><TableHead>Event</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>{content.admission.dates.map((d, i) => (
                  <TableRow key={i}><TableCell>{d.event}</TableCell><TableCell>{d.date}</TableCell><TableCell><Button size="sm" variant="ghost" className="h-6">Edit</Button></TableCell></TableRow>
                ))}</TableBody>
              </Table>
              <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" />Add Date</Button>
            </CardContent></Card>

            <Card><CardContent className="p-5 space-y-4">
              <h3 className="font-semibold">Notices</h3>
              {content.admission.notices.map((n, i) => (
                <div key={i} className="flex items-center gap-2"><Input defaultValue={n} className="flex-1" /><Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></div>
              ))}
              <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" />Add Notice</Button>
            </CardContent></Card>

            <Button className="bg-gradient-brand border-0" onClick={() => toast.success("Admission page settings saved")}>Save Changes</Button>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: AdminSettingsComponent,
});
