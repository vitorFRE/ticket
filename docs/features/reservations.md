# Feature: Reservations (hold)

Reserva de inventário com hold curto (TTL), concorrência para `SEAT_MAP` e `GA_SECTOR`, e expiração lazy. **Sem** payment/tickets neste passo.

## Auth

Todas as rotas exigem JWT + role `CLIENT`.

| Situação | Status |
|----------|--------|
| Sem token | 401 |
| `ORGANIZER` / `GATE` | 403 |
| `CLIENT` | permitido |
| Reserva de outro usuário | 404 |

## Hold TTL

- `expiresAt = now + 15 minutos`
- Status inicial: `PENDING`
- Expiração **lazy** em `POST /reservations`, `GET /reservations/me`, `GET /reservations/:id` e ao listar seats/sectors do evento
- Ao expirar: seats `HELD → AVAILABLE`; GA `availableCount += quantity`; status `EXPIRED`

## Rotas

### `POST /reservations`

Cria hold. Body (um modo):

**SEAT_MAP**

```json
{
  "eventId": "00000000-0000-4000-8000-000000000001",
  "seatIds": ["<seat-uuid>"]
}
```

**GA_SECTOR**

```json
{
  "eventId": "00000000-0000-4000-8000-000000000002",
  "sectorId": "<sector-uuid>",
  "quantity": 2
}
```

Regras:

- Evento deve estar `PUBLISHED`
- Modo do body deve bater com `inventoryMode`
- SEAT_MAP: `updateMany` `AVAILABLE → HELD`; se `count !== seatIds.length` → **409**
- GA: decremento atômico de `availableCount` se `>= quantity`; senão **409**
- Transação Prisma (SQLite serializa; sem fila distribuída)

### `GET /reservations/me`

Lista reservas do cliente autenticado (mais recentes primeiro).

### `GET /reservations/:id`

Detalhe da reserva (só owner).

## Erros

| Código | Quando |
|--------|--------|
| 400 | Payload misto/vazio; modo incompatível; quantity inválido |
| 401 | Sem JWT |
| 403 | Role sem permissão |
| 404 | Evento não publicado / assento ou setor alheio / reserva alheia |
| 409 | Assento ou capacidade indisponível |

## Schema

- `Reservation` + `ReservationItem`
- `Sector.availableCount` (init = `capacity` na criação/seed)
- Enums `ReservationStatus`: `PENDING` \| `PAID` \| `FAILED` \| `EXPIRED` \| `CANCELLED` (`PAID`/`FAILED` no passo payment)

## Arquivos

```
apps/api/src/modules/reservations/
  reservations.module.ts
  reservations.controller.ts
  reservations.service.ts
  dto/create-reservation.dto.ts
```

## Testes

```bash
pnpm --filter api test
pnpm --filter api test:e2e
```

## Limitações

- Sem `POST /reservations/:id/pay` (próximo passo)
- Sem job em background; só expiração lazy
- Concorrência adequada para SQLite local; documentar limite em produção multi-instância
