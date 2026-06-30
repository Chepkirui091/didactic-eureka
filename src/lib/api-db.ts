import { NextResponse } from "next/server";
import { canUseDatabase, markDatabaseUnavailable, databaseConnectionHint } from "./db-health";
import { DATA_SOURCE_HEADER } from "./api-response";

export { DATA_SOURCE_HEADER } from "./api-response";

/** Coalesce concurrent health checks within the same serverless instance. */
let inflightHealth: Promise<boolean> | null = null;

function checkDatabaseOnce(): Promise<boolean> {
  if (!inflightHealth) {
    inflightHealth = canUseDatabase().finally(() => {
      inflightHealth = null;
    });
  }
  return inflightHealth;
}

export async function resolveDataSource(): Promise<"database" | "fallback"> {
  return (await checkDatabaseOnce()) ? "database" : "fallback";
}

export function jsonWithSource<T>(
  data: T,
  source: "database" | "fallback",
  init?: ResponseInit,
): NextResponse {
  const res = NextResponse.json(data, init);
  res.headers.set(DATA_SOURCE_HEADER, source);
  return res;
}

export async function withDatabase<T>(
  fn: () => Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false; message: string }> {
  if (!(await checkDatabaseOnce())) {
    return {
      ok: false,
      message: databaseConnectionHint(),
    };
  }
  try {
    return { ok: true, value: await fn() };
  } catch (error) {
    await markDatabaseUnavailable();
    const message =
      error instanceof Error ? error.message : "Database operation failed";
    console.error("[withDatabase]", error);
    return { ok: false, message };
  }
}
