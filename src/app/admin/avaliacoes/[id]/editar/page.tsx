import { getAssessment, listPrograms } from "@/server/repositories/assessmentRepository";
import { updateAssessmentAction } from "../../actions";

export default async function EditarAvaliacaoPage({ params }: { params: { id: string } }) {
  const [assessment, programs] = await Promise.all([getAssessment(params.id), listPrograms()]);

  return (
    <main className="max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Editar avaliação</h1>

      <form action={updateAssessmentAction} className="grid gap-3 rounded-lg border bg-white p-5 sm:grid-cols-2">
        <input type="hidden" name="id" value={assessment.id} />
        <select name="programId" defaultValue={assessment.programId} required className="rounded-md border px-3 py-2 text-sm sm:col-span-2">
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input name="name" defaultValue={assessment.name} required
          className="rounded-md border px-3 py-2 text-sm sm:col-span-2" />
        <input name="year" type="number" defaultValue={assessment.year} required
          className="rounded-md border px-3 py-2 text-sm" />
        <input name="grade" defaultValue={assessment.grade ?? ""} placeholder="Série/ano escolar (opcional)"
          className="rounded-md border px-3 py-2 text-sm" />
        <input name="subject" defaultValue={assessment.subject ?? ""} placeholder="Disciplina (opcional, usado no SPADEB)"
          className="rounded-md border px-3 py-2 text-sm" />
        <input name="totalQuestions" type="number" defaultValue={assessment.totalQuestions ?? ""} placeholder="Total de questões (opcional, SPADEB)"
          className="rounded-md border px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white sm:col-span-2">
          Salvar
        </button>
      </form>
    </main>
  );
}
