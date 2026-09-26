// @ts-check
import { Card, CardHeader, StatCard, ListRow, IconTile, Button, Badge, AreaChart } from '../components/index.js';
import { Grid, SectionTitle, Icon, renderizarIcones } from '../patterns/index.js';
import { dados } from './data.js';
import { colunas, pilha, caixa, texto } from './_ui.js';

/**
 * Contas: lista mestre-detalhe (linha selecionada em teal suave), card da conta
 * com aurora e gráfico, dois KPIs compactos. Porte de AccountsScreen.jsx.
 *
 * @returns {Node[]}
 */
export function AccountsScreen() {
    var selecionada = dados.accounts[0].id;
    var lista = document.createElement('div');
    var detalhe = document.createElement('div');

    function desenhar() {
        lista.replaceChildren.apply(lista, dados.accounts.map(function (conta, i) {
            return ListRow({
                divider: i < dados.accounts.length - 1,
                leading: IconTile({ tone: conta.tone, children: Icon(conta.icon, 16) }),
                title: conta.name, subtitle: conta.sub, value: conta.value, delta: conta.delta,
                tone: conta.neg ? 'negative' : 'positive',
                selected: conta.id === selecionada,
                onClick: function () { selecionada = conta.id; desenhar(); }
            });
        }));

        var conta = dados.accounts.filter(function (c) { return c.id === selecionada; })[0];
        var valor = caixa('ef-figure', [
            texto('span', 'ef-figure__value', conta.value),
            texto('span', conta.neg ? 'ef-figure__delta ef-figure__delta--negative' : 'ef-figure__delta', conta.delta)
        ]);

        detalhe.replaceChildren(pilha([
            Card({
                aurora: true,
                children: [
                    CardHeader({ label: conta.sub, title: conta.name, action: Badge({ tone: 'positive', dot: true, children: 'Sincronizado' }) }),
                    valor,
                    AreaChart({
                        data: dados.cashflow['1M'], tone: conta.neg ? 'negative' : 'brand', height: 190,
                        xLabels: dados.cashflowLabels['1M'], formatY: function (v) { return (v / 1000).toFixed(1) + 'M'; }
                    })
                ]
            }),
            Grid({
                min: 200,
                children: [
                    StatCard({ compact: true, label: 'Entradas · 30 dias', value: 'R$ 216.500', delta: '7,4%', series: conta.series }),
                    StatCard({ compact: true, label: 'Saídas · 30 dias', value: 'R$ 128.940', delta: '3,1%', tone: 'negative', series: conta.series.slice().reverse() })
                ]
            })
        ], 'ef-stack--loose'));
        renderizarIcones();
    }

    desenhar();

    var cabecalho = caixa('ef-card-section-head', [SectionTitle({
        children: 'Contas conectadas',
        action: Button({ variant: 'secondary', size: 'sm', iconLeft: Icon('plus', 15), children: 'Conectar' })
    })]);

    var rodape = caixa('ef-card-footer', [
        caixa('ef-row', [Icon('shield-check', 16), texto('span', 'ef-caption', 'Conexões via Open Finance, somente leitura.')])
    ]);

    return [colunas('ef-columns--wide-right', [Card({ padding: 'none', children: [cabecalho, lista, rodape] }), detalhe])];
}
