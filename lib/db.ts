import { PrismaClient } from "@prisma/client";

/// Resolve the database URL from any of the common names that hosting
/// integrations inject (Vercel Prisma Postgres sets `DATABASE_URL`, but some
/// setups expose `PRISMA_DATABASE_URL`, `POSTGRES_URL`, etc.).
export const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  undefined;

/// The app is fully functional without a database (it reads the chain directly).
export const dbEnabled = Boolean(databaseUrl);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getDb(): PrismaClient | null {
  if (!databaseUrl) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ datasourceUrl: databaseUrl });
  }
  return globalForPrisma.prisma;
}
