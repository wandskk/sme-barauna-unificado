import React from "react";
import Link from "next/link";
import { listPublishedContent } from "@/server/repositories/contentRepository";
import { createContentAction, deleteContentAction } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { FileText, Plus, Edit, Trash2 } from "lucide-react";

export default async function AdminConteudosPage({
  searchParams,
}: {
  searchParams: { new?: string };
}) {
  const items = await listPublishedContent().catch(() => []);
  const showNewForm = searchParams.new === "true";

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Conteúdos do Portal Institucional"
        description="Gerenciamento de notícias, comunicados e seções do site público."
        badgeText={`${items.length} publicados`}
        badgeVariant="outline"
        actions={
          <Link href={showNewForm ? "/admin/conteudos" : "/admin/conteudos?new=true"}>
            <Button variant={showNewForm ? "outline" : "primary"} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>{showNewForm ? "Cancelar" : "Novo Conteúdo"}</span>
            </Button>
          </Link>
        }
      />

      {showNewForm && (
        <Card className="border-primary/50 bg-primary-soft/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Publicar Novo Conteúdo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createContentAction} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Seção do Site *</label>
                <input
                  name="section"
                  placeholder="Ex: noticias, comunicados, avisos"
                  required
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Título do Conteúdo *</label>
                <input
                  name="title"
                  placeholder="Ex: Abertura do Período de Matrículas 2026"
                  required
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-foreground">Descrição Resumida</label>
                <textarea
                  name="description"
                  placeholder="Resumo explicativo do conteúdo..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface p-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <Link href="/admin/conteudos">
                  <Button type="button" variant="outline">Cancelar</Button>
                </Link>
                <Button type="submit" variant="primary">Publicar Conteúdo</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {items.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-semibold text-foreground">Nenhum conteúdo publicado ainda.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Título</th>
                <th className="p-4">Seção</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="p-4 font-semibold text-foreground">{item.title}</td>
                  <td className="p-4 text-muted-foreground"><Badge variant="info">{item.section}</Badge></td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/conteudos/${item.id}/editar`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </Link>
                      <form action={deleteContentAction.bind(null, item.id)}>
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
      )}
    </div>
  );
}
