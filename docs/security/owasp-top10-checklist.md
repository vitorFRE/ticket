# Checklist OWASP Top 10:2025

Testes **defensivos**: o caso passa quando a API **nega** o que deve (401 / 403 / 404 / 400 / 429) ou quando o comportamento documentado do lab se confirma. Sem payloads de exploit.

Relatório: [owasp-top10-2025.md](./owasp-top10-2025.md).  
A06–A10 + cobertura automática: [owasp-top10-checklist-a06-a10.md](./owasp-top10-checklist-a06-a10.md).

## Pré-requisitos

- API local: `pnpm --filter api start:dev` (default `http://localhost:3001`)
- Seed aplicado (`pnpm` seed do README)
- `curl` + `jq` (ou equivalente)

```bash
export API="${API:-http://localhost:3001}"
export PASS="Password123!"
```

Contas seed (avaliação; não é achado):

| Variável sugerida | Email | Role |
| --- | --- | --- |
| `CLIENT1` | `client1@ticket.local` | CLIENT |
| `CLIENT2` | `client2@ticket.local` | CLIENT |
| `ORG` | `organizer@ticket.local` | ORGANIZER |
| `GATE` | `gate@ticket.local` | GATE |

Login (grava o access em variável):

```bash
login() {
  local email="$1"
  curl -sS -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$PASS\"}"
}

T1=$(login client1@ticket.local | jq -r .accessToken)
T2=$(login client2@ticket.local | jq -r .accessToken)
TO=$(login organizer@ticket.local | jq -r .accessToken)
TG=$(login gate@ticket.local | jq -r .accessToken)
```

IDs reais (depois de um checkout pago, ou de dados já seedados):

```bash
# reserva / ticket do CLIENT1
RID=$(curl -sS "$API/reservations/mine" -H "Authorization: Bearer $T1" | jq -r '.[0].id')
TID=$(curl -sS "$API/tickets/mine" -H "Authorization: Bearer $T1" | jq -r '.[0].id')
EID=$(curl -sS "$API/events" | jq -r '.[0].id')
```

Se `tickets/mine` estiver vazio: fazer o fluxo cinema/show → pagar `APPROVED` como CLIENT1 (caso A06-01) e repetir.

Marque cada caso: **OK** / **FALHOU** / **N/A**.

Cobertura automática: tabela no final de [owasp-top10-checklist-a06-a10.md](./owasp-top10-checklist-a06-a10.md).

---

## A01 — Broken Access Control

### A01-01 — CLIENT2 não lê ticket de CLIENT1

```bash
curl -sS -o /tmp/a01-01.json -w "%{http_code}" \
  "$API/tickets/$TID" -H "Authorization: Bearer $T2"
```

**Esperado:** `404`, body `"Ticket não encontrado"` (ou equivalente). Não `200` com `code` de outro user.

### A01-02 — CLIENT2 não lê reserva de CLIENT1

```bash
curl -sS -o /tmp/a01-02.json -w "%{http_code}" \
  "$API/reservations/$RID" -H "Authorization: Bearer $T2"
```

**Esperado:** `404`.

### A01-03 — CLIENT2 não paga reserva de CLIENT1

```bash
curl -sS -o /tmp/a01-03.json -w "%{http_code}" \
  -X POST "$API/reservations/$RID/pay" \
  -H "Authorization: Bearer $T2" \
  -H "Content-Type: application/json" \
  -d '{"outcome":"APPROVED"}'
```

**Esperado:** `404` (não `403` com vazamento de existência, não `201`).

### A01-04 — CLIENT não acessa catálogo

```bash
curl -sS -o /tmp/a01-04.json -w "%{http_code}" \
  "$API/catalog/tmdb/search?q=matrix" -H "Authorization: Bearer $T1"
```

**Esperado:** `403`.

### A01-05 — CLIENT não cria evento

```bash
curl -sS -o /tmp/a01-05.json -w "%{http_code}" \
  -X POST "$API/events" \
  -H "Authorization: Bearer $T1" \
  -H "Content-Type: application/json" \
  -d '{"title":"x"}'
```

**Esperado:** `403` (ou `400` de validação; nunca `201`).

### A01-06 — CLIENT / ORGANIZER não validam portaria

```bash
curl -sS -o /tmp/a01-06a.json -w "%{http_code}" \
  -X POST "$API/gate/validate" \
  -H "Authorization: Bearer $T1" \
  -H "Content-Type: application/json" \
  -d "{\"eventId\":\"$EID\",\"code\":\"00000000-0000-4000-8000-000000000099\"}"

curl -sS -o /tmp/a01-06b.json -w "%{http_code}" \
  -X POST "$API/gate/validate" \
  -H "Authorization: Bearer $TO" \
  -H "Content-Type: application/json" \
  -d "{\"eventId\":\"$EID\",\"code\":\"00000000-0000-4000-8000-000000000099\"}"
```

**Esperado:** `403` nos dois.

### A01-07 — GATE não lista tickets do cliente

```bash
curl -sS -o /tmp/a01-07.json -w "%{http_code}" \
  "$API/tickets/mine" -H "Authorization: Bearer $TG"
```

**Esperado:** `403`.

### A01-08 — ORGANIZER não vê stats de evento de outro org

Só aplicável se existir segundo organizador. Com um org seed: **N/A**. Unit: `event-metrics.service.spec.ts` (non-owner → 404).

**Esperado (quando houver 2 orgs):** `404` em `GET /events/:id/stats` e `GET /events/:id/tickets`.

### A01-09 — Sem token em rota autenticada

```bash
curl -sS -o /tmp/a01-09.json -w "%{http_code}" "$API/auth/me"
```

**Esperado:** `401`.

### A01-10 — Draft de evento não aparece para CLIENT

Criar draft como ORGANIZER (não publicar). Copiar o `id`.

```bash
curl -sS -o /tmp/a01-10.json -w "%{http_code}" \
  "$API/events/$DRAFT_ID" -H "Authorization: Bearer $T1"
```

**Esperado:** `404` (não `200` com título do draft). Owner ORGANIZER no mesmo id → `200`.

### A01-11 — Front não é fronteira

Abrir `/organizer` e `/gate` deslogado (ou como CLIENT). A UI redireciona; o teste de segurança é A01-04 / A01-06 na API.

**Esperado:** API 403 mesmo se a página “piscar”.

---

## A02 — Security Misconfiguration

### A02-01 — CORS não aceita origem arbitrária

```bash
curl -sS -D - -o /dev/null \
  -H "Origin: https://evil.example" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS "$API/events"
```

**Esperado:** sem `Access-Control-Allow-Origin: https://evil.example`. Origem `http://localhost:3000` (ou `FRONTEND_URL`) pode aparecer no allow.

### A02-02 — Body extra rejeitado (ValidationPipe)

```bash
curl -sS -o /tmp/a02-02.json -w "%{http_code}" \
  -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"client1@ticket.local","password":"Password123!","role":"ORGANIZER"}'
```

**Esperado:** `400` (`forbidNonWhitelisted`). Não `200` com role alterada.

### A02-03 — Sem Swagger público

```bash
curl -sS -o /dev/null -w "%{http_code}" "$API/api"
curl -sS -o /dev/null -w "%{http_code}" "$API/docs"
```

**Esperado:** `401` ou `404` (não UI Swagger).

### A02-04 — Headers (observação)

```bash
curl -sS -D - -o /dev/null "$API/health"
```

**Esperado (estado atual / F-04):** provavelmente **sem** `X-Content-Type-Options` / `X-Frame-Options` / HSTS. Registrar como gap, não como regressão até haver Helmet.

### A02-05 — Health público e sem throttle de auth

```bash
curl -sS -o /tmp/a02-05.json -w "%{http_code}" "$API/health"
```

**Esperado:** `200`. Não exige token.

---

## A03 — Software Supply Chain Failures

### A03-01 — `pnpm audit`

```bash
pnpm audit
```

**Esperado (baseline 2026-08-12):** 6 advisories (4 high, 2 moderate), todos transitivos `apps/web` → Next/PostCSS/sharp/nanoid. Ver F-18 no relatório. Re-rodar após bump de Next.

### A03-02 — Lockfile presente

**Esperado:** `pnpm-lock.yaml` na raiz; sem `package-lock.json` conflitante.

### A03-03 — CI

**Esperado (estado atual / F-07):** pasta `.github/workflows` **ausente**. Gap de processo.

### A03-04 — `.env` não versionado

```bash
git check-ignore -v apps/api/.env apps/web/.env || true
```

**Esperado:** ignorado. `.env.example` sem secrets reais.

---

## A04 — Cryptographic Failures

### A04-01 — Login devolve tokens, não senha

```bash
login client1@ticket.local | jq 'keys, .user | keys'
```

**Esperado:** `accessToken`, `refreshToken`, `user` sem `password` nem `refreshToken` no user.

### A04-02 — `/auth/me` sem secrets

```bash
curl -sS "$API/auth/me" -H "Authorization: Bearer $T1" | jq 'keys'
```

**Esperado:** perfil (`id`, `email`, `role`, …) sem `password` / `refreshToken`.

### A04-03 — Access token expirado / lixo

```bash
curl -sS -o /tmp/a04-03.json -w "%{http_code}" \
  "$API/auth/me" -H "Authorization: Bearer not-a-jwt"
```

**Esperado:** `401`.

### A04-04 — HMAC vs UUID no gate (observação de desenho)

Com ticket VALID e porta aberta:

1. `POST /gate/validate` com `qrPayload` (`body.sig`) → `VALID` ou `GATE_CLOSED` / `ALREADY_USED`.
2. Mesmo ticket, só o campo `code` (UUID, sem `.`) → mesmo resultado de negócio.

**Esperado (lab / F-12):** UUID cru é aceito. Registrar; não falhar o checklist por isso.

---

## A05 — Injection

### A05-01 — Campo extra no login (já A02-02)

Mesmo request. **Esperado:** `400`, app sobe.

### A05-02 — Email inválido no register

```bash
curl -sS -o /tmp/a05-02.json -w "%{http_code}" \
  -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"nao-e-email","password":"Password123!"}'
```

**Esperado:** `400`. Processo vivo.

### A05-03 — Busca de eventos com string longa

```bash
Q=$(python -c "print('a'*500)")
curl -sS -o /tmp/a05-03.json -w "%{http_code}" "$API/events?q=$Q"
```

**Esperado:** `200` (lista vazia ou filtrada) ou `400` se houver max length. **Não** 500.

### A05-04 — Catalog `q` vazio

```bash
curl -sS -o /tmp/a05-04.json -w "%{http_code}" \
  "$API/catalog/tmdb/search?q=" -H "Authorization: Bearer $TO"
```

**Esperado:** `400`.

### A05-05 — UUID inválido em path

```bash
curl -sS -o /tmp/a05-05.json -w "%{http_code}" \
  "$API/tickets/not-a-uuid" -H "Authorization: Bearer $T1"
```

**Esperado:** `400` ou `404`. Não 500 com stack.

---

## Resultado A01–A05 (preencher)

| ID | Resultado | Notas |
| --- | --- | --- |
| A01-01 | | |
| A01-02 | | |
| A01-03 | | |
| A01-04 | | |
| A01-05 | | |
| A01-06 | | |
| A01-07 | | |
| A01-08 | | N/A se um org |
| A01-09 | | |
| A01-10 | | |
| A01-11 | | |
| A02-01 | | |
| A02-02 | | |
| A02-03 | | |
| A02-04 | | gap F-04 |
| A02-05 | | |
| A03-01 | | |
| A03-02 | | |
| A03-03 | | gap F-07 |
| A03-04 | | |
| A04-01 | | |
| A04-02 | | |
| A04-03 | | |
| A04-04 | | lab F-12 |
| A05-01 | | |
| A05-02 | | |
| A05-03 | | |
| A05-04 | | |
| A05-05 | | |

Continua em [owasp-top10-checklist-a06-a10.md](./owasp-top10-checklist-a06-a10.md).
