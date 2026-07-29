import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { cmsApi } from "@/services/adminApi";
import { websiteAdminApi } from "@/services/websiteApi";
import type { WebsiteSlot, FacilityItem } from "@/services/websiteApi";

function AdminSettingsComponent() {
  const [about, setAbout] = useState<any>({ content: "", video: "", videoTitle: "" });
  const [gallery, setGallery] = useState<any[]>([]);
  const [homepage, setHomepage] = useState<any[]>([]);
  const [admission, setAdmission] = useState<any>({ bannerInfo: "", fee: "", intakeCapacity: "" });
  const [slots, setSlots] = useState<WebsiteSlot[]>([]);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const homeInputRef = useRef<HTMLInputElement>(null);
  const facilityInputRef = useRef<HTMLInputElement>(null);
  const [facilityName, setFacilityName] = useState("");
  const [facilityDesc, setFacilityDesc] = useState("");

  useEffect(() => {
    Promise.all([
      cmsApi.about.get().catch(() => ({ content: "", video: "", videoTitle: "" })),
      cmsApi.gallery.list().catch(() => []),
      cmsApi.homepage.list().catch(() => []),
      cmsApi.admission.get().catch(() => ({ bannerInfo: "", fee: "", intakeCapacity: "" })),
      websiteAdminApi.slots.list().catch(() => [] as WebsiteSlot[]),
      websiteAdminApi.facilities.list().catch(() => [] as FacilityItem[]),
    ]).then(([a, g, h, ad, s, f]) => {
      setAbout(a as any);
      setGallery(g as any[]);
      setHomepage(h as any[]);
      setAdmission(ad as any);
      setSlots(s as WebsiteSlot[]);
      setFacilities(f as FacilityItem[]);
    }).finally(() => setLoading(false));
  }, []);

  const saveAbout = async () => {
    try { await cmsApi.about.update(about); toast.success("About page saved"); } catch { toast.error("Failed to save"); }
  };

  const saveAdmission = async () => {
    try { await cmsApi.admission.update(admission); toast.success("Admission page saved"); } catch { toast.error("Failed to save"); }
  };

  const uploadGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append("image", file); fd.append("label", file.name);
    try { await cmsApi.gallery.upload(fd); toast.success("Image uploaded"); const g = await cmsApi.gallery.list(); setGallery(g as any[] || []); } catch { toast.error("Upload failed"); }
  };

  const deleteGallery = async (id: number) => {
    try { await cmsApi.gallery.delete(id); setGallery(prev => prev.filter(g => g.id !== id)); toast.success("Image deleted"); } catch { toast.error("Delete failed"); }
  };

  const uploadHomepage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append("image", file); fd.append("label", file.name);
    try { await cmsApi.homepage.upload(fd); toast.success("Image uploaded"); const h = await cmsApi.homepage.list(); setHomepage(h as any[] || []); } catch { toast.error("Upload failed"); }
  };

  const deleteHomepage = async (id: number) => {
    try { await cmsApi.homepage.delete(id); setHomepage(prev => prev.filter(h => h.id !== id)); toast.success("Image deleted"); } catch { toast.error("Delete failed"); }
  };

  const uploadSlotImage = async (slot: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append("image", file);
    try {
      await websiteAdminApi.slots.upload(slot, fd);
      toast.success("Slot image uploaded");
      const s = await websiteAdminApi.slots.list();
      setSlots(s);
    } catch { toast.error("Upload failed"); }
  };

  const removeSlotImage = async (slot: string) => {
    try {
      await websiteAdminApi.slots.deactivate(slot);
      toast.success("Slot image removed");
      const s = await websiteAdminApi.slots.list();
      setSlots(s);
    } catch { toast.error("Failed to remove"); }
  };

  const uploadFacility = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!facilityName) { toast.error("Name is required"); return; }
    const fd = new FormData();
    fd.append("image", file);
    fd.append("name", facilityName);
    fd.append("description", facilityDesc);
    try {
      await websiteAdminApi.facilities.upload(fd);
      toast.success("Facility added");
      setFacilityName(""); setFacilityDesc("");
      const f = await websiteAdminApi.facilities.list();
      setFacilities(f);
    } catch { toast.error("Upload failed"); }
  };

  const deleteFacility = async (id: number) => {
    try {
      await websiteAdminApi.facilities.delete(id);
      setFacilities(prev => prev.filter(f => f.id !== id));
      toast.success("Facility deleted");
    } catch { toast.error("Delete failed"); }
  };

  const toggleFacilityActive = async (item: FacilityItem) => {
    try {
      await websiteAdminApi.facilities.update(item.id, { is_active: !item.is_active });
      const f = await websiteAdminApi.facilities.list();
      setFacilities(f);
      toast.success("Facility updated");
    } catch { toast.error("Update failed"); }
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading settings...</div>;

  return (
    <Tabs defaultValue="about">
      <TabsList className="mb-4 flex-wrap"><TabsTrigger value="about">About Page</TabsTrigger><TabsTrigger value="gallery">Gallery</TabsTrigger><TabsTrigger value="home">Home Page</TabsTrigger><TabsTrigger value="slots">Website Slots</TabsTrigger><TabsTrigger value="facilities">Facilities</TabsTrigger><TabsTrigger value="admission">Admission Page</TabsTrigger></TabsList>

      <TabsContent value="about">
        <div className="space-y-4">
          <Card><CardContent className="p-5 space-y-4">
            <h3 className="font-semibold">About Content</h3>
            <div className="space-y-2"><Label>Content</Label><Textarea value={about.content || ""} onChange={e => setAbout({ ...about, content: e.target.value })} rows={5} /></div>
          </CardContent></Card>
          <Card><CardContent className="p-5 space-y-4">
            <h3 className="font-semibold">Featured Video</h3>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Video URL</Label><Input value={about.video || ""} onChange={e => setAbout({ ...about, video: e.target.value })} /></div><div className="space-y-2"><Label>Video Title</Label><Input value={about.videoTitle || ""} onChange={e => setAbout({ ...about, videoTitle: e.target.value })} /></div></div>
          </CardContent></Card>
          <Button className="bg-gradient-brand border-0" onClick={saveAbout}>Save Changes</Button>
        </div>
      </TabsContent>

      <TabsContent value="gallery">
        <Card><CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-semibold">Gallery Images</h3>
            <Button variant="outline" size="sm" onClick={() => galleryInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Upload Images</Button>
            <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" onChange={uploadGallery} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {gallery.map((img: any) => (
              <Card key={img.id} className="overflow-hidden group">
                <div className="h-28 bg-muted relative">
                  <img src={img.image || img.file} alt={img.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteGallery(img.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs truncate">{img.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="home">
        <Card><CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-semibold">Home Page Featured Images</h3>
            <Button variant="outline" size="sm" onClick={() => homeInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Add Image</Button>
            <input type="file" ref={homeInputRef} className="hidden" accept="image/*" onChange={uploadHomepage} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {homepage.map((img: any) => (
              <Card key={img.id} className="overflow-hidden">
                <div className="h-32 bg-muted"><img src={img.image || img.file} alt={img.label} className="w-full h-full object-cover" /></div>
                <CardContent className="p-3 space-y-2">
                  <p className="text-sm font-medium truncate">{img.label}</p>
                  <Button size="sm" variant="ghost" className="w-full text-destructive h-7 text-xs" onClick={() => deleteHomepage(img.id)}><Trash2 className="mr-1 h-3 w-3" />Remove</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="slots">
        <Card><CardContent className="p-5 space-y-4">
          <h3 className="font-semibold">Fixed Website Image Slots</h3>
          <p className="text-sm text-muted-foreground">Upload or replace images for predefined website placement slots.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => (
              <Card key={slot.slot} className="overflow-hidden">
                <div className="h-36 bg-muted relative">
                  {slot.image ? (
                    <img src={slot.image} alt={slot.slot_display} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
                  )}
                </div>
                <CardContent className="p-3 space-y-2">
                  <p className="text-sm font-medium">{slot.slot_display}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => {
                      const input = document.getElementById(`slot-file-${slot.slot}`) as HTMLInputElement;
                      input?.click();
                    }}>
                      <Upload className="mr-1 h-3 w-3" />{slot.image ? "Replace" : "Upload"}
                    </Button>
                    {slot.image && (
                      <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => removeSlotImage(slot.slot)}>
                        <Trash2 className="mr-1 h-3 w-3" />Remove
                      </Button>
                    )}
                    <input id={`slot-file-${slot.slot}`} type="file" className="hidden" accept="image/*" onChange={(e) => uploadSlotImage(slot.slot, e)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="facilities">
        <Card><CardContent className="p-5 space-y-4">
          <h3 className="font-semibold">Facility Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2"><Label>Facility Name</Label><Input value={facilityName} onChange={e => setFacilityName(e.target.value)} placeholder="e.g. Library" /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={facilityDesc} onChange={e => setFacilityDesc(e.target.value)} placeholder="Brief description" /></div>
            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" onClick={() => facilityInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Add Facility</Button>
              <input type="file" ref={facilityInputRef} className="hidden" accept="image/*" onChange={uploadFacility} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {facilities.map((item) => (
              <Card key={item.id} className={`overflow-hidden ${!item.is_active ? "opacity-50" : ""}`}>
                <div className="h-28 bg-muted relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 text-white" onClick={() => toggleFacilityActive(item)}>
                      {item.is_active ? "Hide" : "Show"}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteFacility(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs font-medium truncate">{item.name}</p>
                  {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="admission">
        <div className="space-y-4">
          <Card><CardContent className="p-5 space-y-4">
            <h3 className="font-semibold">Banner Information</h3>
            <div className="space-y-2"><Label>Banner Text</Label><Input value={admission.bannerInfo || ""} onChange={e => setAdmission({ ...admission, bannerInfo: e.target.value })} /></div>
            <div className="space-y-2"><Label>Application Fee ($)</Label><Input type="number" value={admission.fee || ""} onChange={e => setAdmission({ ...admission, fee: e.target.value })} /></div>
            <div className="space-y-2"><Label>Intake Capacity</Label><Input type="number" value={admission.intakeCapacity || ""} onChange={e => setAdmission({ ...admission, intakeCapacity: e.target.value })} /></div>
          </CardContent></Card>
          <Button className="bg-gradient-brand border-0" onClick={saveAdmission}>Save Changes</Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: AdminSettingsComponent,
});