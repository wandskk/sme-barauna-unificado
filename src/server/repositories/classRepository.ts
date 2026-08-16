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

export async function getClass(id: string) {
  return prisma.class.findUniqueOrThrow({
    where: { id },
    include: { school: true, teacher: true, coordinator: true, schoolYear: true },
  });
}

/** Detalhe da turma (/admin/escolas/[id]/turmas/[turmaId]): alunos + resultados de avaliação lançados. */
export async function getClassDetail(ctx: AuthContext, classId: string) {
  const klass = await prisma.class.findUniqueOrThrow({
    where: { id: classId },
    include: {
      school: true,
      teacher: true,
      coordinator: true,
      schoolYear: true,
      students: { orderBy: { name: "asc" } },
    },
  });
  assertSchoolScope(ctx, klass.schoolId);

  const results = await prisma.assessmentResult.findMany({
    where: { classId },
    include: { assessment: { include: { program: true } }, student: true },
    orderBy: [{ assessment: { year: "desc" } }, { student: { name: "asc" } }],
  });

  // Cru (não agregado) — a tela filtra por data no cliente, sem ida e volta ao servidor.
  const attendanceRaw = await prisma.attendanceRecord.findMany({
    where: { classId },
    orderBy: { date: "asc" },
    select: { studentId: true, date: true, disciplina: true, totalAulas: true, totalFaltas: true },
  });

  // Pivotado (aluno x disciplina, média entre bimestres) — pra caber tudo numa
  // tabela só em vez de uma tabela por disciplina repetindo o nome do aluno.
  const gradeRows = await prisma.grade.findMany({ where: { classId } });
  const byStudentDisciplina = new Map<string, Map<string, { sum: number; count: number }>>();
  const byDisciplina = new Map<string, { sum: number; count: number }>();
  for (const g of gradeRows) {
    const perDisciplina = byStudentDisciplina.get(g.studentId) ?? new Map<string, { sum: number; count: number }>();
    const acc = perDisciplina.get(g.disciplina) ?? { sum: 0, count: 0 };
    acc.sum += Number(g.nota);
    acc.count += 1;
    perDisciplina.set(g.disciplina, acc);
    byStudentDisciplina.set(g.studentId, perDisciplina);

    const turmaAcc = byDisciplina.get(g.disciplina) ?? { sum: 0, count: 0 };
    turmaAcc.sum += Number(g.nota);
    turmaAcc.count += 1;
    byDisciplina.set(g.disciplina, turmaAcc);
  }
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const grades = {
    disciplinas: [...byDisciplina.keys()].sort((a, b) => a.localeCompare(b)),
    disciplinaAverage: new Map([...byDisciplina.entries()].map(([d, a]) => [d, round2(a.sum / a.count)])),
    byStudent: new Map(
      [...byStudentDisciplina.entries()].map(([studentId, perDisciplina]) => [
        studentId,
        new Map([...perDisciplina.entries()].map(([d, a]) => [d, round2(a.sum / a.count)])),
      ])
    ),
    hasData: gradeRows.length > 0,
  };

  return { class: klass, results, attendanceRaw, grades };
}

export async function updateClass(
  ctx: AuthContext,
  id: string,
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
  return prisma.class.update({ where: { id }, data: input });
}

export async function deleteClass(ctx: AuthContext, id: string) {
  assertCanWriteIndicators(ctx);
  return prisma.class.delete({ where: { id } });
}
