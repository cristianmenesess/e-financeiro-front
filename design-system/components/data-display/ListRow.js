// @ts-check
import { criarElemento, aplicarPropsBase, classes } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   leading?: Node,
 *   title: import('../_internal/dom.js').Conteudo,
 *   subtitle?: import('../_internal/dom.js').Conteudo,
 *   value?: import('../_internal/dom.js').Conteudo,
 *   delta?: import('../_internal/dom.js').Conteudo,
 *   tone?: 'positive' | 'negative',
 *   trailing?: Node | null,
 *   onClick?: (evento: MouseEvent) => void,
 *   divider?: boolean,
 *   selected?: boolean,
 *   disabled?: boolean
 * }} ListRowProps
 *
 * @typedef {'neutral' | 'brand' | 'positive' | 'negative' | 'warning' | 'ai' | 'blue' | 'indigo' | 'purple' | 'magenta' | 'wine' | 'pink' | 'brown'} IconTileTone
 *
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   children?: import('../_internal/dom.js').Conteudo,
 *   tone?: IconTileTone,
 *   size?: number
 * }} IconTileProps
 */

/**
 * O equivalente mobile/lista de uma linha de tabela: ícone · título + legenda
 * mono · valor + delta. Com `onClick` vira <button> (focável, hover afundado).
 * `trailing` é o espaço entre texto e valor (geralmente uma Sparkline ou Badge).
 *
 * @param {ListRowProps} props
 * @returns {HTMLElement}
 */
export function ListRow(props) {
    var negativo = props.tone === 'negative';
    var temValor = props.value != null || props.delta != null;

    var filhos = [
        props.leading ? criarElemento('span', { class: 'ef-list-row__leading' }, props.leading) : null,
        criarElemento('span', { class: 'ef-list-row__text' }, [
            criarElemento('span', { class: 'ef-list-row__title' }, props.title),
            props.subtitle ? criarElemento('span', { class: 'ef-list-row__subtitle' }, props.subtitle) : null
        ]),
        props.trailing || null,
        temValor
            ? criarElemento('span', { class: 'ef-list-row__end' }, [
                props.value != null ? criarElemento('span', { class: 'ef-list-row__value' }, props.value) : null,
                props.delta != null ? criarElemento('span', { class: 'ef-list-row__delta' }, props.delta) : null
            ])
            : null
    ];

    var atributos = {
        class: classes('ef-list-row', props.divider === false && 'ef-list-row--no-divider', negativo && 'ef-list-row--negative'),
        'aria-selected': props.selected === undefined ? null : String(props.selected)
    };

    var linha = props.onClick
        ? criarElemento('button', Object.assign({ type: 'button', disabled: !!props.disabled }, atributos), filhos)
        : criarElemento('div', atributos, filhos);

    if (props.onClick) {
        linha.addEventListener('click', /** @type {EventListener} */ (props.onClick));
    }

    return aplicarPropsBase(linha, props);
}

/**
 * Quadrado arredondado tonal (36px por padrão) que carrega um glifo Lucide no
 * início de uma linha.
 *
 * @param {IconTileProps} props
 * @returns {HTMLSpanElement}
 */
export function IconTile(props) {
    var tom = props.tone || 'neutral';
    var tile = criarElemento('span', {
        class: classes('ef-icon-tile', tom !== 'neutral' && 'ef-icon-tile--' + tom),
        'aria-hidden': 'true'
    }, props.children);

    if (props.size) {
        tile.style.width = props.size + 'px';
        tile.style.height = props.size + 'px';
    }

    return aplicarPropsBase(tile, props);
}
