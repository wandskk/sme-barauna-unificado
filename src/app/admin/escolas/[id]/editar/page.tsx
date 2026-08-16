import { requireAuthContext } from "@/server/auth";
import { getSchool } from "@/server/repositories/schoolRepository";
import { updateSchoolAction } from "../../actions";

export default async function EditarEscolaPage({ params }: { params: { id: string } }) {
  const ctx = await requireAuthContext();
  const school = await getSchool(ctx, params.id);

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Editar escola</h1>

      <form action={updateSchoolAction} className="space-y-3 rounded-lg border bg-white p-5">
        <input type="hidden" name="id" value={school.id} />
        <input name="name" defaultValue={school.name} required
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <input name="type" defaultValue={school.type ?? ""} placeholder="Tipo (ex.: Municipal, Creche, EJA)"
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <select name="zone" defaultValue={school.zone} className="w-full rounded-md border px-3 py-2 text-sm">
          <option value="urbana">Urbana</option>
          <option value="rural">Rural</option>
        </select>
        <input name="address" defaultValue={school.address ?? ""} placeholder="Endereço"
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
          Salvar
        </button>
      </form>
    </main>
  );
}
