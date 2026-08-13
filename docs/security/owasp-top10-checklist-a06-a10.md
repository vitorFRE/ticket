# Checklist OWASP Top 10:2025 (A06–A10)

Continuação de [owasp-top10-checklist.md](./owasp-top10-checklist.md) (setup, tokens, A01–A05). Relatório: [owasp-top10-2025.md](./owasp-top10-2025.md).

Reusa `$API`, `$T1`, `$TO`, `$TG`, `$RID`, `$EID` do arquivo anterior.

---

## A06 — Insecure Design

### A06-01 — Pay simulado (desenho do lab)

Com reserva `PENDING` do CLIENT1:

```bash
curl -sS -o /tmp/a06-01.json -w "%{http_code}" \
  -X POST "$API/reservations/$RID/pay" \
  -H "Authorization: Bearer $T1" \
  -H "Content-Type: application/json" \
  -d '{"outcome":"APPROVED"}'
```

**Esperado (lab):** `201` ou `200`, tickets gerados. Documentar como F-13, não como bypass acidental.

### A06-02 — Outcome inválido

```bash
curl -sS -o /tmp/a06-02.json -w "%{http_code}" \
  -X POST "$API/reservations/$RID/pay" \
  -H "Authorization: Bearer $T1" \
  -H "Content-Type: application/json" \
  -d '{"outcome":"MAYBE"}'
```

**Esperado:** `400`.

### A06-03 — Register não escala role

```bash
curl -sS -o /tmp/a06-03.json -w "%{http_code}" \
  -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"probe-role@ticket.local","password":"Password123!","name":"Probe"}'
```

**Esperado:** `201`/`200` com `user.role === "CLIENT"`, ou `400` se mandar `role` extra (A02-02). Nunca `ORGANIZER`/`GATE` via API.

### A06-04 — Share público contém `code`, não PII

CLIENT1: `POST /tickets/:id/share` → copiar `token`.

```bash
curl -sS "$API/public/tickets/$SHARE_TOKEN" | jq 'keys, .code, .userId, .email'
```

**Esperado:** `200` com `code`, `status`, evento/assento. Sem `userId` / `email`. (F-12: `code` é credencial — lab.)

---

## A07 — Authentication Failures

### A07-01 — Throttle de login

```bash
for i in $(seq 1 11); do
  curl -sS -o /dev/null -w "%{http_code}\n" \
    -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"client1@ticket.local","password":"wrong-password"}'
done
```

**Esperado:** 10 respostas `401`, a 11ª `429`. Esperar 60s antes de outros testes de auth.

Coberto por `apps/api/test/throttler.e2e-spec.ts`.

### A07-02 — Senha errada

```bash
curl -sS -o /tmp/a07-02.json -w "%{http_code}" \
  -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"client1@ticket.local","password":"wrong-password"}'
```

**Esperado:** `401`, mensagem genérica (`Credenciais inválidas`). Sem stack.

### A07-03 — Email inexistente

```bash
curl -sS -o /tmp/a07-03.json -w "%{http_code}" \
  -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@ticket.local","password":"Password123!"}'
```

**Esperado:** `401` com a **mesma** mensagem de A07-02.

### A07-04 — Refresh com access token

```bash
curl -sS -o /tmp/a07-04.json -w "%{http_code}" \
  -X POST "$API/auth/refresh" \
  -H "Authorization: Bearer $T1"
```

**Esperado:** `401` (refresh secret diferente).

### A07-05 — Refresh rotaciona

```bash
PAIR=$(login client1@ticket.local)
R1=$(echo "$PAIR" | jq -r .refreshToken)
PAIR2=$(curl -sS -X POST "$API/auth/refresh" -H "Authorization: Bearer $R1")
R2=$(echo "$PAIR2" | jq -r .refreshToken)
curl -sS -o /tmp/a07-05.json -w "%{http_code}" \
  -X POST "$API/auth/refresh" -H "Authorization: Bearer $R1"
```

**Esperado:** segundo uso de `R1` → `401`. `R2` ainda funciona uma vez.

### A07-06 — Logout invalida refresh

```bash
PAIR=$(login client1@ticket.local)
A=$(echo "$PAIR" | jq -r .accessToken)
R=$(echo "$PAIR" | jq -r .refreshToken)
curl -sS -o /dev/null -w "%{http_code}" \
  -X POST "$API/auth/logout" -H "Authorization: Bearer $A"
curl -sS -o /tmp/a07-06.json -w "%{http_code}" \
  -X POST "$API/auth/refresh" -H "Authorization: Bearer $R"
```

**Esperado:** logout `204`; refresh seguinte `401`.

### A07-07 — Open redirect no login (web)

Abrir `/login?next=https://evil.example` e `/login?next=//evil.example`. Após login, a app deve ir para `/` (ou path relativo seguro), não para o host externo.

Coberto por `safe-next-path` spec.

### A07-08 — Senha curta no register

```bash
curl -sS -o /tmp/a07-08.json -w "%{http_code}" \
  -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"short@ticket.local","password":"1234567"}'
```

**Esperado:** `400` (mínimo 8).

---

## A08 — Software or Data Integrity Failures

### A08-01 — Pay sem outcome

```bash
curl -sS -o /tmp/a08-01.json -w "%{http_code}" \
  -X POST "$API/reservations/$RID/pay" \
  -H "Authorization: Bearer $T1" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Esperado:** `400`.

### A08-02 — Segunda cobrança na mesma reserva

Depois de A06-01 (`APPROVED`):

```bash
curl -sS -o /tmp/a08-02.json -w "%{http_code}" \
  -X POST "$API/reservations/$RID/pay" \
  -H "Authorization: Bearer $T1" \
  -H "Content-Type: application/json" \
  -d '{"outcome":"APPROVED"}'
```

**Esperado:** `400` (`Reserva já possui pagamento` ou não `PENDING`).

### A08-03 — HMAC adulterado no gate

Pegar um `qrPayload` válido, alterar o último caractere da assinatura (depois do `.`), manter `eventId` certo.

```bash
curl -sS -X POST "$API/gate/validate" \
  -H "Authorization: Bearer $TG" \
  -H "Content-Type: application/json" \
  -d "{\"eventId\":\"$EID\",\"code\":\"$TAMPERED_PAYLOAD\"}"
```

**Esperado:** `result: "INVALID"` (HTTP 200 com resultado de negócio, não 500). Unit: `gate.service.spec.ts`.

---

## A09 — Security Logging and Alerting Failures

### A09-01 — 500 não vaza stack

Forçar erro só se houver rota de debug. Caso contrário, observar um 500 acidental (secret JWT missing, etc.):

**Esperado:** JSON `{ statusCode: 500, message: "Internal server error", error: "InternalServerError", path, timestamp }` **sem** `stack`.

### A09-02 — 401/429 sem PII extra

Reusar A07-01 / A07-02. **Esperado:** sem senha no body de erro; sem stack.

### A09-03 — Observação de logs

No terminal da API: login falho e 429 **não** geram `Logger.error` (F-08). 500 não-HTTP **sim**. Registrar gap de alerta; não falhar o app por isso.

---

## A10 — Mishandling of Exceptional Conditions

### A10-01 — Pay de reserva expirada

Hold de 15 min. Com reserva `PENDING` cujo `expiresAt` já passou (esperar ou ajustar relógio de teste):

```bash
curl -sS -o /tmp/a10-01.json -w "%{http_code}" \
  -X POST "$API/reservations/$RID/pay" \
  -H "Authorization: Bearer $T1" \
  -H "Content-Type: application/json" \
  -d '{"outcome":"APPROVED"}'
```

**Esperado:** `400` (`Só é possível pagar reservas PENDING não expiradas`). Sem ticket novo. Unit: `reservations.service.spec.ts`.

### A10-02 — Ticket inexistente vs de outro user

A01-01 (outro user) e:

```bash
curl -sS -o /tmp/a10-02.json -w "%{http_code}" \
  "$API/tickets/00000000-0000-4000-8000-000000000099" \
  -H "Authorization: Bearer $T1"
```

**Esperado:** **mesmo** `404` nos dois (não `403` só no alheio).

### A10-03 — Gate: código inexistente

```bash
curl -sS -X POST "$API/gate/validate" \
  -H "Authorization: Bearer $TG" \
  -H "Content-Type: application/json" \
  -d "{\"eventId\":\"$EID\",\"code\":\"00000000-0000-4000-8000-000000000099\"}"
```

**Esperado:** HTTP `200`, `result: "INVALID"`, `ticket: null`. Não 500.

### A10-04 — Gate: ticket já usado

Validar o mesmo código duas vezes (janela de porta aberta).

**Esperado:** primeira `VALID` (ou `GATE_CLOSED` se fora da janela); segunda `ALREADY_USED`. Race coberta em `gate.service.spec.ts` (`updateMany`).

### A10-05 — Gate: evento errado

`eventId` de outro evento publicado + `code` de um ticket válido.

**Esperado:** `WRONG_EVENT`. Não marca `USED`.

### A10-06 — Share token inexistente

```bash
curl -sS -o /tmp/a10-06.json -w "%{http_code}" \
  "$API/public/tickets/this-token-does-not-exist"
```

**Esperado:** `404`, mensagem genérica, sem stack.

---

## Resultado A06–A10 (preencher)

| ID | Resultado | Notas |
| --- | --- | --- |
| A06-01 | | lab F-13 |
| A06-02 | | |
| A06-03 | | |
| A06-04 | | lab F-12 |
| A07-01 | | esperar 60s depois |
| A07-02 | | |
| A07-03 | | |
| A07-04 | | |
| A07-05 | | |
| A07-06 | | |
| A07-07 | | |
| A07-08 | | |
| A08-01 | | |
| A08-02 | | |
| A08-03 | | |
| A09-01 | | |
| A09-02 | | |
| A09-03 | | gap F-08 |
| A10-01 | | |
| A10-02 | | |
| A10-03 | | |
| A10-04 | | |
| A10-05 | | |
| A10-06 | | |

---

## Já coberto por teste automatizado

Rodar: `pnpm --filter api test` e `pnpm --filter api test:e2e`.

| Caso | Teste |
| --- | --- |
| A01-04 / A01-05 / catálogo | `catalog.e2e-spec.ts`, `events.e2e-spec.ts` |
| A01-06 | `gate.e2e-spec.ts` |
| A01-01 / A01-02 | `tickets.service.spec.ts`, `reservations.service.spec.ts` |
| A02-02 / A05 | ValidationPipe nos e2e (body inválido → 400) |
| A06-02 | `payment-tickets.e2e-spec.ts` |
| A06-04 (sem userId) | `payment-tickets.e2e-spec.ts`, `tickets.service.spec.ts` |
| A07-01 | `throttler.e2e-spec.ts` |
| A07-07 | `safe-next-path` spec (web) |
| A08-03 / A10-03 / A10-04 / A10-05 | `gate.service.spec.ts` |
| A10-01 | `reservations.service.spec.ts` |

O checklist HTTP valida o **processo em pé** (seed + CORS + secrets reais), que o e2e mockado não cobre.
