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

export async function getStudent(id: string) {
  return prisma.student.findUniqueOrThrow({ where: { id }, include: { class: true } });
}

/** Perfil do aluno (/admin/alunos/[id]): notas, frequência e resultados de avaliação. */
export async function getStudentDetail(ctx: AuthContext, studentId: string) {
  const student = await prisma.student.findUniqueOrThrow({
    where: { id: studentId },
    include: { class: { include: { school: true } } },
  });
  assertSchoolScope(ctx, student.schoolId);

  const gradeRows = await prisma.grade.findMany({
    where: { studentId },
    orderBy: [{ disciplina: "asc" }, { unidade: "asc" }],
  });

  const attendanceRaw = await prisma.attendanceRecord.findMany({
    where: { studentId },
    orderBy: { date: "asc" },
    select: { date: true, disciplina: true, totalAulas: true, totalFaltas: true },
  });

  const results = await prisma.assessmentResult.findMany({
    where: { studentId },
    include: { assessment: { include: { program: true } } },
    orderBy: [{ assessment: { year: "desc" } }],
  });

  return { student, gradeRows, attendanceRaw, results };
}

export async function updateStudent(
  ctx: AuthContext,
  id: string,
  input: { name: string; classId: string; specialNeeds?: string }
) {
  assertCanWriteIndicators(ctx);
  const klass = await prisma.class.findUniqueOrThrow({ where: { id: input.classId } });
  return prisma.student.update({
    where: { id },
    data: { name: input.name, classId: input.classId, specialNeeds: input.specialNeeds, schoolId: klass.schoolId },
  });
}

export async function deleteStudent(ctx: AuthContext, id: string) {
  assertCanWriteIndicators(ctx);
  return prisma.student.delete({ where: { id } });
}
