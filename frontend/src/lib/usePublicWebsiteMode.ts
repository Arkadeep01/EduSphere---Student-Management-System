import { useQuery } from "@tanstack/react-query";
import { publicWebsiteApi } from "@/services/websiteApi";

export type WebsiteDataMode = "DEMO" | "LIVE";

export function usePublicWebsiteMode() {
  const query = useQuery({
    queryKey: ["public-website-mode"],
    queryFn: () => publicWebsiteApi.institution(),
    staleTime: 60_000,
    retry: 2,
  });

  const mode: WebsiteDataMode =
    query.isError ? "DEMO" :
    query.data?.public_website_data_mode === "DEMO" ? "DEMO" : "LIVE";

  return {
    mode,
    isDemo: mode === "DEMO",
    isLive: mode === "LIVE",
    loading: query.isLoading,
    error: query.isError,
    refetch: query.refetch,
  };
}