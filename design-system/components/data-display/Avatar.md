# Avatar

Implementação: [`Avatar.js`](Avatar.js) · estilos: [`data-display.css`](data-display.css) · demo: `/design-system/#avatar`.
Importe sempre pelo índice público: `import { Avatar } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
Avatar({ name: 'Ana Ribeiro', size: 'lg', ring: true })
UserChip({ name: 'Ana Ribeiro', meta: 'Plano Premium', onClick: abrirConta })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Diretriz de uso (original do dump)

`UserChip` is the account control at the foot of the sidebar.

```jsx
<UserChip name="Ana Ribeiro" meta="Plano Premium" trailing={<i data-lucide="chevron-down"></i>} onClick={open} />
```

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `Avatar.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Circular user image with initials fallback on soft teal. */
export interface AvatarProps {
  src?: string;
  /** Used for the alt text and the initials fallback. */
  name?: string;
  /** @default "md" */
  size?: "xs" | "sm" | "md" | "lg";
  /** Teal halo — marks the signed-in user. */
  ring?: boolean;
  style?: React.CSSProperties;
}
export declare function Avatar(props: AvatarProps): JSX.Element;

/** Avatar + name + plan/role line. The sidebar footer and top-bar account control. */
export interface UserChipProps {
  src?: string;
  name: string;
  meta?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function UserChip(props: UserChipProps): JSX.Element;
```
