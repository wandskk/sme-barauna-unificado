import React from "react";
import Link from "next/link";
import { listClasses } from "@/server/repositories/classRepository";
import { listSchools } from "@/server/repositories/schoolRepository";
import { listTeachers } from "@/server/repositories/teacherRepository";
import { listCoordinators } from "@/server/repositories/coordinatorRepository";
import { listSchoolYears } from "@/server/repositories/schoolYearRepository";
import { SHIFT_LABEL } from "@/core/school/shift";
import { createClassAction, deleteClassAction } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Users, Plus, Edit, Trash2, Search } from "lucide-react";

export default async function AdminTurmasPage({
  searchParams,
}: {
  searchParams: { new?: string; query?: string };
}) {
  const [allClasses, schools, teachers, coordinators, schoolYears] = await Promise.all([
    listClasses().catch(() => []),
    listSchools().catch(() => []),
    listTeachers().catch(() => []),
    listCoordinators().catch(() => []),
    listSchoolYears().catch(() => []),
  ]);

  const query = searchParams.query?.toLowerCase() || "";
  const classes = query
    ? allClasses.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.grade.toLowerCase().includes(query) ||
          c.school.name.toLowerCase().includes(query) ||
          (c.teacher && c.teacher.name.toLowerCase().includes(query))
      )
    : allClasses;

  const showNewForm = searchParams.new === "true";

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Gestão de Turmas"
        description="Organização das turmas por escola, turno, professores e coordenadores."
        badgeText={`${allClasses.length} registradas`}
        badgeVariant="outline"
        actions={
          <Link href={showNewForm ? "/admin/turmas" : "/admin/turmas?new=true"}>
            <Button variant={showNewForm ? "outline" : "primary"} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>{showNewForm ? "Cancelar" : "Nova Turma"}</span>
            </Button>
          </Link>
        }
      />

      {showNewForm && (
        <Card className="border-primary/50 bg-primary-soft/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Cadastrar Nova Turma</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {schools.length === 0 ? (
              <p className="text-xs text-danger">Cadastre ao menos uma escola antes de criar turmas.</p>
            ) : (
              <form action={createClassAction} className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-foreground">Nome da Turma *</label>
                  <input
                    name="name"
                    placeholder="Ex: 5º Ano A"
                    required
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Série / Ano Escolar *</label>
                  <input
                    name="grade"
                    placeholder="Ex: 5º Ano"
                    required
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Turno *</label>
                  <select
                    name="shift"
                    defaultValue="manha"
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="integral">Integral</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-foreground">Escola *</label>
                  <select
                    name="schoolId"
                    required
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <option value="">Selecione a escola...</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Professor Responsável</label>
                  <select
                    name="teacherId"
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <option value="">Nenhum (Opcional)</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Coordenador Pedagógico</label>
                  <select
                    name="coordinatorId"
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <option value="">Nenhum (Opcional)</option>
                    {coordinators.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-foreground">Ano Letivo</label>
                  <select
                    name="schoolYearId"
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <option value="">Selecione o ano letivo...</option>
                    {schoolYears.map((y) => (
                      <option key={y.id} value={y.id}>{y.year}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                  <Link href="/admin/turmas">
                    <Button type="button" variant="outline">Cancelar</Button>
                  </Link>
                  <Button type="submit" variant="primary">Salvar Turma</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Busca */}
      <div className="flex items-center gap-2">
        <form className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            name="query"
            defaultValue={query}
            placeholder="Buscar turma por nome, série, escola ou professor..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          />
        </form>
      </div>

      {classes.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            {query ? "Nenhuma turma encontrada para a busca." : "Nenhuma turma cadastrada ainda."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Turma / Série</th>
                  <th className="p-4">Escola</th>
                  <th className="p-4">Turno</th>
                  <th className="p-4">Professor / Coordenador</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {classes.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="p-4 font-semibold text-foreground">
                      <Link
                        href={`/admin/turmas/${c.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {c.name} · <span className="text-muted-foreground font-normal">{c.grade}</span>
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">{c.school.name}</td>
                    <td className="p-4">
                      <Badge variant="info">{SHIFT_LABEL[c.shift] ?? c.shift}</Badge>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {c.teacher ? `Prof. ${c.teacher.name}` : "Sem prof."}
                      {c.coordinator ? ` · Coord. ${c.coordinator.name}` : ""}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/turmas/${c.id}/editar`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </Link>
                        <form action={deleteClassAction.bind(null, c.id)}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-danger" title="Excluir">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {classes.map((c) => (
              <Card key={c.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/admin/turmas/${c.id}`}
                      className="font-semibold text-foreground hover:text-primary hover:underline"
                    >
                      {c.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{c.school.name}</p>
                  </div>
                  <Badge variant="info">{SHIFT_LABEL[c.shift] ?? c.shift}</Badge>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                  <Link href={`/admin/turmas/${c.id}/editar`}>
                    <Button variant="outline" size="sm">Editar</Button>
                  </Link>
                  <form action={deleteClassAction.bind(null, c.id)}>
                    <Button variant="danger" size="sm">Excluir</Button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
