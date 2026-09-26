# Card

Implementação: [`Card.js`](Card.js) · estilos: [`data-display.css`](data-display.css) · demo: `/design-system/#card`.
Importe sempre pelo índice público: `import { Card } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
Card({ aurora: true, children: [CardHeader({ label: 'Fluxo de caixa', title: 'Saldo consolidado', action: controle }), grafico] })
Card({ interactive: true, onClick: abrir, children: conteudo })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Every block of the dashboard is a `Card`. Nothing floats bare on the canvas.

```jsx
<Card>
  <CardHeader label="Alocação de ativos" action={<IconButton label="Mais"><i data-lucide="more-horizontal"></i></IconButton>} />
  …
</Card>
```
Use `aurora` at most once per screen (the hero/balance card). `inverse` for the
single navy promo or summary block. Never stack a strong border with `elevation="raised"`.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Card.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/**
 * The surface every dashboard block sits on: white, 24px radius, hairline border,
 * wide soft shadow. `aurora` adds the brand's blurred colour wash in the corner.
 */
export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "style"> {
  children?: React.ReactNode;
  /** @default "default" */
  padding?: "none" | "compact" | "default" | "roomy";
  /** @default "card" */
  elevation?: "none" | "flat" | "card" | "raised";
  /** Lifts 2px and deepens the shadow on hover. */
  interactive?: boolean;
  /** Blurred aurora wash in the top-right corner — hero cards only, max one per screen. */
  aurora?: boolean;
  /** Navy gradient surface with inverse text. */
  inverse?: boolean;
  style?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;

/** Mono micro-label + title + optional action, with the standard 16px gap below. */
export interface CardHeaderProps { label?: string; title?: string; action?: React.ReactNode; style?: React.CSSProperties }
export declare function CardHeader(props: CardHeaderProps): JSX.Element;
```
