# DonutChart

Implementação: [`DonutChart.js`](DonutChart.js) · estilos: [`charts.css`](charts.css) · demo: `/design-system/#donutchart`.
Importe sempre pelo índice público: `import { DonutChart } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
DonutChart({ data: alocacao, centerLabel: 'Total', centerValue: 'R$ 4,22M' })
DonutLegend({ data: alocacao })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Asset/category allocation. Always paired with `DonutLegend` on the right.

```jsx
<DonutChart data={aloc} centerLabel="Total" centerValue="R$ 4,22M" />
<DonutLegend data={aloc} />
```
Slice colours follow `--series-1..6` in order unless you pass `color`.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `DonutChart.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

export interface DonutSlice { label: string; value: number; color?: string; precise?: boolean }

/** Allocation ring with the signature aurora bloom behind it and a floating white hub. */
export interface DonutChartProps {
  data: DonutSlice[];
  /** @default 200 */
  size?: number;
  /** Ring stroke width. @default 14 */
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  /** The blurred multi-colour wash behind the ring. @default true */
  aurora?: boolean;
  style?: React.CSSProperties;
}
export declare function DonutChart(props: DonutChartProps): JSX.Element;

/** Companion legend: dot · label · percentage. Sits to the right of the ring. */
export interface DonutLegendProps { data: DonutSlice[]; style?: React.CSSProperties }
export declare function DonutLegend(props: DonutLegendProps): JSX.Element;
```
