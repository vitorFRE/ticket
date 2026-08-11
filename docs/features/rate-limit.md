# Feature: Rate limit da API

Limite por IP (`req.ip`) com [`@nestjs/throttler`](https://docs.nestjs.com/security/rate-limiting). Guard global, storage em memória (uma instância). Sem Redis neste passo.

## Limites

TTL de 60s. Constantes em `apps/api/src/common/throttler/throttler.config.ts`.

| Nome | Limite | Onde |
|------|--------|------|
| `default` | 120 / 60s | Rotas sem preset especial |
| `auth` | 10 / 60s | `POST /auth/login`, `/auth/register`, `/auth/refresh` |
| `catalog` | 30 / 60s | `GET /catalog/*` (proxy TMDb / Ticketmaster) |
| `gate` | 60 / 60s | `POST /gate/validate` |
| health | skip | `GET /health` (`@SkipThrottle()`) |

`me` e `logout` usam o default. Rotas `auth` / `catalog` / `gate` pulam o default para não somar dois contadores.

## Resposta 429

`ThrottlerException` é `HttpException`. O [`AllExceptionsFilter`](../../apps/api/src/common/filters/all-exceptions.filter.ts) devolve o contrato usual:

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "ThrottlerException",
  "path": "/auth/login",
  "timestamp": "2026-08-11T18:00:00.000Z"
}
```

Headers `X-RateLimit-*` / `Retry-After` seguem o padrão do Throttler.

## Proxy (produção)

Em `NODE_ENV === production`, `main.ts` liga `trust proxy` (1 hop) para o IP vir de `X-Forwarded-For` (Railway / Vercel). Sem isso, o limite agrupa todo mundo no IP do proxy.

## Memória vs Redis

O storage padrão é in-memory. Serve para uma instância. Com várias réplicas o contador não é compartilhado: cada processo tem o próprio teto. Redis fica para um passo seguinte, se o deploy for horizontal.

## Fora de escopo

Sem captcha. Sem mudança de contrato das rotas. Sem rate limit no Next.
