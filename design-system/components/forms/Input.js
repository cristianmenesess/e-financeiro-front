// @ts-check
import { criarElemento, aplicarPropsBase, classes } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   prefix?: import('../_internal/dom.js').Conteudo,
 *   suffix?: import('../_internal/dom.js').Conteudo,
 *   iconLeft?: Node,
 *   invalid?: boolean,
 *   mono?: boolean,
 *   size?: 'sm' | 'md' | 'lg',
 *   disabled?: boolean,
 *   id?: string,
 *   name?: string,
 *   type?: string,
 *   value?: string,
 *   placeholder?: string,
 *   inputMode?: 'text' | 'decimal' | 'numeric' | 'email' | 'tel' | 'search' | 'url' | 'none',
 *   autocomplete?: string,
 *   required?: boolean,
 *   readOnly?: boolean,
 *   min?: string | number,
 *   max?: string | number,
 *   step?: string | number,
 *   onInput?: (evento: Event) => void,
 *   onChange?: (evento: Event) => void
 * }} InputProps
 */

/**
 * Campo de texto/número de uma linha. Use `mono` para qualquer valor monetário
 * ou identificador (sempre verdadeiro para dinheiro). Retorna a caixa
 * (.ef-input); o <input> fica em `.ef-input__control`. Estados: hover, foco,
 * erro (`invalid`), disabled.
 *
 * @param {InputProps} props
 * @returns {HTMLDivElement}
 */
export function Input(props) {
    var tamanho = props.size || 'md';

    var controle = criarElemento('input', {
        class: 'ef-input__control',
        id: props.id,
        name: props.name,
        type: props.type || 'text',
        placeholder: props.placeholder,
        inputmode: props.inputMode,
        autocomplete: props.autocomplete,
        required: !!props.required,
        readonly: !!props.readOnly,
        min: props.min,
        max: props.max,
        step: props.step,
        disabled: !!props.disabled,
        'aria-invalid': props.invalid ? 'true' : null
    });

    if (props.value !== undefined) {
        controle.value = props.value;
    }

    if (props.onInput) {
        controle.addEventListener('input', props.onInput);
    }

    if (props.onChange) {
        controle.addEventListener('change', props.onChange);
    }

    var caixa = criarElemento('div', {
        class: classes(
            'ef-input',
            tamanho !== 'md' && 'ef-input--' + tamanho,
            props.mono && 'ef-input--mono',
            props.invalid && 'is-invalid',
            props.disabled && 'is-disabled'
        )
    }, [
        props.iconLeft ? criarElemento('span', { class: 'ef-input__icon', 'aria-hidden': 'true' }, props.iconLeft) : null,
        props.prefix ? criarElemento('span', { class: 'ef-input__affix' }, props.prefix) : null,
        controle,
        props.suffix ? criarElemento('span', { class: 'ef-input__affix' }, props.suffix) : null
    ]);

    return aplicarPropsBase(caixa, props);
}
