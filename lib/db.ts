import { PrismaClient } from "@prisma/client";

/// The app is fully functional without a database (it reads the chain directly).
/// Set DATABASE_URL to enable persistence of users, payments and tx hashes.
export const dbEnabled = Boolean(process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getDb(): PrismaClient | null {
  if (!dbEnabled) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}
