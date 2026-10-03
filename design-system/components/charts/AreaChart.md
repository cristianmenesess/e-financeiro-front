# AreaChart

Implementação: [`AreaChart.js`](AreaChart.js) · estilos: [`charts.css`](charts.css) · demo: `/design-system/#areachart`.
Importe sempre pelo índice público: `import { AreaChart } from '../design-system/components/index.js'`.

## Uso nesta stack

```js
AreaChart({ data: serie, height: 240, xLabels: ['1 SET', '15 SET', '29 SET'], formatY: function (v) { return (v / 1000).toFixed(1) + 'M'; } })
```

Fábrica DOM: recebe um objeto de props e devolve o elemento pronto. Além das props
abaixo, todo componente aceita `className`, `style` (só posicionamento) e `attrs`.

## Rolagem e dica do ponto (extensão desta stack)

Duas props que não vieram do dump:

- `minPointWidth` (número, em px): largura mínima por ponto. Se a série não couber no
  contêiner, a área do gráfico rola na horizontal, já posicionada no ponto mais
  recente, e o eixo Y fica fixo à direita. Use quando todo ponto precisa do seu
  rótulo no eixo X (31 dias, 12 meses); sem a prop, o gráfico só se ajusta à largura.
- `tooltipLabels` (um texto por ponto) liga a dica: com o cursor ou o toque sobre a
  área, o ponto mais próximo ganha destaque e mostra o rótulo e o valor, formatado
  por `formatTooltip` (ou `formatY`, se ela não vier).

```js
AreaChart({ data: dias, xLabels: numeros, minPointWidth: 26, tooltipLabels: datas, formatTooltip: formatarMoeda })
```

## Diretriz de uso (original do dump)

The hero chart inside a portfolio/balance card. Scales fluidly to its container.

```jsx
<AreaChart data={serie} height={220} xLabels={["1 MAI","8 MAI","15 MAI","22 MAI","29 MAI"]} formatY={v => (v/1000).toFixed(0)+"k"} />
```
One series only. For comparisons stack two cards side by side instead.

## Contrato de props (original do dump)

O contrato foi preservado; os tipos vivos estão em JSDoc no `AreaChart.js` (checados por `npm run typecheck`).
`React.ReactNode` virou `Node`/texto e callbacks de evento recebem o evento DOM.

```ts
import * as React from "react";

/** Primary performance chart: single series, gradient fill, right-hand y ticks, mono x labels. */
export interface AreaChartProps {
  data: number[];
  width?: number;
  height?: number;
  /** @default "positive" */
  tone?: "positive" | "negative" | "brand" | "violet";
  /** Mono labels along the bottom axis, evenly spaced. */
  xLabels?: string[];
  /** @default 5 */
  yTicks?: number;
  /** Formats the right-hand tick values. */
  formatY?: (v: number) => string | number;
  /** @default true */
  grid?: boolean;
  style?: React.CSSProperties;
}
export declare function AreaChart(props: AreaChartProps): JSX.Element;
```
