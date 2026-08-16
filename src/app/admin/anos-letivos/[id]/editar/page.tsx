import { getSchoolYear } from "@/server/repositories/schoolYearRepository";
import { updateSchoolYearAction } from "../../actions";

export default async function EditarAnoLetivoPage({ params }: { params: { id: string } }) {
  const schoolYear = await getSchoolYear(params.id);

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Editar ano letivo</h1>

      <form action={updateSchoolYearAction} className="flex items-end gap-3 rounded-lg border bg-white p-5">
        <input type="hidden" name="id" value={schoolYear.id} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Ano</label>
          <input name="year" type="number" defaultValue={schoolYear.year} required
            className="w-32 rounded-md border px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
          <input name="active" type="checkbox" defaultChecked={schoolYear.active} />
          Ativo
        </label>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
          Salvar
        </button>
      </form>
    </main>
  );
}
