// @ts-check
import { criarElemento, aplicarPropsBase, classes } from '../_internal/dom.js';

/**
 * @typedef {'neutral' | 'brand' | 'positive' | 'negative' | 'warning' | 'info' | 'ai' | 'solid'} BadgeTone
 *
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   children?: import('../_internal/dom.js').Conteudo,
 *   tone?: BadgeTone,
 *   dot?: boolean,
 *   mono?: boolean,
 *   size?: 'sm' | 'md'
 * }} BadgeProps
 */

/**
 * Pílula de status curto: estado de lançamento, nível de risco, confiança da IA,
 * categoria. `mono` para códigos e percentuais; `dot` adiciona o ponto de status.
 *
 * @param {BadgeProps} props
 * @returns {HTMLSpanElement}
 */
export function Badge(props) {
    var tom = props.tone || 'neutral';

    var badge = criarElemento('span', {
        class: classes(
            'ef-badge',
            tom !== 'neutral' && 'ef-badge--' + tom,
            props.size === 'sm' && 'ef-badge--sm',
            props.mono && 'ef-badge--mono'
        )
    }, [
        props.dot ? criarElemento('span', { class: 'ef-badge__dot', 'aria-hidden': 'true' }) : null,
        props.children
    ]);

    return aplicarPropsBase(badge, props);
}
