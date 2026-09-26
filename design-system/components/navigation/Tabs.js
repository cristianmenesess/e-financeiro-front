// @ts-check
import { criarElemento, aplicarPropsBase } from '../_internal/dom.js';

/**
 * @typedef {{ value: string, label: string, count?: number, disabled?: boolean }} TabItem
 *
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   items: Array<TabItem | string>,
 *   value: string,
 *   onChange?: (valor: string) => void
 * }} TabsProps
 */

/**
 * Abas sublinhadas dentro de um card ou página, indicador teal de 2px.
 * `count` mostra a contagem mono ao lado do rótulo. Controla a seleção e aceita
 * setas ← → (padrão WAI-ARIA de tablist).
 *
 * @param {TabsProps} props
 * @returns {HTMLDivElement}
 */
export function Tabs(props) {
    var itens = props.items.map(function (item) {
        return typeof item === 'string' ? { value: item, label: item } : item;
    });

    /** @type {HTMLButtonElement[]} */
    var botoes = itens.map(function (item) {
        var ativo = item.value === props.value;
        var botao = criarElemento('button', {
            type: 'button',
            role: 'tab',
            class: 'ef-tabs__item',
            'aria-selected': String(ativo),
            tabindex: ativo ? '0' : '-1',
            disabled: !!item.disabled,
            'data-value': item.value
        }, [
            item.label,
            item.count != null ? criarElemento('span', { class: 'ef-tabs__count' }, item.count) : null
        ]);

        botao.addEventListener('click', function () { selecionar(item.value, false); });
        return botao;
    });

    /**
     * @param {string} valor
     * @param {boolean} focar
     * @returns {void}
     */
    function selecionar(valor, focar) {
        botoes.forEach(function (botao) {
            var ativo = botao.dataset.value === valor;
            botao.setAttribute('aria-selected', String(ativo));
            botao.tabIndex = ativo ? 0 : -1;

            if (ativo && focar) {
                botao.focus();
            }
        });

        if (props.onChange) {
            props.onChange(valor);
        }
    }

    var raiz = criarElemento('div', { role: 'tablist', class: 'ef-tabs' }, botoes);

    raiz.addEventListener('keydown', function (evento) {
        if (evento.key !== 'ArrowRight' && evento.key !== 'ArrowLeft') {
            return;
        }

        var habilitados = botoes.filter(function (botao) { return !botao.disabled; });
        var atual = habilitados.findIndex(function (botao) { return botao.getAttribute('aria-selected') === 'true'; });
        var passo = evento.key === 'ArrowRight' ? 1 : -1;
        var proximo = habilitados[(atual + passo + habilitados.length) % habilitados.length];
        selecionar(String(proximo.dataset.value), true);
    });

    return aplicarPropsBase(raiz, props);
}
