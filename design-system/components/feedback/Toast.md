# Toast

Implementação: [`Toast.js`](Toast.js) · estilos: [`feedback.css`](feedback.css) · demo: `/design-system/#toast`.
Importe sempre pelo índice público: `import { Toast } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
exibirToast({ tone: 'positive', title: 'Relatório gerado', message: 'dre-set-2026.pdf enviado por e-mail' })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Confirmation of something that already happened. Auto-dismiss after 5s.

```jsx
<Toast tone="positive" title="Transação salva" message="R$ 1.280,00 em Marketing." action={<Button variant="ghost" size="sm">Desfazer</Button>} />
```
Never use for errors that block the user — those belong inline or in a `Dialog`.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Toast.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/**
 * Transient navy notification, bottom-right on desktop and bottom-centre on mobile.
 * Intentional addition — needed to confirm saves and background syncs.
 */
export interface ToastProps {
  title?: string;
  message?: string;
  /** @default "neutral" */
  tone?: "neutral" | "positive" | "negative" | "warning" | "ai";
  /** Inline link-style action, e.g. "Desfazer". */
  action?: React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}
export declare function Toast(props: ToastProps): JSX.Element;
```
