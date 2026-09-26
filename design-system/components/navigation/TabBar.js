// @ts-check
import { criarElemento, aplicarPropsBase } from '../_internal/dom.js';

/**
 * @typedef {{ id: string, label: string, icon?: Node, href?: string }} TabBarItem
 *
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   items: TabBarItem[],
 *   active?: string,
 *   onSelect?: (id: string) => void
 * }} TabBarProps
 */

/**
 * Navegação inferior do mobile. Vidro fosco, no máximo 5 itens; o ativo ganha a
 * pílula teal suave atrás do glifo. Controla a seleção (aria-current).
 *
 * @param {TabBarProps} props
 * @returns {HTMLElement}
 */
export function TabBar(props) {
    /** @type {HTMLElement[]} */
    var itens = props.items.slice(0, 5).map(function (item) {
        var atributos = {
            class: 'ef-tabbar__item',
            'aria-current': item.id === props.active ? 'page' : null,
            'data-id': item.id
        };
        var filhos = [
            criarElemento('span', { class: 'ef-tabbar__pill', 'aria-hidden': 'true' }, item.icon || null),
            criarElemento('span', { class: 'ef-tabbar__label' }, item.label)
        ];

        var elemento = item.href
            ? criarElemento('a', Object.assign({ href: item.href }, atributos), filhos)
            : criarElemento('button', Object.assign({ type: 'button' }, atributos), filhos);

        elemento.addEventListener('click', function () {
            itens.forEach(function (outro) { outro.removeAttribute('aria-current'); });
            elemento.setAttribute('aria-current', 'page');

            if (props.onSelect) {
                props.onSelect(item.id);
            }
        });

        return elemento;
    });

    return aplicarPropsBase(criarElemento('nav', { class: 'ef-tabbar', 'aria-label': 'Navegação' }, itens), props);
}
