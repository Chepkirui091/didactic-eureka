import {
  getPrisma,
  isDatabaseConfigured,
  isRemoteDatabase,
  resetPrismaClient,
} from "./prisma";

type HealthCache = { ok: boolean; checkedAt: number };

const globalHealth = globalThis as unknown as { dbHealth?: HealthCache };

const OK_TTL_MS = 60_000;
const FAIL_TTL_MS = 15_000;
/** Fail fast — 30s × 2 retries was causing 60s waits before fallback. */
const PING_TIMEOUT_MS = 5_000;
const MAX_ATTEMPTS = 1;

function getCache(): HealthCache | undefined {
  return globalHealth.dbHealth;
}

function setCache(ok: boolean): void {
  globalHealth.dbHealth = { ok, checkedAt: Date.now() };
}

async function pingDatabase(): Promise<void> {
  await Promise.race([
    getPrisma().$queryRaw`SELECT 1`,
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Database ping timed out")),
        PING_TIMEOUT_MS,
      );
    }),
  ]);
}

export async function canUseDatabase(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;

  const cached = getCache();
  if (cached) {
    const ttl = cached.ok ? OK_TTL_MS : FAIL_TTL_MS;
    if (Date.now() - cached.checkedAt < ttl) return cached.ok;
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await pingDatabase();
      setCache(true);
      return true;
    } catch (error) {
      const isLast = attempt === MAX_ATTEMPTS;
      console.error(
        `[db-health] Database ping attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
        error,
      );
      if (!isLast) {
        await resetPrismaClient();
        continue;
      }
      setCache(false);
      await resetPrismaClient();
      return false;
    }
  }

  return false;
}

export async function markDatabaseUnavailable(): Promise<void> {
  setCache(false);
  await resetPrismaClient();
}

export function invalidateDatabaseHealth(): void {
  globalHealth.dbHealth = undefined;
}

/** Hint for toasts — remote DB (e.g. Render) can be slow on first connect. */
export function databaseConnectionHint(): string {
  if (!isDatabaseConfigured()) {
    return "Add DATABASE_URL to .env.local (Render Postgres URL).";
  }
  if (isRemoteDatabase()) {
    return "Could not reach Postgres. Check DATABASE_URL in .env.local and restart npm run dev.";
  }
  return "Could not reach Postgres. Ensure the server is running locally.";
}
