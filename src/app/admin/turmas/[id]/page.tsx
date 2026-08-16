import Link from "next/link";
import { requireAuthContext } from "@/server/auth";
import { getClassDetail } from "@/server/repositories/classRepository";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { shiftLabel } from "@/core/school/shift";
import { TurmaTabs } from "@/components/turma/TurmaTabs";
import { Users, GraduationCap, Edit } from "lucide-react";

export default async function TurmaDetalhePage({ params }: { params: { id: string } }) {
  const ctx = await requireAuthContext();
  const { class: klass, results, attendanceRaw, grades } = await getClassDetail(ctx, params.id);

  const students = klass.students.map((s) => ({ id: s.id, name: s.name, matricula: s.matricula }));

  const attendance = attendanceRaw.map((a) => ({
    studentId: a.studentId,
    date: a.date.toISOString().slice(0, 10),
    disciplina: a.disciplina,
    totalAulas: a.totalAulas,
    totalFaltas: a.totalFaltas,
  }));

  const gradesPlain = {
    disciplinas: grades.disciplinas,
    disciplinaAverage: Object.fromEntries(grades.disciplinaAverage),
    byStudent: Object.fromEntries(
      [...grades.byStudent.entries()].map(([studentId, m]) => [studentId, Object.fromEntries(m)])
    ),
  };

  const resultsByAssessment = new Map<string, typeof results>();
  for (const r of results) {
    const list = resultsByAssessment.get(r.assessmentId) ?? [];
    list.push(r);
    resultsByAssessment.set(r.assessmentId, list);
  }
  const assessmentGroups = [...resultsByAssessment.entries()].map(([assessmentId, rows]) => ({
    assessmentId,
    programName: rows[0].assessment.program.name,
    assessmentName: rows[0].assessment.name,
    resultType: rows[0].assessment.program.resultType,
    rows: rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.student.name,
      correctPortuguese: r.correctPortuguese,
      correctMath: r.correctMath,
      percentage: r.percentage != null ? Number(r.percentage) : null,
      classification: r.classification,
      readingLevel: r.readingLevel,
    })),
  }));

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title={`Turma ${klass.name} — ${klass.grade}`}
        description={`${klass.school.name} · ${shiftLabel(klass.shift)}${klass.schoolYear ? ` · Ano letivo ${klass.schoolYear.year}` : ""}`}
        badgeText={`${klass.students.length} alunos`}
        badgeVariant="outline"
        backHref={`/admin/escolas/${klass.schoolId}`}
        backLabel={klass.school.name}
        actions={
          <Link href={`/admin/turmas/${klass.id}/editar`}>
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
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Professor</p>
              <p className="text-sm font-semibold text-foreground">{klass.teacher?.name ?? "Não vinculado"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-soft text-secondary shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coordenador</p>
              <p className="text-sm font-semibold text-foreground">{klass.coordinator?.name ?? "Não vinculado"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <TurmaTabs students={students} attendance={attendance} grades={gradesPlain} assessmentGroups={assessmentGroups} />
    </div>
  );
}
