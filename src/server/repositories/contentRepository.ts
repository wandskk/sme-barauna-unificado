import { prisma } from "@/server/db";
import { AuthContext, assertCanManageInstitutionalContent } from "@/core/auth/permissions";
import { ContentInput, ContentSummary } from "@/core/institutional/content.types";

/**
 * Repositório = única porta de entrada para dados de conteúdo institucional.
 * Nenhuma tela/rota deve chamar `prisma.content.*` diretamente — mesma
 * "regra de ouro" usada no projeto legado (ver HANDOFF.md dele), só que
 * agora o "banco fake" virou Prisma/Postgres de verdade desde o primeiro
 * dia, sem precisar de uma etapa de migração depois.
 */
export async function listPublishedContent(section?: string): Promise<ContentSummary[]> {
  return prisma.content.findMany({
    where: { published: true, ...(section ? { section } : {}) },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    select: {
      id: true,
      section: true,
      title: true,
      description: true,
      imageUrl: true,
      featured: true,
      pinned: true,
      published: true,
      publishedAt: true,
    },
  });
}

export async function createContent(ctx: AuthContext, input: ContentInput) {
  assertCanManageInstitutionalContent(ctx);
  return prisma.content.create({
    data: {
      ...input,
      createdById: ctx.userId,
      publishedAt: input.published === false ? null : new Date(),
    },
  });
}

export async function updateContent(ctx: AuthContext, id: string, input: Partial<ContentInput>) {
  assertCanManageInstitutionalContent(ctx);
  return prisma.content.update({ where: { id }, data: input });
}

export async function deleteContent(ctx: AuthContext, id: string) {
  assertCanManageInstitutionalContent(ctx);
  return prisma.content.delete({ where: { id } });
}
