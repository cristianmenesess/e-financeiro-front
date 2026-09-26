// @ts-check
import {
    Card, DataTable, Tabs, Tag, Badge, Button, IconButton, SearchField, Select, IconTile,
    EmptyState, Dialog, Field, Input, ListRow, Checkbox
} from '../components/index.js';
import { Icon, renderizarIcones } from '../patterns/index.js';
import { dados } from './data.js';
import { colunas, pilha, linhaFlex } from './_ui.js';

/** @typedef {import('./data.js').Lancamento} Lancamento */

/**
 * Transações: busca, filtros em Tag, Tabs com contagem, DataTable clicável
 * (ListRow no mobile) → Dialog de edição, EmptyState quando o filtro zera,
 * paginação. Porte de ui_kits/admin-dashboard/TransactionsScreen.jsx.
 *
 * @returns {Node[]}
 */
export function TransactionsScreen() {
    var aba = 'todas';
    /** @type {string | null} */
    var categoria = null;
    var categorias = Array.from(new Set(dados.transactions.map(function (t) { return t.cat; })));

    var areaLista = document.createElement('div');
    var rodape = document.createElement('div');
    rodape.className = 'ef-card-footer';
    var dialogo = document.createElement('div');

    /** @returns {Lancamento[]} */
    function filtrar() {
        return dados.transactions.filter(function (t) {
            var passaAba = aba === 'todas' || (aba === 'entradas' && t.pos) || (aba === 'saidas' && !t.pos) || (aba === 'pendentes' && t.status !== 'Conciliado');
            return passaAba && (!categoria || t.cat === categoria);
        });
    }

    function desenhar() {
        var linhas = filtrar();

        if (linhas.length === 0) {
            areaLista.replaceChildren(EmptyState({
                icon: Icon('receipt', 20),
                title: 'Nenhum lançamento com esse filtro',
                description: 'Remova a categoria selecionada ou amplie o período.',
                action: Button({ size: 'sm', variant: 'secondary', children: 'Limpar filtros', onClick: limparFiltros })
            }));
        } else {
            var tabela = DataTable({ columns: colunasTabela(), rows: linhas, onRowClick: abrir, className: 'ef-desktop-only' });
            var lista = document.createElement('div');
            lista.className = 'ef-mobile-only ef-stack ef-stack--flush';
            lista.append.apply(lista, linhas.map(function (t, i) {
                return ListRow({
                    divider: i < linhas.length - 1,
                    leading: IconTile({ tone: t.pos ? 'positive' : 'neutral', children: Icon(t.icon, 16) }),
                    title: t.desc, subtitle: t.cat.toUpperCase() + ' · ' + t.data.slice(0, 5),
                    value: t.valor, tone: t.pos ? 'positive' : 'negative',
                    onClick: function () { abrir(t); }
                });
            }));
            areaLista.replaceChildren(tabela, lista);
        }

        var contagem = document.createElement('span');
        contagem.className = 'ef-numeric-muted';
        contagem.textContent = linhas.length + ' de ' + dados.transactions.length + ' lançamentos';
        rodape.replaceChildren(contagem, linhaFlex([
            IconButton({ label: 'Anterior', tone: 'surface', size: 'sm', children: Icon('chevron-left', 16) }),
            IconButton({ label: 'Próxima', tone: 'surface', size: 'sm', children: Icon('chevron-right', 16) })
        ]));
        renderizarIcones();
    }

    function limparFiltros() {
        categoria = null;
        aba = 'todas';
        filtros.replaceChildren(montarTags());
        abas.replaceChildren(montarAbas());
        desenhar();
    }

    /** @param {Lancamento} t */
    function abrir(t) {
        var janela = Dialog({
            open: true,
            placement: 'auto',
            title: t.desc,
            description: t.cat + ' · ' + t.conta,
            onClose: function () { janela.fechar(); },
            children: colunas('ef-columns--2', [
                Field({ label: 'Valor', children: Input({ mono: true, prefix: 'R$', value: t.valor.replace(/[+−] R\$ /, '') }) }),
                Field({ label: 'Data', children: Input({ mono: true, value: t.data }) }),
                Field({ label: 'Categoria', children: Select({ options: categorias, value: t.cat }) }),
                Field({ label: 'Conta', children: Select({ options: ['Itaú', 'Nubank', 'Reserva CDB', 'Cartão 4821'], value: t.conta }) }),
                Checkbox({ checked: true, label: 'Marcar como recorrente mensal', className: 'ef-columns__full' })
            ]),
            footer: [
                Button({ variant: 'secondary', children: 'Fechar', onClick: function () { janela.fechar(); } }),
                Button({ children: 'Conciliar', onClick: function () { janela.fechar(); } })
            ]
        });
        dialogo.replaceChildren(janela);
        janela.abrir();
    }

    function montarTags() {
        var bloco = linhaFlex(categorias.map(function (c) {
            return Tag({
                children: c,
                active: categoria === c,
                onClick: function () {
                    categoria = categoria === c ? null : c;
                    filtros.replaceChildren(montarTags());
                    desenhar();
                }
            });
        }));
        return bloco;
    }

    function montarAbas() {
        return Tabs({
            value: aba,
            onChange: function (valor) { aba = valor; desenhar(); },
            items: [
                { value: 'todas', label: 'Todas', count: dados.transactions.length },
                { value: 'entradas', label: 'Entradas', count: dados.transactions.filter(function (t) { return t.pos; }).length },
                { value: 'saidas', label: 'Saídas', count: dados.transactions.filter(function (t) { return !t.pos; }).length },
                { value: 'pendentes', label: 'Pendentes', count: dados.transactions.filter(function (t) { return t.status !== 'Conciliado'; }).length }
            ]
        });
    }

    var filtros = document.createElement('div');
    filtros.append(montarTags());
    var abas = document.createElement('div');
    abas.append(montarAbas());

    var barraFerramentas = linhaFlex([
        SearchField({ width: 300, placeholder: 'Buscar por descrição, valor ou conta…' }),
        Select({ options: ['Este mês', 'Últimos 90 dias', 'Este ano', 'Personalizado'], size: 'md', className: 'ef-desktop-only', style: { width: 'var(--select-w-compact)' } })
    ]);

    var topo = pilha([barraFerramentas, filtros, abas]);
    topo.classList.add('ef-card-section-head');

    desenhar();
    return [Card({ padding: 'none', children: [topo, areaLista, rodape] }), dialogo];
}

/** @returns {Array<import('../components/data-display/DataTable.js').DataTableColumn<Lancamento>>} */
function colunasTabela() {
    return [
        {
            key: 'desc', header: 'Lançamento', render: function (t) {
                var texto = document.createElement('span');
                texto.className = 'ef-list-row__text';
                texto.innerHTML = '<span class="ef-list-row__title"></span><span class="ef-list-row__subtitle"></span>';
                /** @type {HTMLElement} */ (texto.firstChild).textContent = t.desc;
                /** @type {HTMLElement} */ (texto.lastChild).textContent = t.conta.toUpperCase();
                return linhaFlex([IconTile({ tone: t.pos ? 'positive' : 'neutral', size: 32, children: Icon(t.icon, 15) }), texto]);
            }
        },
        { key: 'cat', header: 'Categoria', render: function (t) { return Badge({ children: t.cat }); } },
        { key: 'data', header: 'Data', mono: true },
        { key: 'status', header: 'Status', render: function (t) { return Badge({ tone: t.st, dot: true, children: t.status }); } },
        {
            key: 'valor', header: 'Valor', mono: true, align: 'right', render: function (t) {
                var valor = document.createElement('span');
                valor.className = t.pos ? 'ef-text-positive ef-strong' : 'ef-strong';
                valor.textContent = t.valor;
                return valor;
            }
        }
    ];
}
