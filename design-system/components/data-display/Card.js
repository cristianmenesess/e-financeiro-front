// @ts-check
import { criarElemento, aplicarPropsBase, classes } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   children?: import('../_internal/dom.js').Conteudo,
 *   padding?: 'none' | 'compact' | 'default' | 'roomy',
 *   elevation?: 'none' | 'flat' | 'card' | 'raised',
 *   interactive?: boolean,
 *   aurora?: boolean,
 *   inverse?: boolean,
 *   selected?: boolean,
 *   onClick?: (evento: MouseEvent) => void
 * }} CardProps
 *
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   label?: string,
 *   title?: string,
 *   action?: Node
 * }} CardHeaderProps
 */

/**
 * A superfície de todo bloco do painel: branco, raio 24, borda fina e sombra
 * larga. `aurora` adiciona o borrão de marca no canto (no máximo um por tela);
 * `inverse` é o gradiente navy (um card por tela). `interactive` sobe 2px no
 * hover e vira focável por teclado (Enter/Espaço disparam onClick).
 *
 * @param {CardProps} props
 * @returns {HTMLElement}
 */
export function Card(props) {
    var espacamento = props.padding || 'default';
    var elevacao = props.elevation || 'card';

    var card = criarElemento('section', {
        class: classes(
            'ef-card',
            espacamento !== 'default' && 'ef-card--pad-' + espacamento,
            elevacao !== 'card' && 'ef-card--elev-' + elevacao,
            props.interactive && 'ef-card--interactive',
            props.inverse && 'ef-card--inverse'
        ),
        tabindex: props.interactive ? '0' : null,
        role: props.interactive ? 'button' : null,
        'aria-selected': props.selected === undefined ? null : String(props.selected)
    }, [
        props.aurora ? criarElemento('div', { class: 'ef-card__aurora', 'aria-hidden': 'true' }) : null,
        criarElemento('div', { class: 'ef-card__body' }, props.children)
    ]);

    if (props.onClick) {
        var aoClicar = props.onClick;
        card.addEventListener('click', aoClicar);

        if (props.interactive) {
            card.addEventListener('keydown', function (evento) {
                if (evento.key === 'Enter' || evento.key === ' ') {
                    evento.preventDefault();
                    card.click();
                }
            });
        }
    }

    return aplicarPropsBase(card, props);
}

/**
 * Micro-rótulo mono + título + ação opcional, com o respiro padrão de 16px abaixo.
 *
 * @param {CardHeaderProps} props
 * @returns {HTMLElement}
 */
export function CardHeader(props) {
    var cabecalho = criarElemento('header', { class: 'ef-card-header' }, [
        criarElemento('div', { class: 'ef-card-header__text' }, [
            props.label ? criarElemento('span', { class: 'ef-card-header__label' }, props.label) : null,
            props.title ? criarElemento('h3', { class: 'ef-card-header__title' }, props.title) : null
        ]),
        props.action || null
    ]);

    return aplicarPropsBase(cabecalho, props);
}
