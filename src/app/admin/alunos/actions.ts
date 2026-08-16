"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/server/auth";
import { createStudent, deleteStudent, updateStudent } from "@/server/repositories/studentRepository";

export async function createStudentAction(formData: FormData) {
  const ctx = await requireAuthContext();

  await createStudent(ctx, {
    name: String(formData.get("name") ?? ""),
    classId: String(formData.get("classId") ?? ""),
    specialNeeds: String(formData.get("specialNeeds") ?? "") || undefined,
  });

  revalidatePath("/admin/alunos");
}

export async function updateStudentAction(formData: FormData) {
  const ctx = await requireAuthContext();
  const id = String(formData.get("id"));

  await updateStudent(ctx, id, {
    name: String(formData.get("name") ?? ""),
    classId: String(formData.get("classId") ?? ""),
    specialNeeds: String(formData.get("specialNeeds") ?? "") || undefined,
  });

  revalidatePath("/admin/alunos");
  redirect("/admin/alunos");
}

export async function deleteStudentAction(id: string) {
  const ctx = await requireAuthContext();
  await deleteStudent(ctx, id);
  revalidatePath("/admin/alunos");
}
