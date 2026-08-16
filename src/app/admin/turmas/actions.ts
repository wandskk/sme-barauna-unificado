"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/server/auth";
import { createClass, deleteClass, updateClass } from "@/server/repositories/classRepository";

export async function createClassAction(formData: FormData) {
  const ctx = await requireAuthContext();

  await createClass(ctx, {
    name: String(formData.get("name") ?? ""),
    grade: String(formData.get("grade") ?? ""),
    shift: String(formData.get("shift") ?? "manha"),
    schoolId: String(formData.get("schoolId") ?? ""),
    teacherId: String(formData.get("teacherId") ?? "") || null,
    coordinatorId: String(formData.get("coordinatorId") ?? "") || null,
    schoolYearId: String(formData.get("schoolYearId") ?? "") || null,
  });

  revalidatePath("/admin/turmas");
}

export async function updateClassAction(formData: FormData) {
  const ctx = await requireAuthContext();
  const id = String(formData.get("id"));

  await updateClass(ctx, id, {
    name: String(formData.get("name") ?? ""),
    grade: String(formData.get("grade") ?? ""),
    shift: String(formData.get("shift") ?? "manha"),
    schoolId: String(formData.get("schoolId") ?? ""),
    teacherId: String(formData.get("teacherId") ?? "") || null,
    coordinatorId: String(formData.get("coordinatorId") ?? "") || null,
    schoolYearId: String(formData.get("schoolYearId") ?? "") || null,
  });

  revalidatePath("/admin/turmas");
  redirect("/admin/turmas");
}

export async function deleteClassAction(id: string) {
  const ctx = await requireAuthContext();
  await deleteClass(ctx, id);
  revalidatePath("/admin/turmas");
}
