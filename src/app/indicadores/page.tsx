import Link from "next/link";
import {
  listPrograms,
  listAssessments,
  getProgramOverview,
  getAssessmentSummaryBySchool,
} from "@/server/repositories/assessmentRepository";
import { ObjectiveOverview, ReadingOverview } from "./ProgramOverviewChart";
import { ObjectiveScoreChart, ReadingLevelChart } from "./AssessmentChart";

// Dashboard de indicadores — área logada (ver src/middleware.ts, sistema
// totalmente privado, sem rota pública). Por padrão mostra a visão geral do
// programa (todas as avaliações somadas, réplica das fórmulas do painel
// SPADEB legado); "Ver avaliação específica" abaixo detalha por escola uma
// avaliação isolada. Lançamento/edição fica em /painel.
export default async function IndicadoresPage({
  searchParams,
}: {
  searchParams: { programId?: string; assessmentId?: string };
}) {
  const [programs, assessments] = await Promise.all([
    listPrograms().catch(() => []),
    listAssessments().catch(() => []),
  ]);

  if (programs.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-2xl font-bold text-slate-900">Indicadores Educacionais</h1>
        <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
          Nenhum programa de avaliação cadastrado ainda. Rode o seed
          (<code>npm run db:seed</code>) ou cadastre pelo painel.
        </p>
      </main>
    );
  }

  const programId = searchParams.programId ?? programs[0].id;
  const program = programs.find((p) => p.id === programId) ?? programs[0];
  const overview = await getProgramOverview(program.id).catch(() => null);

  const assessmentsInProgram = assessments.filter((a) => a.programId === program.id);
  const assessmentId = searchParams.assessmentId;
  const assessmentSummary = assessmentId
    ? await getAssessmentSummaryBySchool(assessmentId).catch(() => null)
    : null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Indicadores Educacionais</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Visão consolidada das avaliações da rede municipal (SPADEB e Fluência Leitora).
      </p>

      <form method="GET" className="mt-8 flex max-w-md items-end gap-2">
        <select name="programId" defaultValue={program.id} className="flex-1 rounded-md border px-3 py-2 text-sm">
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
          Ver
        </button>
      </form>

      <div className="mt-8">
        {!overview || overview.totalStudents === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
            Nenhum resultado lançado para {program.name} ainda.{" "}
            <Link href="/painel/lancamento" className="text-primary underline">
              Lançar resultados
            </Link>
            .
          </p>
        ) : overview.resultType === "OBJECTIVE_SCORE" ? (
          <ObjectiveOverview data={overview} />
        ) : (
          <ReadingOverview data={overview} />
        )}
      </div>

      {assessmentsInProgram.length > 0 && (
        <details className="mt-12 rounded-lg border bg-white p-5" open={!!assessmentId}>
          <summary className="cursor-pointer text-sm font-medium text-slate-700">
            Ver uma avaliação específica (em vez de todas somadas)
          </summary>

          <form method="GET" className="mt-4 flex max-w-lg items-end gap-2">
            <input type="hidden" name="programId" value={program.id} />
            <select name="assessmentId" defaultValue={assessmentId ?? ""} className="flex-1 rounded-md border px-3 py-2 text-sm">
              <option value="">Selecione a avaliação</option>
              {assessmentsInProgram.map((a) => (
                <option key={a.id} value={a.id}>{a.name} · {a.year}</option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
              Ver
            </button>
          </form>

          {assessmentSummary && (
            <div className="mt-6">
              {assessmentSummary.rows.length === 0 ? (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
                  Nenhum resultado lançado para esta avaliação ainda.
                </p>
              ) : assessmentSummary.resultType === "OBJECTIVE_SCORE" ? (
                <ObjectiveScoreChart rows={assessmentSummary.rows} />
              ) : (
                <ReadingLevelChart rows={assessmentSummary.rows} />
              )}
            </div>
          )}
        </details>
      )}
    </main>
  );
}
