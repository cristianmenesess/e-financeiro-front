// @ts-check
import { criarElemento, aplicarPropsBase, classes, glifo } from '../_internal/dom.js';

/** @typedef {{ value: string, label: string }} SelectOption */

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   options: Array<SelectOption | string>,
 *   value?: string,
 *   onChange?: (evento: Event) => void,
 *   size?: 'sm' | 'md' | 'lg',
 *   invalid?: boolean,
 *   disabled?: boolean,
 *   id?: string,
 *   name?: string,
 *   placeholder?: string
 * }} SelectProps
 */

/**
 * <select> nativo com o acabamento da marca; o chevron é desenhado pelo
 * componente. `placeholder` adiciona uma primeira opção vazia (estado vazio).
 * O <select> fica em `.ef-select__control`.
 *
 * @param {SelectProps} props
 * @returns {HTMLDivElement}
 */
export function Select(props) {
    var tamanho = props.size || 'md';

    var opcoes = props.options.map(function (opcao) {
        var item = typeof opcao === 'string' ? { value: opcao, label: opcao } : opcao;
        return criarElemento('option', { value: item.value }, item.label);
    });

    if (props.placeholder) {
        opcoes.unshift(criarElemento('option', { value: '', disabled: true }, props.placeholder));
    }

    var controle = criarElemento('select', {
        class: 'ef-select__control',
        id: props.id,
        name: props.name,
        disabled: !!props.disabled,
        'aria-invalid': props.invalid ? 'true' : null
    }, opcoes);

    controle.value = props.value !== undefined ? props.value : (props.placeholder ? '' : controle.value);

    if (props.onChange) {
        controle.addEventListener('change', props.onChange);
    }

    var raiz = criarElemento('div', {
        class: classes('ef-select', tamanho !== 'md' && 'ef-select--' + tamanho, props.invalid && 'is-invalid')
    }, [controle, criarElemento('span', { class: 'ef-select__chevron' }, glifo('chevron', 16))]);

    return aplicarPropsBase(raiz, props);
}
