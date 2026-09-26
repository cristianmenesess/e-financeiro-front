// @ts-check
import { criarElemento, aplicarPropsBase, classes } from '../_internal/dom.js';

/** @typedef {{ value: string, label: string, disabled?: boolean }} SegmentedOption */

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   options: Array<SegmentedOption | string>,
 *   value: string,
 *   onChange?: (valor: string) => void,
 *   size?: 'sm' | 'md',
 *   fullWidth?: boolean
 * }} SegmentedControlProps
 */

/**
 * Seletor de período em pílula — 1D · 1S · 1M · 3M · 1A · TUDO. Rótulos
 * monoespaçados por definição. Controla a própria seleção: ao clicar, marca o
 * item e chama `onChange` com o novo valor. Setas ← → movem a seleção.
 *
 * @param {SegmentedControlProps} props
 * @returns {HTMLDivElement}
 */
export function SegmentedControl(props) {
    var itens = props.options.map(function (opcao) {
        return typeof opcao === 'string' ? { value: opcao, label: opcao } : opcao;
    });

    var raiz = criarElemento('div', {
        role: 'tablist',
        class: classes('ef-segmented', props.size === 'sm' && 'ef-segmented--sm', props.fullWidth && 'ef-segmented--block')
    });

    /** @type {HTMLButtonElement[]} */
    var botoes = itens.map(function (item) {
        var botao = criarElemento('button', {
            type: 'button',
            role: 'tab',
            class: 'ef-segmented__item',
            'aria-selected': String(item.value === props.value),
            tabindex: item.value === props.value ? '0' : '-1',
            disabled: !!item.disabled,
            'data-value': item.value
        }, item.label);

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

    raiz.addEventListener('keydown', function (evento) {
        if (evento.key !== 'ArrowRight' && evento.key !== 'ArrowLeft') {
            return;
        }

        var atual = botoes.findIndex(function (botao) { return botao.getAttribute('aria-selected') === 'true'; });
        var passo = evento.key === 'ArrowRight' ? 1 : -1;
        var proximo = (atual + passo + botoes.length) % botoes.length;
        selecionar(String(botoes[proximo].dataset.value), true);
    });

    raiz.append.apply(raiz, botoes);
    return aplicarPropsBase(raiz, props);
}
