import Link from "next/link";
import {
  listAssessments,
  getAssessmentSummaryBySchool,
} from "@/server/repositories/assessmentRepository";
import { ObjectiveScoreChart, ReadingLevelChart } from "./AssessmentChart";

// Dashboard PÚBLICO de indicadores — qualquer visitante enxerga a visão
// consolidada (sem exigir login), atendendo ao pedido de transparência
// pública dos dados. Lançamento/edição fica em /painel (área logada).
export default async function IndicadoresPage({
  searchParams,
}: {
  searchParams: { assessmentId?: string };
}) {
  const assessments = await listAssessments().catch(() => []);
  const assessmentId = searchParams.assessmentId ?? assessments[0]?.id;
  const summary = assessmentId ? await getAssessmentSummaryBySchool(assessmentId).catch(() => null) : null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Indicadores Educacionais</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Visão consolidada das avaliações da rede municipal (SPADEB e Fluência Leitora).
      </p>

      {assessments.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
          Nenhum programa de avaliação cadastrado ainda. Rode o seed
          (<code>npm run db:seed</code>) ou cadastre pelo painel.
        </p>
      ) : (
        <>
          <form method="GET" className="mt-8 flex max-w-lg items-end gap-2">
            <select
              name="assessmentId"
              defaultValue={assessmentId}
              className="flex-1 rounded-md border px-3 py-2 text-sm"
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.program.name} · {a.name} · {a.year}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
              Ver
            </button>
          </form>

          <div className="mt-8">
            {!summary || summary.rows.length === 0 ? (
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
                Nenhum resultado lançado para esta avaliação ainda.{" "}
                <Link href="/painel/lancamento" className="text-primary underline">
                  Lançar resultados
                </Link>
                .
              </p>
            ) : summary.resultType === "OBJECTIVE_SCORE" ? (
              <ObjectiveScoreChart rows={summary.rows} />
            ) : (
              <ReadingLevelChart rows={summary.rows} />
            )}
          </div>
        </>
      )}
    </main>
  );
}
