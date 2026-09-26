# Button

Implementação: [`Button.js`](Button.js) · estilos: [`actions.css`](actions.css) · demo: `/design-system/#button`.
Importe sempre pelo índice público: `import { Button } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
Button({ variant: 'primary', iconLeft: Icon('plus', 16), children: 'Nova transação', onClick: salvar })
Button({ loading: true, children: 'Salvando' })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Use `Button` for every clickable action; never style a bare `<button>`.

```jsx
<Button variant="primary" size="md" iconLeft={<Icon name="plus" />}>Nova transação</Button>
```

- `primary` (teal) — the default affirmative action, one per view group.
- `dark` (navy) — the single highest-intent CTA on a marketing or onboarding page.
- `success` (mint) — confirm/trade actions only ("Comprar", "Confirmar pagamento").
- `secondary` — white with a hairline border; pairs next to a primary.
- `ghost` — toolbars and low-emphasis rows.
- `danger` — destructive confirmation inside a Dialog.
Sizes: `sm` 34px (dense toolbars), `md` 42px (default), `lg` 52px (mobile full-width, hero).
On mobile always pass `fullWidth` and `size="lg"` so the target clears 44px.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Button.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/**
 * Primary action control for E-Financeiro. Teal `primary` is the default
 * affirmative action; `dark` navy is reserved for the single highest-intent
 * CTA on marketing surfaces; `success` mint is used only for trade/confirm.
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children?: React.ReactNode;
  /** Visual intent. @default "primary" */
  variant?: "primary" | "dark" | "success" | "secondary" | "ghost" | "danger";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  /** Swaps the left icon for a spinner and blocks interaction. */
  loading?: boolean;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
```
