import Link from "next/link";
import { listPublishedContent } from "@/server/repositories/contentRepository";

// Home institucional pública. Busca direto do repositório (Server Component
// → sem API route intermediária; ver docs/ARCHITECTURE.md "Server Components
// vs API routes").
export default async function HomePage() {
  const highlights = await listPublishedContent().catch(() => []);

  return (
    <main>
      <header className="border-b bg-primary text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold">SME Baraúna</span>
          <nav className="flex gap-6 text-sm">
            <Link href="/">Início</Link>
            <Link href="/indicadores">Indicadores</Link>
            <Link href="/login">Área restrita</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900">
          Secretaria Municipal de Educação de Baraúna/RN
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Portal institucional e indicadores educacionais da rede municipal em um só lugar.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Publicações</h2>
        {highlights.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
            Nenhuma publicação cadastrada ainda. Conecte o banco (ver README) e cadastre
            conteúdos pelo painel administrativo.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <li key={item.id} className="rounded-lg border p-4">
                <h3 className="font-medium text-slate-900">{item.title}</h3>
                {item.description && (
                  <p className="mt-1 line-clamp-3 text-sm text-slate-600">{item.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
