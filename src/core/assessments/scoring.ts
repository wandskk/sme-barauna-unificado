// Regras de cálculo do programa SPADEB — portadas de src/lib/assessment.ts
// do projeto legado. Puramente funcional: não sabe de banco, não sabe de
// Next.js. Testável isoladamente (ver src/core/assessments/scoring.test.ts
// quando os testes forem adicionados — ver docs/ROADMAP.md).

export const SPADEB_GOAL_PERCENTAGE = 60;

export type Classification = "Abaixo do Básico" | "Proficiente" | "Avançado";

export function classify(percentage: number): Classification {
  if (percentage <= 40) return "Abaixo do Básico";
  if (percentage <= 60) return "Proficiente";
  return "Avançado";
}

export function calculatePercentage(totalCorrect: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((totalCorrect / totalQuestions) * 10000) / 100;
}

export function scoreObjectiveResult(input: {
  correctPortuguese: number;
  correctMath: number;
  totalQuestions: number;
}) {
  const totalCorrect = input.correctPortuguese + input.correctMath;
  const percentage = calculatePercentage(totalCorrect, input.totalQuestions);
  return {
    totalCorrect,
    percentage,
    classification: classify(percentage),
  };
}
