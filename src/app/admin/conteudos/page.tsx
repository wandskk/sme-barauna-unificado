import Link from "next/link";
import { listPublishedContent } from "@/server/repositories/contentRepository";
import { createContentAction, deleteContentAction } from "./actions";

// Exemplo completo de ponta a ponta: Server Component lê pelo repositório,
// Server Actions escrevem por ele também — nenhuma chamada Prisma na tela,
// nenhuma API route intermediária necessária. Serve de modelo para as
// próximas telas de admin (escolas, notícias, seções do menu).
export default async function AdminConteudosPage() {
  const items = await listPublishedContent().catch(() => []);

  return (
    <main className="max-w-4xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Conteúdos do portal</h1>

      <form action={createContentAction} className="mb-8 space-y-3 rounded-lg border p-5">
        <input name="section" placeholder="Seção (ex.: noticias)" required
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <input name="title" placeholder="Título" required
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <textarea name="description" placeholder="Descrição"
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <button type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
          Publicar
        </button>
      </form>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-md border px-4 py-3">
            <span className="text-sm text-slate-800">{item.title}</span>
            <div className="flex items-center gap-3">
              <Link href={`/admin/conteudos/${item.id}/editar`} className="text-sm text-primary hover:underline">
                Editar
              </Link>
              <form action={deleteContentAction.bind(null, item.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Excluir
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
