# AreaChart

Implementação: [`AreaChart.js`](AreaChart.js) · estilos: [`charts.css`](charts.css) · demo: `/design-system/#areachart`.
Importe sempre pelo índice público: `import { AreaChart } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
AreaChart({ data: serie, height: 240, xLabels: ['1 SET', '15 SET', '29 SET'], formatY: function (v) { return (v / 1000).toFixed(1) + 'M'; } })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

The hero chart inside a portfolio/balance card. Scales fluidly to its container.

```jsx
<AreaChart data={serie} height={220} xLabels={["1 MAI","8 MAI","15 MAI","22 MAI","29 MAI"]} formatY={v => (v/1000).toFixed(0)+"k"} />
```
One series only. For comparisons stack two cards side by side instead.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `AreaChart.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Primary performance chart: single series, gradient fill, right-hand y ticks, mono x labels. */
export interface AreaChartProps {
  data: number[];
  width?: number;
  height?: number;
  /** @default "positive" */
  tone?: "positive" | "negative" | "brand" | "violet";
  /** Mono labels along the bottom axis, evenly spaced. */
  xLabels?: string[];
  /** @default 5 */
  yTicks?: number;
  /** Formats the right-hand tick values. */
  formatY?: (v: number) => string | number;
  /** @default true */
  grid?: boolean;
  style?: React.CSSProperties;
}
export declare function AreaChart(props: AreaChartProps): JSX.Element;
```
