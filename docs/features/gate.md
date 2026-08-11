# Feature: Gate (validação de ingresso)

Portaria valida ingressos por QR assinado (HMAC) ou código opaco (UUID), no contexto de um evento.

## Auth

| Rota | Auth |
|------|------|
| `POST /gate/validate` | JWT + role `GATE` |

| Situação | Status |
|----------|--------|
| Sem token | 401 |
| `CLIENT` / `ORGANIZER` | 403 |
| `GATE` | permitido |

Seed: `gate@ticket.local` / `Password123!`

## Rota

### `POST /gate/validate`

```json
{
  "eventId": "00000000-0000-4000-8000-000000000001",
  "code": "<qrPayload | Ticket.code>"
}
```

`code` aceita dois formatos:

- **`qrPayload`** (contém `.`): valida HMAC com `TicketQrService.verifyPayload`, depois busca por `ticketId` e confere `code` do payload
- **UUID opaco** (`Ticket.code`): lookup direto no banco (entrada manual)

HTTP **200** sempre para resultados de negócio. Resposta tipada:

```json
{
  "result": "VALID" | "INVALID" | "ALREADY_USED" | "WRONG_EVENT",
  "ticket": {
    "id": "...",
    "code": "...",
    "status": "USED",
    "eventId": "...",
    "seat": { "label": "A1" },
    "sector": null,
    "user": { "name": "Cliente Um" },
    "event": { "id": "...", "title": "Interestelar" },
    "validatedAt": "..."
  }
}
```

| `result` | Quando | `ticket` |
|----------|--------|----------|
| `VALID` | Assinatura/existência ok, evento certo, `VALID → USED` | preenchido (status `USED`) |
| `INVALID` | HMAC quebrado, ticket inexistente, mismatch payload, `VOID` | `null` |
| `ALREADY_USED` | Já `USED` (ou race no `updateMany`) | resumido |
| `WRONG_EVENT` | `ticket.eventId !== body.eventId` | resumido |

## Regras

1. Contexto de evento obrigatório no body (`eventId`)
2. Transição atômica: `updateMany` onde `id` + `status = VALID` → `USED`, com `validatedAt` e `validatedById`
3. Se `updateMany` retorna `count = 0` após leitura `VALID`, re-lê e devolve `ALREADY_USED`
4. Sem UI neste passo — front de portaria no fluxo web

## Erros HTTP

| Código | Quando |
|--------|--------|
| 400 | DTO inválido (`eventId` não UUID, `code` vazio) |
| 401 | Sem JWT |
| 403 | Role sem permissão |

## Arquivos

```
apps/api/src/modules/gate/
  gate.module.ts
  gate.controller.ts
  gate.service.ts
  gate.service.spec.ts
  dto/validate-gate.dto.ts
```

## Como testar

1. Login `gate@ticket.local` / `Password123!`
2. (como cliente) pagar reserva → `GET /tickets/mine` → copiar `qrPayload` ou `code`
3. `POST /gate/validate` `{ "eventId": "<do ticket>", "code": "<...>" }` → `VALID`
4. Repetir → `ALREADY_USED`
5. Outro `eventId` → `WRONG_EVENT`
6. Payload adulterado → `INVALID`

```bash
pnpm --filter api test
pnpm --filter api test:e2e
```
