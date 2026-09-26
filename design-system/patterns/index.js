// @ts-check
/**
 * Padrões de composição do E-Financeiro (porte de ui_kits/admin-dashboard/Shell.jsx):
 * AppShell (rail + top bar + tab bar responsiva), Grid, SectionTitle e Icon.
 * Montados só com os componentes públicos de ../components/index.js.
 */
import { SidebarNav, TopBar, TabBar, UserChip, SearchField, IconButton } from '../components/index.js';

/** @typedef {import('../components/navigation/SidebarNav.js').SidebarNavItem} ItemNavegacao */
/** @typedef {import('../components/navigation/TabBar.js').TabBarItem} ItemTabBar */

/**
 * Glifo Lucide (DESIGN.md → Iconography). Cria o <i data-lucide>; chame
 * renderizarIcones() depois de montar a tela para o Lucide trocar pelo SVG.
 *
 * @param {string} nome nome Lucide, ex. "wallet"
 * @param {number} [tamanho] 15–16 em linhas, 18 padrão, 20 em destaque
 * @returns {HTMLElement}
 */
export function Icon(nome, tamanho) {
    var lado = (tamanho || 18) + 'px';
    var icone = document.createElement('i');
    icone.className = 'ef-icon';
    icone.setAttribute('data-lucide', nome);
    icone.setAttribute('aria-hidden', 'true');
    icone.style.width = lado;
    icone.style.height = lado;
    return icone;
}

/**
 * Troca todos os <i data-lucide> da página pelo SVG (se o Lucide estiver carregado).
 *
 * @returns {void}
 */
export function renderizarIcones() {
    var lucide = /** @type {any} */ (window).lucide;

    if (lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons({ attrs: { 'stroke-width': 1.9 } });
    }
}

/**
 * Grade de cards auto-ajustável: repeat(auto-fit, minmax(min(<min>px,100%),1fr)).
 *
 * @param {{ min?: number, tight?: boolean, children: Node[] }} props
 * @returns {HTMLDivElement}
 */
export function Grid(props) {
    var grade = document.createElement('div');
    grade.className = props.tight ? 'ef-grid ef-grid--tight' : 'ef-grid';
    grade.style.setProperty('--ef-grid-min', (props.min || 220) + 'px');
    grade.append.apply(grade, props.children);
    return grade;
}

/**
 * Título de seção (h4) com ação à direita.
 *
 * @param {{ children: string, action?: Node }} props
 * @returns {HTMLDivElement}
 */
export function SectionTitle(props) {
    var bloco = document.createElement('div');
    bloco.className = 'ef-section-title';
    var titulo = document.createElement('h3');
    titulo.className = 'ef-section-title__text';
    titulo.textContent = props.children;
    bloco.append(titulo);

    if (props.action) {
        bloco.append(props.action);
    }

    return bloco;
}

/**
 * @typedef {{
 *   logoSrc: string,
 *   markSrc: string,
 *   nav: ItemNavegacao[],
 *   mobileTabs: ItemTabBar[],
 *   view: string,
 *   onNavigate: (id: string) => void,
 *   user: { name: string, meta?: string },
 *   breadcrumb?: string,
 *   title: string,
 *   actions?: () => Node[],
 *   searchPlaceholder?: string,
 *   content: Node[]
 * }} AppShellProps
 */

/**
 * Casca do painel: rail lateral (desktop), top bar de vidro, conteúdo com
 * largura máxima e tab bar inferior (abaixo de 1024px). As ações da página vão
 * na top bar no desktop e numa linha acima do conteúdo no mobile.
 *
 * @param {AppShellProps} props
 * @returns {HTMLDivElement}
 */
export function AppShell(props) {
    var logo = document.createElement('img');
    logo.src = props.logoSrc;
    logo.alt = 'E-Financeiro';
    logo.className = 'ef-shell__logo';

    var marca = document.createElement('img');
    marca.src = props.markSrc;
    marca.alt = '';
    marca.className = 'ef-shell__mark ef-mobile-only';

    // Fábrica: as ações são criadas duas vezes (top bar no desktop, linha no
    // mobile), cada uma com seus próprios listeners.
    var criarAcoes = props.actions || function () { return []; };
    var acoesDesktop = document.createElement('div');
    acoesDesktop.className = 'ef-row ef-desktop-only';
    acoesDesktop.append.apply(acoesDesktop, criarAcoes());

    var buscaMobile = IconButton({ label: 'Buscar', tone: 'surface', children: Icon('search'), className: 'ef-mobile-only' });

    var rail = SidebarNav({
        className: 'ef-shell__rail',
        logo: logo,
        items: props.nav,
        active: props.view,
        onSelect: props.onNavigate,
        footer: UserChip({ name: props.user.name, meta: props.user.meta, trailing: Icon('chevron-down', 16), onClick: function () {} })
    });

    var conteudo = document.createElement('div');
    conteudo.className = 'ef-shell__content';

    var listaAcoesMobile = criarAcoes();

    if (listaAcoesMobile.length) {
        var acoesMobile = document.createElement('div');
        acoesMobile.className = 'ef-shell__mobile-actions ef-mobile-only';
        acoesMobile.append.apply(acoesMobile, listaAcoesMobile);
        conteudo.append(acoesMobile);
    }

    conteudo.append.apply(conteudo, props.content);

    var principal = document.createElement('main');
    principal.className = 'ef-shell__main';
    principal.append(
        TopBar({
            breadcrumb: props.breadcrumb,
            title: props.title,
            search: SearchField({ width: 280, placeholder: props.searchPlaceholder || 'Buscar lançamentos, contas…', className: 'ef-desktop-only' }),
            actions: [buscaMobile, acoesDesktop, IconButton({ label: 'Alertas', tone: 'surface', children: Icon('bell') }), marca]
        }),
        conteudo
    );

    var tabbar = document.createElement('div');
    tabbar.className = 'ef-shell__tabbar';
    tabbar.append(TabBar({ items: props.mobileTabs, active: props.view, onSelect: props.onNavigate }));

    var casca = document.createElement('div');
    casca.className = 'ef-shell';
    casca.append(rail, principal, tabbar);
    return casca;
}
