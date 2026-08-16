import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Sistema totalmente privado — nenhuma rota é pública, cada escola tem seu
// próprio login. O matcher cobre tudo exceto /login e o que o próprio
// NextAuth precisa servir sem sessão (/api/auth/*) e assets estáticos;
// withAuth já redireciona para /login quem não tem token nessas rotas.
// RBAC fino de PAPEL (quem vê /admin, quem vê o quê dentro dele) fica aqui;
// autorização de dado (ex.: só a própria escola) é sempre reforçada de novo
// nos repositórios (src/server/repositories), nunca confiada só ao middleware.
export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && role !== "SECRETARIA" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
};
