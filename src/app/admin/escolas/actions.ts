"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/server/auth";
import { createSchool, deleteSchool } from "@/server/repositories/schoolRepository";

export async function createSchoolAction(formData: FormData) {
  const ctx = await requireAuthContext();

  await createSchool(ctx, {
    name: String(formData.get("name") ?? ""),
    type: String(formData.get("type") ?? "") || undefined,
    zone: String(formData.get("zone") ?? "urbana"),
    address: String(formData.get("address") ?? "") || undefined,
  });

  revalidatePath("/admin/escolas");
}

export async function deleteSchoolAction(id: string) {
  const ctx = await requireAuthContext();
  await deleteSchool(ctx, id);
  revalidatePath("/admin/escolas");
}
