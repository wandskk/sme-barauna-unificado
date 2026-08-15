import Link from "next/link";
import { prisma } from "@/server/db";

const CARDS = [
  { href: "/admin/escolas", label: "Escolas", count: () => prisma.school.count() },
  { href: "/admin/turmas", label: "Turmas", count: () => prisma.class.count() },
  { href: "/admin/alunos", label: "Alunos", count: () => prisma.student.count() },
  { href: "/admin/professores", label: "Professores", count: () => prisma.teacher.count() },
  { href: "/admin/coordenadores", label: "Coordenadores", count: () => prisma.coordinator.count() },
  { href: "/admin/anos-letivos", label: "Anos letivos", count: () => prisma.schoolYear.count() },
  { href: "/admin/avaliacoes", label: "Avaliações", count: () => prisma.assessment.count() },
  { href: "/admin/conteudos", label: "Conteúdos do portal", count: () => prisma.content.count() },
];

export default async function AdminHomePage() {
  const counts = await Promise.all(CARDS.map((c) => c.count().catch(() => 0)));

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Painel administrativo</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card, i) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border bg-white p-5 transition hover:border-primary"
          >
            <p className="text-2xl font-semibold text-slate-900">{counts[i]}</p>
            <p className="mt-1 text-sm text-slate-600">{card.label}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/painel/lancamento"
        className="mt-6 inline-block text-sm text-primary underline"
      >
        Lançar resultados de avaliações →
      </Link>
    </div>
  );
}
