// @ts-check
import { criarElemento, aplicarPropsBase, classes } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   children?: import('../_internal/dom.js').Conteudo,
 *   label: string,
 *   tone?: 'neutral' | 'surface' | 'brand' | 'inverse',
 *   size?: 'sm' | 'md' | 'lg',
 *   active?: boolean,
 *   disabled?: boolean,
 *   onClick?: (evento: MouseEvent) => void
 * }} IconButtonProps
 */

/**
 * Controle quadrado só com ícone, para toolbars, cabeçalhos de card e app bars
 * mobile. `label` é obrigatório: vira o nome acessível e o tooltip. `active`
 * renderiza o estado selecionado persistente (tile teal suave).
 *
 * @param {IconButtonProps} props
 * @returns {HTMLButtonElement}
 */
export function IconButton(props) {
    var tom = props.tone || 'neutral';
    var tamanho = props.size || 'md';

    var botao = criarElemento('button', {
        type: 'button',
        class: classes('ef-icon-btn', 'ef-icon-btn--' + tom, tamanho !== 'md' && 'ef-icon-btn--' + tamanho),
        'aria-label': props.label,
        title: props.label,
        'aria-pressed': props.active === undefined ? null : String(props.active),
        disabled: !!props.disabled
    }, props.children);

    if (props.onClick) {
        botao.addEventListener('click', props.onClick);
    }

    return aplicarPropsBase(botao, props);
}
