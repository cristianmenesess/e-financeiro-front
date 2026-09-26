# Tag

Implementação: [`Tag.js`](Tag.js) · estilos: [`data-display.css`](data-display.css) · demo: `/design-system/#tag`.
Importe sempre pelo índice público: `import { Tag } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
Tag({ children: 'Impostos', active: filtroAtivo, onClick: alternarFiltro })
Tag({ children: 'Nubank', onRemove: removerFiltro })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Filter chips above tables and category labels on transactions.

```jsx
<Tag active onClick={() => toggle("entradas")}>Entradas</Tag>
<Tag onRemove={() => clear("Alimentação")}>Alimentação</Tag>
```
For status use `Badge` — `Tag` is for things the user chose.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Tag.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Filter chip / free-form label. Removable when `onRemove` is given. */
export interface TagProps {
  children?: React.ReactNode;
  onRemove?: () => void;
  /** Selected filter state (soft teal). */
  active?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function Tag(props: TagProps): JSX.Element;
```
