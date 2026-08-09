# Feature: Catalog (proxy TMDb + Ticketmaster)

Proxy de busca e detalhe de catálogo externo para o organizador pré-preencher a criação de eventos. Não persiste dados — só consulta APIs de terceiros e devolve um shape unificado.

## Env

| Variável | Uso |
|----------|-----|
| `TMDB_API_KEY` | API key v3 (preferencial) |
| `TMDB_ACCESS_TOKEN` | Bearer v4 (fallback se a key faltar) |
| `TICKETMASTER_API_KEY` | Consumer Key da Discovery API |

Definidas em `apps/api/.env` / `.env.example` e expostas via `env.config` → `catalog.*`.

## Auth

Todas as rotas exigem JWT válido e role `ORGANIZER` (`@Roles` + `RolesGuard`).

| Situação | Status |
|----------|--------|
| Sem token | 401 |
| `CLIENT` / `GATE` | 403 |
| `ORGANIZER` | permitido |

## Rotas

### `GET /catalog/tmdb/search?q=`

Busca multi (filme + TV) no TMDb. Ignora resultados `person`.

### `GET /catalog/ticketmaster/search?q=`

Busca eventos na Discovery API v2.

### `GET /catalog/:source/:externalId`

Detalhe para pré-preencher evento. `source`: `tmdb` \| `ticketmaster`.

- TMDb: `externalId` composto `movie:{id}` ou `tv:{id}` (ex.: `movie:550`)
- Ticketmaster: id nativo do evento

### Exemplo de item (`CatalogItem`)

```json
{
  "source": "tmdb",
  "externalId": "movie:550",
  "title": "Clube da Luta",
  "description": "...",
  "imageUrl": "https://image.tmdb.org/t/p/w500/...",
  "venue": null,
  "startsAt": null,
  "raw": {}
}
```

Search responde `{ "items": CatalogItem[] }` (até ~20 itens).

## Erros

| Código | Quando |
|--------|--------|
| 400 | `q` ausente; `source` inválido; `externalId` TMDb malformado |
| 401 | Sem JWT |
| 403 | Role sem permissão |
| 404 | Item não encontrado na API externa |
| 502 | Falha de rede ou HTTP de erro da API externa |
| 503 | Chave da fonte não configurada |

## Arquivos

```
apps/api/src/modules/catalog/
  catalog.module.ts
  catalog.controller.ts
  catalog.service.ts
  clients/tmdb.client.ts
  clients/ticketmaster.client.ts
  dto/catalog-search.query.dto.ts
  types/catalog-item.type.ts
  http/http-fetcher.ts
```

## Testes

```bash
pnpm --filter api test          # unit (*.spec.ts)
pnpm --filter api test:e2e      # inclui catalog.e2e-spec.ts
```

Cobertura pretendida: mapeamento TMDb/Ticketmaster, chave ausente, upstream/network, id inválido, delegação do service, e2e 401/403/400/200 com clients mockados (sem hit real nas APIs).

## Limitações

- Sem cache e sem sync offline
- Só busca/detalhe — criação de `Event` é o próximo passo do PRD
- Rate limits das APIs externas não são tratados além do 502
