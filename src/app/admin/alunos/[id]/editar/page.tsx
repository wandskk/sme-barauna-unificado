import { getStudent } from "@/server/repositories/studentRepository";
import { listClasses } from "@/server/repositories/classRepository";
import { updateStudentAction } from "../../actions";

export default async function EditarAlunoPage({ params }: { params: { id: string } }) {
  const [student, classes] = await Promise.all([getStudent(params.id), listClasses()]);

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Editar aluno</h1>

      <form action={updateStudentAction} className="space-y-3 rounded-lg border bg-white p-5">
        <input type="hidden" name="id" value={student.id} />
        <input name="name" defaultValue={student.name} required
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <select name="classId" defaultValue={student.classId} required className="w-full rounded-md border px-3 py-2 text-sm">
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.school.name} · {c.name}
            </option>
          ))}
        </select>
        <input name="specialNeeds" defaultValue={student.specialNeeds ?? ""} placeholder="Necessidades especiais (opcional)"
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
          Salvar
        </button>
      </form>
    </main>
  );
}
