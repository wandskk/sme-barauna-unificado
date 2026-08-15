"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/server/auth";
import { createAssessment, deleteAssessment } from "@/server/repositories/assessmentRepository";

export async function createAssessmentAction(formData: FormData) {
  const ctx = await requireAuthContext();

  const totalQuestions = String(formData.get("totalQuestions") ?? "");

  await createAssessment(ctx, {
    programId: String(formData.get("programId") ?? ""),
    name: String(formData.get("name") ?? ""),
    year: Number(formData.get("year")),
    grade: String(formData.get("grade") ?? "") || undefined,
    subject: String(formData.get("subject") ?? "") || undefined,
    totalQuestions: totalQuestions ? Number(totalQuestions) : undefined,
  });

  revalidatePath("/admin/avaliacoes");
}

export async function deleteAssessmentAction(id: string) {
  const ctx = await requireAuthContext();
  await deleteAssessment(ctx, id);
  revalidatePath("/admin/avaliacoes");
}
