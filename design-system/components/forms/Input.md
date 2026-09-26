# Input

Implementação: [`Input.js`](Input.js) · estilos: [`forms.css`](forms.css) · demo: `/design-system/#input`.
Importe sempre pelo índice público: `import { Input } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
Input({ placeholder: '0,00', prefix: 'R$', mono: true, inputMode: 'decimal' })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Text and numeric input. Money always gets `prefix="R$"` and `mono`.

```jsx
<Input placeholder="0,00" prefix="R$" mono />
```
Heights: sm 36 · md 44 · lg 52. Pair with `Field` for the label.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Input.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Single-line text/number input. Use `mono` for any monetary or identifier value. */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "style" | "prefix"> {
  /** Static leading text, e.g. "R$". */
  prefix?: React.ReactNode;
  /** Static trailing text, e.g. "%" or "BRL". */
  suffix?: React.ReactNode;
  iconLeft?: React.ReactNode;
  invalid?: boolean;
  /** Renders the value in JetBrains Mono — always true for money. */
  mono?: boolean;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
```
