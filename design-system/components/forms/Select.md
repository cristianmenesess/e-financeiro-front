# Select

Implementação: [`Select.js`](Select.js) · estilos: [`forms.css`](forms.css) · demo: `/design-system/#select`.
Importe sempre pelo índice público: `import { Select } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
Select({ options: ['Este mês', 'Últimos 90 dias'], placeholder: 'Selecione o período', onChange: filtrar })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Dropdown for filters and settings. Same geometry as `Input`.

```jsx
<Select options={["Este mês","Últimos 90 dias","Este ano"]} value={periodo} onChange={e=>setPeriodo(e.target.value)} />
```

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Select.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

export interface SelectOption { value: string; label: string }

/** Native select with brand chrome. Chevron is drawn by the component. */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size" | "style"> {
  options: Array<SelectOption | string>;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
```
