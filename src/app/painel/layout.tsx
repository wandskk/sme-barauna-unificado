import Link from "next/link";
import { SignOutLink } from "../SignOutLink";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-primary text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold">SME Baraúna — Painel</span>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/painel" className="hover:underline">Início</Link>
            <Link href="/painel/lancamento" className="hover:underline">Lançamento</Link>
            <Link href="/painel/validar" className="hover:underline">Validar</Link>
            <Link href="/indicadores" className="hover:underline">Indicadores</Link>
            <Link href="/" className="hover:underline">Portal</Link>
            <SignOutLink />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
