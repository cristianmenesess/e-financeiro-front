// @ts-check
import { Card, CardHeader, InsightCard, Badge, Button, ProgressBar, ListRow, IconTile, Sparkline, Tabs, AreaChart } from '../components/index.js';
import { Icon } from '../patterns/index.js';
import { dados } from './data.js';
import { colunas, pilha, caixa, texto } from './_ui.js';

/**
 * Insights IA: bloco inverse + aurora com a recomendação, sinais em ListRow,
 * projeção em AreaChart violeta, ProgressBar pontilhado de confiança.
 * Porte de InsightsScreen.jsx.
 *
 * @returns {Node[]}
 */
export function InsightsScreen() {
    var sinais = [
        { id: 1, name: 'Receita recorrente', note: 'Momento forte', delta: '+24%', icon: 'trending-up', tone: /** @type {'positive'} */ ('positive'), neg: false },
        { id: 2, name: 'Despesas com software', note: 'Acima da média', delta: '+22%', icon: 'credit-card', tone: /** @type {'warning'} */ ('warning'), neg: true },
        { id: 3, name: 'Prazo médio de recebimento', note: 'Estável', delta: '0%', icon: 'clock', tone: /** @type {'neutral'} */ ('neutral'), neg: false },
        { id: 4, name: 'Inadimplência de clientes', note: 'Queda consistente', delta: '−8%', icon: 'shield-check', tone: /** @type {'positive'} */ ('positive'), neg: false }
    ];

    var manchete = texto('h2', 'ef-h2', 'Antecipe R$ 96.500 em recebíveis');
    manchete.append(texto('span', 'ef-accent-dot', '.'));

    var recomendacao = Card({
        inverse: true,
        aurora: true,
        children: caixa('ef-row ef-row--between', [
            pilha([
                texto('span', 'ef-mono-label ef-text-inverse-muted', 'Recomendação do dia'),
                manchete,
                texto('p', 'ef-body-sm ef-text-inverse-muted ef-measure', 'Com a taxa atual de 1,49% ao mês, antecipar o contrato Orbit Labs cobre o DARF em atraso e mantém o runway acima de 14 meses.')
            ], 'ef-stack--tight ef-grow'),
            pilha([
                Badge({ tone: 'ai', mono: true, children: '96% CONFIANÇA' }),
                Button({ variant: 'success', size: 'lg', iconRight: Icon('arrow-up-right', 16), children: 'Simular antecipação' })
            ], 'ef-stack--tight')
        ])
    });

    var listaSinais = Card({
        padding: 'none',
        children: [
            caixa('ef-card-section-head', [Tabs({
                value: 'todos',
                items: [{ value: 'todos', label: 'Todos os sinais', count: sinais.length }, { value: 'risco', label: 'Risco' }, { value: 'economia', label: 'Economia' }, { value: 'crescimento', label: 'Crescimento' }]
            })]),
            sinais.map(function (sinal, i) {
                return ListRow({
                    divider: i < sinais.length - 1,
                    leading: IconTile({ tone: sinal.tone, children: Icon(sinal.icon, 16) }),
                    title: sinal.name, subtitle: sinal.note.toUpperCase(), value: sinal.delta,
                    tone: sinal.neg ? 'negative' : 'positive',
                    trailing: Sparkline({ data: dados.kpis[i % 4].series, width: 96, height: 28, tone: sinal.neg ? 'negative' : 'positive', className: 'ef-desktop-only' }),
                    onClick: function () {}
                });
            })
        ]
    });

    var projecao = Card({
        className: 'ef-columns__full',
        children: [
            CardHeader({ label: 'Projeção de caixa · 6 meses', title: 'Cenário base com a antecipação aplicada' }),
            AreaChart({ data: dados.cashflow['1A'].slice(0, 26), tone: 'violet', height: 200, xLabels: ['OUT', 'NOV', 'DEZ', 'JAN', 'FEV', 'MAR'], formatY: function (v) { return (v / 1000).toFixed(1) + 'M'; } }),
            colunas('ef-columns--2', [
                ProgressBar({ label: 'Confiança do modelo', valueLabel: '91%', value: 91, tone: 'ai', dotted: true }),
                ProgressBar({ label: 'Cobertura de dados bancários', valueLabel: '100%', value: 100, tone: 'positive' })
            ])
        ]
    });

    return [
        recomendacao,
        listaSinais,
        colunas('ef-columns--2', [
            InsightCard({ body: dados.insights[0].body, confidence: dados.insights[0].confidence, onAction: function () {} }),
            InsightCard({ label: 'Alerta IA', tone: 'warning', body: dados.insights[1].body, confidence: dados.insights[1].confidence, actionLabel: 'Pagar agora', onAction: function () {} }),
            projecao
        ])
    ];
}
