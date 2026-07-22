export type CacheSource = "database" | "fallback" | "local";

export type CacheEntry<T> = {
  data: T;
  savedAt: number;
  source: CacheSource;
};

const memory = new Map<string, CacheEntry<unknown>>();

export const CacheKeys = {
  habits: "habits",
  entriesToday: "entries:today",
  entriesDays: (days: number) => `entries:days:${days}`,
  entriesHabit: (habitId: string) => `entries:habit:${habitId}`,
  activity: (days: number) => `activity:${days}`,
  roadmap: "roadmap",
  roadmapId: (id: string) => `roadmap:${id}`,
  roadmaps: "roadmaps",
  habit: (id: string) => `habit:${id}`,
} as const;

const INVALIDATE_EVENT = "habitflow:cache-invalidate";

function storageKey(key: string): string {
  return `habitflow:cache:${key}`;
}

export function readCache<T>(key: string): CacheEntry<T> | null {
  const mem = memory.get(key);
  if (mem) return mem as CacheEntry<T>;

  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(key));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    memory.set(key, entry as CacheEntry<unknown>);
    return entry;
  } catch {
    return null;
  }
}

export function writeCache<T>(
  key: string,
  data: T,
  source: CacheSource = "database",
): void {
  const entry: CacheEntry<T> = { data, savedAt: Date.now(), source };
  memory.set(key, entry as CacheEntry<unknown>);

  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(entry));
  } catch {
    // storage full — memory cache still works this session
  }
}

export function invalidateCache(...keys: string[]): void {
  for (const key of keys) {
    memory.delete(key);
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey(key));
    }
  }
  if (typeof window !== "undefined" && keys.length > 0) {
    window.dispatchEvent(
      new CustomEvent(INVALIDATE_EVENT, { detail: { keys } }),
    );
  }
}

export function invalidateByPrefix(prefix: string): void {
  const keys = new Set<string>();
  for (const key of memory.keys()) {
    if (key.startsWith(prefix)) keys.add(key);
  }
  if (typeof window !== "undefined") {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(`habitflow:cache:${prefix}`)) {
        keys.add(k.replace("habitflow:cache:", ""));
      }
    }
  }
  invalidateCache(...keys);
}

export function subscribeCacheInvalidation(
  listener: (keys: string[]) => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ keys: string[] }>).detail;
    listener(detail?.keys ?? []);
  };
  window.addEventListener(INVALIDATE_EVENT, handler);
  return () => window.removeEventListener(INVALIDATE_EVENT, handler);
}

export function invalidateHabitRelatedCaches(habitId?: string): void {
  invalidateCache(CacheKeys.habits, CacheKeys.entriesToday);
  invalidateByPrefix("entries:days:");
  invalidateByPrefix("activity:");
  if (habitId) {
    invalidateCache(CacheKeys.habit(habitId), CacheKeys.entriesHabit(habitId));
  } else {
    invalidateByPrefix("habit:");
    invalidateByPrefix("entries:habit:");
  }
}

export function invalidateRoadmapCache(roadmapId?: string): void {
  invalidateCache(CacheKeys.roadmap, CacheKeys.roadmaps);
  if (roadmapId) {
    invalidateCache(CacheKeys.roadmapId(roadmapId));
  } else {
    invalidateByPrefix("roadmap:");
  }
}
