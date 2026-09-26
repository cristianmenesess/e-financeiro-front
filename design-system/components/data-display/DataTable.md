# DataTable

Implementação: [`DataTable.js`](DataTable.js) · estilos: [`data-display.css`](data-display.css) · demo: `/design-system/#datatable`.
Importe sempre pelo índice público: `import { DataTable } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
DataTable({ columns: [{ key: 'desc', header: 'Lançamento' }, { key: 'valor', header: 'Valor', mono: true, align: 'right' }], rows: lancamentos, onRowClick: abrir, emptyTitle: 'Nenhum lançamento neste período' })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Transactions, holdings, invoices. Lives inside a `Card` with `padding="none"`.

```jsx
<DataTable columns={[{key:"data",header:"Data",mono:true},{key:"valor",header:"Valor",mono:true,align:"right"}]} rows={rows} onRowClick={open} />
```
Right-align every numeric column and mark it `mono`. No zebra striping, no vertical rules.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `DataTable.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

export interface DataTableColumn<R = any> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  width?: number | string;
  /** Renders the cell in JetBrains Mono — always true for money, %, dates, tickers. */
  mono?: boolean;
  render?: (row: R, index: number) => React.ReactNode;
}

/** Borderless data table: mono uppercase headers, hairline row rules, sunken hover. */
export interface DataTableProps<R = any> {
  columns: Array<DataTableColumn<R>>;
  rows: R[];
  onRowClick?: (row: R, index: number) => void;
  /** Tighter rows for long lists. */
  dense?: boolean;
  style?: React.CSSProperties;
}
export declare function DataTable<R = any>(props: DataTableProps<R>): JSX.Element;
```
