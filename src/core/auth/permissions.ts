import { Role, isRestrictedToOwnSchool } from "./roles";

/**
 * Sessão mínima que qualquer camada de apresentação (App Router, um futuro
 * app mobile, um script de import) precisa fornecer para checar permissões.
 * Não depende do formato de sessão do NextAuth — o adaptador em
 * src/server/auth.ts é quem traduz a sessão do NextAuth para este formato.
 */
export type AuthContext = {
  userId: string;
  role: Role;
  schoolId: string | null;
};

export class ForbiddenError extends Error {
  constructor(message = "Acesso não autorizado.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Garante que, se o usuário é do papel ESCOLA, o recurso que ele está
 * tentando ler/validar pertence à escola dele. SECRETARIA e ADMIN sempre
 * passam. Lança ForbiddenError caso contrário — quem chama decide como
 * traduzir isso (404, redirect, resposta 403 de API, etc.).
 */
export function assertSchoolScope(ctx: AuthContext, targetSchoolId: string): void {
  if (isRestrictedToOwnSchool(ctx.role) && ctx.schoolId !== targetSchoolId) {
    throw new ForbiddenError("Você só pode acessar dados da sua própria escola.");
  }
}

export function assertCanWriteIndicators(ctx: AuthContext): void {
  if (ctx.role === "ESCOLA") {
    throw new ForbiddenError(
      "Escolas não podem cadastrar ou editar indicadores — apenas validar os dados existentes."
    );
  }
}

export function assertCanManageInstitutionalContent(ctx: AuthContext): void {
  if (ctx.role === "ESCOLA") {
    throw new ForbiddenError("Apenas Secretaria/Administrador gerenciam o site institucional.");
  }
}
