# ProgressBar

Implementação: [`ProgressBar.js`](ProgressBar.js) · estilos: [`feedback.css`](feedback.css) · demo: `/design-system/#progressbar`.
Importe sempre pelo índice público: `import { ProgressBar } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
ProgressBar({ label: 'Pessoal', value: 89, valueLabel: 'R$ 186.400 / R$ 210.000', tone: 'warning' })
ProgressBar({ label: 'Confiança do modelo', value: 91, tone: 'ai', dotted: true })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Budgets and goals. Switch `tone` to `warning` past 80% and `negative` past 100%.

```jsx
<ProgressBar label="Alimentação" valueLabel="R$ 820 / R$ 1.000" value={82} tone="warning" />
<ProgressBar value={94} tone="ai" dotted />
```

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `ProgressBar.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Budget usage, goal progress, AI confidence. `dotted` is the confidence/segmented variant. */
export interface ProgressBarProps {
  value: number;
  /** @default 100 */
  max?: number;
  /** @default "brand" */
  tone?: "brand" | "positive" | "warning" | "negative" | "ai";
  label?: string;
  /** Right-aligned mono value above the bar. */
  valueLabel?: string;
  /** 24-segment dotted rendering — used for AI confidence. */
  dotted?: boolean;
  /** @default 8 */
  height?: number;
  style?: React.CSSProperties;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
```
