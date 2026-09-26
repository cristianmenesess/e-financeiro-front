# StatCard

Implementação: [`StatCard.js`](StatCard.js) · estilos: [`data-display.css`](data-display.css) · demo: `/design-system/#statcard`.
Importe sempre pelo índice público: `import { StatCard } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
StatCard({ label: 'Saldo total', value: 'R$ 1.284.309', delta: '18,4%', caption: 'vs. mês anterior', series: serie, icon: Icon('wallet', 16) })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

The KPI unit of the dashboard. Rows of 3 or 4; on mobile, 2-up `compact`.

```jsx
<StatCard label="Saldo total" value="R$ 128.430,90" delta="18,4%" caption="vs. mês anterior" series={serie} />
```
Money is always pre-formatted pt-BR (`R$ 1.234,56`). Never put a currency symbol in `label`.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `StatCard.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** KPI tile: mono label · big mono number · signed delta · caption · optional micro-chart. */
export interface StatCardProps {
  /** Uppercase mono micro-label, e.g. "SALDO TOTAL". */
  label: string;
  /** Pre-formatted value — format money before passing it in. */
  value: React.ReactNode;
  /** Signed change, e.g. "18,4%". The arrow is added by the component. */
  delta?: string;
  /** Alias for `caption` when the caption explains the delta. */
  deltaLabel?: string;
  caption?: string;
  icon?: React.ReactNode;
  series?: number[];
  /** @default "spark" */
  seriesType?: "spark" | "bars";
  /** Drives delta colour and chart tone. @default "positive" */
  tone?: "positive" | "negative";
  /** Tighter padding + smaller number, for 4-up rows and mobile. */
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function StatCard(props: StatCardProps): JSX.Element;
```
