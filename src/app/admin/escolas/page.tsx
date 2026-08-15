import { listSchools } from "@/server/repositories/schoolRepository";
import { createSchoolAction, deleteSchoolAction } from "./actions";

export default async function AdminEscolasPage() {
  const schools = await listSchools().catch(() => []);

  return (
    <main className="max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Escolas</h1>

      <form action={createSchoolAction} className="mb-8 space-y-3 rounded-lg border bg-white p-5">
        <input name="name" placeholder="Nome da escola" required
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <input name="type" placeholder="Tipo (ex.: Municipal, Creche, EJA)"
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <select name="zone" defaultValue="urbana" className="w-full rounded-md border px-3 py-2 text-sm">
          <option value="urbana">Urbana</option>
          <option value="rural">Rural</option>
        </select>
        <input name="address" placeholder="Endereço"
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
          Cadastrar
        </button>
      </form>

      <ul className="space-y-2">
        {schools.map((school) => (
          <li key={school.id} className="flex items-center justify-between rounded-md border bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{school.name}</p>
              <p className="text-xs text-slate-500">
                {school.type ?? "—"} · {school.zone === "urbana" ? "Urbana" : "Rural"}
                {school.address ? ` · ${school.address}` : ""}
              </p>
            </div>
            <form action={deleteSchoolAction.bind(null, school.id)}>
              <button type="submit" className="text-sm text-red-600 hover:underline">
                Excluir
              </button>
            </form>
          </li>
        ))}
        {schools.length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
            Nenhuma escola cadastrada ainda.
          </p>
        )}
      </ul>
    </main>
  );
}
