import { getCoordinator } from "@/server/repositories/coordinatorRepository";
import { updateCoordinatorAction } from "../../actions";

export default async function EditarCoordenadorPage({ params }: { params: { id: string } }) {
  const coordinator = await getCoordinator(params.id);

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Editar coordenador</h1>

      <form action={updateCoordinatorAction} className="flex items-end gap-3 rounded-lg border bg-white p-5">
        <input type="hidden" name="id" value={coordinator.id} />
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
          <input name="name" defaultValue={coordinator.name} required className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
          Salvar
        </button>
      </form>
    </main>
  );
}
