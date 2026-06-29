"use client";

import { useCallback } from "react";
import type { Habit } from "@/lib/types";
import { getHabits } from "@/lib/data-api";
import { CacheKeys } from "@/lib/client-cache";
import { useCachedData } from "@/hooks/use-cached-data";

export function useHabits() {
  const fetcher = useCallback((force: boolean) => getHabits(force), []);
  const { data, loading, refresh } = useCachedData<Habit[]>(
    CacheKeys.habits,
    fetcher,
  );
  return { habits: data ?? [], loading, refresh };
}
