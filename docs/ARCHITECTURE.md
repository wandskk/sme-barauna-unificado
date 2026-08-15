# Arquitetura — Portal + Indicadores SME Baraúna (projeto unificado)

Este documento explica as decisões de design deste projeto novo, criado para
substituir os dois sistemas separados que existiam antes: o site
institucional/SPADEB (pasta `SITE SME`, React+Vite+Supabase, hoje em modo
mock) e o app "Fluência Leitora" (`fluencialeitora.xyz`, projeto à parte).
A pasta antiga foi usada só como **referência** de funcionalidades, campos e
regras — nenhum código dela foi copiado; este é um projeto novo, do zero,
em Next.js.

## Por que unificar em um só sistema

Os dois sistemas mediam coisas diferentes (acerto/erro em prova x nível de
fluência leitora), mas sobre a **mesma base**: escola, turma, aluno,
professor, coordenador, ano letivo. Mantê-los separados significava
cadastrar a mesma escola duas vezes, sem cruzar os dois indicadores no
mesmo dashboard. Ver `prisma/schema.prisma`, seção 3, para o modelo que
resolve isso: um `AssessmentProgram` (SPADEB, Fluência Leitora, e qualquer
programa futuro) e um `Assessment`/`AssessmentResult` únicos, com o
resultado sendo polimórfico conforme o tipo do programa.

## Camadas (por que nada depende do framework)

```
src/core/     → regras de negócio puras (roles, permissões, cálculo de
                nota, níveis de leitura). Zero import de Next.js ou Prisma.
                Se um dia trocar o framework, esta pasta não muda.
src/server/   → implementação concreta usando Next.js + Prisma + NextAuth:
                repositórios (única porta de entrada para o banco — nenhuma
                tela chama `prisma.*` direto, mesma regra do projeto
                legado) e configuração de autenticação.
src/app/      → App Router: páginas (Server Components) e Server Actions.
                Chamam só os repositórios de src/server, nunca o Prisma
                direto.
```

Essa separação é o que o pedido original chamou de "modular, sem depender
de framework": trocar Next.js por outra coisa no futuro significa reescrever
`src/app` e `src/server`, mas as regras em `src/core` (o que cada papel pode
fazer, como se calcula uma nota, quais são os níveis de leitura) continuam
valendo e são testáveis isoladamente.

## Autorização (3 papéis)

| Papel | O que pode fazer |
|---|---|
| `SECRETARIA` | Tudo: site institucional + todos os indicadores de todas as escolas |
| `ADMIN` | Mesmo nível de escrita que Secretaria hoje (papel separado para diferenciar no futuro se necessário) |
| `ESCOLA` | Só visualiza e **valida** (`SchoolValidation`) os dados da própria escola — nunca cria dado novo |

Reforçada em duas camadas (nunca só uma):
1. `middleware.ts` — bloqueia navegação para `/admin` e `/painel` por papel.
2. `src/core/auth/permissions.ts` — cada função de repositório chama
   `assertCanWriteIndicators`, `assertSchoolScope` etc. antes de tocar no
   banco. Isso significa que mesmo uma chamada direta a um repositório
   (bypassando a UI) continua protegida.

## Banco de dados

Postgres hospedado na [Neon](https://neon.tech), acessado via
[Prisma](https://www.prisma.io). `DATABASE_URL` fica em `.env` (nunca
commitado — ver `.env.example`). Ver `docs/ROADMAP.md` para o passo a passo
de configurar a Neon e rodar a primeira migration.

## Deploy

Pensado para [Vercel](https://vercel.com) com deploy automático a cada push
na branch principal (o pedido original de "depoimento automático" =
deployment automático). Ver `docs/ROADMAP.md`.

## Design system

Reaproveita a identidade visual do site legado (verde/azul institucional) —
ver `tailwind.config.ts`. Por ora funcional e simples, como pedido; refinar
UX é etapa posterior, deliberadamente adiada.
