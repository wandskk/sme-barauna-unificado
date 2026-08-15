import { prisma } from "@/server/db";
import { AuthContext, assertSchoolScope, assertCanWriteIndicators } from "@/core/auth/permissions";
import { scoreObjectiveResult } from "@/core/assessments/scoring";

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
