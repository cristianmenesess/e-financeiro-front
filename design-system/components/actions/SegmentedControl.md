# SegmentedControl

Implementação: [`SegmentedControl.js`](SegmentedControl.js) · estilos: [`actions.css`](actions.css) · demo: `/design-system/#segmentedcontrol`.
Importe sempre pelo índice público: `import { SegmentedControl } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
SegmentedControl({ options: ['1D', '1S', '1M', '3M', '1A', 'TUDO'], value: '1M', onChange: function (valor) { desenharGrafico(valor); } })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Time-range and scope switcher above charts. Labels are monospaced and short.

```jsx
<SegmentedControl options={["1D","1S","1M","3M","1A","TUDO"]} value={range} onChange={setRange} />
```

Use `fullWidth` on mobile so the whole row is tappable. For view switching with
longer labels use `Tabs` instead.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `SegmentedControl.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

export interface SegmentedOption { value: string; label: string }

/** Pill range/period switcher — 1D · 1S · 1M · 3M · 1A · TUDO. Monospaced by design. */
export interface SegmentedControlProps {
  options: Array<SegmentedOption | string>;
  value: string;
  onChange?: (value: string) => void;
  /** @default "md" */
  size?: "sm" | "md";
  fullWidth?: boolean;
  style?: React.CSSProperties;
}
export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
```
