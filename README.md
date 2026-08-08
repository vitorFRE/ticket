# teste-ticket

Monorepo de uma plataforma de eventos e ingressos (desafio Verzel Elite Dev).

**desafio:** ver o [PRD](docs/prd.md) — personas, fluxos, modelo de dados, API e ordem de implementação.

## Stack

- **pnpm** workspaces
- **Turborepo** para orquestrar tasks
- **NestJS** (`apps/api`) + Prisma 7 (SQLite local / Turso em produção) + JWT auth
- **Next.js** (`apps/web`)
- **`@teste-ticket/config`** — Biome, TypeScript e Jest compartilhados

## Quick start

```bash
pnpm install
pnpm setup:env
pnpm --filter api prisma:migrate
pnpm start:dev
```

Apps individuais:

```bash
pnpm dev:api   # http://localhost:3001
pnpm dev:web   # http://localhost:3000
```

### Database

| Ambiente | Variáveis                              | Onde                   |
| -------- | -------------------------------------- | ---------------------- |
| Local    | `LOCAL_DATABASE_URL`                   | SQLite (`file:dev.db`) |
| Produção | `DATABASE_URL` + `DATABASE_AUTH_TOKEN` | Turso (libSQL)         |

Em produção defina `NODE_ENV=production` e as variáveis do Turso. Migrations locais usam `LOCAL_DATABASE_URL`; para aplicar no Turso, rode `prisma migrate deploy` com `LOCAL_DATABASE_URL` apontando para a URL do Turso (mesmo padrão do Sellow no `prisma.config.ts`).

### API auth (exemplos)

- `POST /auth/register` — `{ email, password, name? }`
- `POST /auth/login`
- `POST /auth/refresh` — Bearer refresh token
- `GET /auth/me` — Bearer access token
- `POST /auth/logout`
- `GET /health` — público

## Scripts úteis

| Comando          | Descrição                      |
| ---------------- | ------------------------------ |
| `pnpm build`     | Build de todos os pacotes/apps |
| `pnpm check`     | Lint + format check (Biome)    |
| `pnpm check:fix` | Aplica fixes do Biome          |
| `pnpm test`      | Testes unitários               |

## Docker

Há um `docker-compose.yaml` stub para evoluir depois. O fluxo principal de desenvolvimento é local com pnpm.

## Estrutura

```
apps/
  api/     NestJS API
  web/     Next.js frontend
packages/
  config/  Configs compartilhadas (Biome, TS, Jest)
```
