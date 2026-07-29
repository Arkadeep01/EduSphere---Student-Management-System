import { request, API_BASE } from "./request";

export interface WebsiteSlot {
  slot: string;
  slot_display: string;
  image: string | null;
  alt_text: string;
  is_active: boolean;
  id: number | null;
}

export interface FacilityItem {
  id: number;
  name: string;
  image: string;
  description: string;
  order: number;
  is_active: boolean;
  uploaded_at: string;
}

export interface PublicSlots {
  [slot: string]: {
    image_url: string;
    alt_text: string;
  } | null;
}

export interface PublicGalleryItem {
  id: number;
  image: string;
  label: string;
  caption: string;
  alt_text: string;
  order: number;
}

export interface PublicFacilityItem {
  id: number;
  name: string;
  image: string;
  description: string;
  order: number;
}

export const websiteAdminApi = {
  slots: {
    list: () => request<WebsiteSlot[]>("/settings/slots/"),
    upload: (slot: string, formData: FormData) =>
      request<WebsiteSlot>(`/settings/slots/${slot}/`, { method: "POST", body: formData }),
    update: (slot: string, data: Record<string, unknown>) =>
      request<WebsiteSlot>(`/settings/slots/${slot}/detail/`, { method: "PATCH", body: JSON.stringify(data) }),
    deactivate: (slot: string) =>
      request(`/settings/slots/${slot}/`, { method: "DELETE" }),
  },
  facilities: {
    list: () => request<FacilityItem[]>("/settings/facilities/"),
    upload: (formData: FormData) =>
      request<FacilityItem>("/settings/facilities/upload/", { method: "POST", body: formData }),
    update: (id: number, data: Record<string, unknown>) =>
      request<FacilityItem>(`/settings/facilities/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) =>
      request(`/settings/facilities/${id}/`, { method: "DELETE" }),
  },
};

export interface PublicStats {
  students: number;
  teachers: number;
  subjects: number;
  classes: number;
}

export interface PublicFAQItem {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export interface PublicLeadershipItem {
  id: number;
  name: string;
  designation: string;
  image: string | null;
  quote: string;
  order: number;
}

export interface PublicAnnouncementItem {
  id: number;
  title: string;
  content: string;
  published_at: string | null;
}

export interface PublicInstitutionInfo {
  institution_name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  director_message: string;
  principal_name: string;
  public_website_data_mode: string;
}

export interface MeritStudent {
  rank: number;
  name: string;
  class: string;
  percentage: number;
  grade: string;
}

export interface MeritClass {
  class: string;
  students: MeritStudent[];
}

export interface PublicMeritData {
  classes: MeritClass[];
}

function publicFetch<T>(path: string): Promise<T> {
  return fetch(`${API_BASE}${path}`).then(r => {
    if (!r.ok) throw new Error(`Failed to fetch ${path}`);
    return r.json() as Promise<T>;
  });
}

export const publicWebsiteApi = {
  slots: () => publicFetch<PublicSlots>("/api/public/website/slots/"),
  gallery: () => publicFetch<PublicGalleryItem[]>("/api/public/website/gallery/"),
  facilities: () => publicFetch<PublicFacilityItem[]>("/api/public/website/facilities/"),
  faq: () => publicFetch<PublicFAQItem[]>("/api/public/website/faq/"),
  leadership: () => publicFetch<PublicLeadershipItem[]>("/api/public/website/leadership/"),
  announcements: () => publicFetch<PublicAnnouncementItem[]>("/api/public/website/announcements/"),
  about: () => publicFetch<Record<string, unknown>>("/api/public/website/about/"),
  admission: () => publicFetch<Record<string, unknown>>("/api/public/website/admission/"),
  stats: () => publicFetch<PublicStats>("/api/public/website/stats/"),
  merit: () => publicFetch<PublicMeritData>("/api/public/website/merit/"),
  institution: () => publicFetch<PublicInstitutionInfo>("/api/public/website/institution/"),
  subjects: () => publicFetch<Record<string, unknown>[]>("/api/public/website/subjects/"),
  events: () => publicFetch<Record<string, unknown>[]>("/api/public/website/events/"),
  teachers: () => publicFetch<Record<string, unknown>[]>("/api/public/website/teachers/"),
};