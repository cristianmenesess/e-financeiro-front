# Sparkline

Implementação: [`Sparkline.js`](Sparkline.js) · estilos: [`charts.css`](charts.css) · demo: `/design-system/#sparkline`.
Importe sempre pelo índice público: `import { Sparkline } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
Sparkline({ data: serie, width: 80, height: 26, tone: 'negative', dot: true })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Trend line at row and card scale. Tone must match the sign of the change.

```jsx
<Sparkline data={serie} tone={delta >= 0 ? "positive" : "negative"} width={140} height={36} dot />
```
No axes, no labels — if the reader needs values, use `AreaChart`.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Sparkline.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/**
 * Inline trend line for table rows, stat cards and watchlists.
 */
export interface SparklineProps {
  /** Raw series — the component normalises to its own box. */
  data: number[];
  width?: number;
  height?: number;
  /** @default "positive" */
  tone?: "positive" | "negative" | "brand" | "violet";
  /** Soft gradient under the line. @default true */
  fill?: boolean;
  /** Dot on the last point. @default false */
  dot?: boolean;
  strokeWidth?: number;
  style?: React.CSSProperties;
}
export declare function Sparkline(props: SparklineProps): JSX.Element;
```
