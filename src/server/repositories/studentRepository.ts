import { prisma } from "@/server/db";
import { AuthContext, assertCanWriteIndicators, assertSchoolScope } from "@/core/auth/permissions";

export async function listStudents(schoolId?: string) {
  return prisma.student.findMany({
    where: schoolId ? { schoolId } : undefined,
    include: { class: true },
    orderBy: { name: "asc" },
  });
}

export async function listStudentsForSchool(ctx: AuthContext, schoolId: string) {
  assertSchoolScope(ctx, schoolId);
  return listStudents(schoolId);
}

export async function createStudent(
  ctx: AuthContext,
  input: { name: string; classId: string; specialNeeds?: string }
) {
  assertCanWriteIndicators(ctx);
  const klass = await prisma.class.findUniqueOrThrow({ where: { id: input.classId } });
  return prisma.student.create({
    data: { name: input.name, classId: input.classId, specialNeeds: input.specialNeeds, schoolId: klass.schoolId },
  });
}

export async function deleteStudent(ctx: AuthContext, id: string) {
  assertCanWriteIndicators(ctx);
  return prisma.student.delete({ where: { id } });
}
