// @ts-check
/**
 * Utilitários internos dos componentes do design system: criação de elementos
 * HTML/SVG, anexação de filhos e os 6 glifos utilitários embutidos (DESIGN.md →
 * Iconography). Não importe daqui fora de design-system/components — use o
 * index.js público.
 */

/** @typedef {string | number | Node | null | undefined | false} Filho */
/** @typedef {Filho | Conteudo[]} Conteudo */

/**
 * Props comuns aceitas por todo componente, além das próprias.
 * @typedef {object} PropsBase
 * @property {string} [className] Classes extras, somadas às do componente.
 * @property {Partial<CSSStyleDeclaration>} [style] Estilo em linha (só para posicionamento; cor/tamanho vêm dos tokens).
 * @property {Record<string, string>} [attrs] Atributos extras (id, data-*, aria-*).
 */

var SVG_NS = 'http://www.w3.org/2000/svg';
var contadorIds = 0;

/**
 * Cria um elemento HTML com atributos e filhos.
 *
 * @template {keyof HTMLElementTagNameMap} T
 * @param {T} tag
 * @param {Record<string, string | number | boolean | null | undefined>} [atributos] `class` aceita string; valores false/null/undefined são ignorados
 * @param {Conteudo} [filhos]
 * @returns {HTMLElementTagNameMap[T]}
 */
export function criarElemento(tag, atributos, filhos) {
    var elemento = document.createElement(tag);
    aplicarAtributos(elemento, atributos);
    anexarFilhos(elemento, filhos);
    return elemento;
}

/**
 * Cria um elemento SVG (namespace correto) com atributos e filhos.
 *
 * @template {keyof SVGElementTagNameMap} T
 * @param {T} tag
 * @param {Record<string, string | number | boolean | null | undefined>} [atributos]
 * @param {Conteudo} [filhos]
 * @returns {SVGElementTagNameMap[T]}
 */
export function criarSvg(tag, atributos, filhos) {
    var elemento = /** @type {SVGElementTagNameMap[T]} */ (document.createElementNS(SVG_NS, tag));
    aplicarAtributos(elemento, atributos);
    anexarFilhos(elemento, filhos);
    return elemento;
}

/**
 * @param {Element} elemento
 * @param {Record<string, string | number | boolean | null | undefined>} [atributos]
 * @returns {void}
 */
function aplicarAtributos(elemento, atributos) {
    if (!atributos) {
        return;
    }

    Object.keys(atributos).forEach(function (nome) {
        var valor = atributos[nome];

        if (valor === false || valor === null || valor === undefined || valor === '') {
            return;
        }

        elemento.setAttribute(nome, valor === true ? '' : String(valor));
    });
}

/**
 * Anexa filhos (texto, nós ou listas aninhadas), ignorando vazios.
 *
 * @param {Element} elemento
 * @param {Conteudo} [filhos]
 * @returns {void}
 */
export function anexarFilhos(elemento, filhos) {
    if (filhos === null || filhos === undefined || filhos === false) {
        return;
    }

    if (Array.isArray(filhos)) {
        filhos.forEach(function (filho) { anexarFilhos(elemento, filho); });
        return;
    }

    elemento.append(filhos instanceof Node ? filhos : String(filhos));
}

/**
 * Aplica as props comuns (className, style, attrs) ao elemento raiz.
 *
 * @template {HTMLElement | SVGElement} E
 * @param {E} elemento
 * @param {PropsBase} props
 * @returns {E}
 */
export function aplicarPropsBase(elemento, props) {
    if (props.className) {
        elemento.classList.add.apply(elemento.classList, props.className.split(/\s+/).filter(Boolean));
    }

    if (props.style) {
        Object.assign(elemento.style, props.style);
    }

    aplicarAtributos(elemento, props.attrs);
    return elemento;
}

/**
 * Junta nomes de classe, descartando os falsos.
 *
 * @param {...(string | false | null | undefined)} nomes
 * @returns {string}
 */
export function classes(...nomes) {
    return nomes.filter(Boolean).join(' ');
}

/**
 * Gera um id único por página (gradientes SVG precisam de id próprio).
 *
 * @param {string} prefixo
 * @returns {string}
 */
export function idUnico(prefixo) {
    contadorIds += 1;
    return 'ef-' + prefixo + '-' + contadorIds;
}

/**
 * Os 6 glifos utilitários do sistema. São os únicos SVGs desenhados à mão
 * permitidos, para que as primitivas não dependam de CDN de ícones.
 *
 * @param {'chevron' | 'check' | 'close' | 'search' | 'arrow-up-right' | 'minus'} nome
 * @param {number} tamanho Lado do ícone em px (atributo SVG, não CSS)
 * @param {number} [espessura]
 * @returns {SVGSVGElement}
 */
export function glifo(nome, tamanho, espessura) {
    var caminhos = {
        chevron: ['m6 9 6 6 6-6'],
        check: ['M20 6 9 17l-5-5'],
        close: ['M18 6 6 18', 'M6 6l12 12'],
        search: ['m20 20-3.5-3.5'],
        'arrow-up-right': ['M7 17 17 7', 'M9 7h8v8'],
        minus: ['M5 12h14']
    };

    var svg = criarSvg('svg', {
        width: tamanho,
        height: tamanho,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': espessura || 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true',
        focusable: 'false'
    });

    if (nome === 'search') {
        svg.append(criarSvg('circle', { cx: 11, cy: 11, r: 7 }));
    }

    caminhos[nome].forEach(function (d) {
        svg.append(criarSvg('path', { d: d }));
    });

    return svg;
}
