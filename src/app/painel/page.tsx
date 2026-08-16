import React from "react";
import Link from "next/link";
import { requireAuthContext } from "@/server/auth";
import { getSchool } from "@/server/repositories/schoolRepository";
import { listClassesForSchool } from "@/server/repositories/classRepository";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Building2, CheckCircle2, ArrowRight } from "lucide-react";

export default async function PainelPage() {
  const ctx = await requireAuthContext();

  if (ctx.role !== "ESCOLA" || !ctx.schoolId) {
    return (
      <div className="w-full space-y-4">
        <PageHeader
          title="Painel da Escola"
          description="Área destinada aos gestores das escolas municipais."
          badgeText="Escola"
        />
        <Card className="w-full">
          <CardContent className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Você está logado como {ctx.role === "SECRETARIA" ? "Secretaria" : "Administrador"}.
            </p>
            <div className="flex gap-3">
              <Link href="/admin">
                <Button variant="primary">Ir para Painel Administrativo</Button>
              </Link>
              <Link href="/painel/lancamento">
                <Button variant="outline">Ir para Lançamento</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [school, classes] = await Promise.all([
    getSchool(ctx, ctx.schoolId),
    listClassesForSchool(ctx, ctx.schoolId),
  ]);

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title={school.name}
        description={`${school.type || "Escola Municipal"} · Zona ${school.zone === "urbana" ? "Urbana" : "Rural"}`}
        badgeText="Escola Ativa"
        actions={
          <Link href="/painel/validar">
            <Button variant="primary" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Validar Indicadores</span>
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Turmas da Escola</span>
            <Badge variant="outline">{classes.length} turmas</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma turma cadastrada para sua escola ainda.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((c) => (
                <div key={c.id} className="p-4 rounded-lg border border-border bg-surface-subtle space-y-1">
                  <p className="font-semibold text-foreground text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">Série: {c.grade}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
