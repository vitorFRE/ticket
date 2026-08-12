# Feature: Events + inventário

CRUD de eventos do organizador com inventário `SEAT_MAP` ou `GA_SECTOR`, snapshot do catalog externo e listagem pública de eventos publicados.

## Auth

| Rota | Auth |
|------|------|
| `GET /events`, `GET /events/:id`, `GET /events/:id/seats`, `GET /events/:id/sectors` | `@Public()` (JWT opcional: owner vê o próprio `DRAFT`) |
| `GET /events/mine`, `POST /events`, `PATCH /events/:id`, `POST /events/:id/publish` | JWT + role `ORGANIZER` |
| `GET /events/:id/stats`, `GET /events/:id/tickets` | JWT + role `ORGANIZER` (só owner) |

| Situação | Status |
|----------|--------|
| Sem token em rota ORGANIZER | 401 |
| `CLIENT` / `GATE` em mutação | 403 |
| Draft de outro organizer | 404 |

## Rotas

### `GET /events?q=&source=&from=&to=&priceMin=&priceMax=&venue=`

Lista só `PUBLISHED`. Filtros opcionais:

| Param | Efeito |
|------|--------|
| `q` | título `contains` |
| `source` | `tmdb` \| `ticketmaster` |
| `from` / `to` | ISO → `startsAt` gte/lte |
| `priceMin` / `priceMax` | `priceCents` gte/lte (400 se min > max) |
| `venue` | local `contains` |

Cada item inclui `ticketsSold` (`Ticket` do evento).

### `GET /events/mine`

Eventos do organizer autenticado (draft + published). Cada item inclui métricas: `ticketsSold`, `capacity`, `occupancyPct`, `revenueCents`, `ticketsUsed`, `pendingHolds`. Receita = soma dos tickets (seat → `Event.priceCents`; GA → `Sector.priceCents ?? Event.priceCents`).

### `GET /events/:id/stats`

Só owner. Mesmas métricas + `byStatus` + breakdown `seats` (SEAT_MAP) ou `sectors` (GA_SECTOR).

### `GET /events/:id/tickets?limit=`

Só owner. Lista de ingressos (`limit` default 50, max 100): `code`, `status`, `seatLabel`, `sectorName`, `createdAt`, `validatedAt`.

### `GET /events/:id`

Detalhe. Publicado: qualquer um. Draft: só o owner (com Bearer).

### `POST /events`

Cria em `DRAFT`. Body:

```json
{
  "source": "tmdb",
  "externalId": "movie:550",
  "venue": "Cinema X",
  "startsAt": "2026-09-01T20:00:00.000Z",
  "gateOpensHoursBefore": null,
  "priceCents": 3500,
  "inventoryMode": "SEAT_MAP",
  "title": "opcional",
  "description": "opcional",
  "imageUrl": "opcional",
  "seatMap": { "rows": ["A", "B"], "seatsPerRow": 12 }
}
```

Ou `GA_SECTOR`:

```json
{
  "source": "ticketmaster",
  "externalId": "evt-1",
  "venue": "Arena",
  "startsAt": "2026-10-01T21:00:00.000Z",
  "gateOpensHoursBefore": 3,
  "priceCents": 8000,
  "inventoryMode": "GA_SECTOR",
  "sectors": [
    { "name": "Pista", "capacity": 100 },
    { "name": "Camarote", "capacity": 20, "priceCents": 15000 }
  ]
}
```

Fluxo: `CatalogService.getDetail(source, externalId)` → merge com body → snapshot (`externalPayload` = `raw`) → transação Event + seats/sectors.

- `SEAT_MAP` default: fileiras `A`–`J` × 12 lugares (`A1`…`J12`), status `AVAILABLE`
- `GA_SECTOR`: `sectors` obrigatório; `priceCents` null no setor herda o do evento na leitura
- `venue` e `startsAt` finais obrigatórios (body ou catalog)
- `gateOpensHoursBefore` opcional no create (`null` | `0`–`48`). `null` = sem limite (portaria sempre liberada). `0` = no horário do evento. Seed cria eventos sem limite.
- Inventário **imutável** após create

### `PATCH /events/:id`

Só owner + `DRAFT`. Campos: `title`, `description`, `venue`, `startsAt`, `gateOpensHoursBefore`, `priceCents`, `imageUrl`.

### `POST /events/:id/publish`

`DRAFT` → `PUBLISHED` se houver ≥1 seat ou ≥1 sector conforme o modo.

### `GET /events/:id/seats` / `GET /events/:id/sectors`

Inventário (mesmo critério de visibilidade do detalhe). Erro 400 se o modo não bater.

## Erros

| Código | Quando |
|--------|--------|
| 400 | source inválido; venue/startsAt ausentes; inventário incoerente; editar/publicar fora de DRAFT; modo errado em seats/sectors; `priceMin` > `priceMax`; `from`/`to` inválidos |
| 401 | Sem JWT em rota protegida |
| 403 | Role sem permissão |
| 404 | Evento inexistente, draft alheio, ou stats/tickets de outro organizer |

## Arquivos

```
apps/api/src/modules/events/
  events.module.ts
  events.controller.ts
  events.service.ts
  event-metrics.service.ts
  inventory.service.ts
  dto/create-event.dto.ts
  dto/update-event.dto.ts
  dto/list-events.query.dto.ts
  dto/list-event-tickets.query.dto.ts
```

Schema: `Event`, `Seat`, `Sector` + enums em `apps/api/prisma/schema.prisma`.

## Testes

```bash
pnpm --filter api test
pnpm --filter api test:e2e
```

## Seed

`pnpm --filter api prisma:seed` recria contas e o cartaz do organizer. Filmes vêm do TMDb (pôster + sinopse); shows do Ticketmaster quando a key existe. Datas são à frente de hoje.

| ID estável | Modo | Origem |
|----|------|----------|
| `00000000-0000-4000-8000-000000000001` | `SEAT_MAP` | TMDb (Interestelar) |
| `00000000-0000-4000-8000-000000000002` | `GA_SECTOR` | Ticketmaster (ou fallback TMDb) |

## Limitações (este passo)

- Sem reservations / hold / payment / tickets — ver [reservations.md](./reservations.md) para hold; payment no passo seguinte
- Sem edição de inventário após create
- Preço em centavos (`priceCents`)
- Setores expõem `availableCount` (capacidade restante)
