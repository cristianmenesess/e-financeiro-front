// @ts-check
import { criarElemento, criarSvg, aplicarPropsBase } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   value: number,
 *   max?: number,
 *   size?: number,
 *   label?: string,
 *   caption?: string,
 *   tone?: 'brand' | 'positive' | 'warning' | 'negative'
 * }} ScoreGaugeProps
 */

/** Classe de tom do gráfico para cada tom do gauge. */
var TONS = { brand: 'brand', positive: 'positive', warning: 'warning', negative: 'negative' };

/**
 * Arco de 270° para um único score composto (saúde financeira, score de risco).
 *
 * @param {ScoreGaugeProps} props
 * @returns {HTMLDivElement}
 */
export function ScoreGauge(props) {
    var tamanho = props.size || 160;
    var maximo = props.max || 100;
    var percentual = Math.max(0, Math.min(1, props.value / maximo));
    var espessura = 12;
    var raio = (tamanho - espessura) / 2;
    var circunferencia = 2 * Math.PI * raio;
    var arco = circunferencia * 0.75;

    var svg = criarSvg('svg', { class: 'ef-gauge__svg', width: tamanho, height: tamanho, 'aria-hidden': 'true' }, [
        criarSvg('circle', {
            class: 'ef-gauge__track', cx: tamanho / 2, cy: tamanho / 2, r: raio,
            'stroke-width': espessura, 'stroke-dasharray': arco + ' ' + circunferencia
        }),
        criarSvg('circle', {
            class: 'ef-gauge__value', cx: tamanho / 2, cy: tamanho / 2, r: raio,
            'stroke-width': espessura, 'stroke-dasharray': (arco * percentual) + ' ' + circunferencia
        })
    ]);

    var numero = criarElemento('span', { class: 'ef-gauge__number' }, props.value);
    numero.style.fontSize = (tamanho * 0.24) + 'px';

    var centro = criarElemento('div', { class: 'ef-gauge__center' }, [
        numero,
        props.label ? criarElemento('span', { class: 'ef-gauge__label' }, props.label) : null,
        props.caption ? criarElemento('span', { class: 'ef-gauge__caption' }, props.caption) : null
    ]);
    centro.style.paddingTop = (tamanho * 0.04) + 'px';

    var raiz = criarElemento('div', {
        class: 'ef-gauge ef-chart--' + TONS[props.tone || 'brand'],
        role: 'meter',
        'aria-valuenow': props.value,
        'aria-valuemin': 0,
        'aria-valuemax': maximo,
        'aria-label': props.caption || 'Score'
    }, [svg, centro]);
    raiz.style.width = tamanho + 'px';
    raiz.style.height = (tamanho * 0.82) + 'px';

    return aplicarPropsBase(raiz, props);
}
