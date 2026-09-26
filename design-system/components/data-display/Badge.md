# Badge

Implementação: [`Badge.js`](Badge.js) · estilos: [`data-display.css`](data-display.css) · demo: `/design-system/#badge`.
Importe sempre pelo índice público: `import { Badge } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
Badge({ tone: 'positive', dot: true, children: 'Conciliado' })
Badge({ tone: 'ai', mono: true, children: '96% CONFIANÇA' })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Short status only — one or two words, sentence case.

```jsx
<Badge tone="positive" dot>Conciliado</Badge>
<Badge tone="ai" mono>94% CONFIANÇA</Badge>
```
`ai` (violet) is reserved for machine-generated confidence and forecasts.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Badge.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Status pill: risk level, transaction state, AI confidence, category. */
export interface BadgeProps {
  children?: React.ReactNode;
  /** @default "neutral" */
  tone?: "neutral" | "brand" | "positive" | "negative" | "warning" | "info" | "ai" | "solid";
  /** Leading status dot in the current colour. */
  dot?: boolean;
  /** Monospace the label — use for codes and percentages. */
  mono?: boolean;
  /** @default "md" */
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
```
