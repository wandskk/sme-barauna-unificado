import { requireAuthContext } from "@/server/auth";
import { listAssessmentsForValidation } from "@/server/repositories/assessmentRepository";
import { validateAssessmentAction } from "./actions";

export default async function ValidarPage() {
  const ctx = await requireAuthContext();

  if (ctx.role !== "ESCOLA" || !ctx.schoolId) {
    return (
      <main className="max-w-3xl">
        <p className="text-sm text-slate-600">
          Esta tela é destinada aos usuários do papel Escola confirmarem os indicadores lançados
          pela Secretaria.
        </p>
      </main>
    );
  }

  const schoolId = ctx.schoolId;
  const items = await listAssessmentsForValidation(ctx, schoolId).catch(() => []);

  return (
    <main className="max-w-3xl">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Validação de indicadores</h1>
      <p className="mb-6 text-sm text-slate-500">
        Confirme que os dados lançados pela Secretaria para sua escola estão corretos.
      </p>

      <ul className="space-y-3">
        {items.map(({ assessment, validation }) => (
          <li key={assessment.id} className="rounded-lg border bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {assessment.program.name} · {assessment.name}
                </p>
                <p className="text-xs text-slate-500">{assessment.year}</p>
              </div>
              {validation ? (
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  Validado em {new Intl.DateTimeFormat("pt-BR").format(new Date(validation.validatedAt))}
                </span>
              ) : (
                <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                  Pendente
                </span>
              )}
            </div>

            <form action={validateAssessmentAction} className="flex items-end gap-2">
              <input type="hidden" name="schoolId" value={schoolId} />
              <input type="hidden" name="assessmentId" value={assessment.id} />
              <input
                name="note"
                placeholder="Observação (opcional)"
                defaultValue={validation?.note ?? ""}
                className="flex-1 rounded-md border px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
                {validation ? "Atualizar validação" : "Validar"}
              </button>
            </form>
          </li>
        ))}
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
            Nenhum indicador lançado para sua escola ainda.
          </p>
        )}
      </ul>
    </main>
  );
}
