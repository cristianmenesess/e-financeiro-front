# TopBar

Implementação: [`TopBar.js`](TopBar.js) · estilos: [`navigation.css`](navigation.css) · demo: `/design-system/#topbar`.
Importe sempre pelo índice público: `import { TopBar } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
TopBar({ breadcrumb: 'Visão geral', title: 'Painel financeiro', search: SearchField({ width: 280 }), actions: [botaoExportar, botaoNovo] })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

One per screen, directly above the content grid.

```jsx
<TopBar breadcrumb="Visão geral" title="Painel financeiro"
  search={<SearchField width={300} />} actions={<><Button variant="secondary" size="sm">Exportar</Button><IconButton label="Alertas"><i data-lucide="bell"></i></IconButton></>} />
```
Frosted glass over the canvas — never a solid white bar.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `TopBar.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Sticky frosted page header: breadcrumb · title · search · actions. */
export interface TopBarProps {
  title?: string;
  subtitle?: string;
  /** Uppercase mono context line above the title. */
  breadcrumb?: string;
  actions?: React.ReactNode;
  /** A `SearchField`, placed before the actions. */
  search?: React.ReactNode;
  /** @default true */
  sticky?: boolean;
  style?: React.CSSProperties;
}
export declare function TopBar(props: TopBarProps): JSX.Element;
```
