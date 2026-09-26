# BarTicks

Implementação: [`BarTicks.js`](BarTicks.js) · estilos: [`charts.css`](charts.css) · demo: `/design-system/#barticks`.
Importe sempre pelo índice público: `import { BarTicks } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
BarTicks({ data: serie, tone: 'brand', height: 32 })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Texture strip at the foot of a KPI card — signals activity, not exact values.

```jsx
<BarTicks data={dias} tone="violet" />
```
Never label its axes; if the values matter use `Sparkline` or `AreaChart`.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `BarTicks.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Dense micro bar strip used along the bottom edge of KPI cards. Decorative density, not a readable chart. */
export interface BarTicksProps {
  data: number[];
  /** @default 34 */
  height?: number;
  /** @default 3 */
  gap?: number;
  /** @default "positive" */
  tone?: "positive" | "brand" | "violet" | "blue" | "negative";
  style?: React.CSSProperties;
}
export declare function BarTicks(props: BarTicksProps): JSX.Element;
```
