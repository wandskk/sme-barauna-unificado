# Roadmap — o que já existe e o que falta

## O que este scaffold já entrega (código real, não só esqueleto)

- Schema Prisma completo e unificado (escolas, turmas, alunos, professores,
  coordenadores, anos letivos, programas de avaliação, resultados,
  validações de escola, conteúdo institucional, notícias, relatórios,
  seções do menu).
- Autenticação por credenciais (NextAuth) com 3 papéis, sessão JWT.
- Autorização em duas camadas (middleware de rota + guarda no domínio).
- Repositórios de exemplo (`contentRepository`, `schoolRepository`,
  `assessmentRepository`) cobrindo os três domínios.
- Fluxo ponta a ponta funcional: `/admin/conteudos` (Server Component +
  Server Actions, sem API route) — use como modelo para as próximas telas.
- Dashboard público (`/indicadores`) e home institucional (`/`) já lendo do
  banco de verdade.
- Seed (`prisma/seed.ts`) com um usuário Secretaria, um usuário Escola e os
  dois programas de avaliação.

## Passo a passo para colocar no ar

1. **Instalar dependências.** Este ambiente de nuvem não teve acesso ao
   registro do npm no momento em que o projeto foi montado — rode
   localmente:
   ```sh
   npm install
   ```
2. **Criar o banco na Neon.** Crie uma conta em https://neon.tech, crie um
   projeto Postgres, copie a "Pooled connection string" para
   `DATABASE_URL` e a "Direct connection" para `DIRECT_URL` no seu `.env`
   (copie de `.env.example`). Gere `NEXTAUTH_SECRET` com
   `openssl rand -base64 32`.
3. **Aplicar o schema e popular dados de exemplo:**
   ```sh
   npx prisma migrate dev --name init
   npm run db:seed
   ```
4. **Rodar localmente:**
   ```sh
   npm run dev
   ```
   Login de demonstração (criado pelo seed): `secretaria@barauna.rn.gov.br`
   / `demo123` (papel Secretaria) e `escola@barauna.rn.gov.br` / `demo123`
   (papel Escola).
5. **Criar o repositório no GitHub.** Este projeto já tem um git local
   inicializado (`git log` mostra o commit inicial). Crie um repositório
   vazio no GitHub e rode:
   ```sh
   git remote add origin <url-do-seu-repositorio>
   git push -u origin main
   ```
6. **Conectar à Vercel.** Em https://vercel.com, "Add New Project", importe
   o repositório do GitHub. Configure as variáveis de ambiente
   (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` = a URL
   de produção) no painel da Vercel. Todo push na branch principal já vira
   deploy automático a partir daqui.

## Próximos passos de produto (ainda não implementados)

- [ ] Telas de cadastro completas: Escolas, Turmas, Alunos, Professores,
      Coordenadores, Anos Letivos (seguir o padrão de
      `src/app/admin/conteudos`).
- [ ] Tela de Lançamento (`/painel/lancamento`) para SPADEB e Fluência
      Leitora — grade por turma, reaproveitando `recordObjectiveResult` /
      `recordReadingLevel` de `assessmentRepository.ts`.
- [ ] Tela de Validação da escola (`/painel/validar`) usando
      `validateSchoolAssessment`.
- [ ] Importação de planilha Excel (portar a lógica de
      `FluenciaImportPage.tsx` / `ImportPage.tsx` do projeto legado, usando
      `xlsx` — já está no `package.json`).
- [ ] Dashboards com gráficos (Recharts já incluso) cruzando os dois
      programas por escola/turma.
- [ ] Gerenciamento de Seções do Menu, Notícias e Escolas no `/admin`
      (mesmo padrão de `conteudos`).
- [ ] Página de login diferenciada por destino (redirecionar Escola para
      `/painel`, Secretaria/Admin para `/admin`).
- [ ] Testes automatizados da camada `src/core` (é a mais fácil de testar,
      por não depender de banco nem de rede).
- [ ] Upload de imagem/arquivo de verdade (hoje não implementado — decidir
      entre Vercel Blob, S3 ou outro provedor).

## Decisões que ficaram deliberadamente simples por enquanto

- Papéis `SECRETARIA` e `ADMIN` têm as mesmas permissões — mantidos
  separados no schema para diferenciar depois, sem migration.
- UX mínima, sem componentização visual elaborada (shadcn/ui não foi
  reintroduzido ainda) — funcionalidade primeiro, como pedido.
