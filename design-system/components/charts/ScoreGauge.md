# ScoreGauge

Implementação: [`ScoreGauge.js`](ScoreGauge.js) · estilos: [`charts.css`](charts.css) · demo: `/design-system/#scoregauge`.
Importe sempre pelo índice público: `import { ScoreGauge } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
ScoreGauge({ value: 78, label: '/100', caption: 'boa · liquidez confortável', tone: 'positive' })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

One composite score, nothing else. Reserved for saúde/risco panels and the watch face.

```jsx
<ScoreGauge value={72} label="/100" caption="saúde da carteira" tone="positive" />
```

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `ScoreGauge.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** 270° arc gauge for single composite scores (saúde financeira, score de risco). */
export interface ScoreGaugeProps {
  value: number;
  /** @default 100 */
  max?: number;
  /** @default 160 */
  size?: number;
  /** Small mono line under the number, e.g. "/100". */
  label?: string;
  caption?: string;
  /** @default "brand" */
  tone?: "brand" | "positive" | "warning" | "negative";
  style?: React.CSSProperties;
}
export declare function ScoreGauge(props: ScoreGaugeProps): JSX.Element;
```
