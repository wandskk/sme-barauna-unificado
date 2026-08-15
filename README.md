# Portal + Indicadores — SME Baraúna/RN (projeto unificado)

Next.js 14 (App Router) + Prisma + Postgres (Neon) + NextAuth + Tailwind.

Unifica em um só sistema o que antes eram dois: o site institucional/SPADEB
e o app "Fluência Leitora". Veja **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)**
para as decisões de design e **[`docs/ROADMAP.md`](docs/ROADMAP.md)** para o
passo a passo de colocar no ar e o que falta construir — comece por lá.

## Stack

- **Next.js 14** (App Router, Server Components, Server Actions)
- **Prisma** + **Postgres** (via [Neon](https://neon.tech))
- **NextAuth** (credenciais, JWT, 3 papéis: Secretaria/Admin/Escola)
- **Tailwind CSS**
- **Vercel** (deploy automático)

## Início rápido

```sh
npm install
cp .env.example .env   # preencha DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Detalhes completos em [`docs/ROADMAP.md`](docs/ROADMAP.md).
