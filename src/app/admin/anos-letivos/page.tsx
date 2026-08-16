import Link from "next/link";
import { listSchoolYears } from "@/server/repositories/schoolYearRepository";
import { createSchoolYearAction, deleteSchoolYearAction } from "./actions";

export default async function AdminAnosLetivosPage() {
  const years = await listSchoolYears().catch(() => []);

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Anos letivos</h1>

      <form action={createSchoolYearAction} className="mb-8 flex items-end gap-3 rounded-lg border bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Ano</label>
          <input name="year" type="number" required placeholder="2026"
            className="w-32 rounded-md border px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
          <input name="active" type="checkbox" />
          Ativo
        </label>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
          Cadastrar
        </button>
      </form>

      <ul className="space-y-2">
        {years.map((y) => (
          <li key={y.id} className="flex items-center justify-between rounded-md border bg-white px-4 py-3">
            <span className="text-sm text-slate-800">
              {y.year} {y.active && <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">ativo</span>}
            </span>
            <div className="flex items-center gap-3">
              <Link href={`/admin/anos-letivos/${y.id}/editar`} className="text-sm text-primary hover:underline">
                Editar
              </Link>
              <form action={deleteSchoolYearAction.bind(null, y.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Excluir
                </button>
              </form>
            </div>
          </li>
        ))}
        {years.length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
            Nenhum ano letivo cadastrado ainda.
          </p>
        )}
      </ul>
    </main>
  );
}
