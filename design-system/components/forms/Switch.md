# Switch

Implementação: [`Switch.js`](Switch.js) · estilos: [`forms.css`](forms.css) · demo: `/design-system/#switch`.
Importe sempre pelo índice público: `import { Switch } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
Switch({ checked: true, label: 'Resumo semanal', description: 'Enviado toda segunda às 8h.', onChange: salvarPreferencia })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

Settings toggle — applies immediately, no Save button.

```jsx
<Switch checked={on} onChange={setOn} label="Alertas de preço" description="Notificar quando um ativo variar mais de 5%." />
```

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Switch.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Instant-apply toggle for settings rows. Never use inside a form that needs Save. */
export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Switch(props: SwitchProps): JSX.Element;
```
