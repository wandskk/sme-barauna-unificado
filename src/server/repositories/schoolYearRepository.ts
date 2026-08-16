import { prisma } from "@/server/db";
import { AuthContext, assertCanWriteIndicators } from "@/core/auth/permissions";

export async function listSchoolYears() {
  return prisma.schoolYear.findMany({ orderBy: { year: "desc" } });
}

export async function createSchoolYear(ctx: AuthContext, input: { year: number; active?: boolean }) {
  assertCanWriteIndicators(ctx);
  return prisma.schoolYear.create({ data: input });
}

export async function getSchoolYear(id: string) {
  return prisma.schoolYear.findUniqueOrThrow({ where: { id } });
}

export async function updateSchoolYear(
  ctx: AuthContext,
  id: string,
  input: { year: number; active?: boolean }
) {
  assertCanWriteIndicators(ctx);
  return prisma.schoolYear.update({ where: { id }, data: input });
}

export async function deleteSchoolYear(ctx: AuthContext, id: string) {
  assertCanWriteIndicators(ctx);
  return prisma.schoolYear.delete({ where: { id } });
}
