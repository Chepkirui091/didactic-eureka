import { execSync } from "node:child_process";

function run(command, env = process.env) {
  execSync(command, { stdio: "inherit", env });
}

function sleep(ms) {
  execSync(`node -e "setTimeout(() => {}, ${ms})"`, { stdio: "ignore" });
}

/** Neon pooler hosts often time out (P1002) while the compute wakes up. Migrations want the direct host. */
function migrationDatabaseUrl(raw) {
  const url = new URL(raw);
  if (url.hostname.includes("-pooler.")) {
    url.hostname = url.hostname.replace("-pooler.", ".");
    console.log("[vercel-build] Using the direct Neon host for migrations.");
  }
  if (!url.searchParams.has("connect_timeout")) {
    url.searchParams.set("connect_timeout", "30");
  }
  return url.toString();
}

function migrate() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    console.log(
      "DATABASE_URL not set — skipping migrations (using in-memory fallback at runtime)",
    );
    return;
  }

  const env = { ...process.env, DATABASE_URL: migrationDatabaseUrl(raw) };
  const attempts = 4;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      run("prisma migrate deploy", env);
      return;
    } catch (error) {
      if (attempt === attempts) throw error;
      console.log(
        `[vercel-build] prisma migrate deploy failed (attempt ${attempt}/${attempts}). Retrying in 5s — Neon often times out with P1002 while waking up.`,
      );
      sleep(5000);
    }
  }
}

run("prisma generate");
migrate();
run("next build");
