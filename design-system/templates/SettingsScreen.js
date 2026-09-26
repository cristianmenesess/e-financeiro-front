// @ts-check
import { Card, Field, Input, Select, Switch, Checkbox, Button, Avatar, Badge, ListRow, IconTile, Tabs, exibirToast } from '../components/index.js';
import { Icon, renderizarIcones } from '../patterns/index.js';
import { colunas, pilha, caixa, texto } from './_ui.js';

/**
 * Configurações: quatro abas (perfil, notificações, segurança, integrações) com
 * Field/Input/Select/Switch/Checkbox e barra de ações → Toast. Porte de
 * SettingsScreen.jsx.
 *
 * @returns {Node[]}
 */
export function SettingsScreen() {
    var corpo = caixa('ef-card-section-head', []);

    /** @type {Record<string, () => Node>} */
    var abas = {
        perfil: function () {
            return pilha([
                caixa('ef-row', [
                    Avatar({ name: 'Ana Ribeiro', size: 'lg', ring: true }),
                    pilha([texto('span', 'ef-h4', 'Ana Ribeiro'), texto('span', 'ef-caption', 'ana@ribeiro.co · Administradora')], 'ef-stack--tight'),
                    Button({ variant: 'secondary', size: 'sm', children: 'Trocar foto', className: 'ef-push' })
                ]),
                colunas('ef-columns--2', [
                    Field({ label: 'Nome completo', children: Input({ value: 'Ana Ribeiro' }) }),
                    Field({ label: 'E-mail', children: Input({ value: 'ana@ribeiro.co', type: 'email' }) }),
                    Field({ label: 'Razão social', children: Input({ value: 'Ribeiro & Co. Participações Ltda.' }) }),
                    Field({ label: 'CNPJ', children: Input({ mono: true, value: '12.345.678/0001-90' }) }),
                    Field({ label: 'Fuso horário', children: Select({ options: ['América/São_Paulo (GMT−3)', 'América/Manaus (GMT−4)', 'UTC'] }) }),
                    Field({ label: 'Moeda padrão', children: Select({ options: ['BRL — Real', 'USD — Dólar', 'EUR — Euro'] }) })
                ])
            ], 'ef-stack--loose');
        },
        notif: function () {
            return pilha([
                Switch({ checked: true, label: 'Alertas de saldo', description: 'Avisar quando o caixa ficar abaixo de R$ 50.000.' }),
                Switch({ checked: true, label: 'Resumo semanal', description: 'Enviado toda segunda-feira às 8h com o fechamento da semana.' }),
                Switch({ checked: true, label: 'Recomendações da IA', description: 'Insights de economia e risco direto no painel e por e-mail.' }),
                caixa('ef-divider', []),
                pilha([
                    texto('span', 'ef-mono-label', 'Canais'),
                    caixa('ef-row', [
                        Checkbox({ checked: true, label: 'E-mail' }), Checkbox({ checked: true, label: 'Push no app' }),
                        Checkbox({ label: 'WhatsApp' }), Checkbox({ label: 'Webhook' })
                    ])
                ], 'ef-stack--tight')
            ], 'ef-stack--loose ef-measure');
        },
        seg: function () {
            return pilha([
                Switch({ checked: false, label: 'Autenticação em dois fatores', description: 'Exigir código do aplicativo autenticador a cada acesso.' }),
                colunas('ef-columns--2', [
                    Field({ label: 'Senha atual', children: Input({ type: 'password', value: '••••••••••' }) }),
                    Field({ label: 'Nova senha', hint: 'Mínimo de 12 caracteres', children: Input({ type: 'password' }) })
                ]),
                pilha([texto('span', 'ef-mono-label', 'Sessões ativas')].concat(
                    [['MacBook Pro · São Paulo', 'Agora', 'laptop'], ['iPhone 15 · São Paulo', 'há 2 horas', 'smartphone']].map(function (sessao) {
                        return ListRow({
                            leading: IconTile({ children: Icon(sessao[2], 16) }), title: sessao[0], subtitle: sessao[1].toUpperCase(),
                            trailing: Button({ variant: 'ghost', size: 'sm', children: 'Encerrar' }), divider: false
                        });
                    })
                ), 'ef-stack--tight')
            ], 'ef-stack--loose ef-measure');
        },
        integr: function () {
            return pilha([
                ['Itaú Empresas', 'Open Finance · sincronizado', 'building-2', 'positive', 'Conectado'],
                ['Nubank PJ', 'Open Finance · sincronizado', 'credit-card', 'positive', 'Conectado'],
                ['Omie ERP', 'Notas fiscais e contratos', 'boxes', 'neutral', 'Conectar'],
                ['Contabilizei', 'Envio automático de guias', 'calculator', 'neutral', 'Conectar']
            ].map(function (integracao) {
                return ListRow({
                    leading: IconTile({ tone: integracao[3] === 'positive' ? 'positive' : 'neutral', children: Icon(integracao[2], 16) }),
                    title: integracao[0], subtitle: integracao[1].toUpperCase(),
                    trailing: integracao[4] === 'Conectado'
                        ? Badge({ tone: 'positive', dot: true, children: 'Conectado' })
                        : Button({ variant: 'secondary', size: 'sm', children: integracao[4] })
                });
            }), 'ef-stack--flush');
        }
    };

    /** @param {string} aba */
    function mostrar(aba) {
        corpo.replaceChildren(abas[aba]());
        renderizarIcones();
    }

    mostrar('perfil');

    var rodape = caixa('ef-card-footer', [
        caixa('ef-push ef-row', [
            Button({ variant: 'ghost', children: 'Descartar' }),
            Button({
                children: 'Salvar alterações',
                onClick: function () { exibirToast({ tone: 'positive', title: 'Preferências salvas', message: 'As alterações já valem para toda a equipe.' }, 3500); }
            })
        ])
    ]);

    return [Card({
        padding: 'none',
        children: [
            caixa('ef-card-section-head', [Tabs({
                value: 'perfil', onChange: mostrar,
                items: [{ value: 'perfil', label: 'Perfil e empresa' }, { value: 'notif', label: 'Notificações' }, { value: 'seg', label: 'Segurança' }, { value: 'integr', label: 'Integrações' }]
            })]),
            corpo,
            rodape
        ]
    })];
}
