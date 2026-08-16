import { prisma } from "@/server/db";
import { AuthContext, assertSchoolScope, assertCanWriteIndicators } from "@/core/auth/permissions";

export async function listSchools() {
  return prisma.school.findMany({ orderBy: { name: "asc" } });
}

export async function getSchool(ctx: AuthContext, schoolId: string) {
  assertSchoolScope(ctx, schoolId);
  return prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
}

/** Perfil da escola para a tela de detalhe (/admin/escolas/[id]): turmas + contagens agregadas. */
export async function getSchoolDetail(ctx: AuthContext, schoolId: string) {
  assertSchoolScope(ctx, schoolId);
  const school = await prisma.school.findUniqueOrThrow({
    where: { id: schoolId },
    include: {
      classes: {
        include: { teacher: true, coordinator: true, _count: { select: { students: true } } },
        orderBy: [{ grade: "asc" }, { shift: "asc" }, { name: "asc" }],
      },
    },
  });

  const totalStudents = school.classes.reduce((sum, c) => sum + c._count.students, 0);
  const teacherIds = new Set(school.classes.map((c) => c.teacherId).filter(Boolean));

  return { school, totalStudents, totalTeachers: teacherIds.size, totalClasses: school.classes.length };
}

export async function createSchool(
  ctx: AuthContext,
  input: { name: string; type?: string; zone?: string; address?: string }
) {
  assertCanWriteIndicators(ctx);
  return prisma.school.create({ data: input });
}

export async function updateSchool(
  ctx: AuthContext,
  id: string,
  input: { name?: string; type?: string; zone?: string; address?: string }
) {
  assertCanWriteIndicators(ctx);
  return prisma.school.update({ where: { id }, data: input });
}

export async function deleteSchool(ctx: AuthContext, id: string) {
  assertCanWriteIndicators(ctx);
  return prisma.school.delete({ where: { id } });
}
