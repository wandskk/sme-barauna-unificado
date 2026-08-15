import Link from "next/link";
import { requireAuthContext } from "@/server/auth";
import { getSchool } from "@/server/repositories/schoolRepository";
import { listClassesForSchool } from "@/server/repositories/classRepository";

export default async function PainelPage() {
  const ctx = await requireAuthContext();

  if (ctx.role !== "ESCOLA" || !ctx.schoolId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="mb-4 text-sm text-slate-600">
          Esta área é destinada aos usuários do papel Escola. Você está logado como{" "}
          {ctx.role === "SECRETARIA" ? "Secretaria" : "Administrador"} —{" "}
          <Link href="/admin" className="text-primary underline">
            acesse o painel administrativo
          </Link>
          .
        </p>
        <Link href="/painel/lancamento" className="text-sm text-primary underline">
          Ir para o lançamento de indicadores
        </Link>
      </main>
    );
  }

  const [school, classes] = await Promise.all([
    getSchool(ctx, ctx.schoolId),
    listClassesForSchool(ctx, ctx.schoolId),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">{school.name}</h1>
      <p className="mb-6 text-sm text-slate-500">
        {school.type ?? "—"} · {school.zone === "urbana" ? "Urbana" : "Rural"}
      </p>

      <h2 className="mb-3 text-sm font-medium text-slate-700">Turmas</h2>
      <ul className="mb-8 space-y-2">
        {classes.map((c) => (
          <li key={c.id} className="rounded-md border bg-white px-4 py-3 text-sm text-slate-800">
            {c.name} · {c.grade}
          </li>
        ))}
        {classes.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
            Nenhuma turma cadastrada para sua escola ainda.
          </p>
        )}
      </ul>

      <Link
        href="/painel/validar"
        className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
      >
        Validar indicadores lançados
      </Link>
    </main>
  );
}
