# Dialog

Implementação: [`Dialog.js`](Dialog.js) · estilos: [`feedback.css`](feedback.css) · demo: `/design-system/#dialog`.
Importe sempre pelo índice público: `import { Dialog } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
var janela = Dialog({ open: false, placement: 'auto', title: 'Exportar relatório', description: 'Escolha o período e o formato.', children: campos, footer: [Button({ variant: 'secondary', children: 'Cancelar', onClick: function () { janela.fechar(); } }), Button({ children: 'Exportar' })] });
document.body.append(janela);
janela.abrir();
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Confirmations and short forms. Never for content that deserves its own page.

```jsx
<Dialog open={open} onClose={close} title="Exportar relatório" description="Escolha o período e o formato."
  footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button>Exportar</Button></>}>…</Dialog>
```
On mobile, prefer a bottom sheet layout (`width` 100%, radius only on the top corners).

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Dialog.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/**
 * Centred modal on a blurred navy scrim. Rises 12px on entry.
 * Intentional addition — the source case study defines no modal, but export,
 * confirm-delete and new-transaction flows need one.
 */
export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  /** Right-aligned action row, usually secondary + primary `Button`. */
  footer?: React.ReactNode;
  /** @default 480 */
  width?: number;
  style?: React.CSSProperties;
}
export declare function Dialog(props: DialogProps): JSX.Element;
```
