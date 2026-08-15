"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions, toAuthContext } from "@/server/auth";
import { createContent, deleteContent } from "@/server/repositories/contentRepository";
import { ForbiddenError } from "@/core/auth/permissions";

export async function createContentAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const ctx = session ? toAuthContext(session) : null;
  if (!ctx) throw new ForbiddenError("Faça login para continuar.");

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
  const session = await getServerSession(authOptions);
  const ctx = session ? toAuthContext(session) : null;
  if (!ctx) throw new ForbiddenError("Faça login para continuar.");

  await deleteContent(ctx, id);
  revalidatePath("/admin/conteudos");
  revalidatePath("/");
}
