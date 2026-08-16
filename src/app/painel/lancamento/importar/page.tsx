import Link from "next/link";
import { requireAuthContext } from "@/server/auth";
import { listAssessments } from "@/server/repositories/assessmentRepository";
import { listClasses } from "@/server/repositories/classRepository";
import { importResultsAction } from "./actions";

export default async function ImportarResultadosPage({
  searchParams,
}: {
  searchParams: {
    assessmentId?: string;
    classId?: string;
    imported?: string;
    errorCount?: string;
    errorSummary?: string;
    importError?: string;
  };
}) {
  const ctx = await requireAuthContext();

  if (ctx.role === "ESCOLA") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-sm text-slate-600">
          A importação de planilhas é feita pela Secretaria/Administrador.
        </p>
      </main>
    );
  }

  const [assessments, classes] = await Promise.all([
    listAssessments().catch(() => []),
    listClasses().catch(() => []),
  ]);

  const { assessmentId, classId } = searchParams;
  const assessment = assessments.find((a) => a.id === assessmentId);
  const klass = classes.find((c) => c.id === classId);
  const isObjective = assessment?.program.resultType === "OBJECTIVE_SCORE";

  const imported = searchParams.imported ? Number(searchParams.imported) : null;
  const errorCount = searchParams.errorCount ? Number(searchParams.errorCount) : 0;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Importar resultados via planilha</h1>
      <p className="mb-6 text-sm text-slate-500">
        Alternativa ao{" "}
        <Link href="/painel/lancamento" className="text-primary underline">
          lançamento manual
        </Link>{" "}
        para turmas grandes.
      </p>

      {searchParams.importError && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {searchParams.importError}
        </p>
      )}

      {imported !== null && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <p>{imported} resultado(s) importado(s) com sucesso.</p>
          {errorCount > 0 && (
            <>
              <p className="mt-1 font-medium text-amber-800">{errorCount} linha(s) com erro:</p>
              <p className="mt-1 whitespace-pre-wrap text-xs text-amber-700">
                {searchParams.errorSummary}
                {errorCount > 15 ? ` … e mais ${errorCount - 15}.` : ""}
              </p>
            </>
          )}
        </div>
      )}

      {assessments.length === 0 || classes.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-sm text-slate-500">
          Cadastre ao menos uma avaliação e uma turma antes de importar.
        </p>
      ) : (
        <form method="GET" className="mb-8 grid gap-3 rounded-lg border bg-white p-5">
          <select name="assessmentId" defaultValue={assessmentId ?? ""} required className="rounded-md border px-3 py-2 text-sm">
            <option value="">Selecione a avaliação</option>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.program.name} · {a.name} · {a.year}
              </option>
            ))}
          </select>
          <select name="classId" defaultValue={classId ?? ""} required className="rounded-md border px-3 py-2 text-sm">
            <option value="">Selecione a turma</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.school.name} · {c.name}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
            Continuar
          </button>
        </form>
      )}

      {assessment && klass && (
        <div className="rounded-lg border bg-white p-5">
          <p className="mb-1 text-sm font-medium text-slate-900">
            {assessment.program.name} · {assessment.name}
          </p>
          <p className="mb-4 text-xs text-slate-500">{klass.school.name} · {klass.name}</p>

          <p className="mb-3 text-xs text-slate-500">
            Colunas esperadas na planilha (primeira linha = cabeçalho):{" "}
            {isObjective ? (
              <code>Aluno | Acertos Português | Acertos Matemática</code>
            ) : (
              <code>Aluno | Nível</code>
            )}
            . O nome do aluno deve corresponder a um aluno já matriculado nesta turma
            {!isObjective && " (nível aceita o código, ex. leitor_fluente, ou o nome completo, ex. Leitor Fluente)"}.
          </p>

          <form action={importResultsAction} encType="multipart/form-data" className="flex items-center gap-3">
            <input type="hidden" name="assessmentId" value={assessment.id} />
            <input type="hidden" name="classId" value={klass.id} />
            <input type="file" name="file" accept=".xlsx,.xls" required className="text-sm" />
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
              Importar
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
