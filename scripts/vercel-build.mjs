import { execSync } from "node:child_process";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

run("prisma generate");

if (process.env.DATABASE_URL?.trim()) {
  run("prisma migrate deploy");
} else {
  console.log("DATABASE_URL not set — skipping migrations (using in-memory fallback at runtime)");
}

run("next build");
