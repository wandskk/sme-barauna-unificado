import { getContent } from "@/server/repositories/contentRepository";
import { updateContentAction } from "../../actions";

export default async function EditarConteudoPage({ params }: { params: { id: string } }) {
  const content = await getContent(params.id);

  return (
    <main className="max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Editar conteúdo</h1>

      <form action={updateContentAction} className="space-y-3 rounded-lg border bg-white p-5">
        <input type="hidden" name="id" value={content.id} />
        <input name="section" defaultValue={content.section} placeholder="Seção (ex.: noticias)" required
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <input name="title" defaultValue={content.title} placeholder="Título" required
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <textarea name="description" defaultValue={content.description ?? ""} placeholder="Descrição"
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
          Salvar
        </button>
      </form>
    </main>
  );
}
