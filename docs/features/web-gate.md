# Feature: Web portaria

Validar ingresso na porta no contexto de um evento publicado.

## Auth

| Quem | Ação |
|------|------|
| Guest | `/login?next=/gate` |
| `GATE` | `/gate` |
| `CLIENT` / `ORGANIZER` | `/` |

Login sem `next` manda `GATE` para `/gate`.

## Rota

| Rota | Descrição |
|------|-----------|
| `/gate` | Escolher evento + scan de QR (cola como reserva) |

## APIs

- `GET /events` (lista publicada, contexto da porta)
- `POST /gate/validate` `{ eventId, code }` → `VALID` \| `INVALID` \| `ALREADY_USED` \| `WRONG_EVENT`

`code` aceita `qrPayload` (tem `.`) ou o UUID opaco do ticket.

## UI

1. Escolher o evento da entrada (fica na sessão do browser)
2. A câmera abre sozinha. Aponte o QR do ingresso (`@zxing/browser`, qualquer browser moderno)
3. Sem câmera ou permissão recusada: **Colar código** (payload ou UUID)
4. Resultado vira o título da tela. **Próximo** volta ao scan, evento intacto

| Resultado | Título |
|-----------|--------|
| `VALID` | Pode entrar |
| `ALREADY_USED` | Já usado |
| `WRONG_EVENT` | Evento errado |
| `INVALID` | Ingresso inválido |

## Como testar

1. Lab → Portaria Seed (ou login `gate@ticket.local` / `Password123!`) → `/gate`
2. Escolher o evento do ingresso
3. Ler o QR do ingresso (ou colar `qrPayload` / `code`) de um ticket `VALID` → Pode entrar
4. Mesmo código de novo → Já usado
5. Trocar para outro evento → Evento errado
6. Texto adulterado → Ingresso inválido
7. Client/org em `/gate` → `/`

```bash
pnpm --filter web start:dev
pnpm --filter web build
```
