"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/server/auth";
import {
  createCoordinator,
  deleteCoordinator,
  updateCoordinator,
} from "@/server/repositories/coordinatorRepository";

export async function createCoordinatorAction(formData: FormData) {
  const ctx = await requireAuthContext();
  await createCoordinator(ctx, { name: String(formData.get("name") ?? "") });
  revalidatePath("/admin/coordenadores");
}

export async function updateCoordinatorAction(formData: FormData) {
  const ctx = await requireAuthContext();
  const id = String(formData.get("id"));
  await updateCoordinator(ctx, id, { name: String(formData.get("name") ?? "") });
  revalidatePath("/admin/coordenadores");
  redirect("/admin/coordenadores");
}

export async function deleteCoordinatorAction(id: string) {
  const ctx = await requireAuthContext();
  await deleteCoordinator(ctx, id);
  revalidatePath("/admin/coordenadores");
}
