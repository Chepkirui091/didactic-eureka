import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

const root = process.cwd();

// Next.js uses .env.local — Prisma CLI only loads .env by default
if (existsSync(resolve(root, ".env"))) {
  loadEnv({ path: resolve(root, ".env") });
}
if (existsSync(resolve(root, ".env.local"))) {
  loadEnv({ path: resolve(root, ".env.local"), override: true });
}

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.warn(
    "[prisma] DATABASE_URL is missing. Add it to .env.local (see .env.example).",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
