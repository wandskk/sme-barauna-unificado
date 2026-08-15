"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/server/auth";
import { createCoordinator, deleteCoordinator } from "@/server/repositories/coordinatorRepository";

export async function createCoordinatorAction(formData: FormData) {
  const ctx = await requireAuthContext();
  await createCoordinator(ctx, { name: String(formData.get("name") ?? "") });
  revalidatePath("/admin/coordenadores");
}

export async function deleteCoordinatorAction(id: string) {
  const ctx = await requireAuthContext();
  await deleteCoordinator(ctx, id);
  revalidatePath("/admin/coordenadores");
}
