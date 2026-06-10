import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { documentsList } from "@/lib/mock-data";
import { useRef, useState } from "react";

export const Route = createFileRoute("/admissionForms")({
  head: () => ({
    meta: [
      { title: "Form — EduSphere" },
      { name: "description", content: "Explore 50+ courses across STEM, humanities, arts, and languages." },
    ],
  }),
  component: AdmissionForm,
});

function AdmissionForm() {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <FadeIn direction="up">
            <h1 className="text-4xl md:text-5xl font-bold">
              Admission Application Form
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.15}>
            <p className="mt-4 text-muted-foreground">
              Complete the admission application form and upload the required documents.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Admission Form */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="space-y-8">
            {/* Personal Details Card */}
            <FadeIn direction="up">
              <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-8">
                {/* Top Row: Fields + Photo (stacks on mobile, side-by-side on desktop) */}
                <div className="flex flex-col-reverse md:flex-row gap-6 items-center md:items-start">
                  {/* Personal Fields */}
                  <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full flex-1">
                    <StaggerItem>
                      <div className="space-y-2 text-left">
                        <Label>Name (Block Letters)</Label>
                        <Input />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="space-y-2 text-left">
                        <Label>Father's Name</Label>
                        <Input />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="space-y-2 text-left">
                        <Label>Mother's Name</Label>
                        <Input />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="space-y-2 text-left">
                        <Label>Phone Number</Label>
                        <Input />
                      </div>
                    </StaggerItem>
                  </StaggerContainer>

                  {/* Photo Upload */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="w-28 h-36 rounded-xl border-2 border-dashed border-primary/40 overflow-hidden hover:border-primary transition flex items-center justify-center bg-muted/30 cursor-pointer"
                    >
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Passport photo preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground text-center px-2 leading-snug">
                          Upload Photo
                        </span>
                      )}
                    </button>
                    <span className="text-[11px] text-muted-foreground text-center">
                      Passport Size
                    </span>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>
                </div>

                {/* Address Fields */}
                <div className="space-y-2 text-left">
                  <Label>Address</Label>
                  <Textarea rows={4} />
                </div>

                <div className="space-y-2 text-left">
                  <Label>Local Guardian Name &amp; Address</Label>
                  <Textarea rows={3} />
                </div>

                <div className="space-y-2 text-left">
                  <Label>Relationship With Guardian</Label>
                  <Input />
                </div>

                <div className="space-y-2 text-left">
                  <Label>Previous School &amp; Board</Label>
                  <Input />
                </div>

                {/* Stream Selection */}
                <div className="space-y-2 text-left">
                  <Label>Stream / Subject Combination</Label>
                  <StaggerContainer className="flex flex-wrap gap-4 sm:gap-8 pt-1">
                    {["Science", "Arts", "Commerce"].map((stream) => (
                      <StaggerItem key={stream}>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="radio" name="stream" value={stream} />
                          {stream}
                        </label>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </div>
            </FadeIn>

            {/* Marks Table */}
            <FadeIn direction="up">
              <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b text-left">
                  <h2 className="font-semibold text-base">Previous Examination Marks</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Subject</th>
                        <th className="p-3 font-medium text-center">Pass Marks</th>
                        <th className="p-3 font-medium text-center">Marks Obtained</th>
                        <th className="p-3 font-medium text-center">Total Marks</th>
                        <th className="p-3 font-medium text-center">Division %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {["English", "Bengali", "Mathematics", "Science", "Social Science"].map((subject) => (
                        <tr key={subject} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-medium text-sm text-left">{subject}</td>
                          <td className="p-3"><Input className="h-8 text-sm text-center mx-auto max-w-[80px]" /></td>
                          <td className="p-3"><Input className="h-8 text-sm text-center mx-auto max-w-[80px]" /></td>
                          <td className="p-3"><Input className="h-8 text-sm text-center mx-auto max-w-[80px]" /></td>
                          <td className="p-3"><Input className="h-8 text-sm text-center mx-auto max-w-[80px]" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>

            {/* Documents Upload Section */}
            <FadeIn direction="up">
              <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-5">
                <h2 className="text-xl font-bold text-left">Upload Documents</h2>

                <div className="space-y-3 text-left">
                  {documentsList.map((doc) => (
                    <div
                      key={doc}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-muted/20 px-4 py-3"
                    >
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {doc}
                      </span>
                      <div className="shrink-0 w-full sm:w-auto">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="h-8 text-xs w-full sm:w-56 cursor-pointer bg-background"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Submit Button */}
            <FadeIn direction="up" className="w-full text-center">
              <Button type="submit" size="lg">
                Submit Application
              </Button>
            </FadeIn>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}