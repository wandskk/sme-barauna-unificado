// Tipos do domínio "conteúdo institucional" — o contrato que a camada de
// apresentação (App Router) e a camada de persistência (Prisma) concordam
// em respeitar. Trocar Prisma por outra coisa não deveria exigir mudar
// estes tipos nem as telas que os consomem.

export type ContentInput = {
  section: string;
  title: string;
  description?: string;
  content?: string;
  contentType?: string;
  category?: string;
  imageUrl?: string;
  fileUrl?: string;
  externalLink?: string;
  buttonLabel?: string;
  featured?: boolean;
  pinned?: boolean;
  published?: boolean;
};

export type ContentSummary = {
  id: string;
  section: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  featured: boolean;
  pinned: boolean;
  published: boolean;
  publishedAt: Date | null;
};
