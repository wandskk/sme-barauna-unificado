import { getTeacher } from "@/server/repositories/teacherRepository";
import { updateTeacherAction } from "../../actions";

export default async function EditarProfessorPage({ params }: { params: { id: string } }) {
  const teacher = await getTeacher(params.id);

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Editar professor</h1>

      <form action={updateTeacherAction} className="flex items-end gap-3 rounded-lg border bg-white p-5">
        <input type="hidden" name="id" value={teacher.id} />
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
          <input name="name" defaultValue={teacher.name} required className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
          Salvar
        </button>
      </form>
    </main>
  );
}
