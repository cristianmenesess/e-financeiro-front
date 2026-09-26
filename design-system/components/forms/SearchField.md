# SearchField

Implementação: [`SearchField.js`](SearchField.js) · estilos: [`forms.css`](forms.css) · demo: `/design-system/#searchfield`.
Importe sempre pelo índice público: `import { SearchField } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
SearchField({ width: 280, placeholder: 'Buscar lançamentos, contas…' })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Sunken pill search used in the dashboard top bar.

```jsx
<SearchField placeholder="Buscar ativos, transações..." width={320} />
```

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `SearchField.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Pill search input for the top bar and list headers. */
export interface SearchFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  width?: number | string;
  /** Keyboard hint rendered on the right while unfocused. Pass `null` to hide. */
  shortcut?: string | null;
  style?: React.CSSProperties;
}
export declare function SearchField(props: SearchFieldProps): JSX.Element;
```
