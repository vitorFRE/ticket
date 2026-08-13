# ticketim

Plataforma de eventos e ingressos — desafio [Verzel Elite Dev](https://elitedev.verzel.com.br).

Fluxo completo: organizador publica a partir do catálogo (TMDb / Ticketmaster), cliente reserva (mapa de assentos ou setores), paga de forma simulada, recebe QR e compartilha por link; portaria valida na entrada.

## Avaliação (deploy)

O app está no ar:

**Web:** [https://ticket-web-murex.vercel.app](https://ticket-web-murex.vercel.app)

No canto inferior direito: **Lab avaliador** — troca entre as contas seed sem digitar senha e atalha para cinema / show / área org / portaria.

### Contas seed

Senha de todas: `Password123!`

| Email | Role | O que testar |
| --- | --- | --- |
| `client1@ticket.local` | `CLIENT` | Reservar, pagar, ver QR, compartilhar |
| `client2@ticket.local` | `CLIENT` | Segundo cliente (holds cruzados) |
| `organizer@ticket.local` | `ORGANIZER` | Área org, catálogo TMDb/Ticketmaster, publicar |
| `gate@ticket.local` | `GATE` | Portaria: validar QR / código |

### Percurso sugerido

1. **Cliente** — home → filme (mapa) ou show (setores) → reservar → confirmar pagamento → ingresso com QR → Compartilhar (`/t/...` abre sem login).
2. **Organizador** — Área org → Novo evento → TMDb ou Ticketmaster → publicar. O evento aparece na home.
3. **Portaria** — escolher o evento do ingresso → câmera ou colar o código → válido; de novo → já usado.

Pagamento é simulado: **confirmar** gera ticket; **rejeitar** não gera e devolve o inventário.

---

## Decisões de projeto

### Por que monorepo

Optei por **um único repositório** (`pnpm` workspaces + Turborepo) com `apps/api` e `apps/web` lado a lado.

- Avaliação e clone ficam em um lugar só: README, seed, docs e código no mesmo fluxo.
- Scripts unificados (`pnpm start:dev`, `pnpm test`, seed) sem caçar dois repos.
- Contratos e features evoluem juntos (reserva, QR, portaria) sem desalinhamento de versão.

### Uso de IA

O desafio recomenda IA — usei de forma deliberada, não como “colar o PDF e aceitar o resultado”.

| O que | Como |
| --- | --- |
| **Base na mão** | Estrutura inicial do monorepo, pastas `apps/api` e `apps/web`, workspace e organização por features. |
| **Com IA (Cursor)** | Planejamento por etapas (PRD → features → UI), implementação NestJS/Next, Prisma, fluxos de reserva/pagamento/gate, testes e polimento. |
| **Sempre meu** | Escopo do que entra ou não, tom visual (ticketim coral), regras de hold/lock no checkout, Lab do avaliador, e o que fica de fora de propósito. |

Fluxo típico: eu defino a etapa e as restrições → a IA implementa → eu reviso, ajusto e cubro com teste antes de seguir.

Artefatos de processo versionados em [`docs/`](docs/): PRD, etapas do front, features e [decisões de UX](docs/decisoes-ux.md). Isso documenta *por que* a tela é assim, não só o que o código faz.

### Testes como rede de segurança

Como boa parte da implementação passou pela IA, **cada etapa relevante ganhou teste** (unit na API com Jest, componentes com Vitest, e e2e Playwright no fluxo crítico). Objetivo: pegar regressão cedo — inventário duplicado, validação de portaria, auth por role — em vez de descobrir na demo.

```bash
pnpm test
pnpm --filter web test:e2e   # reseeda o banco; na 1ª vez: pnpm --filter web exec playwright install chromium
```

---

## Limitações conhecidas

Escopo consciente — preferi o fluxo inteiro estável a features opcionais pela metade.

- Sem tela de cadastro / forgot password. `ORGANIZER` e `GATE` vêm do seed (conforme o enunciado: não precisa recuperação de senha),
Já deixei as contas no seed e no deploy.
- Pagamento só `APPROVED` / `REJECTED` na UI — sem gateway real.
- Hold de 15 minutos; voltar no browser **não** cancela o hold (há aviso + link para pagar).
- Sem cancelamento de ingresso com devolução ao estoque.
- Inventário (assentos/setores) não muda depois de criar o evento.
- O QR desenhado no ingresso é o UUID `ticket.code`. A API ainda aceita o payload HMAC assinado.
- Sem mapa de assentos em tempo real (WebSocket); o inventário atualiza no refresh / nova reserva, e como o deploy esta na vercel serverless não temos acesso a websocket.
- Catálogo externo: sem `TMDB_*` / `TICKETMASTER_API_KEY` no `.env`, a seed ainda sobe o cartaz (fallback); só a busca ao vivo do organizador fica indisponível.

---

## Setup local

Node 20+ e [pnpm](https://pnpm.io) 10 (`corepack enable` já resolve a versão do repo).

```bash
git clone <url-do-repositorio>
cd teste-ticket
corepack enable
pnpm install
pnpm setup:env
```

`setup:env` copia `apps/*/.env.example` → `.env` (JWT e HMAC de dev já vêm preenchidos).

```bash
pnpm --filter api prisma:migrate:deploy
pnpm --filter api prisma:seed
pnpm start:dev
```

- Web: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001](http://localhost:3001)

Mesmas contas da tabela acima (`Password123!`). Apps isolados: `pnpm dev:api` / `pnpm dev:web`.

### Seed

`pnpm --filter api prisma:seed` recria as 4 contas e o cartaz do organizer.

- Filmes: **TMDb** (título, sinopse, pôster) — sessões à frente, cinemas em SP, mapa de assentos.
- Shows: **Ticketmaster** (nome, imagem, local/data quando a API devolve) — setores Pista + Camarote.
- IDs estáveis no Lab: cinema `...0001` (mapa) e show `...0002` (GA).

Rodar de novo apaga os eventos do organizer seed e tickets/reservas ligados a eles.

### Banco

| Ambiente | Variáveis | Onde |
| --- | --- | --- |
| Local | `LOCAL_DATABASE_URL` | SQLite (`file:dev.db`) |
| Produção | `DATABASE_URL` + `DATABASE_AUTH_TOKEN` | Turso (libSQL) |

CORS da API: `FRONTEND_URL` com o origin **exato**, sem barra no fim (local e Vercel podem ir separados por vírgula).

---

## Stack

- **pnpm** workspaces + **Turborepo**
- **NestJS** (`apps/api`) + Prisma 7 (SQLite / Turso) + JWT Bearer
- **Next.js** (`apps/web`) — ticketim (coral; tema claro default, dark opcional)
- **`@teste-ticket/config`** — Biome, TypeScript, Jest

## Scripts

| Comando | Descrição |
| --- | --- |
| `pnpm start:dev` | API + web |
| `pnpm --filter api prisma:seed` | Contas + cartaz |
| `pnpm build` | Build de todos os apps |
| `pnpm check` | Lint + format (Biome) |
| `pnpm test` | Jest (API) + Vitest (web) |
| `pnpm --filter web test:e2e` | Playwright (reseeda o banco) |

## Docs

| Doc | Conteúdo |
| --- | --- |
| [docs/prd.md](docs/prd.md) | PRD do desafio |
| [docs/prd-frontend.md](docs/prd-frontend.md) | Etapas do web (F1–F7) |
| [docs/decisoes-ux.md](docs/decisoes-ux.md) | Regras de produto na UI |
| [docs/features/](docs/features/) | Notas por feature (auth, reserva, gate, org…) |

## Estrutura

```
apps/
  api/     NestJS API
  web/     Next.js (ticketim)
packages/
  config/  Biome, TypeScript, Jest
docs/      PRD, UX e features
```
