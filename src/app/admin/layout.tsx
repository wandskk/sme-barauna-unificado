import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Início" },
  { href: "/admin/escolas", label: "Escolas" },
  { href: "/admin/turmas", label: "Turmas" },
  { href: "/admin/alunos", label: "Alunos" },
  { href: "/admin/professores", label: "Professores" },
  { href: "/admin/coordenadores", label: "Coordenadores" },
  { href: "/admin/anos-letivos", label: "Anos letivos" },
  { href: "/admin/conteudos", label: "Conteúdos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-primary text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold">SME Baraúna — Painel</span>
          <Link href="/" className="text-sm underline">
            Ver portal
          </Link>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-4 px-6 pb-3 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
