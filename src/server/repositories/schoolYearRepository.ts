import { prisma } from "@/server/db";
import { AuthContext, assertCanWriteIndicators } from "@/core/auth/permissions";

export async function listSchoolYears() {
  return prisma.schoolYear.findMany({ orderBy: { year: "desc" } });
}

export async function createSchoolYear(ctx: AuthContext, input: { year: number; active?: boolean }) {
  assertCanWriteIndicators(ctx);
  return prisma.schoolYear.create({ data: input });
}

export async function deleteSchoolYear(ctx: AuthContext, id: string) {
  assertCanWriteIndicators(ctx);
  return prisma.schoolYear.delete({ where: { id } });
}
