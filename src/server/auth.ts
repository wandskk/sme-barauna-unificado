import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { AuthContext, ForbiddenError } from "@/core/auth/permissions";
import type { Role } from "@/core/auth/roles";

// Configuração do NextAuth. Único arquivo que sabe que a autenticação usa
// NextAuth + credenciais por e-mail/senha — se um dia trocar para outro
// provedor (Auth.js v5, Clerk, SSO da prefeitura, etc.), é aqui e só aqui
// que muda; o resto do app depende de AuthContext (src/core/auth), não
// deste arquivo.
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          schoolId: user.schoolId,
        } as unknown as { id: string; name: string; email: string; role: Role; schoolId: string | null };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { role: Role; schoolId: string | null };
        token.role = u.role;
        token.schoolId = u.schoolId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.schoolId = token.schoolId ?? null;
      }
      return session;
    },
  },
};

/** Traduz a sessão do NextAuth para o AuthContext do domínio (src/core). */
export function toAuthContext(session: {
  user?: { id?: string; role?: Role; schoolId?: string | null };
}): AuthContext | null {
  if (!session.user?.id || !session.user.role) return null;
  return {
    userId: session.user.id,
    role: session.user.role,
    schoolId: session.user.schoolId ?? null,
  };
}

/** Usado em Server Actions: pega a sessão atual e lança ForbiddenError se não houver login. */
export async function requireAuthContext(): Promise<AuthContext> {
  const session = await getServerSession(authOptions);
  const ctx = session ? toAuthContext(session) : null;
  if (!ctx) throw new ForbiddenError("Faça login para continuar.");
  return ctx;
}
