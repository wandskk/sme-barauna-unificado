import React from "react";
import { requireAuthContext } from "@/server/auth";
import { listAssessmentsForValidation } from "@/server/repositories/assessmentRepository";
import { validateAssessmentAction } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckCircle2, Clock, MessageSquare, AlertCircle, FileCheck } from "lucide-react";

export default async function ValidarPage() {
  const ctx = await requireAuthContext();

  if (ctx.role !== "ESCOLA" || !ctx.schoolId) {
    return (
      <div className="w-full space-y-4">
        <PageHeader
          title="Validação de Indicadores da Escola"
          description="Área destinada aos gestores das escolas para conferência e validação dos dados de avaliações."
          badgeText="Gestão Escolar"
        />
        <Card className="w-full">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Esta tela é destinada aos gestores das escolas para conferência e validação dos dados de avaliações lançados pela Secretaria Municipal.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const schoolId = ctx.schoolId;
  const items = await listAssessmentsForValidation(ctx, schoolId).catch(() => []);

  return (
    <div className="space-y-6 w-full">
      {/* Cabeçalho Padronizado */}
      <PageHeader
        title="Validação de Indicadores da Escola"
        description="Confirme a acurácia dos dados de avaliações registrados pela Secretaria para a sua unidade."
        badgeText="Gestão Escolar"
      />

      {/* Lista de Avaliações para Validação */}
      <ul className="space-y-4">
        {items.map(({ assessment, validation }) => {
          let statusBadge = <Badge variant="warning"><Clock className="mr-1 h-3 w-3 inline" />Pendente</Badge>;
          if (validation) {
            const hasNote = Boolean(validation.note && validation.note.trim());
            const hasIssue = hasNote && (validation.note!.toLowerCase().includes("erro") || validation.note!.toLowerCase().includes("inconsist"));

            if (hasIssue) {
              statusBadge = <Badge variant="danger"><AlertCircle className="mr-1 h-3 w-3 inline" />Com Inconsistência</Badge>;
            } else if (hasNote) {
              statusBadge = <Badge variant="info"><MessageSquare className="mr-1 h-3 w-3 inline" />Validado com Observação</Badge>;
            } else {
              statusBadge = <Badge variant="success"><CheckCircle2 className="mr-1 h-3 w-3 inline" />Validado</Badge>;
            }
          }

          return (
            <Card key={assessment.id} className="overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {assessment.program.name} · {assessment.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Ano Letivo: {assessment.year}</p>
                </div>
                <div>{statusBadge}</div>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                {validation && (
                  <p className="text-xs text-muted-foreground">
                    Última validação em:{" "}
                    <span className="font-semibold text-foreground">
                      {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(
                        new Date(validation.validatedAt)
                      )}
                    </span>
                  </p>
                )}

                <form action={validateAssessmentAction} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-2 border-t border-border/50">
                  <input type="hidden" name="schoolId" value={schoolId} />
                  <input type="hidden" name="assessmentId" value={assessment.id} />

                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Observação / Ressalva da Escola (Opcional)
                    </label>
                    <input
                      name="note"
                      placeholder="Ex: Todos os 25 alunos da turma A realizaram a prova normalmente."
                      defaultValue={validation?.note ?? ""}
                      className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                    />
                  </div>

                  <Button type="submit" variant={validation ? "outline" : "primary"}>
                    {validation ? "Atualizar Validação" : "Confirmar Validação"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}

        {items.length === 0 && (
          <Card className="border-dashed p-12 text-center">
            <FileCheck className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-semibold text-foreground">Nenhum indicador pendente de validação</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Os relatórios das avaliações aparecerão nesta tela assim que forem lançados pela Secretaria.
            </p>
          </Card>
        )}
      </ul>
    </div>
  );
}
