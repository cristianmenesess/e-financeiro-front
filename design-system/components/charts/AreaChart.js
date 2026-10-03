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
 *   grid?: boolean,
 *   minPointWidth?: number,
 *   tooltipLabels?: string[],
 *   formatTooltip?: (valor: number) => string | number
 * }} AreaChartProps
 */

/**
 * @typedef {object} Geometria
 * @property {number} largura Largura da área do gráfico (sem o eixo Y)
 * @property {number} altura
 * @property {number} base Margem inferior (rótulos do eixo X)
 * @property {number} minimo
 * @property {number} amplitude
 * @property {(indice: number) => number} x
 * @property {(valor: number) => number} y
 */

/** Largura do eixo Y, fixo à direita da área do gráfico. */
var LARGURA_EIXO = 44;
var MARGEM_LATERAL = 8;
var MARGEM_TOPO = 12;

/**
 * Gráfico principal de desempenho: uma série, preenchimento em gradiente,
 * ticks do eixo Y à direita e rótulos X monoespaçados. Ocupa a largura do
 * contêiner e redesenha quando ela muda (ResizeObserver), para os rótulos nunca
 * esticarem. Com menos de 2 pontos mostra o estado vazio.
 *
 * `minPointWidth` garante uma largura mínima por ponto: se a série não couber
 * no contêiner, a área do gráfico rola na horizontal (começando no ponto mais
 * recente) e o eixo Y fica fixo. `tooltipLabels` liga a dica do ponto sob o
 * cursor ou o toque: rótulo do ponto + valor (`formatTooltip`, ou `formatY`).
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

    var rolagem = criarElemento('div', { class: 'ef-area-chart__scroll' });
    var dica = criarElemento('div', { class: 'ef-chart-tooltip', role: 'status' });
    var larguraDesenhada = 0;

    dica.hidden = true;

    /**
     * @param {number} largura
     * @returns {void}
     */
    function desenhar(largura) {
        if (largura === larguraDesenhada || largura <= 0) {
            return;
        }

        larguraDesenhada = largura;
        dica.hidden = true;

        var disponivel = Math.max(largura - LARGURA_EIXO, MARGEM_LATERAL * 4);
        var minima = props.minPointWidth ? Math.round(dados.length * props.minPointWidth) : 0;
        var geometria = calcularGeometria(props, dados, Math.max(disponivel, minima), altura);
        var area = montarArea(props, dados, geometria);

        if (props.tooltipLabels) {
            ligarDica(props, dados, geometria, { raiz: raiz, rolagem: rolagem, area: area, dica: dica });
        }

        rolagem.replaceChildren(area);
        raiz.replaceChildren(rolagem, montarEixo(props, geometria), dica);

        // O ponto mais recente fica à direita: a rolagem começa nele
        rolagem.scrollLeft = rolagem.scrollWidth;
    }

    rolagem.addEventListener('scroll', function () { dica.hidden = true; });

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
 * @returns {Geometria}
 */
function calcularGeometria(props, dados, largura, altura) {
    var base = (props.xLabels || []).length ? 28 : 12;
    var minimo = Math.min.apply(null, dados);
    var amplitude = Math.max.apply(null, dados) - minimo || 1;

    return {
        largura: largura,
        altura: altura,
        base: base,
        minimo: minimo,
        amplitude: amplitude,
        x: function (indice) { return MARGEM_LATERAL + (indice / (dados.length - 1)) * (largura - MARGEM_LATERAL * 2); },
        y: function (valor) { return MARGEM_TOPO + (1 - (valor - minimo) / amplitude) * (altura - MARGEM_TOPO - base); }
    };
}

/**
 * Valores dos ticks do eixo Y, do menor pro maior.
 *
 * @param {AreaChartProps} props
 * @param {Geometria} geometria
 * @returns {number[]}
 */
function calcularTicks(props, geometria) {
    var quantidade = props.yTicks || 5;
    var ticks = [];

    for (var i = 0; i < quantidade; i++) {
        ticks.push(geometria.minimo + (geometria.amplitude * i) / (quantidade - 1));
    }

    return ticks;
}

/**
 * Área do gráfico: grade, preenchimento, linha, pontos das pontas, rótulos X
 * e (escondidos até a dica aparecer) a guia e o ponto em destaque.
 *
 * @param {AreaChartProps} props
 * @param {number[]} dados
 * @param {Geometria} geometria
 * @returns {SVGSVGElement}
 */
function montarArea(props, dados, geometria) {
    var rotulosX = props.xLabels || [];
    var formatarY = props.formatY || function (/** @type {number} */ valor) { return valor; };
    var x = geometria.x;
    var y = geometria.y;
    var chao = geometria.altura - geometria.base;

    var linha = dados.map(function (valor, indice) {
        return (indice ? 'L' : 'M') + x(indice).toFixed(1) + ' ' + y(valor).toFixed(1);
    }).join(' ');
    var area = linha + ' L' + x(dados.length - 1).toFixed(1) + ' ' + chao + ' L' + MARGEM_LATERAL + ' ' + chao + ' Z';
    var idGradiente = idUnico('area');

    var svg = criarSvg('svg', {
        class: 'ef-chart ef-chart--' + (props.tone || 'positive'),
        width: geometria.largura,
        height: geometria.altura,
        viewBox: '0 0 ' + geometria.largura + ' ' + geometria.altura,
        role: 'img',
        'aria-label': 'Série de ' + dados.length + ' pontos, de ' + formatarY(geometria.minimo) + ' a ' + formatarY(geometria.minimo + geometria.amplitude)
    }, criarSvg('defs', {}, criarSvg('linearGradient', { id: idGradiente, x1: 0, y1: 0, x2: 0, y2: 1 }, [
        criarSvg('stop', { class: 'ef-chart__stop', offset: '0%', 'stop-opacity': 0.2 }),
        criarSvg('stop', { class: 'ef-chart__stop', offset: '100%', 'stop-opacity': 0 })
    ])));

    if (props.grid !== false) {
        calcularTicks(props, geometria).forEach(function (tick) {
            svg.append(criarSvg('line', { class: 'ef-chart__grid', x1: MARGEM_LATERAL, x2: geometria.largura - MARGEM_LATERAL, y1: y(tick), y2: y(tick) }));
        });
    }

    svg.append(
        criarSvg('path', { d: area, fill: 'url(#' + idGradiente + ')' }),
        criarSvg('path', { class: 'ef-chart__line', d: linha, 'stroke-width': 2 }),
        criarSvg('circle', { class: 'ef-chart__dot', cx: x(0), cy: y(dados[0]), r: 3.5 }),
        criarSvg('circle', { class: 'ef-chart__dot', cx: x(dados.length - 1), cy: y(dados[dados.length - 1]), r: 3.5 }),
        criarSvg('line', { class: 'ef-chart__guide', y1: MARGEM_TOPO, y2: chao, visibility: 'hidden' }),
        criarSvg('circle', { class: 'ef-chart__dot ef-chart__dot--active', r: 4.5, visibility: 'hidden' })
    );

    rotulosX.forEach(function (rotulo, indice) {
        var ancora = indice === 0 ? 'start' : indice === rotulosX.length - 1 ? 'end' : 'middle';
        svg.append(criarSvg('text', {
            class: 'ef-chart__axis ef-chart__axis--x',
            x: MARGEM_LATERAL + (indice / Math.max(rotulosX.length - 1, 1)) * (geometria.largura - MARGEM_LATERAL * 2),
            y: geometria.altura - 8,
            'text-anchor': ancora
        }, rotulo));
    });

    return svg;
}

/**
 * Eixo Y: os valores dos ticks, num SVG à parte pra ficar fixo enquanto a área rola.
 *
 * @param {AreaChartProps} props
 * @param {Geometria} geometria
 * @returns {SVGSVGElement}
 */
function montarEixo(props, geometria) {
    var formatarY = props.formatY || function (/** @type {number} */ valor) { return valor; };
    var svg = criarSvg('svg', {
        class: 'ef-chart ef-area-chart__axis',
        width: LARGURA_EIXO,
        height: geometria.altura,
        viewBox: '0 0 ' + LARGURA_EIXO + ' ' + geometria.altura,
        'aria-hidden': 'true'
    });

    if (props.grid !== false) {
        calcularTicks(props, geometria).forEach(function (tick) {
            svg.append(criarSvg('text', { class: 'ef-chart__axis', x: 2, y: geometria.y(tick) + 4 }, formatarY(tick)));
        });
    }

    return svg;
}

/**
 * Liga a dica do ponto: com o cursor (ou o toque) sobre a área, destaca o ponto
 * mais próximo e mostra rótulo e valor acima dele, sem sair do gráfico.
 *
 * @param {AreaChartProps} props
 * @param {number[]} dados
 * @param {Geometria} geometria
 * @param {{ raiz: HTMLElement, rolagem: HTMLElement, area: SVGSVGElement, dica: HTMLElement }} partes
 * @returns {void}
 */
function ligarDica(props, dados, geometria, partes) {
    var rotulos = props.tooltipLabels || [];
    var formatar = props.formatTooltip || props.formatY || function (/** @type {number} */ valor) { return valor; };
    var guia = /** @type {SVGLineElement} */ (partes.area.querySelector('.ef-chart__guide'));
    var ponto = /** @type {SVGCircleElement} */ (partes.area.querySelector('.ef-chart__dot--active'));

    /** @returns {void} */
    function esconder() {
        partes.dica.hidden = true;
        guia.setAttribute('visibility', 'hidden');
        ponto.setAttribute('visibility', 'hidden');
    }

    /**
     * @param {PointerEvent} evento
     * @returns {void}
     */
    function mostrar(evento) {
        var posicao = evento.clientX - partes.area.getBoundingClientRect().left;
        var fracao = (posicao - MARGEM_LATERAL) / (geometria.largura - MARGEM_LATERAL * 2);
        var indice = Math.min(Math.max(Math.round(fracao * (dados.length - 1)), 0), dados.length - 1);
        var px = geometria.x(indice);
        var py = geometria.y(dados[indice]);

        guia.setAttribute('x1', String(px));
        guia.setAttribute('x2', String(px));
        guia.setAttribute('visibility', 'visible');
        ponto.setAttribute('cx', String(px));
        ponto.setAttribute('cy', String(py));
        ponto.setAttribute('visibility', 'visible');

        partes.dica.replaceChildren(
            criarElemento('span', { class: 'ef-chart-tooltip__label' }, rotulos[indice] || ''),
            criarElemento('span', { class: 'ef-chart-tooltip__value' }, formatar(dados[indice]))
        );
        partes.dica.hidden = false;

        // Centraliza no ponto sem deixar a dica sair do gráfico; sem espaço em cima, vai pra baixo
        var metade = partes.dica.offsetWidth / 2;
        var centro = px - partes.rolagem.scrollLeft;
        var topo = py - partes.dica.offsetHeight - 10;

        partes.dica.style.left = Math.min(Math.max(centro, metade), partes.raiz.clientWidth - metade) + 'px';
        partes.dica.style.top = (topo < 0 ? py + 12 : topo) + 'px';
    }

    partes.area.addEventListener('pointermove', mostrar);
    partes.area.addEventListener('pointerdown', mostrar);

    // No toque a dica fica até o próximo toque ou rolagem; com mouse, some ao sair
    partes.area.addEventListener('pointerleave', function (evento) {
        if (evento.pointerType === 'mouse') {
            esconder();
        }
    });
}
