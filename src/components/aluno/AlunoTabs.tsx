"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getReadingLevel } from "@/core/assessments/readingLevels";
import { CalendarClock, BookOpen, ClipboardList } from "lucide-react";

type GradeDisciplina = { disciplina: string; notas: { unidade: number; nota: number }[]; media: number };

type AttendanceRow = { date: string; disciplina: string; totalAulas: number; totalFaltas: number };

type AssessmentRow = {
  assessmentId: string;
  programName: string;
  assessmentName: string;
  resultType: "OBJECTIVE_SCORE" | "READING_LEVEL";
  correctPortuguese: number | null;
  correctMath: number | null;
  percentage: number | null;
  classification: string | null;
  readingLevel: string | null;
};

function attendanceBadgeVariant(pct: number): "success" | "warning" | "danger" {
  if (pct >= 90) return "success";
  if (pct >= 75) return "warning";
  return "danger";
}

function gradeBadgeVariant(nota: number): "success" | "warning" | "danger" {
  if (nota >= 7) return "success";
  if (nota >= 5) return "warning";
  return "danger";
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function FrequenciaTab({ attendance }: { attendance: AttendanceRow[] }) {
  const minDate = attendance[0]?.date ?? "";
  const maxDate = attendance[attendance.length - 1]?.date ?? "";
  const [start, setStart] = useState(minDate);
  const [end, setEnd] = useState(maxDate);

  const { byDisciplina, geralPct } = useMemo(() => {
    const byDisciplina = new Map<string, { totalAulas: number; totalFaltas: number }>();
    let totalAulas = 0;
    let totalFaltas = 0;
    for (const a of attendance) {
      if ((start && a.date < start) || (end && a.date > end)) continue;
      const acc = byDisciplina.get(a.disciplina) ?? { totalAulas: 0, totalFaltas: 0 };
      acc.totalAulas += a.totalAulas;
      acc.totalFaltas += a.totalFaltas;
      byDisciplina.set(a.disciplina, acc);
      totalAulas += a.totalAulas;
      totalFaltas += a.totalFaltas;
    }
    const pct = (v: { totalAulas: number; totalFaltas: number }) =>
      v.totalAulas > 0 ? Math.round((1 - v.totalFaltas / v.totalAulas) * 1000) / 10 : null;
    return {
      byDisciplina: [...byDisciplina.entries()]
        .map(([disciplina, v]) => ({ disciplina, pct: pct(v) }))
        .sort((a, b) => a.disciplina.localeCompare(b.disciplina)),
      geralPct: totalAulas > 0 ? Math.round((1 - totalFaltas / totalAulas) * 1000) / 10 : null,
    };
  }, [attendance, start, end]);

  if (attendance.length === 0) {
    return (
      <Card className="border-dashed p-12 text-center">
        <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-3 text-sm font-semibold text-foreground">Sem dados de frequência para este aluno.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-end gap-4 p-4">
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            De
            <input
              type="date"
              value={start}
              min={minDate}
              max={end || maxDate}
              onChange={(e) => setStart(e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-2 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Até
            <input
              type="date"
              value={end}
              min={start || minDate}
              max={maxDate}
              onChange={(e) => setEnd(e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-2 text-sm text-foreground"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setStart(minDate);
              setEnd(maxDate);
            }}
            className="h-9 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-surface-subtle"
          >
            Período completo ({formatDate(minDate)} – {formatDate(maxDate)})
          </button>
          {geralPct != null && (
            <Badge variant={attendanceBadgeVariant(geralPct)} className="ml-auto text-sm">
              {geralPct}% de presença geral no período
            </Badge>
          )}
        </div>
      </Card>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Disciplina</th>
              <th className="p-3">Presença</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {byDisciplina.map((d) => (
              <tr key={d.disciplina}>
                <td className="p-3 text-foreground">{d.disciplina}</td>
                <td className="p-3">
                  {d.pct != null ? (
                    <Badge variant={attendanceBadgeVariant(d.pct)}>{d.pct}%</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotasTab({ grades }: { grades: GradeDisciplina[] }) {
  if (grades.length === 0) {
    return (
      <Card className="border-dashed p-12 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-3 text-sm font-semibold text-foreground">Nenhuma nota importada para este aluno.</p>
      </Card>
    );
  }

  const unidades = [...new Set(grades.flatMap((g) => g.notas.map((n) => n.unidade)))].sort((a, b) => a - b);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
          <tr>
            <th className="p-3">Disciplina</th>
            {unidades.map((u) => (
              <th key={u} className="p-3">
                {u}ª Unid.
              </th>
            ))}
            <th className="p-3">Média</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {grades.map((g) => (
            <tr key={g.disciplina}>
              <td className="p-3 text-foreground">{g.disciplina}</td>
              {unidades.map((u) => {
                const nota = g.notas.find((n) => n.unidade === u)?.nota;
                return (
                  <td key={u} className="p-3 text-muted-foreground">
                    {nota != null ? nota : "—"}
                  </td>
                );
              })}
              <td className="p-3">
                <Badge variant={gradeBadgeVariant(g.media)}>{g.media}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AvaliacoesTab({ rows }: { rows: AssessmentRow[] }) {
  if (rows.length === 0) {
    return (
      <Card className="border-dashed p-12 text-center">
        <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-3 text-sm font-semibold text-foreground">Nenhum resultado de avaliação para este aluno.</p>
      </Card>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
          <tr>
            <th className="p-3">Avaliação</th>
            <th className="p-3">Português</th>
            <th className="p-3">Matemática</th>
            <th className="p-3">% Geral</th>
            <th className="p-3">Classificação / Nível</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.assessmentId}>
              <td className="p-3 text-foreground">
                {r.programName} — {r.assessmentName}
              </td>
              {r.resultType === "OBJECTIVE_SCORE" ? (
                <>
                  <td className="p-3 text-muted-foreground">{r.correctPortuguese ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{r.correctMath ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">
                    {r.percentage != null ? `${r.percentage.toFixed(1)}%` : "—"}
                  </td>
                  <td className="p-3">{r.classification ? <Badge variant="outline">{r.classification}</Badge> : "—"}</td>
                </>
              ) : (
                <>
                  <td className="p-3 text-muted-foreground">—</td>
                  <td className="p-3 text-muted-foreground">—</td>
                  <td className="p-3 text-muted-foreground">—</td>
                  <td className="p-3">
                    {r.readingLevel ? (
                      <Badge variant="outline">{getReadingLevel(r.readingLevel)?.fullLabel ?? r.readingLevel}</Badge>
                    ) : (
                      "—"
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AlunoTabs({
  grades,
  attendance,
  assessmentRows,
}: {
  grades: GradeDisciplina[];
  attendance: AttendanceRow[];
  assessmentRows: AssessmentRow[];
}) {
  const tabs = [
    { id: "frequencia", label: "Frequência", icon: CalendarClock },
    { id: "notas", label: "Notas", icon: BookOpen },
    { id: "avaliacoes", label: "Avaliações", icon: ClipboardList },
  ] as const;
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("frequencia");

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={clsx(
                "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                active === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="pt-4">
        {active === "frequencia" && <FrequenciaTab attendance={attendance} />}
        {active === "notas" && <NotasTab grades={grades} />}
        {active === "avaliacoes" && <AvaliacoesTab rows={assessmentRows} />}
      </div>
    </div>
  );
}
