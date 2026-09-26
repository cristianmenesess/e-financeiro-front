// @ts-check
import { criarElemento, aplicarPropsBase, classes, glifo } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   children?: import('../_internal/dom.js').Conteudo,
 *   onRemove?: () => void,
 *   active?: boolean,
 *   onClick?: (evento: MouseEvent) => void,
 *   disabled?: boolean
 * }} TagProps
 */

/**
 * Chip de filtro / rótulo livre. Com `onClick` vira <button> com aria-pressed
 * (selecionado = teal suave); com `onRemove` ganha o X de remoção.
 *
 * @param {TagProps} props
 * @returns {HTMLElement}
 */
export function Tag(props) {
    var clicavel = !!props.onClick;
    var atributos = {
        class: classes('ef-tag', clicavel && props.onRemove && 'ef-tag--clickable', !clicavel && props.active && 'is-selected'),
        type: clicavel ? 'button' : null,
        'aria-pressed': clicavel ? String(!!props.active) : null,
        disabled: clicavel && !!props.disabled
    };

    var remover = props.onRemove
        ? criarElemento('button', { type: 'button', class: 'ef-tag__remove', 'aria-label': 'Remover' }, glifo('close', 12, 2.5))
        : null;

    // Com botão de remover dentro, a raiz não pode ser <button> (botão aninhado).
    var tag = clicavel && !remover
        ? criarElemento('button', atributos, props.children)
        : criarElemento('span', atributos, [props.children, remover]);

    if (clicavel && remover) {
        tag.setAttribute('role', 'button');
        tag.setAttribute('tabindex', '0');
    }

    if (remover && props.onRemove) {
        var aoRemover = props.onRemove;
        remover.addEventListener('click', function (evento) {
            evento.stopPropagation();
            aoRemover();
        });
    }

    if (props.onClick) {
        var aoClicar = props.onClick;
        tag.addEventListener('click', function (evento) {
            if (tag.getAttribute('aria-pressed') !== null) {
                tag.setAttribute('aria-pressed', String(tag.getAttribute('aria-pressed') !== 'true'));
            }

            aoClicar(evento);
        });
    }

    return aplicarPropsBase(tag, props);
}
