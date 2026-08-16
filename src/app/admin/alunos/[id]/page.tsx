import Link from "next/link";
import { requireAuthContext } from "@/server/auth";
import { getStudentDetail } from "@/server/repositories/studentRepository";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlunoTabs } from "@/components/aluno/AlunoTabs";
import { shiftLabel } from "@/core/school/shift";
import { School, Layers, Edit } from "lucide-react";

export default async function AlunoDetalhePage({ params }: { params: { id: string } }) {
  const ctx = await requireAuthContext();
  const { student, gradeRows, attendanceRaw, results } = await getStudentDetail(ctx, params.id);

  const gradesByDisciplina = new Map<string, { unidade: number; nota: number }[]>();
  for (const g of gradeRows) {
    const list = gradesByDisciplina.get(g.disciplina) ?? [];
    list.push({ unidade: g.unidade, nota: Number(g.nota) });
    gradesByDisciplina.set(g.disciplina, list);
  }
  const grades = [...gradesByDisciplina.entries()]
    .map(([disciplina, notas]) => ({
      disciplina,
      notas,
      media: Math.round((notas.reduce((a, b) => a + b.nota, 0) / notas.length) * 100) / 100,
    }))
    .sort((a, b) => a.disciplina.localeCompare(b.disciplina));

  const attendance = attendanceRaw.map((a) => ({
    date: a.date.toISOString().slice(0, 10),
    disciplina: a.disciplina,
    totalAulas: a.totalAulas,
    totalFaltas: a.totalFaltas,
  }));

  const assessmentRows = results.map((r) => ({
    assessmentId: r.assessmentId,
    programName: r.assessment.program.name,
    assessmentName: r.assessment.name,
    resultType: r.assessment.program.resultType,
    correctPortuguese: r.correctPortuguese,
    correctMath: r.correctMath,
    percentage: r.percentage != null ? Number(r.percentage) : null,
    classification: r.classification,
    readingLevel: r.readingLevel,
  }));

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title={student.name}
        description={`Matrícula ${student.matricula ?? "não informada"}`}
        badgeText={student.specialNeeds ?? undefined}
        badgeVariant="info"
        backHref={`/admin/turmas/${student.classId}`}
        backLabel={`Turma ${student.class.name}`}
        actions={
          <Link href={`/admin/alunos/${student.id}/editar`}>
            <Button variant="primary" className="gap-2">
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary shrink-0">
              <School className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Escola</p>
              <Link
                href={`/admin/escolas/${student.class.schoolId}`}
                className="text-sm font-semibold text-foreground hover:text-primary hover:underline"
              >
                {student.class.school.name}
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-soft text-secondary shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Turma</p>
              <Link
                href={`/admin/turmas/${student.classId}`}
                className="text-sm font-semibold text-foreground hover:text-primary hover:underline"
              >
                {student.class.name} — {student.class.grade}
              </Link>
              <p className="text-xs text-muted-foreground">{shiftLabel(student.class.shift)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlunoTabs grades={grades} attendance={attendance} assessmentRows={assessmentRows} />
    </div>
  );
}
