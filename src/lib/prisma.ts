import dns from "node:dns";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Avoid long hangs when Railway host resolves to IPv6 first (Node falls back slowly).
dns.setDefaultResultOrder("ipv4first");

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function isLocalHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  );
}

/** Railway / remote MySQL needs SSL and longer timeouts than local dev. */
function buildPoolConfig(url: string) {
  const parsed = new URL(url);
  const remote = !isLocalHost(parsed.hostname);

  const sslParam = parsed.searchParams.get("ssl");
  const sslMode = parsed.searchParams.get("sslmode");
  const explicitSsl =
    sslParam === "true" ||
    sslParam === "1" ||
    sslMode === "require" ||
    sslMode === "verify-full";

  // Railway proxy hosts always need TLS even if the URL omits sslmode
  const isRailway =
    parsed.hostname.endsWith(".rlwy.net") ||
    parsed.hostname.endsWith(".railway.app");
  const needsSsl = remote || explicitSsl || isRailway;

  const timeout = remote ? 10_000 : 5_000;

  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, "").split("?")[0],
    connectionLimit: 5,
    connectTimeout: timeout,
    acquireTimeout: timeout,
    idleTimeout: 120,
    minimumIdle: 1,
    ...(needsSsl
      ? {
          ssl: {
            // Railway proxy certs often need this; strict verify for other hosts
            rejectUnauthorized: isRailway
              ? false
              : parsed.searchParams.get("sslaccept") !== "accept_invalid_certs",
          },
        }
      : {}),
  };
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaMariaDb(buildPoolConfig(url));
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
}
