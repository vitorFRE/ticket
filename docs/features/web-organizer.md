# Feature: Web organizador

Criar eventos a partir de TMDb / Ticketmaster, editar draft e publicar.

## Auth

| Quem | Ação |
|------|------|
| Guest | `/login?next=` da rota |
| `ORGANIZER` | lista, wizard, detalhe |
| `CLIENT` / `GATE` | `/` |

## Rotas

| Rota | Descrição |
|------|-----------|
| `/organizer/events` | `GET /events/mine` |
| `/organizer/events/new` | Wizard → `POST /events` |
| `/organizer/events/[id]` | Detalhe; draft: `PATCH` + publish; publicado: link público |

## APIs

- `GET /catalog/tmdb/search?q=` e `/catalog/ticketmaster/search?q=`
- `GET /catalog/:source/:externalId` (`encodeURIComponent` em `movie:550`)
- `GET /events/mine`, `POST /events`, `GET /events/:id` (Bearer), `PATCH /events/:id`, `POST /events/:id/publish`

Create sempre nasce `DRAFT`. Inventário imutável depois do create.

## Wizard

1. Fonte + busca
2. Confirmar item
3. Local, data, preço base
4. `SEAT_MAP` (fileiras + lugares) ou `GA_SECTOR` (setores)
5. Criar rascunho → detalhe

## Como testar

1. Login `organizer@ticket.local` / `Password123!`
2. Área org → Novo evento → TMDb → filme → venue/data/preço → mapa → criar → publicar → aparece em `/`
3. Ticketmaster → show → setores Pista + Camarote → publicar
4. Guest em `/organizer/events` → login e volta
5. Client na mesma URL → `/`

```bash
pnpm --filter web start:dev
pnpm --filter web build
```
