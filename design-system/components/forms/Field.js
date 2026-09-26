// @ts-check
import { criarElemento, aplicarPropsBase, idUnico } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   label?: string,
 *   hint?: string,
 *   error?: string,
 *   required?: boolean,
 *   htmlFor?: string,
 *   children?: import('../_internal/dom.js').Conteudo
 * }} FieldProps
 */

/**
 * Invólucro de rótulo + dica/erro. O rótulo é o micro-rótulo mono em caixa alta
 * usado em todo o produto. Com `error`, a mensagem substitui a dica, fica
 * vermelha e o controle interno recebe aria-invalid + aria-describedby.
 *
 * @param {FieldProps} props
 * @returns {HTMLDivElement}
 */
export function Field(props) {
    var idMensagem = idUnico('field-msg');
    var mensagem = props.error || props.hint;

    var raiz = criarElemento('div', { class: 'ef-field' }, [
        props.label
            ? criarElemento('label', { class: 'ef-field__label', for: props.htmlFor }, [
                props.label,
                props.required ? criarElemento('span', { class: 'ef-field__required', 'aria-hidden': 'true' }, '*') : null
            ])
            : null,
        props.children,
        mensagem
            ? criarElemento('span', {
                id: idMensagem,
                class: props.error ? 'ef-field__message ef-field__message--error' : 'ef-field__message',
                role: props.error ? 'alert' : null
            }, mensagem)
            : null
    ]);

    var controle = raiz.querySelector('input, select, textarea');

    if (controle) {
        if (mensagem) {
            controle.setAttribute('aria-describedby', idMensagem);
        }

        if (props.error) {
            controle.setAttribute('aria-invalid', 'true');
            var caixa = controle.closest('.ef-input, .ef-select');

            if (caixa) {
                caixa.classList.add('is-invalid');
            }
        }

        if (props.required) {
            controle.setAttribute('required', '');
        }
    }

    return aplicarPropsBase(raiz, props);
}
