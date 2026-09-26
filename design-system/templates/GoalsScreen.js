// @ts-check
import { Card, IconTile, Badge, ProgressBar, Button } from '../components/index.js';
import { Grid, Icon } from '../patterns/index.js';
import { dados } from './data.js';
import { pilha, caixa, texto } from './_ui.js';

/**
 * Metas: cada meta com IconTile, percentual mono, Badge "Atingida" e
 * ProgressBar. Porte da aba Metas de ui_kits/mobile-app/MobileApp.jsx.
 *
 * @returns {Node[]}
 */
export function GoalsScreen() {
    /** @param {number} valor */
    function reais(valor) { return 'R$ ' + valor.toLocaleString('pt-BR'); }

    var metas = dados.goals.map(function (meta) {
        var atingida = meta.cur >= meta.cap;
        return Card({
            padding: 'compact',
            children: pilha([
                caixa('ef-row', [
                    IconTile({ tone: atingida ? 'positive' : 'brand', size: 38, children: Icon(meta.ic, 18) }),
                    pilha([
                        texto('span', 'ef-strong', meta.n),
                        texto('span', 'ef-mono-sub', Math.round(meta.cur / meta.cap * 100) + '% concluído')
                    ], 'ef-stack--flush ef-grow'),
                    atingida ? Badge({ tone: 'positive', dot: true, children: 'Atingida' }) : caixa('', [])
                ]),
                ProgressBar({ value: meta.cur / meta.cap * 100, valueLabel: reais(meta.cur) + ' / ' + reais(meta.cap), tone: atingida ? 'positive' : 'brand' })
            ])
        });
    });

    return [
        Grid({ min: 300, children: metas }),
        Button({ variant: 'secondary', size: 'lg', fullWidth: true, iconLeft: Icon('plus', 16), children: 'Nova meta' })
    ];
}
