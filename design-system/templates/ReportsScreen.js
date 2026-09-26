// @ts-check
import {
    Card, CardHeader, DataTable, Button, IconTile, Dialog, Field, Select, Input, Checkbox,
    ScoreGauge, StatCard, exibirToast
} from '../components/index.js';
import { Grid, Icon } from '../patterns/index.js';
import { dados } from './data.js';
import { colunas, pilha, caixa, texto } from './_ui.js';

/**
 * Relatórios: grade de cards interativos, DRE comparativo em DataTable,
 * ScoreGauge de saúde, Dialog de exportação → Toast. Porte de ReportsScreen.jsx.
 *
 * @returns {Node[]}
 */
export function ReportsScreen() {
    var exportar = Dialog({
        open: false,
        placement: 'auto',
        title: 'Exportar relatório',
        description: 'O arquivo é gerado com os filtros ativos e enviado para o seu e-mail.',
        children: pilha([
            Field({ label: 'Relatório', children: Select({ options: dados.reports.map(function (r) { return r.name; }) }) }),
            colunas('ef-columns--2', [
                Field({ label: 'Período', children: Select({ options: ['Setembro 2026', '3º trimestre', 'Ano de 2026'] }) }),
                Field({ label: 'Formato', children: Select({ options: ['PDF', 'XLSX', 'CSV'] }) })
            ]),
            Field({ label: 'Nome do arquivo', children: Input({ value: 'dre-gerencial-set-2026' }) }),
            Checkbox({ checked: true, label: 'Incluir notas explicativas e conciliação' })
        ]),
        footer: [
            Button({ variant: 'secondary', children: 'Cancelar', onClick: function () { exportar.fechar(); } }),
            Button({
                children: 'Gerar arquivo',
                onClick: function () {
                    exportar.fechar();
                    exibirToast({ tone: 'positive', title: 'Relatório gerado', message: 'dre-gerencial-set-2026.pdf enviado para ana@ribeiro.co' });
                }
            })
        ]
    });

    var grade = Grid({
        min: 260,
        children: dados.reports.map(function (relatorio) {
            return Card({
                interactive: true,
                onClick: function () { exportar.abrir(); },
                children: pilha([
                    caixa('ef-row ef-row--between', [IconTile({ tone: 'brand', size: 38, children: Icon(relatorio.icon, 18) }), Icon('arrow-up-right', 16)]),
                    pilha([texto('span', 'ef-h4', relatorio.name), texto('span', 'ef-mono-sub', relatorio.period)], 'ef-stack--tight'),
                    texto('span', 'ef-caption ef-caption--faint', 'Atualizado ' + relatorio.updated)
                ])
            });
        })
    });

    var dre = Card({
        padding: 'none',
        children: [
            caixa('ef-card-section-head ef-row ef-row--between', [
                CardHeader({ label: 'DRE gerencial', title: 'Setembro 2026 vs. Agosto 2026', style: { marginBottom: '0' } }),
                Button({ variant: 'secondary', size: 'sm', iconLeft: Icon('download', 15), children: 'Exportar PDF', onClick: function () { exportar.abrir(); } })
            ]),
            DataTable({
                rows: dados.dre,
                columns: [
                    { key: 'linha', header: 'Linha', render: function (r) { return texto('span', r.strong ? 'ef-bold' : '', r.linha); } },
                    { key: 'set', header: 'Setembro', mono: true, align: 'right' },
                    { key: 'ago', header: 'Agosto', mono: true, align: 'right' },
                    { key: 'var', header: 'Variação', mono: true, align: 'right', render: function (r) { return texto('span', (r.pos ? 'ef-text-positive' : 'ef-text-negative') + ' ef-strong', r.var); } }
                ]
            })
        ]
    });

    var lateral = pilha([
        Card({ children: [CardHeader({ label: 'Saúde financeira' }), caixa('ef-center', [ScoreGauge({ value: 78, max: 100, label: '/100', caption: 'boa · liquidez confortável', tone: 'positive', size: 168 })])] }),
        StatCard({ label: 'Margem operacional', value: '24,1%', delta: '4,6 p.p.', caption: 'vs. agosto', series: dados.kpis[0].series })
    ], 'ef-stack--loose');

    return [grade, colunas('ef-columns--report', [dre, lateral]), exportar];
}
