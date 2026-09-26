# Select

Implementação: [`Select.js`](Select.js) · estilos: [`forms.css`](forms.css) · demo: `/design-system/#select`.
Importe sempre pelo índice público: `import { Select } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
Select({ options: ['Este mês', 'Últimos 90 dias'], placeholder: 'Selecione o período', onChange: filtrar })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Lista de opções

O `<select>` continua nativo (teclado, leitor de tela e formulário intactos). Onde o
navegador suporta select personalizável (`appearance: base-select`, Chromium 135+),
`forms.css` desenha a lista com o acabamento da marca: painel `surface-raised` com
`shadow-popover` e raio `md`, opção em hover afundada (`surface-sunken`), opção marcada
em `surface-brand-soft` + `text-brand` com o check à direita, chevron girando ao abrir.
Nos demais (Safari/Firefox, roda nativa no iOS) vale a lista do sistema. A marcação
estática equivalente, para telas jQuery, é a mesma que a fábrica gera:

```html
<div class="ef-select">
  <select class="ef-select__control" aria-label="Conta">…</select>
  <span class="ef-select__chevron"><svg …><path d="m6 9 6 6 6-6" /></svg></span>
</div>
```

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
