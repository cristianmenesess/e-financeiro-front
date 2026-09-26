# ListRow

Implementação: [`ListRow.js`](ListRow.js) · estilos: [`data-display.css`](data-display.css) · demo: `/design-system/#listrow`.
Importe sempre pelo índice público: `import { ListRow } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
ListRow({ leading: IconTile({ tone: 'brand', children: Icon('wallet', 16) }), title: 'Conta corrente', subtitle: 'AG 0234', value: 'R$ 412.880,10', delta: '+2,4%', onClick: abrir })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Watchlists, transaction feeds, account lists — anywhere a table is too heavy (all of mobile).

```jsx
<ListRow leading={<IconTile tone="positive"><i data-lucide="arrow-down-left"></i></IconTile>}
  title="Salário" subtitle="RECEITA · 03 SET" value="R$ 8.400,00" delta="+2,1%" trailing={<Sparkline data={s} width={72} height={26} />} />
```
Minimum row height is 44px so it stays tappable.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `ListRow.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** The mobile/list equivalent of a table row: icon · title + ticker · value + delta. */
export interface ListRowProps {
  /** An `IconTile`, logo image or avatar. */
  leading?: React.ReactNode;
  title: React.ReactNode;
  /** Rendered in mono — ticker, category, account. */
  subtitle?: React.ReactNode;
  value?: React.ReactNode;
  delta?: React.ReactNode;
  /** @default "positive" */
  tone?: "positive" | "negative";
  /** Slot between the text and the value — usually a `Sparkline`. */
  trailing?: React.ReactNode;
  onClick?: () => void;
  /** @default true */
  divider?: boolean;
  style?: React.CSSProperties;
}
export declare function ListRow(props: ListRowProps): JSX.Element;

/** Rounded 36px tinted square that holds a Lucide glyph at the head of a row. */
export interface IconTileProps {
  children?: React.ReactNode;
  tone?: "neutral" | "brand" | "positive" | "negative" | "warning" | "ai";
  size?: number;
  style?: React.CSSProperties;
}
export declare function IconTile(props: IconTileProps): JSX.Element;
```
