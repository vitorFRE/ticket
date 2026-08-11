# Feature: Payment simulado + Tickets/QR

Fecha a compra de uma reserva `PENDING`: pagamento simulado, geração de ingressos com QR assinado (HMAC) e link público de compartilhamento.

## Env

| Variável | Uso |
|----------|-----|
| `TICKET_HMAC_SECRET` | Assina `qrPayload` (obrigatório em produção) |
| `FRONTEND_URL` | Base do link de share (`/t/:token`) |

## Auth

| Rota | Auth |
|------|------|
| `POST /reservations/:id/pay` | `CLIENT` owner |
| `GET /tickets/me`, `GET /tickets/:id`, `POST /tickets/:id/share` | `CLIENT` owner |
| `GET /public/tickets/:token` | `@Public()` |

## Fluxo pay

### `POST /reservations/:id/pay`

```json
{ "outcome": "APPROVED" }
```

ou

```json
{ "outcome": "REJECTED" }
```

Pré-condições: reserva `PENDING` (expire lazy roda antes), sem payment prévio, owner.

**APPROVED**

- Cria `Payment` (`SIMULATED` / `APPROVED`)
- Seats `HELD → SOLD` (GA já teve `availableCount` decrementado no hold)
- Reserva → `PAID`
- Gera tickets `VALID`: 1 por assento; em GA, 1 por unidade de `quantity`
- Cada ticket: `code` UUID + `qrPayload` = `base64url(JSON({code,eventId,ticketId})).hmacSha256`

**REJECTED**

- Cria `Payment` `REJECTED`
- Libera hold (seats `AVAILABLE` / `availableCount++`)
- Reserva → `FAILED`
- Sem tickets

## Tickets

### `GET /tickets/me`

Lista ingressos do cliente.

### `GET /tickets/:id`

Detalhe (owner). Inclui `code`, `qrPayload`, evento, assento/setor.

### `POST /tickets/:id/share`

Idempotente. Resposta:

```json
{
  "token": "...",
  "url": "http://localhost:3000/t/..."
}
```

### `GET /public/tickets/:token`

Dados públicos: `code`, `status`, `event`, `seat`, `sector`. Sem `userId`/email.

## Erros

| Código | Quando |
|--------|--------|
| 400 | outcome inválido; reserva não PENDING; já paga |
| 401/403 | auth |
| 404 | reserva/ticket/share alheio ou inexistente |
| 409 | seats em hold inconsistentes no APPROVED |

## Arquivos

```
apps/api/src/modules/tickets/
  tickets.module.ts
  tickets.controller.ts
  public-tickets.controller.ts
  tickets.service.ts
  ticket-qr.service.ts

apps/api/src/modules/reservations/
  dto/pay-reservation.dto.ts
  (+ pay em reservations.service/controller)
```

## Testes

```bash
pnpm --filter api test
pnpm --filter api test:e2e
```

## Limitações

- Sem `POST /gate/validate` (próximo passo)
- API não renderiza imagem QR — devolve `qrPayload`/`code` para o front
- Share aponta para rota web `/t/:token` (página ainda não existe)
