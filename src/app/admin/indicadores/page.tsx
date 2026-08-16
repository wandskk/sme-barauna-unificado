import Link from "next/link";
import { requireAuthContext } from "@/server/auth";
import {
  listPrograms,
  listAssessments,
  getProgramOverview,
  getProgramOverviewForSchool,
  getAssessmentSummaryBySchool,
  getAssessmentSummaryForSchool,
} from "@/server/repositories/assessmentRepository";
import { listSchools } from "@/server/repositories/schoolRepository";
import { ObjectiveOverview, ReadingOverview } from "@/components/indicadores/ProgramOverviewChart";
import { ObjectiveScoreChart, ReadingLevelChart } from "@/components/indicadores/AssessmentChart";
import { IndicadoresFilters } from "@/components/indicadores/IndicadoresFilters";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default async function AdminIndicadoresPage({
  searchParams,
}: {
  searchParams: { programId?: string; assessmentId?: string; schoolId?: string };
}) {
  const ctx = await requireAuthContext();
  const [programs, assessments, schools] = await Promise.all([
    listPrograms().catch(() => []),
    listAssessments().catch(() => []),
    listSchools().catch(() => []),
  ]);

  if (programs.length === 0) {
    return (
      <div className="space-y-6 w-full">
        <PageHeader
          title="Indicadores Educacionais"
          description="Visão consolidada das avaliações da rede municipal (SPADEB e Fluência Leitora)."
          badgeText="Rede Municipal"
        />
        <Card className="border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum programa de avaliação cadastrado ainda. Rode o seed (<code>npm run db:seed</code>) ou cadastre pelo painel.
          </p>
        </Card>
      </div>
    );
  }

  const programId = searchParams.programId ?? programs[0].id;
  const program = programs.find((p) => p.id === programId) ?? programs[0];
  const schoolId = searchParams.schoolId ?? "";
  const school = schoolId ? schools.find((s) => s.id === schoolId) : null;
  const assessmentId = searchParams.assessmentId ?? "";
  const groupNoun = school ? "turma" : "escola";

  const overview = schoolId
    ? await getProgramOverviewForSchool(ctx, schoolId, program.id).catch(() => null)
    : await getProgramOverview(program.id).catch(() => null);

  const summary = assessmentId
    ? schoolId
      ? await getAssessmentSummaryForSchool(ctx, schoolId, assessmentId).catch(() => null)
      : await getAssessmentSummaryBySchool(assessmentId).catch(() => null)
    : null;

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Indicadores Educacionais"
        description={
          school
            ? `Desempenho de ${school.name}, por turma e turno.`
            : "Visão consolidada das avaliações da rede municipal (SPADEB e Fluência Leitora)."
        }
        badgeText={school ? school.name : "Rede Municipal"}
        backHref={school ? `/admin/indicadores?programId=${program.id}` : undefined}
        backLabel="Voltar para a visão consolidada da rede"
      />

      {/* Barra de Filtros */}
      <div>
        <IndicadoresFilters
          basePath="/admin/indicadores"
          programs={programs}
          assessments={assessments}
          schools={schools}
          programId={program.id}
          assessmentId={assessmentId}
          schoolId={schoolId}
        />
      </div>

      {/* Conteúdo dos Gráficos e Relatórios */}
      <div>
        {assessmentId ? (
          !summary || summary.rows.length === 0 ? (
            <Card className="border-dashed p-12 text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-semibold text-foreground">Nenhum resultado lançado para esta avaliação ainda.</p>
            </Card>
          ) : summary.resultType === "OBJECTIVE_SCORE" ? (
            <ObjectiveScoreChart rows={summary.rows} groupNoun={groupNoun} />
          ) : (
            <ReadingLevelChart rows={summary.rows} groupNoun={groupNoun} />
          )
        ) : !overview || overview.totalStudents === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Nenhum resultado lançado para {program.name} ainda.
            </p>
            <Link href="/painel/lancamento" className="mt-3 inline-block text-xs font-semibold text-primary underline">
              Lançar resultados →
            </Link>
          </Card>
        ) : overview.resultType === "OBJECTIVE_SCORE" ? (
          <ObjectiveOverview data={overview} groupNoun={groupNoun} />
        ) : (
          <ReadingOverview data={overview} groupNoun={groupNoun} />
        )}
      </div>
    </div>
  );
}
