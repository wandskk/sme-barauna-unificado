"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/server/auth";
import {
  createSchoolYear,
  deleteSchoolYear,
  updateSchoolYear,
} from "@/server/repositories/schoolYearRepository";

export async function createSchoolYearAction(formData: FormData) {
  const ctx = await requireAuthContext();
  await createSchoolYear(ctx, {
    year: Number(formData.get("year")),
    active: formData.get("active") === "on",
  });
  revalidatePath("/admin/anos-letivos");
}

export async function updateSchoolYearAction(formData: FormData) {
  const ctx = await requireAuthContext();
  const id = String(formData.get("id"));
  await updateSchoolYear(ctx, id, {
    year: Number(formData.get("year")),
    active: formData.get("active") === "on",
  });
  revalidatePath("/admin/anos-letivos");
  redirect("/admin/anos-letivos");
}

export async function deleteSchoolYearAction(id: string) {
  const ctx = await requireAuthContext();
  await deleteSchoolYear(ctx, id);
  revalidatePath("/admin/anos-letivos");
}
