# TabBar

Implementação: [`TabBar.js`](TabBar.js) · estilos: [`navigation.css`](navigation.css) · demo: `/design-system/#tabbar`.
Importe sempre pelo índice público: `import { TabBar } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
TabBar({ items: abasMobile, active: 'overview', onSelect: navegar })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Mobile root navigation — exactly the top 5 destinations, "Mais" last.

```jsx
<TabBar items={[{id:"home",label:"Início",icon:<i data-lucide="home"></i>}, …]} active={tab} onSelect={setTab} />
```
Pinned to the bottom of the device frame, above the home indicator.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `TabBar.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

export interface TabBarItem { id: string; label: string; icon?: React.ReactNode }

/** Mobile bottom navigation. Frosted, 5 items max, active item gets a soft teal pill behind the glyph. */
export interface TabBarProps {
  items: TabBarItem[];
  active?: string;
  onSelect?: (id: string) => void;
  style?: React.CSSProperties;
}
export declare function TabBar(props: TabBarProps): JSX.Element;
```
