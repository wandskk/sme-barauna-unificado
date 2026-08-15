import { prisma } from "@/server/db";
import { AuthContext, assertSchoolScope, assertCanWriteIndicators } from "@/core/auth/permissions";

export async function listSchools() {
  return prisma.school.findMany({ orderBy: { name: "asc" } });
}

export async function getSchool(ctx: AuthContext, schoolId: string) {
  assertSchoolScope(ctx, schoolId);
  return prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
}

export async function createSchool(
  ctx: AuthContext,
  input: { name: string; type?: string; zone?: string; address?: string }
) {
  assertCanWriteIndicators(ctx);
  return prisma.school.create({ data: input });
}
