import React from "react";
import Link from "next/link";
import { requireAuthContext } from "@/server/auth";
import { listAssessments } from "@/server/repositories/assessmentRepository";
import { listClasses } from "@/server/repositories/classRepository";
import { importResultsAction } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export default async function ImportarResultadosPage({
  searchParams,
}: {
  searchParams: {
    assessmentId?: string;
    classId?: string;
    imported?: string;
    errorCount?: string;
    errorSummary?: string;
    importError?: string;
  };
}) {
  const ctx = await requireAuthContext();

  if (ctx.role === "ESCOLA") {
    return (
      <div className="w-full space-y-4">
        <PageHeader
          title="Importação via Planilha"
          description="Fluxo de carga em lote via arquivos XLSX."
          badgeText="Escola"
        />
        <Card className="w-full">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              A importação de planilhas em lote é realizada pela Secretaria/Administrador.
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
  const assessment = assessments.find((a) => a.id === assessmentId);
  const klass = classes.find((c) => c.id === classId);
  const isObjective = assessment?.program.resultType === "OBJECTIVE_SCORE";

  const imported = searchParams.imported ? Number(searchParams.imported) : null;
  const errorCount = searchParams.errorCount ? Number(searchParams.errorCount) : 0;

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Importar Resultados via Planilha (.xlsx)"
        description="Alternativa ao lançamento manual para turmas grandes. Carregue o arquivo contendo os acertos ou níveis de leitura."
        badgeText="Importação em Lote"
        backHref="/painel/lancamento"
        backLabel="Voltar para Lançamento Manual"
      />

      {searchParams.importError && (
        <Card className="border-rose-200 bg-rose-50/30 dark:bg-rose-950/20 p-4 text-sm text-danger flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{searchParams.importError}</span>
        </Card>
      )}

      {imported !== null && (
        <Card className="border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 text-sm text-success space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{imported} resultado(s) importado(s) com sucesso.</span>
          </div>
          {errorCount > 0 && (
            <div className="text-xs text-warning pt-1 border-t border-amber-200/40">
              <p className="font-semibold">{errorCount} linha(s) apresentaram inconsistência:</p>
              <p className="mt-1 font-mono text-[11px] whitespace-pre-wrap">{searchParams.errorSummary}</p>
            </div>
          )}
        </Card>
      )}

      {assessments.length === 0 || classes.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <FileSpreadsheet className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            Cadastre ao menos uma avaliação e uma turma antes de importar.
          </p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Passo 1: Selecionar Avaliação e Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <form method="GET" className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Avaliação *</label>
                <select
                  name="assessmentId"
                  defaultValue={assessmentId ?? ""}
                  required
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
                  defaultValue={classId ?? ""}
                  required
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

              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" variant="primary">Continuar para Upload</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {assessment && klass && (
        <Card className="border-primary/50 bg-primary-soft/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              <span>Passo 2: Upload do Arquivo (.xlsx)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1 font-semibold text-foreground">
                <Info className="h-3.5 w-3.5 text-primary" />
                <span>Colunas esperadas no cabeçalho da primeira linha:</span>
              </div>
              <p className="font-mono bg-surface-subtle p-2 rounded text-foreground">
                {isObjective
                  ? "Aluno | Acertos Português | Acertos Matemática"
                  : "Aluno | Nível"}
              </p>
              <p>O nome do aluno deve corresponder exatamente a um estudante matriculado na turma {klass.name}.</p>
            </div>

            <form action={importResultsAction} encType="multipart/form-data" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <input type="hidden" name="assessmentId" value={assessment.id} />
              <input type="hidden" name="classId" value={klass.id} />

              <input
                type="file"
                name="file"
                accept=".xlsx,.xls"
                required
                className="text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-soft file:text-primary hover:file:bg-primary-soft/80"
              />

              <Button type="submit" variant="primary" className="gap-2 shrink-0">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Processar e Importar</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
