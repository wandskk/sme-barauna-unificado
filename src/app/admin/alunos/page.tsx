import Link from "next/link";
import { listStudents } from "@/server/repositories/studentRepository";
import { listClasses } from "@/server/repositories/classRepository";
import { createStudentAction, deleteStudentAction } from "./actions";

export default async function AdminAlunosPage() {
  const [students, classes] = await Promise.all([
    listStudents().catch(() => []),
    listClasses().catch(() => []),
  ]);

  return (
    <main className="max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Alunos</h1>

      {classes.length === 0 ? (
        <p className="mb-8 rounded-lg border border-dashed p-6 text-sm text-slate-500">
          Cadastre ao menos uma turma antes de matricular alunos.
        </p>
      ) : (
        <form action={createStudentAction} className="mb-8 space-y-3 rounded-lg border bg-white p-5">
          <input name="name" placeholder="Nome do aluno" required
            className="w-full rounded-md border px-3 py-2 text-sm" />
          <select name="classId" required className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">Selecione a turma</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.school.name} · {c.name}
              </option>
            ))}
          </select>
          <input name="specialNeeds" placeholder="Necessidades especiais (opcional)"
            className="w-full rounded-md border px-3 py-2 text-sm" />
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
            Matricular
          </button>
        </form>
      )}

      <ul className="space-y-2">
        {students.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-md border bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{s.name}</p>
              <p className="text-xs text-slate-500">{s.class.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/alunos/${s.id}/editar`} className="text-sm text-primary hover:underline">
                Editar
              </Link>
              <form action={deleteStudentAction.bind(null, s.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Excluir
                </button>
              </form>
            </div>
          </li>
        ))}
        {students.length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
            Nenhum aluno matriculado ainda.
          </p>
        )}
      </ul>
    </main>
  );
}
