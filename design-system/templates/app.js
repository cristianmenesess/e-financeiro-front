// @ts-check
/**
 * Monta os templates dentro do AppShell. Rota: /design-system/templates/
 * (?tela=<id> abre uma tela direto; ?tema=escuro força o tema).
 */
import { Badge, Button, IconButton } from '../components/index.js';
import { AppShell, Icon, renderizarIcones } from '../patterns/index.js';
import { alternarTema } from '../showcase/tema.js';
import { dados } from './data.js';
import { OverviewScreen } from './OverviewScreen.js';
import { TransactionsScreen } from './TransactionsScreen.js';
import { AccountsScreen } from './AccountsScreen.js';
import { ReportsScreen } from './ReportsScreen.js';
import { InsightsScreen } from './InsightsScreen.js';
import { SettingsScreen } from './SettingsScreen.js';
import { GoalsScreen } from './GoalsScreen.js';
import { MoreScreen } from './MoreScreen.js';

/** @type {Record<string, { breadcrumb: string, title: string, render: () => Node[], actions?: () => Node[] }>} */
var TELAS = {
    overview: {
        breadcrumb: 'Visão geral', title: 'Painel financeiro', render: OverviewScreen,
        actions: function () {
            return [
                Button({ variant: 'secondary', size: 'sm', iconLeft: Icon('download', 15), children: 'Exportar' }),
                Button({ size: 'sm', iconLeft: Icon('plus', 15), children: 'Novo lançamento' })
            ];
        }
    },
    transactions: { breadcrumb: 'Movimentação', title: 'Transações', render: TransactionsScreen },
    accounts: { breadcrumb: 'Movimentação', title: 'Contas e carteiras', render: AccountsScreen },
    reports: { breadcrumb: 'Análise', title: 'Relatórios', render: ReportsScreen },
    insights: { breadcrumb: 'Análise', title: 'Insights IA', render: InsightsScreen },
    goals: { breadcrumb: 'Planejamento', title: 'Metas', render: GoalsScreen },
    settings: { breadcrumb: 'Conta', title: 'Configurações', render: SettingsScreen },
    more: { breadcrumb: 'Conta', title: 'Mais', render: MoreScreen }
};

var NAV = [
    { id: 'overview', label: 'Visão geral', icon: Icon('layout-dashboard') },
    { id: 'transactions', label: 'Transações', icon: Icon('arrow-left-right'), badge: Badge({ size: 'sm', children: '12' }) },
    { id: 'accounts', label: 'Contas', icon: Icon('wallet') },
    { id: 'reports', label: 'Relatórios', icon: Icon('file-text') },
    { id: 'insights', label: 'Insights IA', icon: Icon('sparkles') },
    { id: 'goals', label: 'Metas', icon: Icon('target') },
    { id: 'settings', label: 'Configurações', icon: Icon('settings') }
];

var TABS_MOBILE = [
    { id: 'overview', label: 'Início', icon: Icon('home') },
    { id: 'transactions', label: 'Extrato', icon: Icon('arrow-left-right') },
    { id: 'insights', label: 'Insights', icon: Icon('sparkles') },
    { id: 'goals', label: 'Metas', icon: Icon('target') },
    { id: 'more', label: 'Mais', icon: Icon('more-horizontal') }
];

var raiz = /** @type {HTMLElement} */ (document.getElementById('app'));

/**
 * @param {string} id
 * @returns {void}
 */
function navegar(id) {
    var tela = TELAS[id] || TELAS.overview;
    var acoesTela = tela.actions || function () { return []; };

    raiz.replaceChildren(AppShell({
        logoSrc: '../assets/logo-lockup.png',
        markSrc: '../assets/logo-mark.png',
        nav: NAV.map(function (item) { return Object.assign({}, item, { icon: /** @type {Node} */ (item.icon).cloneNode(true) }); }),
        mobileTabs: TABS_MOBILE.map(function (item) { return Object.assign({}, item, { icon: item.icon.cloneNode(true) }); }),
        view: id,
        onNavigate: navegar,
        user: dados.user,
        breadcrumb: tela.breadcrumb,
        title: tela.title,
        actions: function () {
            return acoesTela().concat([IconButton({ label: 'Alternar tema', tone: 'surface', children: Icon('sun-moon'), onClick: function () { alternarTema(); } })]);
        },
        content: tela.render()
    }));

    history.replaceState(null, '', '?tela=' + id + window.location.search.replace(/^\?/, '&').replace(/&?tela=[^&]*/, ''));
    window.scrollTo(0, 0);
    renderizarIcones();
}

navegar(new URLSearchParams(window.location.search).get('tela') || 'overview');
