import dns from "node:dns";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

// Avoid long hangs when remote host resolves to IPv6 first (Node falls back slowly).
dns.setDefaultResultOrder("ipv4first");

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function isLocalHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  );
}

/** Remote Postgres (e.g. Render) needs SSL and longer timeouts than local dev. */
function buildPool(url: string): Pool {
  const parsed = new URL(url);
  const remote = !isLocalHost(parsed.hostname);

  const sslMode = parsed.searchParams.get("sslmode");
  const explicitSsl =
    sslMode === "require" ||
    sslMode === "verify-full" ||
    sslMode === "verify-ca";
  const isRender = parsed.hostname.endsWith(".render.com");
  const needsSsl = remote || explicitSsl || isRender;
  const timeout = remote ? 10_000 : 5_000;

  return new Pool({
    connectionString: url,
    max: 5,
    connectionTimeoutMillis: timeout,
    idleTimeoutMillis: 120_000,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = buildPool(url);
  globalForPrisma.pgPool = pool;
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function isRemoteDatabase(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  try {
    return !isLocalHost(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export async function resetPrismaClient(): Promise<void> {
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
  }
  if (globalForPrisma.pgPool) {
    await globalForPrisma.pgPool.end().catch(() => {});
    globalForPrisma.pgPool = undefined;
  }
}
