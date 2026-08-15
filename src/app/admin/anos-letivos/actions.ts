"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/server/auth";
import { createSchoolYear, deleteSchoolYear } from "@/server/repositories/schoolYearRepository";

export async function createSchoolYearAction(formData: FormData) {
  const ctx = await requireAuthContext();
  await createSchoolYear(ctx, {
    year: Number(formData.get("year")),
    active: formData.get("active") === "on",
  });
  revalidatePath("/admin/anos-letivos");
}

export async function deleteSchoolYearAction(id: string) {
  const ctx = await requireAuthContext();
  await deleteSchoolYear(ctx, id);
  revalidatePath("/admin/anos-letivos");
}
