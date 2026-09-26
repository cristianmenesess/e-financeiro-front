# Tabs

Implementação: [`Tabs.js`](Tabs.js) · estilos: [`navigation.css`](navigation.css) · demo: `/design-system/#tabs`.
Importe sempre pelo índice público: `import { Tabs } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
Tabs({ value: 'todas', items: [{ value: 'todas', label: 'Todas', count: 8 }, { value: 'entradas', label: 'Entradas' }], onChange: filtrar })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Switching between comparable content sets inside one view.

```jsx
<Tabs items={[{value:"todas",label:"Todas",count:128},{value:"entradas",label:"Entradas"}]} value={tab} onChange={setTab} />
```
For time ranges use `SegmentedControl` instead.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Tabs.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

export interface TabItem { value: string; label: string; count?: number }

/** Underlined section tabs inside a card or page. Teal 2px indicator. */
export interface TabsProps {
  items: Array<TabItem | string>;
  value: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): JSX.Element;
```
