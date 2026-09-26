// @ts-check
import { criarElemento, aplicarPropsBase, classes, glifo } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   label?: string,
 *   title?: string,
 *   body: import('../_internal/dom.js').Conteudo,
 *   confidence?: string,
 *   actionLabel?: string,
 *   onAction?: (evento: MouseEvent) => void,
 *   tone?: 'ai' | 'warning' | 'positive'
 * }} InsightCardProps
 */

/**
 * Recomendação gerada por máquina: ponto violeta + rótulo mono + link mono
 * sublinhado. Insight = observação + consequência, no máximo três frases; se a
 * IA inferiu, mostre `confidence`.
 *
 * @param {InsightCardProps} props
 * @returns {HTMLElement}
 */
export function InsightCard(props) {
    var tom = props.tone || 'ai';
    var acao = null;

    if (props.onAction) {
        acao = criarElemento('button', { type: 'button', class: 'ef-insight__action' }, [
            props.actionLabel || 'Ver insight',
            glifo('arrow-up-right', 14, 2.2)
        ]);
        acao.addEventListener('click', props.onAction);
    }

    var card = criarElemento('section', { class: classes('ef-insight', tom !== 'ai' && 'ef-insight--' + tom) }, [
        criarElemento('div', { class: 'ef-insight__head' }, [
            criarElemento('span', { class: 'ef-insight__dot', 'aria-hidden': 'true' }),
            criarElemento('span', { class: 'ef-insight__label' }, props.label || 'Insight IA'),
            props.confidence ? criarElemento('span', { class: 'ef-insight__confidence' }, props.confidence) : null
        ]),
        props.title ? criarElemento('h4', { class: 'ef-insight__title' }, props.title) : null,
        criarElemento('p', { class: 'ef-insight__body' }, props.body),
        acao
    ]);

    return aplicarPropsBase(card, props);
}
