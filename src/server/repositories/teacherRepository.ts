import { prisma } from "@/server/db";
import { AuthContext, assertCanWriteIndicators } from "@/core/auth/permissions";

export async function listTeachers() {
  return prisma.teacher.findMany({ orderBy: { name: "asc" } });
}

export async function createTeacher(ctx: AuthContext, input: { name: string }) {
  assertCanWriteIndicators(ctx);
  return prisma.teacher.create({ data: input });
}

export async function getTeacher(id: string) {
  return prisma.teacher.findUniqueOrThrow({ where: { id } });
}

export async function updateTeacher(ctx: AuthContext, id: string, input: { name: string }) {
  assertCanWriteIndicators(ctx);
  return prisma.teacher.update({ where: { id }, data: input });
}

export async function deleteTeacher(ctx: AuthContext, id: string) {
  assertCanWriteIndicators(ctx);
  return prisma.teacher.delete({ where: { id } });
}
