// @ts-check
import { criarElemento, aplicarPropsBase, classes } from '../_internal/dom.js';

/**
 * @typedef {'primary' | 'dark' | 'success' | 'secondary' | 'ghost' | 'danger'} ButtonVariant
 * @typedef {'sm' | 'md' | 'lg'} ButtonSize
 *
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   children?: import('../_internal/dom.js').Conteudo,
 *   variant?: ButtonVariant,
 *   size?: ButtonSize,
 *   iconLeft?: Node,
 *   iconRight?: Node,
 *   fullWidth?: boolean,
 *   disabled?: boolean,
 *   loading?: boolean,
 *   type?: 'button' | 'submit' | 'reset',
 *   onClick?: (evento: MouseEvent) => void
 * }} ButtonProps
 */

/**
 * Ação principal do E-Financeiro. `primary` (teal) é a ação afirmativa padrão;
 * `dark` (navy) é reservado ao CTA de maior intenção; `success` (menta) só para
 * confirmar/transacionar. Estados: hover, press, foco, disabled e loading
 * (troca o ícone esquerdo por spinner e bloqueia interação).
 *
 * @param {ButtonProps} props
 * @returns {HTMLButtonElement}
 */
export function Button(props) {
    var variante = props.variant || 'primary';
    var tamanho = props.size || 'md';
    var bloqueado = !!(props.disabled || props.loading);

    var botao = criarElemento('button', {
        type: props.type || 'button',
        class: classes(
            'ef-btn',
            'ef-btn--' + variante,
            tamanho !== 'md' && 'ef-btn--' + tamanho,
            props.fullWidth && 'ef-btn--block'
        ),
        disabled: bloqueado,
        'aria-busy': props.loading ? 'true' : null
    }, [
        props.loading
            ? criarElemento('span', { class: 'ef-btn__spinner', 'aria-hidden': 'true' })
            : envolverIcone(props.iconLeft),
        props.children,
        envolverIcone(props.iconRight)
    ]);

    if (props.onClick) {
        botao.addEventListener('click', props.onClick);
    }

    return aplicarPropsBase(botao, props);
}

/**
 * @param {Node | undefined} icone
 * @returns {HTMLSpanElement | null}
 */
function envolverIcone(icone) {
    return icone ? criarElemento('span', { class: 'ef-btn__icon', 'aria-hidden': 'true' }, icone) : null;
}
