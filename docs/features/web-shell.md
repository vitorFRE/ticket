# Feature: Web shell

Redirects, guards de role e estados vazios do App Router.

## Após login

| Role | Sem `?next=` | Com `?next=` interno |
|------|--------------|----------------------|
| `CLIENT` | `/` | o path |
| `ORGANIZER` | `/organizer/events` | o path |
| `GATE` | `/gate` | o path |

`safeNextPath` rejeita URLs externas. Login já autenticado segue a mesma regra (`homeForRole` se não houver `next`).

## Guards

`useRequireRole(role)`:

- guest → `/login?next=`
- role errada → `/`

Layouts:

- `(site)/organizer/layout` → `ORGANIZER`
- `(site)/gate/layout` → `GATE`

Checkout, pay e tickets (`CLIENT`) chamam o hook nas pages. Rotas org/gate não repetem o guard.

## Header

| Role | Link (só fora da área) |
|------|------|
| `CLIENT` | Ingressos |
| `ORGANIZER` | Área org |
| `GATE` | Portaria |

Barra `sticky` no topo, em fluxo (não pílula flutuante). O link da área é uma pílula. Na própria área ele some (não compete com o título). O nome da conta não vai no header: contas seed tipo “Portaria Seed” colavam no link. **Sair** fica só ícone no `xs`.

## Empty / erro

`PageState` (título + texto, sem caixa de alerta) em falha de rede e listas vazias. Erros de formulário e 409 ficam inline.

## Fora

README final e deploy (passo 8 do PRD raiz).
