// @ts-check
import { criarElemento, aplicarPropsBase, classes, idUnico } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   checked?: boolean,
 *   onChange?: (proximo: boolean) => void,
 *   label?: string,
 *   description?: string,
 *   disabled?: boolean
 * }} SwitchProps
 */

/**
 * Alternância de aplicação imediata para linhas de configuração. Nunca use
 * dentro de formulário que precisa de "Salvar". Controla o próprio estado e
 * avisa `onChange` com o novo valor.
 *
 * @param {SwitchProps} props
 * @returns {HTMLDivElement}
 */
export function Switch(props) {
    var idRotulo = idUnico('switch');
    var ligado = !!props.checked;

    var trilho = criarElemento('button', {
        type: 'button',
        role: 'switch',
        class: 'ef-switch__track',
        'aria-checked': String(ligado),
        'aria-labelledby': props.label ? idRotulo : null,
        disabled: !!props.disabled
    }, criarElemento('span', { class: 'ef-switch__thumb' }));

    trilho.addEventListener('click', function () {
        ligado = !ligado;
        trilho.setAttribute('aria-checked', String(ligado));

        if (props.onChange) {
            props.onChange(ligado);
        }
    });

    var raiz = criarElemento('div', {
        class: classes('ef-switch', props.description && 'ef-switch--described', props.disabled && 'is-disabled')
    }, [
        trilho,
        props.label || props.description
            ? criarElemento('span', { class: 'ef-switch__text' }, [
                props.label ? criarElemento('span', { class: 'ef-switch__label', id: idRotulo }, props.label) : null,
                props.description ? criarElemento('span', { class: 'ef-switch__description' }, props.description) : null
            ])
            : null
    ]);

    // Clicar no texto também alterna, como num <label>.
    raiz.addEventListener('click', function (evento) {
        if (!trilho.contains(/** @type {Node} */ (evento.target)) && !trilho.disabled) {
            trilho.click();
        }
    });

    return aplicarPropsBase(raiz, props);
}
