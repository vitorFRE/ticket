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
pnpm --filter api prisma:seed
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

### Seed (usuários + eventos)

`pnpm --filter api prisma:seed` — senha de todos: `Password123!`

| Email                    | Role        |
| ------------------------ | ----------- |
| `organizer@ticket.local` | `ORGANIZER` |
| `client1@ticket.local`   | `CLIENT`    |
| `client2@ticket.local`   | `CLIENT`    |
| `gate@ticket.local`      | `GATE`      |

Também cria 2 eventos **PUBLISHED** do organizer (mapa de assentos + setores GA). Detalhes em [docs/features/events.md](docs/features/events.md).

Registro público (`POST /auth/register`) sempre cria `CLIENT`. Roles especiais vêm do seed (ou criação interna).

### API auth (exemplos)

- `POST /auth/register` — `{ email, password, name? }` → role `CLIENT`
- `POST /auth/login`
- `POST /auth/refresh` — Bearer refresh token
- `GET /auth/me` — Bearer access token
- `POST /auth/logout`
- `GET /health` — público

### Catalog (ORGANIZER)

Detalhes em [docs/features/catalog.md](docs/features/catalog.md).

- `GET /catalog/tmdb/search?q=`
- `GET /catalog/ticketmaster/search?q=`
- `GET /catalog/:source/:externalId` — `source`: `tmdb` \| `ticketmaster`

Env: `TMDB_API_KEY` (ou `TMDB_ACCESS_TOKEN`), `TICKETMASTER_API_KEY`.

### Events + inventário

Detalhes em [docs/features/events.md](docs/features/events.md).

- `GET /events?q=` — público (só publicados)
- `GET /events/:id` — público / owner vê draft
- `GET /events/mine` — ORGANIZER
- `POST /events` — ORGANIZER (a partir do catalog + inventário)
- `PATCH /events/:id` — ORGANIZER (só DRAFT)
- `POST /events/:id/publish` — ORGANIZER
- `GET /events/:id/seats` | `/sectors` — inventário
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
