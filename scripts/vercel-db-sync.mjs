#!/usr/bin/env node
/// Apply the Prisma schema to the database before a Vercel build.
///
/// The app can run without a database, and the production database is injected
/// under a host-specific name (Vercel's Postgres integration uses e.g.
/// `Postgres_DATABASE_URL`), which Prisma's datasource cannot reference because
/// it reads `env("DATABASE_URL")`. This script resolves whichever Postgres URL is
/// present, exports it as `DATABASE_URL`, and runs `prisma db push` so models
/// added after the last deploy (for example `Ticket`) exist at runtime.
///
/// It is intentionally non-fatal: a missing URL or a failed sync logs a warning
/// and the build continues, so the app still deploys in DB-less mode.

import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

if (process.env.VERCEL !== "1") {
  process.exit(0);
}

const PREFERRED = [
  "DATABASE_URL",
  "PRISMA_DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
];

function resolveDatabaseUrl() {
  for (const key of PREFERRED) {
    const value = process.env[key];
    if (value && /^postgres(ql)?:\/\//.test(value)) return { key, value };
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string" && /^postgres(ql)?:\/\//.test(value)) {
      return { key, value };
    }
  }
  return null;
}

const resolved = resolveDatabaseUrl();
if (!resolved) {
  console.log("[db-sync] no Postgres URL in the environment; skipping schema sync");
  process.exit(0);
}

const localBin = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "prisma.cmd" : "prisma",
);
const useLocal = existsSync(localBin);
const command = useLocal ? localBin : "npx";
const args = useLocal ? ["db", "push"] : ["--no-install", "prisma", "db", "push"];

console.log(`[db-sync] applying Prisma schema to the database from ${resolved.key}`);
const result = spawnSync(command, args, {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: resolved.value },
});

if (result.error) {
  console.warn(`[db-sync] could not run prisma: ${result.error.message}`);
} else if (result.status !== 0) {
  console.warn(
    "[db-sync] prisma db push failed; continuing the build (the app works without a database)",
  );
}

process.exit(0);
