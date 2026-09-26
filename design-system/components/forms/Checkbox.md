# Checkbox

Implementação: [`Checkbox.js`](Checkbox.js) · estilos: [`forms.css`](forms.css) · demo: `/design-system/#checkbox`.
Importe sempre pelo índice público: `import { Checkbox } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
Checkbox({ checked: true, label: 'E-mail', onChange: function (marcado) { salvar(marcado); } })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Row selection and filter lists.

```jsx
<Checkbox checked={sel} onChange={setSel} label="Somente entradas" />
```
Use `indeterminate` on a table's header checkbox when only some rows are selected.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Checkbox.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Multi-select control for table rows, filters and consent. */
export interface CheckboxProps {
  checked?: boolean;
  /** Header "some selected" state — takes precedence over `checked`. */
  indeterminate?: boolean;
  onChange?: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
```
