import React from "react";
import Link from "next/link";
import { listSchools } from "@/server/repositories/schoolRepository";
import { createSchoolAction, deleteSchoolAction } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Building2, Plus, MapPin, Trash2, Edit, Search } from "lucide-react";

export default async function AdminEscolasPage({
  searchParams,
}: {
  searchParams: { query?: string; new?: string };
}) {
  const allSchools = await listSchools().catch(() => []);
  const query = searchParams.query?.toLowerCase() || "";

  const schools = query
    ? allSchools.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.address && s.address.toLowerCase().includes(query)) ||
          (s.type && s.type.toLowerCase().includes(query))
      )
    : allSchools;

  const showNewForm = searchParams.new === "true";

  return (
    <div className="space-y-6 w-full">
      {/* Cabeçalho Padronizado */}
      <PageHeader
        title="Gestão de Escolas"
        description="Cadastro e acompanhamento das unidades escolares da rede municipal de ensino."
        badgeText={`${allSchools.length} registradas`}
        badgeVariant="outline"
        actions={
          <Link href={showNewForm ? "/admin/escolas" : "/admin/escolas?new=true"}>
            <Button variant={showNewForm ? "outline" : "primary"} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>{showNewForm ? "Cancelar" : "Nova Escola"}</span>
            </Button>
          </Link>
        }
      />

      {/* Formulário Novo (Dedicado/Expansível) */}
      {showNewForm && (
        <Card className="border-primary/50 bg-primary-soft/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Cadastrar Nova Unidade Escolar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createSchoolAction} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-foreground">Nome da Escola *</label>
                <input
                  name="name"
                  placeholder="Ex: Escola Municipal Francisca Martins"
                  required
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Tipo de Ensino</label>
                <input
                  name="type"
                  placeholder="Ex: Ensino Fundamental, Creche, EJA"
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Zona de Localização *</label>
                <select
                  name="zone"
                  defaultValue="urbana"
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <option value="urbana">Urbana</option>
                  <option value="rural">Rural</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-foreground">Endereço Completo</label>
                <input
                  name="address"
                  placeholder="Ex: Rua Central, nº 100, Bairro Centro"
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <Link href="/admin/escolas">
                  <Button type="button" variant="outline">Cancelar</Button>
                </Link>
                <Button type="submit" variant="primary">Salvar Escola</Button>
              </div>
            </form>
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
            placeholder="Buscar escola por nome, tipo ou endereço..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          />
        </form>
      </div>

      {/* Listagem Tabela (Desktop) / Cards (Celular) */}
      {schools.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <Building2 className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            {query ? "Nenhuma escola encontrada para a busca." : "Nenhuma escola cadastrada ainda."}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Adicione a primeira unidade escolar para iniciar os registros.
          </p>
          {!showNewForm && (
            <Link href="/admin/escolas?new=true" className="mt-4 inline-block">
              <Button variant="primary" size="sm">Cadastrar Escola</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Tabela Desktop */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Escola</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Zona</th>
                  <th className="p-4">Endereço</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="p-4 font-semibold text-foreground">
                      <Link href={`/admin/escolas/${school.id}`} className="hover:text-primary hover:underline">
                        {school.name}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">{school.type || "—"}</td>
                    <td className="p-4">
                      <Badge variant={school.zone === "urbana" ? "info" : "warning"}>
                        {school.zone === "urbana" ? "Urbana" : "Rural"}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{school.address || "—"}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/escolas/${school.id}/editar`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </Link>
                        <form action={deleteSchoolAction.bind(null, school.id)}>
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

          {/* Cards Celular */}
          <div className="grid gap-3 md:hidden">
            {schools.map((school) => (
              <Card key={school.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/admin/escolas/${school.id}`} className="font-semibold text-foreground hover:text-primary hover:underline">
                      {school.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{school.type || "Sem tipo especificado"}</p>
                  </div>
                  <Badge variant={school.zone === "urbana" ? "info" : "warning"}>
                    {school.zone === "urbana" ? "Urbana" : "Rural"}
                  </Badge>
                </div>
                {school.address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{school.address}</span>
                  </p>
                )}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                  <Link href={`/admin/escolas/${school.id}/editar`}>
                    <Button variant="outline" size="sm">Editar</Button>
                  </Link>
                  <form action={deleteSchoolAction.bind(null, school.id)}>
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
