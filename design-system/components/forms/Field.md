# Field

Implementação: [`Field.js`](Field.js) · estilos: [`forms.css`](forms.css) · demo: `/design-system/#field`.
Importe sempre pelo índice público: `import { Field } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
Field({ label: 'Valor', required: true, error: erroValor, children: Input({ mono: true, prefix: 'R$', placeholder: '0,00' }) })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Wraps any form control with the brand's uppercase mono micro-label.

```jsx
<Field label="Valor" hint="Em reais" htmlFor="valor"><Input id="valor" prefix="R$" /></Field>
```

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Field.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Label + hint/error wrapper. The label is the uppercase mono micro-label used across the product. */
export interface FieldProps {
  label?: string;
  hint?: string;
  /** When set, replaces the hint and turns it red. */
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Field(props: FieldProps): JSX.Element;
```
