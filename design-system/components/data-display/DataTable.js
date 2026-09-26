// @ts-check
import { criarElemento, aplicarPropsBase, classes } from '../_internal/dom.js';
import { EmptyState } from '../feedback/EmptyState.js';

/**
 * @template [R=any]
 * @typedef {{
 *   key: string,
 *   header: string,
 *   align?: 'left' | 'right' | 'center',
 *   width?: number | string,
 *   mono?: boolean,
 *   render?: (linha: R, indice: number) => import('../_internal/dom.js').Conteudo
 * }} DataTableColumn
 */

/**
 * @template [R=any]
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   columns: Array<DataTableColumn<R>>,
 *   rows: R[],
 *   onRowClick?: (linha: R, indice: number) => void,
 *   dense?: boolean,
 *   selectedIndex?: number,
 *   emptyTitle?: string,
 *   emptyDescription?: string
 * }} DataTableProps
 */

/**
 * Tabela sem bordas: cabeçalho mono em caixa alta, filetes finos entre linhas,
 * hover afundado. Linhas clicáveis são focáveis (Enter abre). Sem linhas, mostra
 * o EmptyState compacto — toda lista precisa do ramo "sem dados".
 *
 * @template R
 * @param {DataTableProps<R>} props
 * @returns {HTMLDivElement}
 */
export function DataTable(props) {
    var colunas = props.columns || [];
    var linhas = props.rows || [];
    var clicavel = !!props.onRowClick;

    var cabecalho = criarElemento('thead', {}, criarElemento('tr', {}, colunas.map(function (coluna) {
        var th = criarElemento('th', {
            scope: 'col',
            class: classes('ef-table__th', coluna.align && coluna.align !== 'left' && 'ef-table__th--' + coluna.align)
        }, coluna.header);

        if (coluna.width !== undefined) {
            th.style.width = typeof coluna.width === 'number' ? coluna.width + 'px' : coluna.width;
        }

        return th;
    })));

    var corpo = criarElemento('tbody');

    if (linhas.length === 0) {
        corpo.append(criarElemento('tr', {}, criarElemento('td', { class: 'ef-table__empty', colspan: colunas.length },
            EmptyState({
                compact: true,
                title: props.emptyTitle || 'Nenhum registro',
                description: props.emptyDescription
            })
        )));
    }

    linhas.forEach(function (linha, indice) {
        var tr = criarElemento('tr', {
            class: 'ef-table__row',
            tabindex: clicavel ? '0' : null,
            'aria-selected': props.selectedIndex === undefined ? null : String(props.selectedIndex === indice)
        }, colunas.map(function (coluna) {
            var registro = /** @type {Record<string, any>} */ (linha);
            return criarElemento('td', {
                class: classes(
                    'ef-table__td',
                    coluna.align && coluna.align !== 'left' && 'ef-table__td--' + coluna.align,
                    coluna.mono && 'ef-table__td--mono'
                )
            }, coluna.render ? coluna.render(linha, indice) : registro[coluna.key]);
        }));

        if (props.onRowClick) {
            var aoClicar = props.onRowClick;
            tr.addEventListener('click', function () { aoClicar(linha, indice); });
            tr.addEventListener('keydown', function (evento) {
                if (evento.key === 'Enter') {
                    aoClicar(linha, indice);
                }
            });
        }

        corpo.append(tr);
    });

    var tabela = criarElemento('table', {
        class: classes('ef-table', props.dense && 'ef-table--dense', clicavel && 'ef-table--clickable')
    }, [cabecalho, corpo]);
    tabela.style.minWidth = (colunas.length * 120) + 'px';

    return aplicarPropsBase(criarElemento('div', { class: 'ef-table-wrap' }, tabela), props);
}
