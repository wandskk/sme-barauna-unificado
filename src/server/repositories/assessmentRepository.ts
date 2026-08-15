import { prisma } from "@/server/db";
import { AuthContext, assertSchoolScope, assertCanWriteIndicators } from "@/core/auth/permissions";
import { scoreObjectiveResult } from "@/core/assessments/scoring";
import { READING_LEVELS } from "@/core/assessments/readingLevels";

/**
 * Repositório dos indicadores — cobre os dois programas (SPADEB e Fluência
 * Leitora) porque ambos usam o mesmo modelo Assessment/AssessmentResult
 * (ver prisma/schema.prisma, seção 3, para o porquê dessa unificação).
 */

export async function listProgramsWithAssessments() {
  return prisma.assessmentProgram.findMany({
    include: { assessments: { orderBy: { year: "desc" } } },
    orderBy: { name: "asc" },
  });
}

export async function listPrograms() {
  return prisma.assessmentProgram.findMany({ orderBy: { name: "asc" } });
}

export async function listAssessments() {
  return prisma.assessment.findMany({
    include: { program: true },
    orderBy: [{ year: "desc" }, { name: "asc" }],
  });
}

export async function getAssessment(id: string) {
  return prisma.assessment.findUniqueOrThrow({ where: { id }, include: { program: true } });
}

export async function createAssessment(
  ctx: AuthContext,
  input: {
    programId: string;
    name: string;
    year: number;
    grade?: string;
    subject?: string;
    totalQuestions?: number;
  }
) {
  assertCanWriteIndicators(ctx);
  return prisma.assessment.create({ data: input });
}

export async function deleteAssessment(ctx: AuthContext, id: string) {
  assertCanWriteIndicators(ctx);
  return prisma.assessment.delete({ where: { id } });
}

/** Usado no lançamento (Secretaria/Admin): resultados já lançados para uma turma, sem exigir escopo de escola. */
export async function listResultsForClass(assessmentId: string, classId: string) {
  return prisma.assessmentResult.findMany({
    where: { assessmentId, classId },
    include: { student: true },
    orderBy: { student: { name: "asc" } },
  });
}

export async function listResultsForSchool(ctx: AuthContext, schoolId: string, assessmentId: string) {
  assertSchoolScope(ctx, schoolId);
  return prisma.assessmentResult.findMany({
    where: { schoolId, assessmentId },
    include: { student: true, class: true },
    orderBy: { student: { name: "asc" } },
  });
}

export async function recordObjectiveResult(
  ctx: AuthContext,
  input: {
    assessmentId: string;
    schoolId: string;
    classId: string;
    studentId: string;
    correctPortuguese: number;
    correctMath: number;
    totalQuestions: number;
  }
) {
  assertCanWriteIndicators(ctx);
  const { totalCorrect, percentage, classification } = scoreObjectiveResult({
    correctPortuguese: input.correctPortuguese,
    correctMath: input.correctMath,
    totalQuestions: input.totalQuestions,
  });

  return prisma.assessmentResult.upsert({
    where: { result_identity: { assessmentId: input.assessmentId, studentId: input.studentId } },
    create: { ...input, totalCorrect, percentage, classification },
    update: { ...input, totalCorrect, percentage, classification },
  });
}

export async function recordReadingLevel(
  ctx: AuthContext,
  input: {
    assessmentId: string;
    schoolId: string;
    classId: string;
    studentId: string;
    readingLevel: string;
    participated: boolean;
  }
) {
  assertCanWriteIndicators(ctx);
  return prisma.assessmentResult.upsert({
    where: { result_identity: { assessmentId: input.assessmentId, studentId: input.studentId } },
    create: input,
    update: input,
  });
}

/** Agregação por escola para o dashboard público (/indicadores) — um gráfico por avaliação. */
export async function getAssessmentSummaryBySchool(assessmentId: string) {
  const assessment = await prisma.assessment.findUniqueOrThrow({
    where: { id: assessmentId },
    include: { program: true },
  });

  const results = await prisma.assessmentResult.findMany({
    where: { assessmentId, participated: true },
    include: { class: { include: { school: true } } },
  });

  const bySchool = new Map<string, { schoolName: string; results: typeof results }>();
  for (const r of results) {
    const key = r.class.schoolId;
    if (!bySchool.has(key)) bySchool.set(key, { schoolName: r.class.school.name, results: [] });
    bySchool.get(key)!.results.push(r);
  }

  if (assessment.program.resultType === "OBJECTIVE_SCORE") {
    const rows = [...bySchool.values()].map(({ schoolName, results }) => {
      const avgPercentage =
        results.reduce((sum, r) => sum + Number(r.percentage ?? 0), 0) / (results.length || 1);
      return {
        schoolName,
        studentCount: results.length,
        avgPercentage: Math.round(avgPercentage * 100) / 100,
        abaixoDoBasico: results.filter((r) => r.classification === "Abaixo do Básico").length,
        proficiente: results.filter((r) => r.classification === "Proficiente").length,
        avancado: results.filter((r) => r.classification === "Avançado").length,
      };
    });
    return { assessment, resultType: "OBJECTIVE_SCORE" as const, rows };
  }

  const rows = [...bySchool.values()].map(({ schoolName, results }) => {
    const counts: Record<string, number> = {};
    for (const level of READING_LEVELS) counts[level.code] = 0;
    for (const r of results) {
      if (r.readingLevel && counts[r.readingLevel] !== undefined) counts[r.readingLevel]++;
    }
    return { schoolName, studentCount: results.length, ...counts };
  });
  return { assessment, resultType: "READING_LEVEL" as const, rows };
}

/** Avaliações com resultados lançados para a escola, e se já foram validadas — usado em /painel/validar. */
export async function listAssessmentsForValidation(ctx: AuthContext, schoolId: string) {
  assertSchoolScope(ctx, schoolId);
  const results = await prisma.assessmentResult.findMany({
    where: { schoolId },
    distinct: ["assessmentId"],
    select: { assessmentId: true },
  });
  const assessmentIds = results.map((r) => r.assessmentId);
  if (assessmentIds.length === 0) return [];

  const [assessments, validations] = await Promise.all([
    prisma.assessment.findMany({
      where: { id: { in: assessmentIds } },
      include: { program: true },
      orderBy: [{ year: "desc" }, { name: "asc" }],
    }),
    prisma.schoolValidation.findMany({ where: { schoolId, assessmentId: { in: assessmentIds } } }),
  ]);

  return assessments.map((a) => ({
    assessment: a,
    validation: validations.find((v) => v.assessmentId === a.id) ?? null,
  }));
}

/** Única escrita permitida ao papel ESCOLA: confirmar que os dados lançados estão corretos. */
export async function validateSchoolAssessment(
  ctx: AuthContext,
  input: { schoolId: string; assessmentId: string; note?: string }
) {
  assertSchoolScope(ctx, input.schoolId);
  return prisma.schoolValidation.upsert({
    where: { schoolId_assessmentId: { schoolId: input.schoolId, assessmentId: input.assessmentId } },
    create: { ...input, validatedById: ctx.userId },
    update: { note: input.note, validatedById: ctx.userId, validatedAt: new Date() },
  });
}
