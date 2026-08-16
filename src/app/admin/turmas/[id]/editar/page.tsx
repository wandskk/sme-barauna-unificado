import { getClass } from "@/server/repositories/classRepository";
import { listSchools } from "@/server/repositories/schoolRepository";
import { listTeachers } from "@/server/repositories/teacherRepository";
import { listCoordinators } from "@/server/repositories/coordinatorRepository";
import { listSchoolYears } from "@/server/repositories/schoolYearRepository";
import { updateClassAction } from "../../actions";

export default async function EditarTurmaPage({ params }: { params: { id: string } }) {
  const [klass, schools, teachers, coordinators, schoolYears] = await Promise.all([
    getClass(params.id),
    listSchools(),
    listTeachers(),
    listCoordinators(),
    listSchoolYears(),
  ]);

  return (
    <main className="max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Editar turma</h1>

      <form action={updateClassAction} className="grid gap-3 rounded-lg border bg-white p-5 sm:grid-cols-2">
        <input type="hidden" name="id" value={klass.id} />
        <input name="name" defaultValue={klass.name} required
          className="rounded-md border px-3 py-2 text-sm sm:col-span-2" />
        <input name="grade" defaultValue={klass.grade} required
          className="rounded-md border px-3 py-2 text-sm" />
        <select name="shift" defaultValue={klass.shift} className="rounded-md border px-3 py-2 text-sm">
          <option value="manha">Manhã</option>
          <option value="tarde">Tarde</option>
          <option value="integral">Integral</option>
        </select>
        <select name="schoolId" defaultValue={klass.schoolId} required className="rounded-md border px-3 py-2 text-sm sm:col-span-2">
          {schools.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select name="teacherId" defaultValue={klass.teacherId ?? ""} className="rounded-md border px-3 py-2 text-sm">
          <option value="">Professor (opcional)</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select name="coordinatorId" defaultValue={klass.coordinatorId ?? ""} className="rounded-md border px-3 py-2 text-sm">
          <option value="">Coordenador (opcional)</option>
          {coordinators.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="schoolYearId" defaultValue={klass.schoolYearId ?? ""} className="rounded-md border px-3 py-2 text-sm sm:col-span-2">
          <option value="">Ano letivo (opcional)</option>
          {schoolYears.map((y) => (
            <option key={y.id} value={y.id}>{y.year}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white sm:col-span-2">
          Salvar
        </button>
      </form>
    </main>
  );
}
