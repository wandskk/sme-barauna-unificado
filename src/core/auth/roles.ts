// Camada "core": regras de negócio puras, sem nenhuma dependência de Next.js,
// Prisma ou qualquer framework. Podem ser testadas isoladamente e reutilizadas
// se um dia o front virar outra coisa (mobile, outro framework, etc.).
// Ver docs/ARCHITECTURE.md, seção "Modularidade".

export type Role = "SECRETARIA" | "ADMIN" | "ESCOLA";

export const ROLES: Record<Role, { label: string; description: string }> = {
  SECRETARIA: {
    label: "Secretaria",
    description:
      "Acesso total: gerencia o site institucional e todos os indicadores de todas as escolas.",
  },
  ADMIN: {
    label: "Administrador",
    description:
      "Mesmo nível de escrita da Secretaria hoje. Papel separado para permitir diferenciação futura.",
  },
  ESCOLA: {
    label: "Escola",
    description:
      "Um usuário por escola. Só visualiza e valida os dados da própria escola — não cria dados novos.",
  },
};

export function canManageInstitutionalContent(role: Role): boolean {
  // Regra do domínio: só quem administra a secretaria mexe no site institucional.
  return role === "SECRETARIA" || role === "ADMIN";
}

export function canCreateOrEditIndicators(role: Role): boolean {
  // Escolas NÃO criam informação nova — só a secretaria/admin.
  return role === "SECRETARIA" || role === "ADMIN";
}

export function canValidateSchoolData(role: Role): boolean {
  // Validar é a única escrita permitida ao papel ESCOLA.
  return role === "ESCOLA" || role === "SECRETARIA" || role === "ADMIN";
}

export function isRestrictedToOwnSchool(role: Role): boolean {
  return role === "ESCOLA";
}
