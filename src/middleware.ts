import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// RBAC no nível de rota. Regras do domínio (quem pode escrever o quê) ficam
// em src/core/auth — este middleware só bloqueia navegação para áreas que o
// papel não deveria nem ver; a autorização fina (ex.: só a própria escola)
// é sempre reforçada de novo nos repositórios (src/server/repositories),
// nunca confiada só ao middleware.
export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && role !== "SECRETARIA" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // /painel = área logada de lançamento/validação de indicadores
    // (Secretaria/Admin lançam, Escola só valida). /indicadores (sem
    // middleware) é o dashboard público — ver src/app/indicadores/page.tsx.
    if (path.startsWith("/painel") && !role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/painel/:path*"],
};
