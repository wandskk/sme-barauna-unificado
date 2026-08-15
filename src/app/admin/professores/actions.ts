"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/server/auth";
import { createTeacher, deleteTeacher } from "@/server/repositories/teacherRepository";

export async function createTeacherAction(formData: FormData) {
  const ctx = await requireAuthContext();
  await createTeacher(ctx, { name: String(formData.get("name") ?? "") });
  revalidatePath("/admin/professores");
}

export async function deleteTeacherAction(id: string) {
  const ctx = await requireAuthContext();
  await deleteTeacher(ctx, id);
  revalidatePath("/admin/professores");
}
