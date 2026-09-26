// @ts-check
import { criarElemento, aplicarPropsBase } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   data: number[],
 *   height?: number,
 *   gap?: number,
 *   tone?: 'positive' | 'brand' | 'violet' | 'blue' | 'negative'
 * }} BarTicksProps
 */

/** Mapeia o tom do BarTicks para a classe de tom dos gráficos. */
var TONS = { positive: 'positive', brand: 'brand', violet: 'violet', blue: 'blue', negative: 'negative' };

/**
 * Faixa densa de micro-barras na base dos cards de KPI. Densidade decorativa,
 * não um gráfico de leitura: a opacidade acompanha o valor.
 *
 * @param {BarTicksProps} props
 * @returns {HTMLDivElement}
 */
export function BarTicks(props) {
    var dados = props.data || [];
    var altura = props.height || 34;
    var maximo = Math.max.apply(null, dados.concat([1]));

    var raiz = criarElemento('div', {
        class: 'ef-bar-ticks ef-chart--' + TONS[props.tone || 'positive'],
        role: 'img',
        'aria-hidden': 'true'
    });
    raiz.style.height = altura + 'px';
    raiz.style.gap = (props.gap === undefined ? 3 : props.gap) + 'px';

    dados.forEach(function (valor) {
        var barra = criarElemento('span', { class: 'ef-bar-ticks__bar' });
        barra.style.height = Math.max(2, (valor / maximo) * altura) + 'px';
        barra.style.opacity = String(0.35 + 0.65 * (valor / maximo));
        raiz.append(barra);
    });

    return aplicarPropsBase(raiz, props);
}
