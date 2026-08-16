import Link from "next/link";
import { listAssessments, listPrograms } from "@/server/repositories/assessmentRepository";
import { createAssessmentAction, deleteAssessmentAction } from "./actions";

export default async function AdminAvaliacoesPage() {
  const [assessments, programs] = await Promise.all([
    listAssessments().catch(() => []),
    listPrograms().catch(() => []),
  ]);

  return (
    <main className="max-w-3xl">
      <h1 className="mb-2 text-xl font-semibold text-slate-900">Avaliações</h1>
      <p className="mb-6 text-sm text-slate-500">
        Cada avaliação pertence a um programa (SPADEB ou Fluência Leitora) e é o que aparece para
        lançamento em <code>/painel/lancamento</code>.
      </p>

      {programs.length === 0 ? (
        <p className="mb-8 rounded-lg border border-dashed p-6 text-sm text-slate-500">
          Nenhum programa de avaliação cadastrado — rode o seed (<code>npm run db:seed</code>).
        </p>
      ) : (
        <form action={createAssessmentAction} className="mb-8 grid gap-3 rounded-lg border bg-white p-5 sm:grid-cols-2">
          <select name="programId" required className="rounded-md border px-3 py-2 text-sm sm:col-span-2">
            <option value="">Selecione o programa</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input name="name" placeholder="Nome (ex.: 1ª Avaliação 2026)" required
            className="rounded-md border px-3 py-2 text-sm sm:col-span-2" />
          <input name="year" type="number" placeholder="Ano" required
            className="rounded-md border px-3 py-2 text-sm" />
          <input name="grade" placeholder="Série/ano escolar (opcional)"
            className="rounded-md border px-3 py-2 text-sm" />
          <input name="subject" placeholder="Disciplina (opcional, usado no SPADEB)"
            className="rounded-md border px-3 py-2 text-sm" />
          <input name="totalQuestions" type="number" placeholder="Total de questões (opcional, SPADEB)"
            className="rounded-md border px-3 py-2 text-sm" />
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white sm:col-span-2">
            Cadastrar
          </button>
        </form>
      )}

      <ul className="space-y-2">
        {assessments.map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded-md border bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{a.name}</p>
              <p className="text-xs text-slate-500">
                {a.program.name} · {a.year}
                {a.grade ? ` · ${a.grade}` : ""}
                {a.subject ? ` · ${a.subject}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/avaliacoes/${a.id}/editar`} className="text-sm text-primary hover:underline">
                Editar
              </Link>
              <form action={deleteAssessmentAction.bind(null, a.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Excluir
                </button>
              </form>
            </div>
          </li>
        ))}
        {assessments.length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
            Nenhuma avaliação cadastrada ainda.
          </p>
        )}
      </ul>
    </main>
  );
}
