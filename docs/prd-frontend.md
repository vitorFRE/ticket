# PRD — Frontend ticketim (`apps/web`)

**Produto:** ticketim  
**Escopo:** implementação do Next.js App Router sobre a API Nest já existente  
**Status:** guia de implementação (API MVP pronta; web F1–F7 fechado; README/deploy pendente)  
**Stack web:** Next.js 16, React 19, Tailwind v4, Phosphor, Bearer JWT (localStorage), pnpm

Documento irmão: [prd.md](./prd.md) (produto completo).  
Fatias de API: [docs/features/](./features/).

---

## 1. Contexto

A API cobre auth, catálogo, eventos/inventário, reservas, pagamento simulado, tickets/QR/share e gate. O web do MVP (F1–F7) está fechado: detalhe, checkout, pay, tickets, organizador, portaria e shell/roles. README/deploy ficam no passo 8 do PRD raiz.

Marca e visual: **ticketim**, dark + âmbar, glass cards, header pill, login com imagem de plateia.

---

## 2. Personas e acesso no front

| Role | Após login | Pode |
|------|------------|------|
| `CLIENT` | `/` ou `/tickets` | Ver eventos, reservar, pagar, ver/compartilhar ingressos |
| `ORGANIZER` | `/organizer/events` | Buscar catálogo, criar/editar draft, publicar, listar meus eventos |
| `GATE` | `/gate` | Escolher evento, validar QR/código |

**Regras de navegação**

1. Login bem-sucedido redireciona por role (tabela acima).
2. Rotas `/organizer/*` exigem `ORGANIZER`; `/gate` exige `GATE`; checkout/tickets exigem `CLIENT`.
3. Visitante não autenticado vê `/` e `/events/[id]`; ações de reserva pedem login com return URL.
4. Header adapta CTAs: Entrar / Meus ingressos / Área org / Portaria / Sair.

Seed (senha `Password123!`): `client1@` / `client2@` / `organizer@` / `gate@` → `ticket.local`.

---

## 3. Design system (já em uso — manter)

- Dark-first, primary âmbar (`oklch` ~75), ambient + grain
- Header flutuante `rounded-full`, cards glass (`rounded-[2rem]`)
- Ícones: `@phosphor-icons/react` apenas
- Motion leve (reveal / hover); debounce em buscas
- Sem register UI no MVP; sem cookies httpOnly nesta fase
- Copy em PT-BR, clara, sem jargão

Novas telas devem reutilizar `glass-styles`, tokens de `globals.css` e padrões de `events-home` / login.

---

## 4. Mapa de rotas alvo

```
/                         # público — lista eventos (feito)
/login                    # guest — login (feito)
/events/[id]              # público — detalhe + CTA reservar
/events/[id]/checkout     # CLIENT — escolher assentos OU setor+qtd → cria reservation
/reservations/[id]/pay    # CLIENT — pagamento simulado APPROVED | REJECTED
/tickets                  # CLIENT — meus ingressos
/tickets/[id]             # CLIENT — detalhe + QR + share
/t/[token]                # público — ingresso compartilhado

/organizer/events         # ORGANIZER — meus eventos
/organizer/events/new     # ORGANIZER — wizard catálogo → inventário → criar
/organizer/events/[id]    # ORGANIZER — detalhe draft/publicado + publish/edit

/gate                     # GATE — selecionar evento + validar
```

API paths reais (não usar drafts do PRD antigo): `/reservations/mine`, `/tickets/mine`, `/events/mine`.

---

## 5. Fatias de implementação (ordem)

Cada fatia: rotas + client API + UI + estados (loading / empty / error) + aceite manual. Preferir PRs pequenos por fatia.

### F1 — Detalhe do evento (base CLIENT)

**Por quê:** o stub bloqueia o resto do funil.

| Item | Detalhe |
|------|---------|
| Rota | `/events/[id]` |
| API | `GET /events/:id` |
| UI | Poster, título, venue, data, preço, modo (`SEAT_MAP` / `GA_SECTOR`), descrição; CTA “Reservar” |
| Auth | CTA: se guest → `/login?next=/events/[id]/checkout`; se CLIENT → checkout; outros roles veem detalhe sem reservar |

**Aceite:** abrir evento seed/publicado mostra dados reais; imagem quando `imageUrl` existe.

---

### F2 — Checkout / reserva

**Por quê:** fecha hold de inventário.

| Item | Detalhe |
|------|---------|
| Rota | `/events/[id]/checkout` (`CLIENT`) |
| API | `GET /events/:id/seats` ou `/sectors`; `POST /reservations` |
| UI SEAT_MAP | Grade de assentos com status (`AVAILABLE` selecionável; `HELD`/`SOLD` bloqueados); multi-select; confirma hold |
| UI GA_SECTOR | Lista setores + `availableCount`; stepper de quantidade; confirma hold |
| Pós-sucesso | Redirect `/reservations/[id]/pay` |
| Erros | 409 estoque → mensagem clara “já foi reservado”; hold 15 min avisado na UI |

**Aceite:** CLIENT segura assento(s) ou setor+qtd; segundo CLIENT no mesmo inventário vê indisponível / 409 tratado.

---

### F3 — Pagamento simulado

**Por quê:** gera (ou não) tickets.

| Item | Detalhe |
|------|---------|
| Rota | `/reservations/[id]/pay` (`CLIENT`, owner) |
| API | `GET /reservations/:id`; `POST /reservations/:id/pay` `{ outcome }` |
| UI | Resumo da reserva + timer/`expiresAt`; botões **Confirmar pagamento** / **Simular rejeição** |
| Sucesso APPROVED | Vai para `/tickets` ou `/tickets/[id]` do primeiro ticket |
| REJECTED | Mensagem + inventário liberado; CTA voltar ao evento |

**Aceite:** fluxo aprovado cria ingresso; rejeitado não cria; reserva expirada bloqueia pay com copy clara.

---

### F4 — Meus ingressos + share público

**Por quê:** critérios de QR e link público.

| Item | Detalhe |
|------|---------|
| Rotas | `/tickets`, `/tickets/[id]`, `/t/[token]` |
| API | `GET /tickets/mine`, `GET /tickets/:id`, `POST /tickets/:id/share`, `GET /public/tickets/:token` |
| UI lista | Cards com evento, status (`VALID`/`USED`), atalho detalhe |
| UI detalhe | QR a partir de `qrPayload` (lib `qrcode` ou similar no client); código opaco; botão compartilhar → copia `url` |
| UI pública `/t/[token]` | Sem auth; evento/assento/setor/status; sem dados de usuário |

**Aceite:** QR legível; share abre sem login; ingresso `USED` aparece claramente.

---

### F5 — Organizador

**Por quê:** criar a partir de TMDb e Ticketmaster.

| Item | Detalhe |
|------|---------|
| Rotas | `/organizer/events`, `/organizer/events/new`, `/organizer/events/[id]` |
| API | catalog search/detail; `POST /events`; `PATCH /events/:id`; `POST /events/:id/publish`; `GET /events/mine` |
| Wizard new | 1) fonte TMDb \| Ticketmaster + busca 2) escolher item 3) venue/startsAt se faltarem 4) modo inventário + config (grade ou setores) 5) criar draft |
| Lista | Drafts vs publicados; ação publicar |
| Detalhe | Metadados; publish se `DRAFT` |

**Aceite:** org cria 1 evento TMDb `SEAT_MAP` e 1 Ticketmaster `GA_SECTOR`, publica, aparecem em `/`.

---

### F6 — Portaria (Gate)

**Por quê:** validação na porta.

| Item | Detalhe |
|------|---------|
| Rota | `/gate` (`GATE`) |
| API | `GET /events` (contexto); `POST /gate/validate` |
| UI | Select/lista do evento ativo; campo manual de código/`qrPayload`; botão validar |
| Câmera | MVP: input de câmera / scan lib leve **ou** colar payload do QR; mesmo endpoint |
| Feedback | Telas/estados grandes e óbvios: válido (verde), inválido, já usado, evento errado |

**Aceite:** VALID → USED; segunda leitura ALREADY_USED; outro eventId → WRONG_EVENT; payload adulterado → INVALID.

---

### F7 — Shell, redirects e polish

| Item | Detalhe |
|------|---------|
| Redirect pós-login por role | Ver §2 |
| Header por role | Links corretos; mobile ok |
| Guards client | Layouts `(organizer)`, `(gate)`, `(client)` ou checks em page |
| Empty/error | Padrão visual único |
| Doc | Atualizar `docs/features/web-*.md` por fatia |

**Fora desta fatia (produto §8):** README final, deploy Vercel, seed extra — podem ficar no passo global 8 do PRD raiz.

---

## 6. Contratos API (referência rápida)

| Ação | Método | Path | Role |
|------|--------|------|------|
| Login | POST | `/auth/login` | public |
| Me | GET | `/auth/me` | auth |
| Eventos públicos | GET | `/events?q=` | public |
| Evento | GET | `/events/:id` | public* |
| Seats / sectors | GET | `/events/:id/seats` \| `/sectors` | public* |
| Criar reserva | POST | `/reservations` | CLIENT |
| Minhas reservas | GET | `/reservations/mine` | CLIENT |
| Pagar | POST | `/reservations/:id/pay` | CLIENT |
| Meus tickets | GET | `/tickets/mine` | CLIENT |
| Share | POST | `/tickets/:id/share` | CLIENT |
| Ticket público | GET | `/public/tickets/:token` | public |
| Catalog search | GET | `/catalog/tmdb/search` \| `/ticketmaster/search` | ORGANIZER |
| Criar evento | POST | `/events` | ORGANIZER |
| Meus eventos | GET | `/events/mine` | ORGANIZER |
| Publish | POST | `/events/:id/publish` | ORGANIZER |
| Validar gate | POST | `/gate/validate` | GATE |

\*conforme guards atuais da API (publicado / regras de 404).

Clients web: espelhar padrão `features/*/api/*-api.ts` + `authorizedFetch` onde precisar Bearer.

---

## 7. Critérios de aceite do front (rollup)

- [x] Detalhe de evento real (não stub)
- [x] CLIENT: SEAT_MAP reserva → pay APPROVED → ticket com QR
- [x] CLIENT: GA_SECTOR reserva → pay APPROVED
- [x] CLIENT: pay REJECTED sem ticket
- [x] Share `/t/[token]` sem login
- [x] ORGANIZER: criar via TMDb e via Ticketmaster + publish
- [x] GATE: VALID / INVALID / ALREADY_USED / WRONG_EVENT (manual; câmera se der tempo)
- [x] Redirect e nav por role
- [x] UI consistente com ticketim (âmbar/dark/glass), usabilidade simples (debounce, feedback de foco, erros claros)

---

## 8. Fora de escopo (front)

- Register / forgot password
- Cancelamento com estorno
- Analytics do organizador
- Mapa realtime / websocket
- App nativo
- Troca para cookies httpOnly (possível pós-MVP)
- Testes e2e web automatizados (desejável se sobrar tempo)

---

## 9. Ordem sugerida de PRs

1. **F1** Detalhe evento  
2. **F2** Checkout reserva  
3. **F3** Pay simulado  
4. **F4** Tickets + QR + share  
5. **F5** Organizador  
6. **F6** Gate  
7. **F7** Shell/roles polish + docs web  

Dependência forte: F1 → F2 → F3 → F4. F5 e F6 podem paralelizar após F1 (F6 só precisa eventos publicados).

---

## 10. Como o avaliador percorre (happy path)

1. Abrir web → ver eventos em `/`  
2. Login `client1@ticket.local` → detalhe → reservar → confirmar pagamento → ver QR em Meus ingressos → share  
3. Login `organizer@ticket.local` → criar evento TMDb + Ticketmaster → publicar  
4. Login `gate@ticket.local` → selecionar evento → validar código/QR (válido depois já usado)

Env: `NEXT_PUBLIC_API_URL=http://localhost:3001`, API com seed (+ opcional `node apps/api/scripts/populate-demo-events.mjs`).

---

## Apêndice — estado no momento deste doc

| Área | API | Web |
|------|-----|-----|
| Auth | OK | Login OK |
| Lista eventos | OK | OK |
| Detalhe / checkout / pay / tickets | OK | OK (F1–F4) |
| Organizador | OK | OK (F5) |
| Gate | OK | OK (F6) |
| Shell / roles | — | OK (F7) |
| README / deploy | Parcial | Pendente |
