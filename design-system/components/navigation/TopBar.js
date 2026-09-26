// @ts-check
import { criarElemento, aplicarPropsBase, classes } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   title?: string,
 *   subtitle?: string,
 *   breadcrumb?: string,
 *   actions?: import('../_internal/dom.js').Conteudo,
 *   search?: Node | null,
 *   sticky?: boolean,
 *   compact?: boolean
 * }} TopBarProps
 */

/**
 * Cabeçalho de página fixo, de vidro: breadcrumb · título · busca · ações.
 * `compact` é a versão mobile (padding de 16px) — cobre o AppBar do UI kit
 * mobile, que era a mesma anatomia.
 *
 * @param {TopBarProps} props
 * @returns {HTMLElement}
 */
export function TopBar(props) {
    var barra = criarElemento('header', {
        class: classes('ef-topbar', props.sticky !== false && 'ef-topbar--sticky', props.compact && 'ef-topbar--compact')
    }, [
        criarElemento('div', { class: 'ef-topbar__text' }, [
            props.breadcrumb ? criarElemento('span', { class: 'ef-topbar__breadcrumb' }, props.breadcrumb) : null,
            props.title ? criarElemento('h2', { class: 'ef-topbar__title' }, props.title) : null,
            props.subtitle ? criarElemento('span', { class: 'ef-topbar__subtitle' }, props.subtitle) : null
        ]),
        props.search || null,
        props.actions ? criarElemento('div', { class: 'ef-topbar__actions' }, props.actions) : null
    ]);

    return aplicarPropsBase(barra, props);
}
