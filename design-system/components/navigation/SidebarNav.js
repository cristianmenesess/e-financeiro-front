// @ts-check
import { criarElemento, aplicarPropsBase, classes } from '../_internal/dom.js';

/**
 * @typedef {{ id: string, label: string, icon?: Node, badge?: Node, href?: string, disabled?: boolean }} SidebarNavItem
 *
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   logo?: Node,
 *   items: SidebarNavItem[],
 *   active?: string,
 *   onSelect?: (id: string) => void,
 *   footer?: Node,
 *   collapsed?: boolean
 * }} SidebarNavProps
 *
 * @typedef {import('../_internal/dom.js').PropsBase & SidebarNavItem & {
 *   active?: boolean,
 *   collapsed?: boolean,
 *   onClick?: (evento: MouseEvent) => void
 * }} NavItemProps
 */

/**
 * Navegação primária do desktop: rail branco, marca no topo, UserChip no pé.
 * O item ativo ganha a barra teal de 3px na aresta esquerda + pílula afundada —
 * nunca uma barra preenchida. `collapsed` = rail só de ícones (76px).
 * Controla a seleção: ao clicar, move aria-current e chama `onSelect`.
 *
 * @param {SidebarNavProps} props
 * @returns {HTMLElement}
 */
export function SidebarNav(props) {
    var lista = criarElemento('ul', { class: 'ef-sidebar__list' });

    /** @type {HTMLElement[]} */
    var botoes = props.items.map(function (item) {
        var botao = NavItem(Object.assign({}, item, {
            active: item.id === props.active,
            collapsed: props.collapsed,
            onClick: function () {
                botoes.forEach(function (outro) { outro.removeAttribute('aria-current'); });
                botao.setAttribute('aria-current', 'page');

                if (props.onSelect) {
                    props.onSelect(item.id);
                }
            }
        }));

        lista.append(criarElemento('li', {}, botao));
        return botao;
    });

    var rail = criarElemento('nav', {
        class: classes('ef-sidebar', props.collapsed && 'ef-sidebar--collapsed'),
        'aria-label': 'Navegação principal'
    }, [
        props.logo ? criarElemento('div', { class: 'ef-sidebar__logo' }, props.logo) : null,
        lista,
        props.footer ? criarElemento('div', { class: 'ef-sidebar__footer' }, props.footer) : null
    ]);

    return aplicarPropsBase(rail, props);
}

/**
 * Item do rail lateral. Com `href` vira link; sem, botão. Recolhido, mostra só o
 * ícone e usa o rótulo como tooltip e nome acessível.
 *
 * @param {NavItemProps} props
 * @returns {HTMLElement}
 */
export function NavItem(props) {
    var atributos = {
        class: classes('ef-nav-item', props.collapsed && 'ef-nav-item--collapsed'),
        'aria-current': props.active ? 'page' : null,
        title: props.collapsed ? props.label : null,
        'aria-label': props.collapsed ? props.label : null,
        'data-id': props.id
    };
    var filhos = [
        props.icon ? criarElemento('span', { class: 'ef-nav-item__icon', 'aria-hidden': 'true' }, props.icon) : null,
        props.collapsed ? null : criarElemento('span', { class: 'ef-nav-item__label' }, props.label),
        props.collapsed ? null : (props.badge || null)
    ];

    var item = props.href
        ? criarElemento('a', Object.assign({ href: props.href }, atributos), filhos)
        : criarElemento('button', Object.assign({ type: 'button', disabled: !!props.disabled }, atributos), filhos);

    if (props.onClick) {
        item.addEventListener('click', /** @type {EventListener} */ (props.onClick));
    }

    return aplicarPropsBase(item, props);
}
