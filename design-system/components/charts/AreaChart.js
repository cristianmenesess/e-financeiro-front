// @ts-check
import { criarElemento, criarSvg, aplicarPropsBase, idUnico } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   data: number[],
 *   width?: number,
 *   height?: number,
 *   tone?: import('./Sparkline.js').ChartTone,
 *   xLabels?: string[],
 *   yTicks?: number,
 *   formatY?: (valor: number) => string | number,
 *   grid?: boolean
 * }} AreaChartProps
 */

/**
 * Gráfico principal de desempenho: uma série, preenchimento em gradiente,
 * ticks do eixo Y à direita e rótulos X monoespaçados. Ocupa a largura do
 * contêiner e redesenha quando ela muda (ResizeObserver), para os rótulos nunca
 * esticarem. Com menos de 2 pontos mostra o estado vazio.
 *
 * @param {AreaChartProps} props
 * @returns {HTMLDivElement}
 */
export function AreaChart(props) {
    var dados = props.data || [];
    var altura = props.height || 220;
    var raiz = criarElemento('div', { class: 'ef-area-chart' });
    raiz.style.width = '100%';

    if (dados.length < 2) {
        var vazio = criarElemento('div', { class: 'ef-chart-empty', role: 'img', 'aria-label': 'Sem dados no período' }, 'Sem dados no período');
        vazio.style.height = altura + 'px';
        raiz.append(vazio);
        return aplicarPropsBase(raiz, props);
    }

    var larguraDesenhada = 0;

    /**
     * @param {number} largura
     * @returns {void}
     */
    function desenhar(largura) {
        if (largura === larguraDesenhada || largura <= 0) {
            return;
        }

        larguraDesenhada = largura;
        raiz.replaceChildren(montarSvg(props, dados, largura, altura));
    }

    desenhar(props.width || 640);

    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(function (entradas) {
            desenhar(Math.round(entradas[0].contentRect.width));
        }).observe(raiz);
    }

    return aplicarPropsBase(raiz, props);
}

/**
 * @param {AreaChartProps} props
 * @param {number[]} dados
 * @param {number} largura
 * @param {number} altura
 * @returns {SVGSVGElement}
 */
function montarSvg(props, dados, largura, altura) {
    var rotulosX = props.xLabels || [];
    var quantidadeTicks = props.yTicks || 5;
    var formatarY = props.formatY || function (valor) { return valor; };
    var comGrade = props.grid !== false;

    var margemEsq = 8;
    var margemDir = 52;
    var margemTopo = 12;
    var margemBase = rotulosX.length ? 28 : 12;
    var minimo = Math.min.apply(null, dados);
    var maximo = Math.max.apply(null, dados);
    var amplitude = maximo - minimo || 1;

    /** @param {number} indice */
    function x(indice) { return margemEsq + (indice / (dados.length - 1)) * (largura - margemEsq - margemDir); }
    /** @param {number} valor */
    function y(valor) { return margemTopo + (1 - (valor - minimo) / amplitude) * (altura - margemTopo - margemBase); }

    var linha = dados.map(function (valor, indice) {
        return (indice ? 'L' : 'M') + x(indice).toFixed(1) + ' ' + y(valor).toFixed(1);
    }).join(' ');
    var area = linha + ' L' + x(dados.length - 1).toFixed(1) + ' ' + (altura - margemBase) + ' L' + margemEsq + ' ' + (altura - margemBase) + ' Z';
    var idGradiente = idUnico('area');

    var svg = criarSvg('svg', {
        class: 'ef-chart ef-chart--' + (props.tone || 'positive'),
        width: largura,
        height: altura,
        viewBox: '0 0 ' + largura + ' ' + altura,
        role: 'img',
        'aria-label': 'Série de ' + dados.length + ' pontos, de ' + formatarY(minimo) + ' a ' + formatarY(maximo)
    }, criarSvg('defs', {}, criarSvg('linearGradient', { id: idGradiente, x1: 0, y1: 0, x2: 0, y2: 1 }, [
        criarSvg('stop', { class: 'ef-chart__stop', offset: '0%', 'stop-opacity': 0.2 }),
        criarSvg('stop', { class: 'ef-chart__stop', offset: '100%', 'stop-opacity': 0 })
    ])));

    if (comGrade) {
        for (var i = 0; i < quantidadeTicks; i++) {
            var valorTick = minimo + (amplitude * i) / (quantidadeTicks - 1);
            svg.append(
                criarSvg('line', { class: 'ef-chart__grid', x1: margemEsq, x2: largura - margemDir, y1: y(valorTick), y2: y(valorTick) }),
                criarSvg('text', { class: 'ef-chart__axis', x: largura - margemDir + 10, y: y(valorTick) + 4 }, formatarY(valorTick))
            );
        }
    }

    svg.append(
        criarSvg('path', { d: area, fill: 'url(#' + idGradiente + ')' }),
        criarSvg('path', { class: 'ef-chart__line', d: linha, 'stroke-width': 2 }),
        criarSvg('circle', { class: 'ef-chart__dot', cx: x(0), cy: y(dados[0]), r: 3.5 }),
        criarSvg('circle', { class: 'ef-chart__dot', cx: x(dados.length - 1), cy: y(dados[dados.length - 1]), r: 3.5 })
    );

    rotulosX.forEach(function (rotulo, indice) {
        var ancora = indice === 0 ? 'start' : indice === rotulosX.length - 1 ? 'end' : 'middle';
        svg.append(criarSvg('text', {
            class: 'ef-chart__axis ef-chart__axis--x',
            x: margemEsq + (indice / Math.max(rotulosX.length - 1, 1)) * (largura - margemEsq - margemDir),
            y: altura - 8,
            'text-anchor': ancora
        }, rotulo));
    });

    return svg;
}
