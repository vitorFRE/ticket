# OWASP Top 10:2025

Revisão estática de `apps/api` (NestJS) e `apps/web` (Next.js). Referência: [OWASP Top 10:2025](https://owasp.org/Top10/2025/).

Não há IDOR clássico: ticket, reserva e evento mutável só o dono vê (404 para o resto). Roles (`CLIENT` / `ORGANIZER` / `GATE`) valem na API, não só na UI. Prisma é parametrizado. Catálogo TMDb/Ticketmaster usa hosts fixos (sem SSRF). Erro 500 não vaza stack para o cliente.

Pay simulado (`outcome` no body), share público com `code` e contas seed do Lab (`Password123!`) são do desafio — não entram como achado.

## Resolvido

**F-01 — secrets JWT/HMAC (A02 / A04)**  
Auth e QR liam `JWT_ACCESS_SECRET` direto do env; o fallback do `envConfig` (`jwt.accessSecret`) não era usado. Sem env em dev, o sign virava 500. Agora tudo passa por `getOrThrow` nas chaves aninhadas. Em produção, secret ausente ou fraco impede o boot. Spec: `apps/api/src/config/env.config.spec.ts`.

**F-02 — refresh sem checar conta (A07)**  
Login recusava `isActive === false`, mas o refresh renovava a sessão (~7d) e a role vinha do JWT velho. Agora o refresh valida o hash, recusa conta inativa (`401 Conta desativada`), zera o refresh no DB e assina com email/role atuais. Access em curso (~15m) ainda vale até expirar. Spec: `apps/api/src/modules/auth/auth.service.spec.ts`.

## Aberto

| ID | O quê | Notas |
| --- | --- | --- |
| F-03 | JWT no `localStorage` | MVP do PRD. XSS no origin = takeover. Cookies httpOnly é o passo grande. |
| F-04 | API sem Helmet | Falta `nosniff`, `X-Frame-Options`, HSTS em prod. Cuidado com CORP vs CORS (`:3000` → `:3001`). |
| F-05 | Next sem CSP / headers | Mesmo conjunto no `next.config.ts`. Combina com F-03. |
| F-07 | Sem CI | Não tem `.github/workflows`. |
| F-18 | `pnpm audit` | 4 high + 2 moderate, transitivos do Next (PostCSS/sharp). |

## Próximo

Headers (F-04 + F-05), depois CI/audit, depois cookies se sair do MVP.
