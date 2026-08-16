"use client";

import { useRouter } from "next/navigation";
import { Filter, Layers, School, Award } from "lucide-react";

export type ProgramOption = { id: string; name: string };
export type AssessmentOption = { id: string; name: string; year: number; programId: string };
export type SchoolOption = { id: string; name: string };

export function IndicadoresFilters({
  basePath,
  programs,
  assessments,
  schools,
  programId,
  assessmentId,
  schoolId,
}: {
  basePath: string;
  programs: ProgramOption[];
  assessments: AssessmentOption[];
  schools?: SchoolOption[];
  programId: string;
  assessmentId: string;
  schoolId: string;
}) {
  const router = useRouter();

  function go(next: { programId: string; assessmentId: string; schoolId: string }) {
    const params = new URLSearchParams();
    params.set("programId", next.programId);
    if (next.assessmentId) params.set("assessmentId", next.assessmentId);
    if (next.schoolId) params.set("schoolId", next.schoolId);
    router.push(`${basePath}?${params.toString()}`);
  }

  const assessmentsInProgram = assessments.filter((a) => a.programId === programId);

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/50">
        <Filter className="h-3.5 w-3.5 text-primary" />
        <span>Filtros do Painel de Indicadores</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Filtro de Programa */}
        <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Award className="h-3.5 w-3.5 text-primary" />
            Programa de Avaliação
          </span>
          <select
            value={programId}
            onChange={(e) => go({ programId: e.target.value, assessmentId: "", schoolId })}
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground transition focus-visible:outline-2 focus-visible:outline-primary min-h-[40px]"
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>

        {/* Filtro de Escola (quando aplicável) */}
        {schools && (
          <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
            <span className="flex items-center gap-1 text-muted-foreground">
              <School className="h-3.5 w-3.5 text-secondary" />
              Escola da Rede
            </span>
            <select
              value={schoolId}
              onChange={(e) => go({ programId, assessmentId, schoolId: e.target.value })}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground transition focus-visible:outline-2 focus-visible:outline-primary min-h-[40px]"
            >
              <option value="">Todas as escolas (Visão Consolidada)</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
        )}

        {/* Filtro de Avaliação Específica */}
        <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Layers className="h-3.5 w-3.5 text-info" />
            Edição da Avaliação
          </span>
          <select
            value={assessmentId}
            onChange={(e) => go({ programId, assessmentId: e.target.value, schoolId })}
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground transition focus-visible:outline-2 focus-visible:outline-primary min-h-[40px]"
          >
            <option value="">Todas as avaliações (Acumulado)</option>
            {assessmentsInProgram.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.year})</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
