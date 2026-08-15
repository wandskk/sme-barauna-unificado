import { prisma } from "@/server/db";
import { AuthContext, assertCanWriteIndicators } from "@/core/auth/permissions";

export async function listTeachers() {
  return prisma.teacher.findMany({ orderBy: { name: "asc" } });
}

export async function createTeacher(ctx: AuthContext, input: { name: string }) {
  assertCanWriteIndicators(ctx);
  return prisma.teacher.create({ data: input });
}

export async function deleteTeacher(ctx: AuthContext, id: string) {
  assertCanWriteIndicators(ctx);
  return prisma.teacher.delete({ where: { id } });
}
