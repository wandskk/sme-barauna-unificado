import Link from "next/link";
import { listClasses } from "@/server/repositories/classRepository";
import { listSchools } from "@/server/repositories/schoolRepository";
import { listTeachers } from "@/server/repositories/teacherRepository";
import { listCoordinators } from "@/server/repositories/coordinatorRepository";
import { listSchoolYears } from "@/server/repositories/schoolYearRepository";
import { createClassAction, deleteClassAction } from "./actions";

const SHIFT_LABEL: Record<string, string> = { manha: "Manhã", tarde: "Tarde", integral: "Integral" };

export default async function AdminTurmasPage() {
  const [classes, schools, teachers, coordinators, schoolYears] = await Promise.all([
    listClasses().catch(() => []),
    listSchools().catch(() => []),
    listTeachers().catch(() => []),
    listCoordinators().catch(() => []),
    listSchoolYears().catch(() => []),
  ]);

  return (
    <main className="max-w-4xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Turmas</h1>

      {schools.length === 0 ? (
        <p className="mb-8 rounded-lg border border-dashed p-6 text-sm text-slate-500">
          Cadastre ao menos uma escola antes de criar turmas.
        </p>
      ) : (
        <form action={createClassAction} className="mb-8 grid gap-3 rounded-lg border bg-white p-5 sm:grid-cols-2">
          <input name="name" placeholder="Nome da turma (ex.: 5º Ano A)" required
            className="rounded-md border px-3 py-2 text-sm sm:col-span-2" />
          <input name="grade" placeholder="Série/ano escolar" required
            className="rounded-md border px-3 py-2 text-sm" />
          <select name="shift" defaultValue="manha" className="rounded-md border px-3 py-2 text-sm">
            <option value="manha">Manhã</option>
            <option value="tarde">Tarde</option>
            <option value="integral">Integral</option>
          </select>
          <select name="schoolId" required className="rounded-md border px-3 py-2 text-sm sm:col-span-2">
            <option value="">Selecione a escola</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select name="teacherId" className="rounded-md border px-3 py-2 text-sm">
            <option value="">Professor (opcional)</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select name="coordinatorId" className="rounded-md border px-3 py-2 text-sm">
            <option value="">Coordenador (opcional)</option>
            {coordinators.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select name="schoolYearId" className="rounded-md border px-3 py-2 text-sm sm:col-span-2">
            <option value="">Ano letivo (opcional)</option>
            {schoolYears.map((y) => (
              <option key={y.id} value={y.id}>{y.year}</option>
            ))}
          </select>
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white sm:col-span-2">
            Cadastrar
          </button>
        </form>
      )}

      <ul className="space-y-2">
        {classes.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-md border bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {c.name} · {c.grade} · {SHIFT_LABEL[c.shift] ?? c.shift}
              </p>
              <p className="text-xs text-slate-500">
                {c.school.name}
                {c.teacher ? ` · Prof. ${c.teacher.name}` : ""}
                {c.coordinator ? ` · Coord. ${c.coordinator.name}` : ""}
                {c.schoolYear ? ` · ${c.schoolYear.year}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/turmas/${c.id}/editar`} className="text-sm text-primary hover:underline">
                Editar
              </Link>
              <form action={deleteClassAction.bind(null, c.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Excluir
                </button>
              </form>
            </div>
          </li>
        ))}
        {classes.length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
            Nenhuma turma cadastrada ainda.
          </p>
        )}
      </ul>
    </main>
  );
}
