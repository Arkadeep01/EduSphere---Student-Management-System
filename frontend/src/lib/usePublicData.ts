import { useQuery } from "@tanstack/react-query";
import { publicWebsiteApi, type PublicFAQItem, type PublicLeadershipItem, type PublicAnnouncementItem, type PublicSlots, type PublicGalleryItem, type PublicFacilityItem, type PublicStats, type PublicMeritData, type PublicInstitutionInfo } from "@/services/websiteApi";

export function usePublicStats() {
  return useQuery<PublicStats>({
    queryKey: ["public-stats"],
    queryFn: () => publicWebsiteApi.stats(),
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePublicFAQ() {
  return useQuery<PublicFAQItem[]>({
    queryKey: ["public-faq"],
    queryFn: () => publicWebsiteApi.faq(),
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePublicLeadership() {
  return useQuery<PublicLeadershipItem[]>({
    queryKey: ["public-leadership"],
    queryFn: () => publicWebsiteApi.leadership(),
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePublicAnnouncements() {
  return useQuery<PublicAnnouncementItem[]>({
    queryKey: ["public-announcements"],
    queryFn: () => publicWebsiteApi.announcements(),
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePublicSlots() {
  return useQuery<PublicSlots>({
    queryKey: ["public-slots"],
    queryFn: () => publicWebsiteApi.slots(),
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePublicGallery() {
  return useQuery<PublicGalleryItem[]>({
    queryKey: ["public-gallery"],
    queryFn: () => publicWebsiteApi.gallery(),
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePublicFacilities() {
  return useQuery<PublicFacilityItem[]>({
    queryKey: ["public-facilities"],
    queryFn: () => publicWebsiteApi.facilities(),
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePublicAbout() {
  return useQuery<Record<string, unknown>>({
    queryKey: ["public-about"],
    queryFn: () => publicWebsiteApi.about(),
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePublicAdmission() {
  return useQuery<Record<string, unknown>>({
    queryKey: ["public-admission"],
    queryFn: () => publicWebsiteApi.admission(),
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePublicMerit() {
  return useQuery<PublicMeritData>({
    queryKey: ["public-merit"],
    queryFn: () => publicWebsiteApi.merit(),
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePublicInstitution() {
  return useQuery<PublicInstitutionInfo>({
    queryKey: ["public-institution"],
    queryFn: () => publicWebsiteApi.institution(),
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePublicSubjects() {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["public-subjects"],
    queryFn: () => publicWebsiteApi.subjects(),
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePublicEvents() {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["public-events"],
    queryFn: () => publicWebsiteApi.events(),
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePublicTeachers() {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["public-teachers"],
    queryFn: () => publicWebsiteApi.teachers(),
    staleTime: 60_000,
    retry: 2,
  });
}
