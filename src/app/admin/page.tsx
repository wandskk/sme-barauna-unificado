import React from "react";
import Link from "next/link";
import { prisma } from "@/server/db";
import { requireAuthContext } from "@/server/auth";
import { listPrograms, getProgramOverview } from "@/server/repositories/assessmentRepository";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AttentionPointsCard } from "@/components/dashboard/AttentionPointsCard";
import { ObjectiveOverview, ReadingOverview } from "@/components/indicadores/ProgramOverviewChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CURRENT_TENANT } from "@/core/config/tenant";
import {
  Building2,
  Users,
  GraduationCap,
  Award,
  UploadCloud,
  CheckCircle2,
  Calendar,
  Database,
  ArrowRight,
  TrendingUp,
  FileCheck2,
} from "lucide-react";

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: { programId?: string; year?: string };
}) {
  const ctx = await requireAuthContext();

  const [
    schoolCount,
    classCount,
    studentCount,
    teacherCount,
    coordinatorCount,
    assessmentCount,
    validationCount,
    programs,
  ] = await Promise.all([
    prisma.school.count().catch(() => 0),
    prisma.class.count().catch(() => 0),
    prisma.student.count().catch(() => 0),
    prisma.teacher.count().catch(() => 0),
    prisma.coordinator.count().catch(() => 0),
    prisma.assessment.count().catch(() => 0),
    prisma.schoolValidation.count().catch(() => 0),
    listPrograms().catch(() => []),
  ]);

  const activeProgram =
    programs.find((p) => p.id === searchParams.programId) ?? programs[0] ?? null;

  const overviewData = activeProgram
    ? await getProgramOverview(activeProgram.id).catch(() => null)
    : null;

  // Montagem dinâmica dos pontos de atenção (baseados em dados reais do sistema)
  const attentionItems = [];
  if (validationCount < schoolCount && schoolCount > 0) {
    attentionItems.push({
      id: "pending-validations",
      type: "warning" as const,
      title: "Validações de Escolas Pendentes",
      description: `${schoolCount - validationCount} escola(s) ainda não validaram os relatórios de avaliação recentes.`,
      actionText: "Ver Validações",
      actionHref: "/painel/validar",
    });
  }
  if (studentCount === 0) {
    attentionItems.push({
      id: "no-students",
      type: "info" as const,
      title: "Cadastro de Alunos Inicial",
      description: "Cadastre os estudantes da rede para iniciar a apuração dos indicadores educacionais.",
      actionText: "Gerenciar Alunos",
      actionHref: "/admin/alunos",
    });
  }

  return (
    <div className="space-y-8">
      {/* 1. Cabeçalho da Visão Geral */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Centro de Estatísticas Educacionais
            </h1>
            <Badge variant="primary">{CURRENT_TENANT.name}/{CURRENT_TENANT.stateAbbr}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Painel executivo da {CURRENT_TENANT.secretariatName} — acompanhamento unificado da rede municipal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/painel/lancamento">
            <Button variant="primary" className="gap-2">
              <UploadCloud className="h-4 w-4" />
              <span>Lançar Resultados</span>
            </Button>
          </Link>
          <Link href="/admin/indicadores">
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Relatório Detalhado</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Filtro Persistente de Programa */}
      {programs.length > 0 && (
        <Card className="bg-surface-subtle border-border">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Programa de Avaliação em Foco:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {programs.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin?programId=${p.id}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeProgram?.id === p.id
                      ? "bg-primary text-white font-semibold shadow-sm"
                      : "bg-surface text-foreground hover:bg-border/60"
                  }`}
                >
                  {p.name} ({p.code})
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Grid de Cards de Visão Geral (KPI Cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Escolas Cadastradas"
          value={schoolCount}
          unit="unidades"
          period="Rede Municipal"
          icon={Building2}
          description="Total de escolas municipais ativas no sistema."
        />
        <KpiCard
          title="Turmas Ativas"
          value={classCount}
          unit="turmas"
          period="Ano Letivo Atual"
          icon={Users}
          description="Turmas cadastradas distribuídas na zona urbana e rural."
        />
        <KpiCard
          title="Estudantes"
          value={studentCount}
          unit="alunos"
          period="Matriculados"
          icon={GraduationCap}
          description="Alunos matriculados na rede municipal."
        />
        <KpiCard
          title="Validações de Escola"
          value={validationCount}
          unit={`de ${schoolCount}`}
          status={validationCount === schoolCount && schoolCount > 0 ? "success" : "warning"}
          badgeText={validationCount === schoolCount && schoolCount > 0 ? "Concluído" : "Em andamento"}
          badgeVariant={validationCount === schoolCount && schoolCount > 0 ? "success" : "warning"}
          icon={FileCheck2}
          description="Validações formais realizadas pelos gestores das escolas."
        />
      </div>

      {/* 4. Resumo de Desempenho da Rede */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Desempenho Consolidado da Rede</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Resultados consolidados do programa {activeProgram?.name || "de avaliação"}.
                </p>
              </div>
              {activeProgram && (
                <Badge variant="outline">{activeProgram.resultType === "OBJECTIVE_SCORE" ? "Objetiva (0-100%)" : "Níveis de Leitura"}</Badge>
              )}
            </CardHeader>
            <CardContent>
              {!overviewData || overviewData.totalStudents === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-12 text-center">
                  <Award className="mx-auto h-8 w-8 text-muted-foreground/60" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Nenhum resultado registrado para este programa ainda
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Utilize a funcionalidade de lançamento para registrar os dados das avaliações.
                  </p>
                  <Link href="/painel/lancamento" className="mt-4 inline-block">
                    <Button size="sm" variant="primary">Lançar Primeiros Dados</Button>
                  </Link>
                </div>
              ) : overviewData.resultType === "OBJECTIVE_SCORE" ? (
                <ObjectiveOverview data={overviewData} groupNoun="escola" />
              ) : (
                <ReadingOverview data={overviewData} groupNoun="escola" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* 5. Coluna Lateral: Pontos de Atenção & Origem dos Dados */}
        <div className="space-y-6">
          <AttentionPointsCard items={attentionItems} />

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <span>Origem & Integridade dos Dados</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span>Fonte dos Dados:</span>
                <span className="font-semibold text-foreground">SME Baraúna / Escola</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span>Última Atualização:</span>
                <span className="font-semibold text-foreground">Em tempo real (PostgreSQL)</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span>Programas Ativos:</span>
                <span className="font-semibold text-foreground">{programs.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Conformidade Acessibilidade:</span>
                <span className="font-semibold text-success">WCAG 2.2 AA</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
