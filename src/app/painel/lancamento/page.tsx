import Link from "next/link";
import { requireAuthContext } from "@/server/auth";
import { listAssessments, listResultsForClass } from "@/server/repositories/assessmentRepository";
import { listClasses } from "@/server/repositories/classRepository";
import { listStudents } from "@/server/repositories/studentRepository";
import { READING_LEVELS } from "@/core/assessments/readingLevels";
import { saveLancamentoAction } from "./actions";

export default async function LancamentoPage({
  searchParams,
}: {
  searchParams: { assessmentId?: string; classId?: string };
}) {
  const ctx = await requireAuthContext();

  if (ctx.role === "ESCOLA") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-sm text-slate-600">
          O lançamento de indicadores é feito pela Secretaria/Administrador. Sua escola pode{" "}
          <Link href="/painel/validar" className="text-primary underline">
            validar os dados já lançados
          </Link>
          .
        </p>
      </main>
    );
  }

  const [assessments, classes] = await Promise.all([
    listAssessments().catch(() => []),
    listClasses().catch(() => []),
  ]);

  const { assessmentId, classId } = searchParams;

  if (!assessmentId || !classId) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">Lançamento de indicadores</h1>

        {assessments.length === 0 || classes.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-slate-500">
            Cadastre ao menos uma avaliação (<Link href="/admin/avaliacoes" className="text-primary underline">/admin/avaliacoes</Link>) e uma turma antes de lançar resultados.
          </p>
        ) : (
          <form method="GET" className="grid gap-3 rounded-lg border bg-white p-5">
            <select name="assessmentId" required defaultValue={assessmentId ?? ""} className="rounded-md border px-3 py-2 text-sm">
              <option value="">Selecione a avaliação</option>
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.program.name} · {a.name} · {a.year}
                </option>
              ))}
            </select>
            <select name="classId" required defaultValue={classId ?? ""} className="rounded-md border px-3 py-2 text-sm">
              <option value="">Selecione a turma</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.school.name} · {c.name}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
              Continuar
            </button>
          </form>
        )}
      </main>
    );
  }

  const assessment = assessments.find((a) => a.id === assessmentId);
  const klass = classes.find((c) => c.id === classId);
  if (!assessment || !klass) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-sm text-red-600">Avaliação ou turma não encontrada.</p>
        <Link href="/painel/lancamento" className="text-sm text-primary underline">Voltar</Link>
      </main>
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
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">
        {assessment.program.name} · {assessment.name}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        {klass.school.name} · {klass.name}
      </p>

      {students.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-sm text-slate-500">
          Nenhum aluno matriculado nesta turma.
        </p>
      ) : (
        <form action={saveLancamentoAction} className="space-y-3">
          <input type="hidden" name="assessmentId" value={assessmentId} />
          <input type="hidden" name="classId" value={classId} />

          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">Aluno</th>
                  <th className="px-4 py-2">Participou</th>
                  {isObjective ? (
                    <>
                      <th className="px-4 py-2">Acertos Português</th>
                      <th className="px-4 py-2">Acertos Matemática</th>
                    </>
                  ) : (
                    <th className="px-4 py-2">Nível de leitura</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const existing = resultByStudent.get(s.id);
                  return (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="px-4 py-2 text-slate-800">{s.name}</td>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          name={`participated_${s.id}`}
                          defaultChecked={existing ? existing.participated : true}
                        />
                      </td>
                      {isObjective ? (
                        <>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min={0}
                              name={`correctPortuguese_${s.id}`}
                              defaultValue={existing?.correctPortuguese ?? ""}
                              className="w-20 rounded-md border px-2 py-1"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min={0}
                              name={`correctMath_${s.id}`}
                              defaultValue={existing?.correctMath ?? ""}
                              className="w-20 rounded-md border px-2 py-1"
                            />
                          </td>
                        </>
                      ) : (
                        <td className="px-4 py-2">
                          <select name={`readingLevel_${s.id}`} defaultValue={existing?.readingLevel ?? ""} className="rounded-md border px-2 py-1">
                            <option value="">—</option>
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

          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
            Salvar lançamento
          </button>
        </form>
      )}
    </main>
  );
}
