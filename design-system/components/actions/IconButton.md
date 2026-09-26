# IconButton

Implementação: [`IconButton.js`](IconButton.js) · estilos: [`actions.css`](actions.css) · demo: `/design-system/#iconbutton`.
Importe sempre pelo índice público: `import { IconButton } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
IconButton({ label: 'Alertas', tone: 'surface', children: Icon('bell') })
IconButton({ label: 'Filtrar', active: true, children: Icon('sliders-horizontal', 16) })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Icon-only action. Always pass `label` — it is both the a11y name and the tooltip.

```jsx
<IconButton label="Notificações" tone="surface"><i data-lucide="bell"></i></IconButton>
```

`tone="surface"` for floating controls on the canvas, `neutral` inside cards,
`brand` for an active filter, `inverse` on navy surfaces. Use `size="lg"` (44px) on mobile.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `IconButton.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Square icon-only control for toolbars, card headers and mobile app bars. */
export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  /** The glyph (a Lucide `<i data-lucide>` node or an `<svg>`). */
  children?: React.ReactNode;
  /** Required accessible name — also used as the tooltip. */
  label: string;
  /** @default "neutral" */
  tone?: "neutral" | "surface" | "brand" | "inverse";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Renders the persistent selected state (soft teal tile). */
  active?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
```
