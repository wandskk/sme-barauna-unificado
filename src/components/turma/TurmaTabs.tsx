"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getReadingLevel } from "@/core/assessments/readingLevels";
import { CalendarClock, BookOpen, ClipboardList, Users } from "lucide-react";

type Student = { id: string; name: string; matricula: string | null };

type AttendanceRow = { studentId: string; date: string; disciplina: string; totalAulas: number; totalFaltas: number };

type GradesData = {
  disciplinas: string[];
  disciplinaAverage: Record<string, number>;
  byStudent: Record<string, Record<string, number>>;
};

type AssessmentRow = {
  id: string;
  studentId: string;
  studentName: string;
  correctPortuguese: number | null;
  correctMath: number | null;
  percentage: number | null;
  classification: string | null;
  readingLevel: string | null;
};

type AssessmentGroup = {
  assessmentId: string;
  programName: string;
  assessmentName: string;
  resultType: "OBJECTIVE_SCORE" | "READING_LEVEL";
  rows: AssessmentRow[];
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

function FrequenciaTab({ students, attendance }: { students: Student[]; attendance: AttendanceRow[] }) {
  const minDate = attendance[0]?.date ?? "";
  const maxDate = attendance[attendance.length - 1]?.date ?? "";
  const [start, setStart] = useState(minDate);
  const [end, setEnd] = useState(maxDate);

  const { disciplinas, disciplinaPct, byStudent, geralByStudent, turmaPct } = useMemo(() => {
    // aluno -> disciplina -> {aulas, faltas}
    const byStudentDisciplina = new Map<string, Map<string, { totalAulas: number; totalFaltas: number }>>();
    // disciplina -> {aulas, faltas} (turma toda)
    const byDisciplina = new Map<string, { totalAulas: number; totalFaltas: number }>();
    // aluno -> {aulas, faltas} (todas as disciplinas, pra coluna Geral)
    const geralByStudent = new Map<string, { totalAulas: number; totalFaltas: number }>();
    let totalAulas = 0;
    let totalFaltas = 0;

    for (const a of attendance) {
      if ((start && a.date < start) || (end && a.date > end)) continue;

      const perDisciplina = byStudentDisciplina.get(a.studentId) ?? new Map();
      const acc = perDisciplina.get(a.disciplina) ?? { totalAulas: 0, totalFaltas: 0 };
      acc.totalAulas += a.totalAulas;
      acc.totalFaltas += a.totalFaltas;
      perDisciplina.set(a.disciplina, acc);
      byStudentDisciplina.set(a.studentId, perDisciplina);

      const turmaAcc = byDisciplina.get(a.disciplina) ?? { totalAulas: 0, totalFaltas: 0 };
      turmaAcc.totalAulas += a.totalAulas;
      turmaAcc.totalFaltas += a.totalFaltas;
      byDisciplina.set(a.disciplina, turmaAcc);

      const geralAcc = geralByStudent.get(a.studentId) ?? { totalAulas: 0, totalFaltas: 0 };
      geralAcc.totalAulas += a.totalAulas;
      geralAcc.totalFaltas += a.totalFaltas;
      geralByStudent.set(a.studentId, geralAcc);

      totalAulas += a.totalAulas;
      totalFaltas += a.totalFaltas;
    }

    const pct = (v: { totalAulas: number; totalFaltas: number }) =>
      v.totalAulas > 0 ? Math.round((1 - v.totalFaltas / v.totalAulas) * 1000) / 10 : null;

    return {
      disciplinas: [...byDisciplina.keys()].sort((a, b) => a.localeCompare(b)),
      disciplinaPct: new Map([...byDisciplina.entries()].map(([d, v]) => [d, pct(v)])),
      byStudent: new Map(
        [...byStudentDisciplina.entries()].map(([sId, m]) => [sId, new Map([...m.entries()].map(([d, v]) => [d, pct(v)]))])
      ),
      geralByStudent: new Map([...geralByStudent.entries()].map(([sId, v]) => [sId, pct(v)])),
      turmaPct: totalAulas > 0 ? Math.round((1 - totalFaltas / totalAulas) * 1000) / 10 : null,
    };
  }, [attendance, start, end]);

  if (attendance.length === 0) {
    return (
      <Card className="border-dashed p-12 text-center">
        <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-3 text-sm font-semibold text-foreground">Sem dados de frequência para esta turma.</p>
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
          {turmaPct != null && (
            <Badge variant={attendanceBadgeVariant(turmaPct)} className="ml-auto text-sm">
              {turmaPct}% de presença geral da turma no período
            </Badge>
          )}
        </div>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="p-3 sticky left-0 bg-surface-subtle">Aluno</th>
              {disciplinas.map((d) => (
                <th key={d} className="p-3 whitespace-nowrap">
                  {d}
                </th>
              ))}
              <th className="p-3 whitespace-nowrap">Geral</th>
            </tr>
            <tr className="border-t border-border/50">
              <th className="p-2 sticky left-0 bg-surface-subtle text-[11px] font-normal normal-case text-muted-foreground">
                Média da turma
              </th>
              {disciplinas.map((d) => {
                const pct = disciplinaPct.get(d) ?? null;
                return (
                  <th key={d} className="p-2">
                    {pct != null ? <Badge variant={attendanceBadgeVariant(pct)}>{pct}%</Badge> : "—"}
                  </th>
                );
              })}
              <th className="p-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((s) => {
              const perDisciplina = byStudent.get(s.id);
              const geral = geralByStudent.get(s.id) ?? null;
              return (
                <tr key={s.id}>
                  <td className="p-3 text-foreground font-medium sticky left-0 bg-surface whitespace-nowrap">
                    {s.name}
                  </td>
                  {disciplinas.map((d) => {
                    const pct = perDisciplina?.get(d) ?? null;
                    return (
                      <td key={d} className="p-3">
                        {pct != null ? (
                          <Badge variant={attendanceBadgeVariant(pct)}>{pct}%</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-3">
                    {geral != null ? (
                      <Badge variant={attendanceBadgeVariant(geral)}>{geral}%</Badge>
                    ) : (
                      <span className="text-muted-foreground">— sem aula no período</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotasTab({ students, grades }: { students: Student[]; grades: GradesData }) {
  if (!grades.disciplinas.length) {
    return (
      <Card className="border-dashed p-12 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-3 text-sm font-semibold text-foreground">Nenhuma nota importada para esta turma.</p>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
          <tr>
            <th className="p-3 sticky left-0 bg-surface-subtle">Aluno</th>
            {grades.disciplinas.map((d) => (
              <th key={d} className="p-3 whitespace-nowrap">
                {d}
              </th>
            ))}
            <th className="p-3 whitespace-nowrap">Geral</th>
          </tr>
          <tr className="border-t border-border/50">
            <th className="p-2 sticky left-0 bg-surface-subtle text-[11px] font-normal normal-case text-muted-foreground">
              Média da turma
            </th>
            {grades.disciplinas.map((d) => (
              <th key={d} className="p-2">
                <Badge variant={gradeBadgeVariant(grades.disciplinaAverage[d])}>{grades.disciplinaAverage[d]}</Badge>
              </th>
            ))}
            <th className="p-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students
            .filter((s) => grades.byStudent[s.id])
            .map((s) => {
              const perDisciplina = grades.byStudent[s.id];
              const notas = Object.values(perDisciplina);
              const geral = Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 100) / 100;
              return (
                <tr key={s.id}>
                  <td className="p-3 text-foreground font-medium sticky left-0 bg-surface whitespace-nowrap">
                    {s.name}
                  </td>
                  {grades.disciplinas.map((d) => {
                    const nota = perDisciplina[d];
                    return (
                      <td key={d} className="p-3">
                        {nota != null ? (
                          <Badge variant={gradeBadgeVariant(nota)}>{nota}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-3">
                    <Badge variant={gradeBadgeVariant(geral)}>{geral}</Badge>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

function AvaliacoesTab({ assessmentGroups }: { assessmentGroups: AssessmentGroup[] }) {
  if (assessmentGroups.length === 0) {
    return (
      <Card className="border-dashed p-12 text-center">
        <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-3 text-sm font-semibold text-foreground">Nenhum resultado lançado para esta turma ainda.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {assessmentGroups.map((g) => (
        <div key={g.assessmentId} className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border bg-surface-subtle p-4">
            <p className="text-sm font-semibold text-foreground">
              {g.programName} — {g.assessmentName}
            </p>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Aluno</th>
                {g.resultType === "OBJECTIVE_SCORE" ? (
                  <>
                    <th className="p-3">Português</th>
                    <th className="p-3">Matemática</th>
                    <th className="p-3">% Geral</th>
                    <th className="p-3">Classificação</th>
                  </>
                ) : (
                  <th className="p-3">Nível de leitura</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {g.rows.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 text-foreground">{r.studentName}</td>
                  {g.resultType === "OBJECTIVE_SCORE" ? (
                    <>
                      <td className="p-3 text-muted-foreground">{r.correctPortuguese ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">{r.correctMath ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">
                        {r.percentage != null ? `${r.percentage.toFixed(1)}%` : "—"}
                      </td>
                      <td className="p-3">
                        {r.classification ? <Badge variant="outline">{r.classification}</Badge> : "—"}
                      </td>
                    </>
                  ) : (
                    <td className="p-3">
                      {r.readingLevel ? (
                        <Badge variant="outline">{getReadingLevel(r.readingLevel)?.fullLabel ?? r.readingLevel}</Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function AlunosTab({ students }: { students: Student[] }) {
  if (students.length === 0) {
    return (
      <Card className="border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">Nenhum aluno matriculado nesta turma.</p>
      </Card>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
          <tr>
            <th className="p-3">Nome</th>
            <th className="p-3">Matrícula</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((s) => (
            <tr key={s.id}>
              <td className="p-3 text-foreground">
                <Link href={`/admin/alunos/${s.id}`} className="hover:text-primary hover:underline">
                  {s.name}
                </Link>
              </td>
              <td className="p-3 text-muted-foreground">{s.matricula ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TurmaTabs({
  students,
  attendance,
  grades,
  assessmentGroups,
}: {
  students: Student[];
  attendance: AttendanceRow[];
  grades: GradesData;
  assessmentGroups: AssessmentGroup[];
}) {
  const tabs = [
    { id: "frequencia", label: "Frequência", icon: CalendarClock },
    { id: "notas", label: "Notas", icon: BookOpen },
    { id: "avaliacoes", label: "Avaliações", icon: ClipboardList },
    { id: "alunos", label: "Alunos", icon: Users, badge: students.length },
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
              {"badge" in t && (
                <span className="ml-1 rounded-full bg-surface-subtle px-1.5 py-0.5 text-xs">{t.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4">
        {active === "frequencia" && <FrequenciaTab students={students} attendance={attendance} />}
        {active === "notas" && <NotasTab students={students} grades={grades} />}
        {active === "avaliacoes" && <AvaliacoesTab assessmentGroups={assessmentGroups} />}
        {active === "alunos" && <AlunosTab students={students} />}
      </div>
    </div>
  );
}
