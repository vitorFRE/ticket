# ticketim

Plataforma de eventos e ingressos (desafio Verzel Elite Dev).

O front do MVP está fechado (auth, catálogo, reserva, pagamento simulado, QR, organizador e portaria). Este README é o caminho do avaliador.

## Avaliação (já no ar)

O deploy foi feito para facilitar a correção. Dá para percorrer o fluxo sem subir o projeto.

**Web:** [https://ticket-web-murex.vercel.app](https://ticket-web-murex.vercel.app)

No canto inferior: **Lab avaliador** troca de conta sem digitar senha.

### Contas seed

Senha de todas: `Password123!`

| Email | Role | O que testar |
| --- | --- | --- |
| `client1@ticket.local` | `CLIENT` | Reservar, pagar, ver QR, compartilhar |
| `client2@ticket.local` | `CLIENT` | Segundo cliente (holds cruzados) |
| `organizer@ticket.local` | `ORGANIZER` | Área org, catálogo TMDb/Ticketmaster, publicar |
| `gate@ticket.local` | `GATE` | Portaria: validar QR / código |

### Percurso sugerido

1. **Cliente** — home → um filme (mapa) ou um show (setores) → reservar → confirmar pagamento → ingresso com QR → Compartilhar (`/t/...` abre sem login).
2. **Organizador** — Área org → Novo evento → TMDb ou Ticketmaster → publicar. O evento aparece na home.
3. **Portaria** — escolher o evento do ingresso → apontar o QR (ou colar o código) → Pode entrar; de novo → Já usado.

Pagamento é simulado: **confirmar** gera ticket; **rejeitar** não gera.

## Setup local

Node 20+ e [pnpm](https://pnpm.io) 10 (`corepack enable` já resolve a versão do repo).

```bash
git clone <seu-fork>
cd teste-ticket
corepack enable
pnpm install
pnpm setup:env
```

`setup:env` copia `apps/*/.env.example` → `.env` (JWT e HMAC de dev já vêm preenchidos). Não precisa criar arquivo na mão.

Catálogo é opcional. Sem `TMDB_API_KEY` / `TMDB_ACCESS_TOKEN` / `TICKETMASTER_API_KEY` em `apps/api/.env` a seed ainda sobe o cartaz (fallback); só a busca do organizador fica indisponível.

```bash
pnpm --filter api prisma:migrate:deploy
pnpm --filter api prisma:seed
pnpm start:dev
```

- Web: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001](http://localhost:3001)

As mesmas contas da tabela acima funcionam no local (`Password123!`).

Apps isolados: `pnpm dev:api` / `pnpm dev:web`.

### Seed

`pnpm --filter api prisma:seed` recria as 4 contas e o cartaz do organizer.

- Filmes vêm do **TMDb** (título, sinopse, pôster). Sessões com datas à frente da data atual, cinemas de São Paulo, mapa de assentos.
- Shows vêm do **Ticketmaster** (nome, imagem, local e data reais quando a API devolve). Setores Pista + Camarote.
- IDs estáveis para o Lab: cinema `...0001` (mapa) e show `...0002` (GA).

Rodar de novo apaga os eventos do organizer seed e os tickets/reservas ligados a eles.

### Banco

| Ambiente | Variáveis | Onde |
| --- | --- | --- |
| Local | `LOCAL_DATABASE_URL` | SQLite (`file:dev.db`) |
| Produção | `DATABASE_URL` + `DATABASE_AUTH_TOKEN` | Turso (libSQL) |

CORS da API: `FRONTEND_URL` com o origin **exato**, sem barra no fim (local e Vercel podem ir separados por vírgula).

## Stack

- **pnpm** workspaces + **Turborepo**
- **NestJS** (`apps/api`) + Prisma 7 (SQLite / Turso) + JWT Bearer
- **Next.js** (`apps/web`) — ticketim, dark + âmbar
- **`@teste-ticket/config`** — Biome, TypeScript, Jest

## Scripts

| Comando | Descrição |
| --- | --- |
| `pnpm start:dev` | API + web |
| `pnpm --filter api prisma:seed` | Contas + cartaz real |
| `pnpm build` | Build de todos os apps |
| `pnpm check` | Lint + format (Biome) |
| `pnpm test` | Jest (API) + Vitest (web) |
| `pnpm --filter web test:e2e` | Playwright (sobe API+web se não estiverem no ar; **reseeda** o banco). Na primeira vez: `pnpm --filter web exec playwright install chromium` |

## Docs

| Doc | Conteúdo |
| --- | --- |
| [docs/prd.md](docs/prd.md) | PRD do desafio |
| [docs/prd-frontend.md](docs/prd-frontend.md) | Fatias do web (F1–F7) |
| [docs/features/web-shell.md](docs/features/web-shell.md) | Redirects e roles |
| [docs/features/web-auth-events.md](docs/features/web-auth-events.md) | Login, checkout, tickets |
| [docs/features/web-organizer.md](docs/features/web-organizer.md) | Área org |
| [docs/features/web-gate.md](docs/features/web-gate.md) | Portaria |
| [docs/decisoes-ux.md](docs/decisoes-ux.md) | Regras de produto na UI |

## Limitações conhecidas

- Sem tela de cadastro / forgot password. Roles `ORGANIZER` e `GATE` vêm do seed.
- Pagamento é `APPROVED` / `REJECTED` na própria UI, sem gateway.
- Hold de 15 minutos; voltar no browser não cancela.
- O QR desenhado no ingresso é o UUID `ticket.code`. A API ainda aceita o payload HMAC.
- Câmera da portaria pede permissão (no telemóvel, HTTPS).
- Inventário não muda depois de criar o evento.

## Estrutura

```
apps/
  api/     NestJS API
  web/     Next.js (ticketim)
packages/
  config/  Biome, TypeScript, Jest
```
