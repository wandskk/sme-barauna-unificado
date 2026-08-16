import { prisma } from "@/server/db";
import { AuthContext, assertSchoolScope, assertCanWriteIndicators } from "@/core/auth/permissions";
import { scoreObjectiveResult, SPADEB_GOAL_PERCENTAGE } from "@/core/assessments/scoring";
import { READING_LEVELS } from "@/core/assessments/readingLevels";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const GRADE_ORDER = ["2º Ano", "3º Ano", "4º Ano", "5º Ano", "6º Ano", "7º Ano", "8º Ano", "9º Ano"];

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

export async function updateAssessment(
  ctx: AuthContext,
  id: string,
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
  return prisma.assessment.update({ where: { id }, data: input });
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

/** Agregação por escola para o dashboard de indicadores (/indicadores) — um gráfico por avaliação. */
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
        basico: results.filter((r) => r.classification === "Básico").length,
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

/**
 * Visão geral do programa inteiro (todas as avaliações), para o dashboard
 * de indicadores (/indicadores) quando "Todas as avaliações" é selecionado —
 * réplica das fórmulas do painel SPADEB legado (smebaraunarn.com/avaliacoes):
 * média geral = média dos percentuais individuais ÷ 10; média global =
 * total de acertos ÷ total de questões aplicadas; níveis pelos mesmos
 * limiares de src/core/assessments/scoring.ts.
 */
export async function getProgramOverview(programId: string) {
  const program = await prisma.assessmentProgram.findUniqueOrThrow({ where: { id: programId } });
  const assessments = await prisma.assessment.findMany({
    where: { programId },
    include: { answerKeys: true },
  });
  const assessmentIds = assessments.map((a) => a.id);

  const allResults = await prisma.assessmentResult.findMany({
    where: { assessmentId: { in: assessmentIds } },
    include: { class: { include: { school: true } } },
  });
  const results = allResults.filter((r) => r.participated);

  const totalStudents = allResults.length;
  const participatedCount = results.length;
  const schoolIds = new Set(results.map((r) => r.class.schoolId));
  const classIds = new Set(results.map((r) => r.classId));

  if (program.resultType === "OBJECTIVE_SCORE") {
    // Nº de questões por disciplina, extraído do gabarito de cada avaliação
    // (fallback: metade/metade sobre o total, se não houver gabarito).
    const subjectQuestionsByAssessment = new Map<string, { lp: number; mat: number }>();
    for (const a of assessments) {
      let lp = 0;
      let mat = 0;
      for (const key of a.answerKeys) {
        const questions = (key.questions as unknown as { subject?: string }[]) ?? [];
        for (const q of questions) {
          if (q.subject === "LP") lp++;
          else if (q.subject === "MAT") mat++;
        }
      }
      if (lp === 0 && mat === 0 && a.totalQuestions) {
        lp = Math.round(a.totalQuestions / 2);
        mat = a.totalQuestions - lp;
      }
      subjectQuestionsByAssessment.set(a.id, { lp: lp || 1, mat: mat || 1 });
    }

    let sumPercentage = 0;
    let sumCorrectTotal = 0;
    let sumQuestionsTotal = 0;
    let sumCorrectLp = 0;
    let sumQuestionsLp = 0;
    let sumCorrectMat = 0;
    let sumQuestionsMat = 0;
    const classification = { abaixoDoBasico: 0, basico: 0, proficiente: 0, avancado: 0 };
    const bySchool = new Map<string, { name: string; sumPct: number; count: number }>();
    const byGrade = new Map<string, { sumPct: number; count: number }>();

    for (const r of results) {
      sumPercentage += Number(r.percentage ?? 0);
      sumCorrectTotal += r.totalCorrect ?? 0;
      sumQuestionsTotal += r.totalQuestions ?? 0;

      const sq = subjectQuestionsByAssessment.get(r.assessmentId) ?? { lp: 1, mat: 1 };
      sumCorrectLp += r.correctPortuguese ?? 0;
      sumQuestionsLp += sq.lp;
      sumCorrectMat += r.correctMath ?? 0;
      sumQuestionsMat += sq.mat;

      if (r.classification === "Abaixo do Básico") classification.abaixoDoBasico++;
      else if (r.classification === "Básico") classification.basico++;
      else if (r.classification === "Proficiente") classification.proficiente++;
      else if (r.classification === "Avançado") classification.avancado++;

      const schoolId = r.class.schoolId;
      const school = bySchool.get(schoolId) ?? { name: r.class.school.name, sumPct: 0, count: 0 };
      school.sumPct += Number(r.percentage ?? 0);
      school.count++;
      bySchool.set(schoolId, school);

      const grade = r.class.grade;
      const g = byGrade.get(grade) ?? { sumPct: 0, count: 0 };
      g.sumPct += Number(r.percentage ?? 0);
      g.count++;
      byGrade.set(grade, g);
    }

    const schoolRanking = [...bySchool.values()]
      .map((s) => ({ schoolName: s.name, avgScore: round2(s.count ? s.sumPct / s.count / 10 : 0) }))
      .sort((a, b) => b.avgScore - a.avgScore);

    const gradePerformance = [...byGrade.entries()]
      .map(([grade, g]) => ({ grade, avgScore: round2(g.count ? g.sumPct / g.count / 10 : 0) }))
      .sort((a, b) => GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade));

    return {
      resultType: "OBJECTIVE_SCORE" as const,
      totalStudents,
      totalSchools: schoolIds.size,
      totalClasses: classIds.size,
      avgScoreOutOf10: round2(participatedCount ? sumPercentage / participatedCount / 10 : 0),
      avgGlobalPercent: round2(sumQuestionsTotal ? (sumCorrectTotal / sumQuestionsTotal) * 100 : 0),
      goalPercent: SPADEB_GOAL_PERCENTAGE,
      subjectAverages: {
        portugues: round2(sumQuestionsLp ? (sumCorrectLp / sumQuestionsLp) * 100 : 0),
        matematica: round2(sumQuestionsMat ? (sumCorrectMat / sumQuestionsMat) * 100 : 0),
      },
      classification,
      schoolRanking,
      gradePerformance,
    };
  }

  const levelCounts: Record<string, number> = {};
  for (const level of READING_LEVELS) levelCounts[level.code] = 0;
  for (const r of results) {
    if (r.readingLevel && levelCounts[r.readingLevel] !== undefined) levelCounts[r.readingLevel]++;
  }

  return {
    resultType: "READING_LEVEL" as const,
    totalStudents,
    totalSchools: schoolIds.size,
    totalClasses: classIds.size,
    participatedCount,
    participationRate: round2(totalStudents ? (participatedCount / totalStudents) * 100 : 0),
    levelCounts,
  };
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
