import { prisma } from "@/server/db";
import { AuthContext, assertCanWriteIndicators, assertSchoolScope } from "@/core/auth/permissions";

export async function listClasses(schoolId?: string) {
  return prisma.class.findMany({
    where: schoolId ? { schoolId } : undefined,
    include: { school: true, teacher: true, coordinator: true, schoolYear: true },
    orderBy: [{ school: { name: "asc" } }, { name: "asc" }],
  });
}

export async function listClassesForSchool(ctx: AuthContext, schoolId: string) {
  assertSchoolScope(ctx, schoolId);
  return listClasses(schoolId);
}

export async function createClass(
  ctx: AuthContext,
  input: {
    name: string;
    grade: string;
    shift?: string;
    schoolId: string;
    teacherId?: string | null;
    coordinatorId?: string | null;
    schoolYearId?: string | null;
  }
) {
  assertCanWriteIndicators(ctx);
  return prisma.class.create({ data: input });
}

export async function deleteClass(ctx: AuthContext, id: string) {
  assertCanWriteIndicators(ctx);
  return prisma.class.delete({ where: { id } });
}
