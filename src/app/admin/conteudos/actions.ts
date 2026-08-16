"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/server/auth";
import { createContent, deleteContent, updateContent } from "@/server/repositories/contentRepository";

export async function createContentAction(formData: FormData) {
  const ctx = await requireAuthContext();

  await createContent(ctx, {
    section: String(formData.get("section") ?? "geral"),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    published: true,
  });

  revalidatePath("/admin/conteudos");
  revalidatePath("/");
}

export async function updateContentAction(formData: FormData) {
  const ctx = await requireAuthContext();
  const id = String(formData.get("id"));

  await updateContent(ctx, id, {
    section: String(formData.get("section") ?? "geral"),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
  });

  revalidatePath("/admin/conteudos");
  revalidatePath("/");
  redirect("/admin/conteudos");
}

export async function deleteContentAction(id: string) {
  const ctx = await requireAuthContext();

  await deleteContent(ctx, id);
  revalidatePath("/admin/conteudos");
  revalidatePath("/");
}
