"use client";

import { useCallback } from "react";
import type { RoadmapSummary } from "@/lib/types";
import { listRoadmaps } from "@/lib/data-api";
import { CacheKeys } from "@/lib/client-cache";
import { useCachedData } from "@/hooks/use-cached-data";

export function useRoadmapList() {
  const fetcher = useCallback((force: boolean) => listRoadmaps(force), []);
  const { data, loading, refresh } = useCachedData<RoadmapSummary[]>(
    CacheKeys.roadmaps,
    fetcher,
  );

  return {
    projects: data ?? [],
    loading,
    refresh,
  };
}
