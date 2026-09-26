// @ts-check
import { criarElemento, aplicarPropsBase } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   icon?: Node,
 *   title: string,
 *   description?: string,
 *   action?: Node,
 *   compact?: boolean
 * }} EmptyStateProps
 */

/**
 * Placeholder de "sem dados" para tabelas, listas e visões filtradas. Explica o
 * vazio e oferece uma saída: "Nenhum lançamento neste período. Ajuste o filtro
 * de datas ou importe um extrato OFX."
 *
 * @param {EmptyStateProps} props
 * @returns {HTMLDivElement}
 */
export function EmptyState(props) {
    var vazio = criarElemento('div', { class: props.compact ? 'ef-empty ef-empty--compact' : 'ef-empty' }, [
        props.icon ? criarElemento('span', { class: 'ef-empty__icon', 'aria-hidden': 'true' }, props.icon) : null,
        criarElemento('h4', { class: 'ef-empty__title' }, props.title),
        props.description ? criarElemento('p', { class: 'ef-empty__description' }, props.description) : null,
        props.action ? criarElemento('div', { class: 'ef-empty__action' }, props.action) : null
    ]);

    return aplicarPropsBase(vazio, props);
}
