# SidebarNav

Implementação: [`SidebarNav.js`](SidebarNav.js) · estilos: [`navigation.css`](navigation.css) · demo: `/design-system/#sidebarnav`.
Importe sempre pelo índice público: `import { SidebarNav } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
SidebarNav({ logo: logo, items: itens, active: 'overview', onSelect: navegar, footer: UserChip({ name: 'Ana Ribeiro', meta: 'Plano Premium' }) })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Desktop primary nav. Max 8 items; Configurações always last.

```jsx
<SidebarNav logo={<img src="assets/logo-lockup.png" height="26" alt="E-Financeiro" />}
  items={nav} active={view} onSelect={setView} footer={<UserChip name="Ana Ribeiro" meta="Plano Premium" />} />
```
Below 1024px hide it and switch to `TabBar`.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `SidebarNav.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

export interface SidebarNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Right-aligned `Badge` for counts. */
  badge?: React.ReactNode;
}

/**
 * Desktop primary navigation: white rail, mark at the top, account chip at the foot.
 * The active item gets a teal 3px edge marker plus a sunken pill — never a filled bar.
 *
 * @startingPoint section="Navigation" subtitle="Rail lateral, top bar e tab bar mobile" viewport="700x380"
 */
export interface SidebarNavProps {
  /** The E-Financeiro lockup (`assets/logo-lockup.png`) or mark when collapsed. */
  logo?: React.ReactNode;
  items: SidebarNavItem[];
  active?: string;
  onSelect?: (id: string) => void;
  /** Usually a `UserChip`. */
  footer?: React.ReactNode;
  /** Icon-only 76px rail. */
  collapsed?: boolean;
  style?: React.CSSProperties;
}
export declare function SidebarNav(props: SidebarNavProps): JSX.Element;

export interface NavItemProps extends SidebarNavItem { active?: boolean; collapsed?: boolean; onClick?: () => void }
export declare function NavItem(props: NavItemProps): JSX.Element;
```
