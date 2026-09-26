// @ts-check
import { criarSvg, aplicarPropsBase, idUnico } from '../_internal/dom.js';

/**
 * @typedef {'positive' | 'negative' | 'brand' | 'violet'} ChartTone
 *
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   data: number[],
 *   width?: number,
 *   height?: number,
 *   tone?: ChartTone,
 *   fill?: boolean,
 *   dot?: boolean,
 *   strokeWidth?: number
 * }} SparklineProps
 */

/**
 * Linha de tendência em escala de linha de tabela, StatCard e watchlist. Normaliza
 * a série para a própria caixa. Com menos de 2 pontos (estado vazio), desenha só
 * uma linha-base tracejada.
 *
 * @param {SparklineProps} props
 * @returns {SVGSVGElement}
 */
export function Sparkline(props) {
    var largura = props.width || 120;
    var altura = props.height || 36;
    var margem = 3;
    var dados = props.data || [];

    var svg = criarSvg('svg', {
        class: 'ef-chart ef-chart--' + (props.tone || 'positive'),
        width: largura,
        height: altura,
        viewBox: '0 0 ' + largura + ' ' + altura,
        role: 'img',
        'aria-label': dados.length > 1 ? 'Tendência: ' + dados.length + ' pontos' : 'Sem dados'
    });

    if (dados.length < 2) {
        svg.append(criarSvg('line', {
            class: 'ef-chart__grid', x1: margem, x2: largura - margem, y1: altura / 2, y2: altura / 2, 'stroke-dasharray': '3 4'
        }));
        return aplicarPropsBase(svg, props);
    }

    var minimo = Math.min.apply(null, dados);
    var maximo = Math.max.apply(null, dados);
    var amplitude = maximo - minimo || 1;

    /** @param {number} indice */
    function x(indice) { return margem + (indice / (dados.length - 1)) * (largura - margem * 2); }
    /** @param {number} valor */
    function y(valor) { return altura - margem - ((valor - minimo) / amplitude) * (altura - margem * 2); }

    var linha = dados.map(function (valor, indice) {
        return (indice ? 'L' : 'M') + x(indice).toFixed(2) + ' ' + y(valor).toFixed(2);
    }).join(' ');

    if (props.fill !== false) {
        var idGradiente = idUnico('spark');
        svg.append(
            criarSvg('defs', {}, criarSvg('linearGradient', { id: idGradiente, x1: 0, y1: 0, x2: 0, y2: 1 }, [
                criarSvg('stop', { class: 'ef-chart__stop', offset: '0%', 'stop-opacity': 0.22 }),
                criarSvg('stop', { class: 'ef-chart__stop', offset: '100%', 'stop-opacity': 0 })
            ])),
            criarSvg('path', {
                d: linha + ' L' + (largura - margem) + ' ' + (altura - margem) + ' L' + margem + ' ' + (altura - margem) + ' Z',
                fill: 'url(#' + idGradiente + ')'
            })
        );
    }

    svg.append(criarSvg('path', { class: 'ef-chart__line', d: linha, 'stroke-width': props.strokeWidth || 1.75 }));

    if (props.dot) {
        svg.append(criarSvg('circle', { class: 'ef-chart__dot', cx: largura - margem, cy: y(dados[dados.length - 1]), r: 2.75 }));
    }

    return aplicarPropsBase(svg, props);
}
