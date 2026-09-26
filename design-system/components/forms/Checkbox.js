// @ts-check
import { criarElemento, aplicarPropsBase, glifo } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   checked?: boolean,
 *   indeterminate?: boolean,
 *   onChange?: (proximo: boolean) => void,
 *   label?: string,
 *   disabled?: boolean,
 *   name?: string,
 *   value?: string
 * }} CheckboxProps
 */

/**
 * Seleção múltipla para linhas de tabela, filtros e consentimento. Usa o
 * <input type="checkbox"> nativo (acessível e navegável por teclado) com a caixa
 * desenhada por cima. `indeterminate` é o estado "alguns selecionados" do
 * cabeçalho e tem precedência sobre `checked`.
 *
 * @param {CheckboxProps} props
 * @returns {HTMLLabelElement}
 */
export function Checkbox(props) {
    var entrada = criarElemento('input', {
        type: 'checkbox',
        class: 'ef-checkbox__input',
        name: props.name,
        value: props.value,
        disabled: !!props.disabled
    });

    entrada.checked = !!props.checked;
    entrada.indeterminate = !!props.indeterminate;

    if (!props.label) {
        entrada.setAttribute('aria-label', 'Selecionar');
    }

    entrada.addEventListener('change', function () {
        if (props.onChange) {
            props.onChange(entrada.checked);
        }
    });

    var caixa = criarElemento('span', { class: 'ef-checkbox__box', 'aria-hidden': 'true' }, [
        criarElemento('span', { class: 'ef-checkbox__check' }, glifo('check', 12, 3.4)),
        criarElemento('span', { class: 'ef-checkbox__dash' })
    ]);

    var raiz = criarElemento('label', { class: 'ef-checkbox' }, [
        entrada,
        caixa,
        props.label ? criarElemento('span', { class: 'ef-checkbox__label' }, props.label) : null
    ]);

    return aplicarPropsBase(raiz, props);
}
