import { listProgramsWithAssessments } from "@/server/repositories/assessmentRepository";

// Dashboard PÚBLICO de indicadores — qualquer visitante enxerga a visão
// consolidada (sem exigir login), atendendo ao pedido de transparência
// pública dos dados. Lançamento/edição fica em /painel (área logada).
export default async function IndicadoresPage() {
  const programs = await listProgramsWithAssessments().catch(() => []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Indicadores Educacionais</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Visão consolidada das avaliações da rede municipal (SPADEB e Fluência Leitora).
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {programs.length === 0 && (
          <p className="col-span-2 rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
            Nenhum programa de avaliação cadastrado ainda. Rode o seed
            (<code>npm run db:seed</code>) ou cadastre pelo painel.
          </p>
        )}
        {programs.map((program) => (
          <div key={program.id} className="rounded-lg border p-5">
            <h2 className="font-semibold text-slate-900">{program.name}</h2>
            <p className="text-sm text-slate-500">{program.assessments.length} avaliação(ões)</p>
          </div>
        ))}
      </div>
    </main>
  );
}
