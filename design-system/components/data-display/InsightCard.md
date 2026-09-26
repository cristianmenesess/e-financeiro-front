# InsightCard

Implementação: [`InsightCard.js`](InsightCard.js) · estilos: [`data-display.css`](data-display.css) · demo: `/design-system/#insightcard`.
Importe sempre pelo índice público: `import { InsightCard } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
InsightCard({ body: 'Assinaturas cresceram 22% em três meses…', confidence: '94%', onAction: abrirInsight })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Anything the system inferred rather than measured goes here, never in a `StatCard`.

```jsx
<InsightCard body="Suas despesas com assinaturas subiram 22% em 3 meses. Revisar pode liberar R$ 180/mês." confidence="94%" onAction={open} />
```
Copy states the observation, then the consequence. Never more than three sentences.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `InsightCard.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Machine-generated recommendation. Violet dot + mono label + underlined mono link-out. */
export interface InsightCardProps {
  /** @default "Insight IA" */
  label?: string;
  title?: string;
  body: React.ReactNode;
  /** Right-aligned confidence, e.g. "94%". */
  confidence?: string;
  /** @default "Ver insight" */
  actionLabel?: string;
  onAction?: () => void;
  /** @default "ai" */
  tone?: "ai" | "warning" | "positive";
  style?: React.CSSProperties;
}
export declare function InsightCard(props: InsightCardProps): JSX.Element;
```
