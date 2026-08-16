import React from "react";
import Link from "next/link";
import { requireAuthContext } from "@/server/auth";
import { listAssessments, listResultsForClass } from "@/server/repositories/assessmentRepository";
import { listClasses } from "@/server/repositories/classRepository";
import { listStudents } from "@/server/repositories/studentRepository";
import { READING_LEVELS } from "@/core/assessments/readingLevels";
import { saveLancamentoAction } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { UploadCloud, FileSpreadsheet, Save, CheckCircle2, ArrowLeft } from "lucide-react";

export default async function LancamentoPage({
  searchParams,
}: {
  searchParams: { assessmentId?: string; classId?: string };
}) {
  const ctx = await requireAuthContext();

  if (ctx.role === "ESCOLA") {
    return (
      <div className="w-full space-y-4">
        <PageHeader
          title="Lançamento de Resultados"
          description="Visualização dos relatórios e lançamentos efetuados."
          badgeText="Escola"
        />
        <Card className="w-full">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              O lançamento de indicadores é realizado pela Secretaria/Administrador. Sua escola pode{" "}
              <Link href="/painel/validar" className="text-primary underline font-semibold">
                validar os dados já lançados
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [assessments, classes] = await Promise.all([
    listAssessments().catch(() => []),
    listClasses().catch(() => []),
  ]);

  const { assessmentId, classId } = searchParams;

  if (!assessmentId || !classId) {
    return (
      <div className="space-y-6 w-full">
        <PageHeader
          title="Lançamento de Indicadores"
          description="Selecione a avaliação e a turma para digitar os resultados dos estudantes."
          badgeText="Secretaria"
          actions={
            <Link href="/painel/lancamento/importar">
              <Button variant="outline" className="gap-2">
                <FileSpreadsheet className="h-4 w-4 text-success" />
                <span>Importar via Planilha (.xlsx)</span>
              </Button>
            </Link>
          }
        />

        {assessments.length === 0 || classes.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Cadastre ao menos uma avaliação e uma turma antes de lançar resultados.
            </p>
            <div className="mt-3">
              <Link href="/admin/avaliacoes">
                <Button size="sm" variant="primary">Ir para Cadastro de Avaliações</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seleção de Turma e Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <form method="GET" className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Avaliação *</label>
                  <select
                    name="assessmentId"
                    required
                    defaultValue={assessmentId ?? ""}
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <option value="">Selecione a avaliação...</option>
                    {assessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.program.name} · {a.name} ({a.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Turma *</label>
                  <select
                    name="classId"
                    required
                    defaultValue={classId ?? ""}
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <option value="">Selecione a turma...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.school.name} · {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 flex justify-end pt-2">
                  <Button type="submit" variant="primary" className="gap-2">
                    <span>Continuar Lançamento</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const assessment = assessments.find((a) => a.id === assessmentId);
  const klass = classes.find((c) => c.id === classId);
  if (!assessment || !klass) {
    return (
      <div className="space-y-4 w-full">
        <PageHeader title="Lançamento de Indicadores" />
        <Card className="p-6 text-danger border-rose-200 bg-rose-50/20">
          <p className="text-sm">Avaliação ou turma não encontrada.</p>
          <Link href="/painel/lancamento" className="mt-2 inline-block text-xs underline">Voltar</Link>
        </Card>
      </div>
    );
  }

  const [studentsInSchool, existingResults] = await Promise.all([
    listStudents(klass.schoolId),
    listResultsForClass(assessmentId, classId),
  ]);
  const students = studentsInSchool.filter((s) => s.classId === classId);

  const resultByStudent = new Map(existingResults.map((r) => [r.studentId, r]));
  const isObjective = assessment.program.resultType === "OBJECTIVE_SCORE";

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title={`${assessment.program.name} · ${assessment.name}`}
        description={`${klass.school.name} · Turma: ${klass.name}`}
        badgeText={isObjective ? "Múltipla Escolha" : "Fluência Leitora"}
        backHref="/painel/lancamento"
        backLabel="Trocar avaliação ou turma"
        actions={
          <Link href={`/painel/lancamento/importar?assessmentId=${assessmentId}&classId=${classId}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <FileSpreadsheet className="h-4 w-4 text-success" />
              <span>Importar Planilha</span>
            </Button>
          </Link>
        }
      />

      {students.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <p className="text-sm font-semibold text-foreground">Nenhum aluno matriculado nesta turma.</p>
        </Card>
      ) : (
        <form action={saveLancamentoAction} className="space-y-4">
          <input type="hidden" name="assessmentId" value={assessmentId} />
          <input type="hidden" name="classId" value={classId} />

          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Estudante</th>
                  <th className="p-4">Participou</th>
                  {isObjective ? (
                    <>
                      <th className="p-4">Acertos Português</th>
                      <th className="p-4">Acertos Matemática</th>
                    </>
                  ) : (
                    <th className="p-4">Nível de Leitura</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => {
                  const existing = resultByStudent.get(s.id);
                  return (
                    <tr key={s.id} className="hover:bg-surface-subtle/40 transition-colors">
                      <td className="p-4 font-semibold text-foreground">{s.name}</td>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          name={`participated_${s.id}`}
                          defaultChecked={existing ? existing.participated : true}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                      </td>
                      {isObjective ? (
                        <>
                          <td className="p-4">
                            <input
                              type="number"
                              min={0}
                              name={`correctPortuguese_${s.id}`}
                              defaultValue={existing?.correctPortuguese ?? ""}
                              className="h-9 w-24 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              min={0}
                              name={`correctMath_${s.id}`}
                              defaultValue={existing?.correctMath ?? ""}
                              className="h-9 w-24 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                            />
                          </td>
                        </>
                      ) : (
                        <td className="p-4">
                          <select
                            name={`readingLevel_${s.id}`}
                            defaultValue={existing?.readingLevel ?? ""}
                            className="h-9 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                          >
                            <option value="">Selecione o nível...</option>
                            {READING_LEVELS.map((l) => (
                              <option key={l.code} value={l.code}>{l.fullLabel}</option>
                            ))}
                          </select>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" className="gap-2">
              <Save className="h-4 w-4" />
              <span>Salvar Lançamento</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
