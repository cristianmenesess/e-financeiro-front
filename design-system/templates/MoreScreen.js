// @ts-check
import { Card, Avatar, Badge, ListRow, IconTile, Switch, Button } from '../components/index.js';
import { Icon } from '../patterns/index.js';
import { pilha, caixa, texto } from './_ui.js';

/**
 * Mais: perfil, atalhos de conta em ListRow, Switch de notificação e biometria,
 * sair. Porte da aba Mais de ui_kits/mobile-app/MobileApp.jsx.
 *
 * @returns {Node[]}
 */
export function MoreScreen() {
    return [
        Card({
            padding: 'compact',
            children: caixa('ef-row', [
                Avatar({ name: 'Ana Ribeiro', size: 'lg', ring: true }),
                pilha([texto('span', 'ef-h4', 'Ana Ribeiro'), texto('span', 'ef-caption', 'ana@ribeiro.co')], 'ef-stack--flush ef-grow'),
                Badge({ tone: 'brand', children: 'Premium' })
            ])
        }),
        Card({
            padding: 'none',
            children: [['Contas conectadas', '4 ATIVAS', 'wallet'], ['Categorias', '18 CATEGORIAS', 'tags'], ['Relatórios', 'PDF · XLSX', 'file-text'], ['Exportar dados', 'OFX · CSV', 'download']].map(function (item, i) {
                return ListRow({
                    divider: i < 3, leading: IconTile({ children: Icon(item[2], 16) }), title: item[0], subtitle: item[1],
                    trailing: Icon('chevron-right', 16), onClick: function () {}
                });
            })
        }),
        Card({
            padding: 'compact',
            children: pilha([
                Switch({ checked: true, label: 'Notificações push', description: 'Alertas de saldo e vencimentos.' }),
                Switch({ checked: true, label: 'Face ID', description: 'Exigir biometria ao abrir o app.' })
            ])
        }),
        Button({ variant: 'ghost', size: 'lg', fullWidth: true, children: 'Sair da conta' })
    ];
}
