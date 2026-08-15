"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/server/auth";
import { createContent, deleteContent } from "@/server/repositories/contentRepository";

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

export async function deleteContentAction(id: string) {
  const ctx = await requireAuthContext();

  await deleteContent(ctx, id);
  revalidatePath("/admin/conteudos");
  revalidatePath("/");
}
