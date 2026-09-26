// @ts-check
import { criarElemento, criarSvg, aplicarPropsBase } from '../_internal/dom.js';

/**
 * @typedef {{ label: string, value: number, color?: string, precise?: boolean }} DonutSlice
 *
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   data: DonutSlice[],
 *   size?: number,
 *   thickness?: number,
 *   centerLabel?: string,
 *   centerValue?: string,
 *   aurora?: boolean
 * }} DonutChartProps
 *
 * @typedef {import('../_internal/dom.js').PropsBase & { data: DonutSlice[] }} DonutLegendProps
 */

/**
 * Cor da fatia: a informada (deve ser um token, ex. "var(--series-2)") ou a
 * série fixa pela posição.
 *
 * @param {DonutSlice} fatia
 * @param {number} indice
 * @returns {string}
 */
function corDaFatia(fatia, indice) {
    return fatia.color || 'var(--series-' + ((indice % 6) + 1) + ')';
}

/**
 * Anel de alocação com o brilho aurora atrás e o hub branco flutuante. Sem
 * dados (estado vazio), desenha só o trilho e o hub com "Sem dados".
 *
 * @param {DonutChartProps} props
 * @returns {HTMLDivElement}
 */
export function DonutChart(props) {
    var tamanho = props.size || 200;
    var espessura = props.thickness || 14;
    var dados = (props.data || []).filter(function (fatia) { return fatia.value > 0; });
    var total = dados.reduce(function (soma, fatia) { return soma + fatia.value; }, 0);
    var raio = (tamanho - espessura) / 2;
    var circunferencia = 2 * Math.PI * raio;
    var acumulado = 0;

    var svg = criarSvg('svg', {
        class: 'ef-donut__svg', width: tamanho, height: tamanho,
        role: 'img',
        'aria-label': total ? dados.map(function (fatia) { return fatia.label + ' ' + Math.round(fatia.value / total * 100) + '%'; }).join(', ') : 'Sem dados'
    });

    if (!total) {
        svg.append(criarSvg('circle', { class: 'ef-donut__track', cx: tamanho / 2, cy: tamanho / 2, r: raio, 'stroke-width': espessura }));
    }

    dados.forEach(function (fatia, indice) {
        var comprimento = (fatia.value / total) * circunferencia;
        var circulo = criarSvg('circle', {
            class: 'ef-donut__slice',
            cx: tamanho / 2, cy: tamanho / 2, r: raio,
            'stroke-width': espessura,
            'stroke-dasharray': (comprimento - 2) + ' ' + (circunferencia - comprimento + 2),
            'stroke-dashoffset': -acumulado
        }, criarSvg('title', {}, fatia.label));
        circulo.style.stroke = corDaFatia(fatia, indice);
        acumulado += comprimento;
        svg.append(circulo);
    });

    var raiz = criarElemento('div', { class: 'ef-donut' });
    raiz.style.width = tamanho + 'px';
    raiz.style.height = tamanho + 'px';

    if (props.aurora !== false && total) {
        var aurora = criarElemento('div', { class: 'ef-donut__aurora', 'aria-hidden': 'true' });
        aurora.style.inset = (-tamanho * 0.18) + 'px';
        raiz.append(aurora);
    }

    var hub = criarElemento('div', { class: 'ef-donut__hub' }, [
        props.centerLabel || !total ? criarElemento('span', { class: 'ef-donut__hub-label' }, total ? props.centerLabel : 'Sem dados') : null,
        props.centerValue && total ? criarElemento('span', { class: 'ef-donut__hub-value' }, props.centerValue) : null
    ]);
    hub.style.inset = (espessura + 10) + 'px';

    raiz.append(svg, hub);
    return aplicarPropsBase(raiz, props);
}

/**
 * Legenda companheira: ponto · rótulo · percentual. Fica à direita do anel.
 *
 * @param {DonutLegendProps} props
 * @returns {HTMLUListElement}
 */
export function DonutLegend(props) {
    var dados = props.data || [];
    var total = dados.reduce(function (soma, fatia) { return soma + fatia.value; }, 0) || 1;

    var lista = criarElemento('ul', { class: 'ef-donut-legend' }, dados.map(function (fatia, indice) {
        var ponto = criarElemento('span', { class: 'ef-donut-legend__dot' });
        ponto.style.background = corDaFatia(fatia, indice);

        return criarElemento('li', { class: 'ef-donut-legend__item' }, [
            ponto,
            criarElemento('span', { class: 'ef-donut-legend__label' }, fatia.label),
            criarElemento('span', { class: 'ef-donut-legend__value' },
                ((fatia.value / total) * 100).toFixed(fatia.precise ? 1 : 0).replace('.', ',') + '%')
        ]);
    }));

    return aplicarPropsBase(lista, props);
}
