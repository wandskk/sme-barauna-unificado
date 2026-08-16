import Link from "next/link";
import { requireAuthContext } from "@/server/auth";
import { getSchoolDetail } from "@/server/repositories/schoolRepository";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { shiftLabel } from "@/core/school/shift";
import { Layers, Users, GraduationCap, MapPin, BarChart3, Edit, ChevronRight } from "lucide-react";

export default async function EscolaDetalhePage({ params }: { params: { id: string } }) {
  const ctx = await requireAuthContext();
  const { school, totalStudents, totalTeachers, totalClasses } = await getSchoolDetail(ctx, params.id);

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title={school.name}
        description="Perfil da unidade escolar: turmas, professores, alunos e indicadores."
        badgeText={school.type || "Sem tipo"}
        badgeVariant="outline"
        backHref="/admin/escolas"
        backLabel="Todas as escolas"
        actions={
          <div className="flex gap-2">
            <Link href={`/admin/indicadores?schoolId=${school.id}`}>
              <Button variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Ver indicadores</span>
              </Button>
            </Link>
            <Link href={`/admin/escolas/${school.id}/editar`}>
              <Button variant="primary" className="gap-2">
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Turmas" value={totalClasses} icon={Layers} />
        <KpiCard title="Alunos" value={totalStudents} icon={GraduationCap} />
        <KpiCard title="Professores" value={totalTeachers} icon={Users} />
      </div>

      <Card>
        <CardContent className="p-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {school.address || "Endereço não informado"}
          </span>
          <Badge variant={school.zone === "urbana" ? "info" : "warning"}>
            {school.zone === "urbana" ? "Zona Urbana" : "Zona Rural"}
          </Badge>
          {school.inepCode && <Badge variant="outline">INEP {school.inepCode}</Badge>}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Turmas ({school.classes.length})
        </h2>

        {school.classes.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <Layers className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-semibold text-foreground">Nenhuma turma cadastrada nesta escola.</p>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Turma</th>
                  <th className="p-4">Série</th>
                  <th className="p-4">Turno</th>
                  <th className="p-4">Professor</th>
                  <th className="p-4">Coordenador</th>
                  <th className="p-4 text-right">Alunos</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {school.classes.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="p-4">
                      <Link
                        href={`/admin/turmas/${c.id}`}
                        className="font-semibold text-foreground hover:text-primary hover:underline"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">{c.grade}</td>
                    <td className="p-4 text-muted-foreground">{shiftLabel(c.shift)}</td>
                    <td className="p-4 text-muted-foreground">{c.teacher?.name ?? "—"}</td>
                    <td className="p-4 text-muted-foreground">{c.coordinator?.name ?? "—"}</td>
                    <td className="p-4 text-right text-foreground font-medium">{c._count.students}</td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/turmas/${c.id}`}>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
