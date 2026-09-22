import { PrismaClient } from "@prisma/client";

/// Resolve the database URL robustly. Hosting integrations inject it under
/// different names depending on the prefix the user chose (DATABASE_URL,
/// POSTGRES_URL, POSTGRES_PRISMA_URL, MY_PREFIX_DATABASE_URL, ...). We first
/// check the well-known names, then fall back to scanning the environment for
/// any value that looks like a Postgres connection string.
function resolveDatabaseUrl(): { url?: string; source?: string } {
  const preferred = [
    "DATABASE_URL",
    "PRISMA_DATABASE_URL",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
  ];
  for (const key of preferred) {
    const value = process.env[key];
    if (value && /^postgres(ql)?:\/\//.test(value)) return { url: value, source: key };
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string" && /^postgres(ql)?:\/\//.test(value)) {
      return { url: value, source: key };
    }
  }
  return {};
}

const resolved = resolveDatabaseUrl();

export const databaseUrl = resolved.url;
export const databaseUrlSource = resolved.source;
export const dbEnabled = Boolean(databaseUrl);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getDb(): PrismaClient | null {
  if (!databaseUrl) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ datasourceUrl: databaseUrl });
  }
  return globalForPrisma.prisma;
}
