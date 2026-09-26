# EmptyState

Implementação: [`EmptyState.js`](EmptyState.js) · estilos: [`feedback.css`](feedback.css) · demo: `/design-system/#emptystate`.
Importe sempre pelo índice público: `import { EmptyState } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
EmptyState({ icon: Icon('receipt', 20), title: 'Nenhum lançamento neste período', description: 'Ajuste o filtro de datas ou importe um extrato OFX.', action: Button({ size: 'sm', variant: 'secondary', children: 'Limpar filtros' }) })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Explain what would be here and give one way to fill it.

```jsx
<EmptyState icon={<i data-lucide="receipt"></i>} title="Nenhuma transação neste período"
  description="Ajuste o filtro de datas ou importe um extrato OFX." action={<Button size="sm">Importar extrato</Button>} />
```
No illustrations — a single muted Lucide glyph in a tile.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `EmptyState.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/**
 * Zero-data placeholder for tables, watchlists and filtered views.
 * Intentional addition — every list surface in the kit needs an empty branch.
 */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element;
```
