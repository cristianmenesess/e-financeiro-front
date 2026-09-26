// @ts-check
import {
    Card, CardHeader, StatCard, AreaChart, DonutChart, DonutLegend, SegmentedControl,
    InsightCard, ListRow, IconTile, Sparkline, Badge, ProgressBar, IconButton
} from '../components/index.js';
import { Grid, Icon } from '../patterns/index.js';
import { dados, brl } from './data.js';
import { cabecalhoSecao, colunas, pilha, linhaFlex } from './_ui.js';

/**
 * Visão geral: 4 KPIs, card de saldo com aurora + AreaChart e seletor de
 * período, anel de alocação, dois InsightCard, orçamentos, contas e últimos
 * lançamentos. Porte de ui_kits/admin-dashboard/OverviewScreen.jsx.
 *
 * @returns {Node[]}
 */
export function OverviewScreen() {
    var periodo = '1M';
    var areaGrafico = document.createElement('div');

    function desenharGrafico() {
        areaGrafico.replaceChildren(AreaChart({
            data: dados.cashflow[periodo],
            height: 240,
            xLabels: dados.cashflowLabels[periodo],
            formatY: function (v) { return (v / 1000).toFixed(1) + 'M'; }
        }));
    }

    desenharGrafico();

    var saldo = document.createElement('div');
    saldo.className = 'ef-figure';
    saldo.innerHTML = '<span class="ef-figure__value">R$ 1.284.309,40</span>'
        + '<span class="ef-figure__delta">↑ 18,4%</span>'
        + '<span class="ef-figure__caption">vs. mês anterior</span>';

    var kpis = Grid({
        min: 262,
        children: dados.kpis.map(function (kpi) {
            return StatCard({
                label: kpi.label, value: kpi.value, delta: kpi.delta, caption: kpi.caption,
                tone: kpi.tone, series: kpi.series, icon: Icon(kpi.icon, 16)
            });
        })
    });

    var linha1 = colunas('ef-columns--wide-left', [
        Card({
            aurora: true,
            children: [
                CardHeader({
                    label: 'Fluxo de caixa',
                    title: 'Saldo consolidado',
                    action: SegmentedControl({
                        size: 'sm', options: ['1M', '3M', '1A', 'TUDO'], value: periodo,
                        onChange: function (valor) { periodo = valor; desenharGrafico(); }
                    })
                }),
                saldo,
                areaGrafico
            ]
        }),
        Card({
            children: [
                CardHeader({ label: 'Composição da receita', action: IconButton({ label: 'Detalhar', children: Icon('arrow-up-right', 16) }) }),
                linhaFlex([
                    DonutChart({ data: dados.allocation, size: 168, thickness: 13, centerLabel: 'Total', centerValue: 'R$ 4,22M' }),
                    DonutLegend({
                        data: dados.allocation.map(function (a) { return Object.assign({}, a, { precise: true }); }),
                        style: { flex: '1', minWidth: '0' }
                    })
                ])
            ]
        })
    ]);

    var linha2 = colunas('ef-columns--3', [
        InsightCard({ body: dados.insights[0].body, confidence: dados.insights[0].confidence, onAction: function () {} }),
        InsightCard({ label: 'Alerta IA', tone: 'warning', body: dados.insights[1].body, confidence: dados.insights[1].confidence, actionLabel: 'Pagar agora', onAction: function () {} }),
        Card({
            children: [
                CardHeader({ label: 'Orçamentos do mês' }),
                pilha(dados.budgets.map(function (orcamento) {
                    var percentual = (orcamento.used / orcamento.cap) * 100;
                    return ProgressBar({
                        label: orcamento.label,
                        value: percentual,
                        valueLabel: brl(orcamento.used).replace(',00', '') + ' / ' + brl(orcamento.cap).replace(',00', ''),
                        tone: percentual > 100 ? 'negative' : percentual > 80 ? 'warning' : 'brand'
                    });
                }))
            ]
        })
    ]);

    var linha3 = colunas('ef-columns--2', [
        Card({
            padding: 'none',
            children: [
                cabecalhoSecao('Contas e carteiras', 'Ver contas'),
                dados.accounts.map(function (conta, i) {
                    return ListRow({
                        divider: i < dados.accounts.length - 1,
                        leading: IconTile({ tone: conta.tone, children: Icon(conta.icon, 16) }),
                        title: conta.name, subtitle: conta.sub, value: conta.value, delta: conta.delta,
                        tone: conta.neg ? 'negative' : 'positive',
                        trailing: Sparkline({ data: conta.series, width: 80, height: 26, tone: conta.neg ? 'negative' : 'positive', className: 'ef-desktop-only' }),
                        onClick: function () {}
                    });
                })
            ]
        }),
        Card({
            padding: 'none',
            children: [
                cabecalhoSecao('Últimos lançamentos', 'Ver extrato'),
                dados.transactions.slice(0, 5).map(function (lancamento, i) {
                    return ListRow({
                        divider: i < 4,
                        leading: IconTile({ tone: lancamento.pos ? 'positive' : 'neutral', children: Icon(lancamento.icon, 16) }),
                        title: lancamento.desc,
                        subtitle: lancamento.cat.toUpperCase() + ' · ' + lancamento.data.slice(0, 5),
                        value: lancamento.valor,
                        tone: lancamento.pos ? 'positive' : 'negative',
                        trailing: Badge({ size: 'sm', tone: lancamento.st, dot: true, children: lancamento.status, className: 'ef-desktop-only' }),
                        onClick: function () {}
                    });
                })
            ]
        })
    ]);

    return [kpis, linha1, linha2, linha3];
}
