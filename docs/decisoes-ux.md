# Decisões de UX (web)

Registro das regras de produto pedidas na implementação do checkout e do pagamento simulado. Não é o PRD: é o “porquê” das escolhas que a UI precisa respeitar.

Relacionado: [features/web-auth-events.md](./features/web-auth-events.md), [features/web-gate.md](./features/web-gate.md), [features/web-shell.md](./features/web-shell.md), [prd-frontend.md](./prd-frontend.md).

## Hold pendente

Depois de `POST /reservations`, os lugares ficam `HELD` por 15 minutos. Voltar no browser não cancela o hold. Sem aviso, a pessoa perde o caminho de pagamento e o mapa parece livre (ou os assentos dela aparecem ocupados).

| Onde | O que mostrar |
|------|----------------|
| `/events/[id]` | Lembrete mínimo: assentos + timer + link **Pagar**. O botão **Reservar** continua, para ir ao mapa. |
| `/events/[id]/checkout` | Lembrete em destaque (timer grande, copy de perda, **Pagar agora**). |
| `/reservations/[id]/pay` | Timer grande à direita. Copy: se não pagar, os lugares voltam à lista. |

## Lock do inventário

Se existir reserva `PENDING` **deste evento** (ainda não expirada):

- Não dá para selecionar outros assentos nem outro setor.
- Assentos do hold aparecem como **Seu hold**, não como ocupado de terceiros.
- O rodapé do mapa mostra os itens do hold + total + **Pagar agora**.
- **Confirmar reserva** some. Não criar um segundo hold em cima do primeiro.
- Só libera de novo depois de pagar, recusar ou expirar.

Fonte: `GET /reservations/mine`, filtro `status === PENDING` e `eventId` atual.

## Pagamento simulado

A tela de pay precisa parecer checkout, não um stub vazio.

- Mini formulário de cartão **preenchido e travado** (nome do cliente, `4242 4242 4242 4242`, validade, CVC). Não é editável. Copy: cartão de teste, nada é cobrado.
- Ações: **Confirmar pagamento** (`APPROVED`) e **Simular rejeição** (`REJECTED`) como texto secundário.
- `APPROVED` → `/tickets/[id]` (stub F4).
- `REJECTED` e expirado **não** ficam no canto. Viram o título da tela (“Pagamento recusado” / “A reserva expirou”), com recibo e CTA **Escolher de novo**.
- Recusado: deixar claro que os lugares voltaram à lista e que ninguém foi cobrado.

## Setores (show / GA)

A quantidade não pode ficar solta no fim da lista. Fica **dentro da linha do setor escolhido** (“Quantidade neste setor”), para não parecer da Pista quando o Camarote está ativo.

- Preço âmbar só no setor selecionado
- Rodapé: `Camarote x 2`, não só o nome
- Trocar de setor zera a quantidade para 1 (já no checkout)

## Header

Barra fixa no topo (`sticky`), em fluxo. Não flutua sobre o hero nem usa a pílula `rounded-full` do shell antigo. O conteúdo começa abaixo dela.

## Tom visual

Manter o editorial do ticketim (dark, âmbar, sem card de vidro extra):

- Hold no detalhe do evento = uma linha, não um widget no lugar do Reservar.
- Hold no checkout = o bloco forte.
- Status de recusa/expirado = tipografia grande no fluxo, sem alerta vermelho de canto.

## Lab (avaliador)

Widget flutuante no canto inferior direito, sempre visível neste teste. Não é produto: é atalho para trocar as contas seed, ver a sessão e pular para cinema / show / área org.

- Fecha e abre sem recarregar; o estado fica na sessão do browser.
- Trocar de conta faz login com `Password123!` e manda para a home do papel (org → `/organizer/events`, portaria → `/gate`).
- Senha e URL da API ficam no rodapé do painel, em mono, sem cartão extra.

## Cartaz (filme vs show)

Na home o filtro não é o modo de inventário. Filme = origem TMDb. Show = origem Ticketmaster. A URL usa `?kind=filme|show`.

- **Próximos**: data mais perto.
- **Populares**: mais `ticketsSold`. Some se ninguém comprou ainda.
- Com busca (`?q=`), a grade vira uma lista só de **Resultados**.
- No card e no detalhe, o selo é Filme / Show, não Assentos / Setores.
- Rodapé do site: crédito obrigatório do TMDb e da Ticketmaster Discovery, sem afiliação.

## Ingressos

`/tickets` não mistura válido com usado. Abas no mesmo tom do filtro da home:

- **Válidos**: ainda podem entrar. Ordenados pela data da sessão.
- **Usados**: `USED` e `VOID`. Histórico da porta.
- **Pagamentos**: `GET /reservations/mine`. Pendente leva ao pay; pago leva ao ingresso.

A URL usa `?tab=usados` ou `?tab=pagamentos`. Sem `tab` é válidos.

## Portaria

A porta precisa de feedback imediato e grande, no mesmo espírito do pay recusado: o resultado é o título, não um toast.

- Evento fica no contexto (sessão). Trocar não perde a tela.
- `VALID` é o único estado colorido (verde). Os outros são tipografia.
- Scan é a câmera ao vivo (PC e telemóvel). Colar código é reserva.
- O QR do ingresso é o UUID curto. O payload HMAC continua válido se alguém colar.
- **Próximo** religa a câmera. O evento não se perde.
