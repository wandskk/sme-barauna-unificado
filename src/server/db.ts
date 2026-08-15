import { PrismaClient } from "@prisma/client";

// Padrão recomendado pela Vercel/Next.js para evitar esgotar conexões do
// Postgres em dev (hot reload cria um client novo a cada reload sem isso).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
