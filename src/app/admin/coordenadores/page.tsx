import { listCoordinators } from "@/server/repositories/coordinatorRepository";
import { createCoordinatorAction, deleteCoordinatorAction } from "./actions";

export default async function AdminCoordenadoresPage() {
  const coordinators = await listCoordinators().catch(() => []);

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Coordenadores</h1>

      <form action={createCoordinatorAction} className="mb-8 flex items-end gap-3 rounded-lg border bg-white p-5">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
          <input name="name" required placeholder="Nome do coordenador"
            className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
          Cadastrar
        </button>
      </form>

      <ul className="space-y-2">
        {coordinators.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-md border bg-white px-4 py-3">
            <span className="text-sm text-slate-800">{c.name}</span>
            <form action={deleteCoordinatorAction.bind(null, c.id)}>
              <button type="submit" className="text-sm text-red-600 hover:underline">
                Excluir
              </button>
            </form>
          </li>
        ))}
        {coordinators.length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
            Nenhum coordenador cadastrado ainda.
          </p>
        )}
      </ul>
    </main>
  );
}
