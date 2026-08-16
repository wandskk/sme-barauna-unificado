import { prisma } from "@/server/db";
import { AuthContext, assertCanWriteIndicators } from "@/core/auth/permissions";

export async function listCoordinators() {
  return prisma.coordinator.findMany({ orderBy: { name: "asc" } });
}

export async function createCoordinator(ctx: AuthContext, input: { name: string }) {
  assertCanWriteIndicators(ctx);
  return prisma.coordinator.create({ data: input });
}

export async function getCoordinator(id: string) {
  return prisma.coordinator.findUniqueOrThrow({ where: { id } });
}

export async function updateCoordinator(ctx: AuthContext, id: string, input: { name: string }) {
  assertCanWriteIndicators(ctx);
  return prisma.coordinator.update({ where: { id }, data: input });
}

export async function deleteCoordinator(ctx: AuthContext, id: string) {
  assertCanWriteIndicators(ctx);
  return prisma.coordinator.delete({ where: { id } });
}
