# Feature: Web organizador

Criar eventos a partir de TMDb / Ticketmaster, editar draft, publicar e acompanhar métricas.

## Auth

| Quem | Ação |
|------|------|
| Guest | `/login?next=` da rota |
| `ORGANIZER` | lista, wizard, detalhe (`organizer/layout`) |
| `CLIENT` / `GATE` | `/` |

## Rotas

| Rota | Descrição |
|------|-----------|
| `/organizer/events` | `GET /events/mine` — resumo (publicados, vendidos, receita, check-ins), filtro Todos/Rascunho/Publicado/Próximos, tiles com vendidos/ocupação/receita |
| `/organizer/events/new` | Wizard → `POST /events` |
| `/organizer/events/[id]` | Draft: `PATCH` + publish. Publicado: meta + `GET /events/:id/stats` + `GET /events/:id/tickets` |

## APIs

- `GET /catalog/tmdb/search?q=` e `/catalog/ticketmaster/search?q=`
- `GET /catalog/:source/:externalId` (`encodeURIComponent` em `movie:550`)
- `GET /events/mine`, `POST /events`, `GET /events/:id` (Bearer), `PATCH /events/:id`, `POST /events/:id/publish`
- `GET /events/:id/stats`, `GET /events/:id/tickets?limit=`

Create sempre nasce `DRAFT`. Inventário imutável depois do create.

## Wizard

1. Fonte + busca
2. Confirmar item
3. Local, data, preço base
4. `SEAT_MAP` (fileiras + lugares) ou `GA_SECTOR` (setores)
5. Criar rascunho → detalhe

## Como testar

1. Login `organizer@ticket.local` / `Password123!`
2. Área org → ver resumo e tiles com métricas
3. Novo evento → TMDb → filme → venue/data/preço → mapa → criar → publicar → aparece em `/`
4. Detalhe do publicado → métricas + lista de ingressos (após vendas)
5. Ticketmaster → show → setores Pista + Camarote → publicar
6. Guest em `/organizer/events` → login e volta
7. Client na mesma URL → `/`

```bash
pnpm --filter web start:dev
pnpm --filter web build
```
