"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/server/auth";
import { validateSchoolAssessment } from "@/server/repositories/assessmentRepository";

export async function validateAssessmentAction(formData: FormData) {
  const ctx = await requireAuthContext();

  await validateSchoolAssessment(ctx, {
    schoolId: String(formData.get("schoolId")),
    assessmentId: String(formData.get("assessmentId")),
    note: String(formData.get("note") ?? "") || undefined,
  });

  revalidatePath("/painel/validar");
}
