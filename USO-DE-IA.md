# Uso de IA

Usei **Cursor** de forma deliberada: não colei o PDF e aceitei o resultado.

Resumo também no [README](./README.md).

## Como trabalhei

Eu defino a etapa e as restrições → a IA implementa → eu reviso, ajusto e cubro com teste antes de seguir.

Planejamento por etapas (PRD → features → UI) ficou versionado em [`docs/`](docs/). Isso documenta _por que_ a tela ou a API é assim, não só o que o código faz.

## Na mão

- Estrutura inicial do monorepo (`pnpm` workspaces + Turborepo)
- Pastas `apps/api` e `apps/web`
- Organização por features no front
- Workspace e scripts unificados

## Com IA (Cursor)

- PRD e recortes de feature
- Implementação NestJS / Next / Prisma
- Auth JWT, reserva, pagamento simulado, QR, portaria
- Área do organizador e catálogo TMDb / Ticketmaster
- UI ticketim (a partir das decisões de tom que eu defini)
- Testes (Jest, Vitest, Playwright) e polimento
- Revisão OWASP Top 10:2025 e correções pontuais

## Sempre meu

- Escopo do que entra ou fica de fora
- Tom visual (ticketim coral; tema claro default)
- Regras de hold / lock no checkout
- Lab do avaliador (contas seed, atalhos cinema / show / org / portaria)
- Pagamento só simulado, sem cadastro / forgot password (conforme o enunciado)

## Testes

Como boa parte do código passou pela IA, cada etapa relevante ganhou teste: unit na API, componentes no web, e2e no fluxo crítico (reserva → pay → ingresso). Objetivo: pegar regressão cedo — inventário duplicado, validação de portaria, auth por role — em vez de descobrir na demo.

```bash
pnpm test
pnpm --filter web test:e2e
```

## Docs de processo

| Doc                                                | Para quê                                    |
| -------------------------------------------------- | ------------------------------------------- |
| [docs/prd.md](docs/prd.md)                         | PRD                                         |
| [docs/prd-frontend.md](docs/prd-frontend.md)       | Etapas do web                               |
| [docs/decisoes-ux.md](docs/decisoes-ux.md)         | Regras de produto na UI                     |
| [docs/security/README.md](docs/security/README.md) | OWASP (o que foi achado e o que já corrigi) |
