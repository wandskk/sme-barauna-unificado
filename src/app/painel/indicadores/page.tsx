import Link from "next/link";
import { requireAuthContext } from "@/server/auth";
import { getSchool } from "@/server/repositories/schoolRepository";
import {
  listPrograms,
  listAssessments,
  getProgramOverviewForSchool,
  getAssessmentSummaryForSchool,
} from "@/server/repositories/assessmentRepository";
import { ObjectiveOverview, ReadingOverview } from "@/components/indicadores/ProgramOverviewChart";
import { ObjectiveScoreChart, ReadingLevelChart } from "@/components/indicadores/AssessmentChart";
import { IndicadoresFilters } from "@/components/indicadores/IndicadoresFilters";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default async function PainelIndicadoresPage({
  searchParams,
}: {
  searchParams: { programId?: string; assessmentId?: string };
}) {
  const ctx = await requireAuthContext();

  if (ctx.role !== "ESCOLA" || !ctx.schoolId) {
    return (
      <div className="w-full space-y-4">
        <PageHeader
          title="Indicadores da Escola"
          description="Área exclusiva para acompanhamento dos indicadores da unidade escolar."
          badgeText="Escola"
        />
        <Card className="w-full p-6">
          <p className="text-sm text-muted-foreground">
            Você está logado como {ctx.role === "SECRETARIA" ? "Secretaria" : "Administrador"} —{" "}
            <Link href="/admin/indicadores" className="text-primary underline">
              acesse a visão de rede em /admin/indicadores
            </Link>
            .
          </p>
        </Card>
      </div>
    );
  }

  const school = await getSchool(ctx, ctx.schoolId);
  const [programs, assessments] = await Promise.all([
    listPrograms().catch(() => []),
    listAssessments().catch(() => []),
  ]);

  if (programs.length === 0) {
    return (
      <div className="space-y-6 w-full">
        <PageHeader
          title={`Indicadores — ${school.name}`}
          description="Desempenho da sua escola por turma e turno (SPADEB e Fluência Leitora)."
          badgeText="Gestão Escolar"
        />
        <Card className="border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum programa de avaliação cadastrado ainda.
          </p>
        </Card>
      </div>
    );
  }

  const programId = searchParams.programId ?? programs[0].id;
  const program = programs.find((p) => p.id === programId) ?? programs[0];
  const assessmentId = searchParams.assessmentId ?? "";

  const overview = await getProgramOverviewForSchool(ctx, ctx.schoolId, program.id).catch(() => null);
  const summary = assessmentId
    ? await getAssessmentSummaryForSchool(ctx, ctx.schoolId, assessmentId).catch(() => null)
    : null;

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title={`Indicadores — ${school.name}`}
        description="Desempenho da sua escola por turma e turno (SPADEB e Fluência Leitora)."
        badgeText="Gestão Escolar"
      />

      {/* Barra de Filtros */}
      <div>
        <IndicadoresFilters
          basePath="/painel/indicadores"
          programs={programs}
          assessments={assessments}
          programId={program.id}
          assessmentId={assessmentId}
          schoolId=""
        />
      </div>

      {/* Conteúdo de Relatórios */}
      <div>
        {assessmentId ? (
          !summary || summary.rows.length === 0 ? (
            <Card className="border-dashed p-12 text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-semibold text-foreground">
                Nenhum resultado lançado para esta avaliação ainda.
              </p>
            </Card>
          ) : summary.resultType === "OBJECTIVE_SCORE" ? (
            <ObjectiveScoreChart rows={summary.rows} groupNoun="turma" />
          ) : (
            <ReadingLevelChart rows={summary.rows} groupNoun="turma" />
          )
        ) : !overview || overview.totalStudents === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Nenhum resultado lançado para {program.name} ainda.
            </p>
          </Card>
        ) : overview.resultType === "OBJECTIVE_SCORE" ? (
          <ObjectiveOverview data={overview} groupNoun="turma" />
        ) : (
          <ReadingOverview data={overview} groupNoun="turma" />
        )}
      </div>
    </div>
  );
}
