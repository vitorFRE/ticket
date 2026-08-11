# Feature: Web auth + eventos + checkout + pagamento + ingressos

Login Bearer, listagem, detalhe, reserva (hold), pagamento simulado, QR e share público.

Regras de produto pedidas na UI: [decisoes-ux.md](../decisoes-ux.md).  
Organizador: [web-organizer.md](./web-organizer.md).

## Env

| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_API_URL` | Base da API Nest (default `http://localhost:3001`) |

## Rotas

| Rota | Auth | Descrição |
|------|------|-----------|
| `/` | pública | Lista `GET /events` + busca `?q=` |
| `/login` | guest | `?next=` interno após autenticar |
| `/events/[id]` | pública | Detalhe + CTA Reservar |
| `/events/[id]/checkout` | `CLIENT` | Mapa ou setores → `POST /reservations` |
| `/reservations/[id]/pay` | `CLIENT` owner | Resumo + timer + `POST /reservations/:id/pay` |
| `/tickets` | `CLIENT` | Lista `GET /tickets/mine` |
| `/tickets/[id]` | `CLIENT` owner | QR + código + share |
| `/t/[token]` | pública | `GET /public/tickets/:token` |

## Checkout

| Quem | Ação |
|------|------|
| Guest | `/login?next=/events/[id]/checkout` |
| `CLIENT` | escolhe inventário e confirma hold (15 min) |
| `ORGANIZER` / `GATE` | volta ao detalhe |

- `SEAT_MAP`: `GET /events/:id/seats` + `{ eventId, seatIds }`
- `GA_SECTOR`: `GET /events/:id/sectors` + `{ eventId, sectorId, quantity }`
- 409: mensagem clara e refetch do inventário
- Sucesso: `/reservations/:id/pay`
- Hold `PENDING` do mesmo evento: aviso + timer + lock do mapa

## Pagamento

| Quem | Ação |
|------|------|
| Guest | `/login?next=/reservations/[id]/pay` |
| `CLIENT` owner | vê resumo, timer e confirma ou simula rejeição |
| Não-`CLIENT` | `/` |
| Reserva alheia / 404 | “Reserva não encontrada” |

- `GET /reservations/:id` para o resumo
- `POST /reservations/:id/pay` com `{ outcome: "APPROVED" | "REJECTED" }`
- `APPROVED` → `/tickets/[tickets[0].id]`
- `REJECTED` → título na própria página; inventário liberado

## Ingressos

| Quem | Ação |
|------|------|
| Guest em `/tickets` | `/login?next=/tickets` |
| Não-`CLIENT` | `/` |
| `CLIENT` | lista e detalhe dos próprios |
| Alheio / 404 | “Ingresso não encontrado” |

- Lista: poster, evento, lugar, status (válido / usado)
- Detalhe: QR de `qrPayload`, código em mono, **Compartilhar** copia `POST /tickets/:id/share` → `url`
- `USED`: “Já foi usado na porta”; QR com opacidade baixa
- `/t/[token]`: evento + lugar + status; sem QR e sem dados de usuário
- Header: link **Ingressos** só para `CLIENT`

## Como testar

1. Login `client1@ticket.local` / `Password123!`
2. Reservar → confirmar pagamento → QR no detalhe
3. `/tickets` lista o ingresso; empty se o client não comprou
4. Compartilhar → colar `/t/[token]` em aba anônima
5. Guest em `/tickets` → login e volta
6. Rejeitar pagamento → sem ticket

```bash
pnpm --filter web start:dev
pnpm --filter web build
```

## Limitações

- Sem gate (F6)
- Redirect pós-login por role e nav completa ficam no F7
