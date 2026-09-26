// @ts-check
import { criarElemento, aplicarPropsBase } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   value: number,
 *   max?: number,
 *   tone?: 'brand' | 'positive' | 'warning' | 'negative' | 'ai',
 *   label?: string,
 *   valueLabel?: string,
 *   dotted?: boolean,
 *   height?: number
 * }} ProgressBarProps
 */

/**
 * Uso de orçamento, progresso de meta, confiança da IA. `dotted` é a variante
 * segmentada (24 segmentos) usada para confiança.
 *
 * @param {ProgressBarProps} props
 * @returns {HTMLDivElement}
 */
export function ProgressBar(props) {
    var maximo = props.max || 100;
    var percentual = Math.max(0, Math.min(1, props.value / maximo));
    var altura = props.height || 8;
    var tom = props.tone || 'brand';
    var barra;

    if (props.dotted) {
        barra = criarElemento('div', { class: 'ef-progress__segments' });

        for (var i = 0; i < 24; i++) {
            var segmento = criarElemento('span', {
                class: i / 24 < percentual ? 'ef-progress__segment ef-progress__segment--on' : 'ef-progress__segment'
            });
            segmento.style.height = (altura - 2) + 'px';
            barra.append(segmento);
        }
    } else {
        var preenchimento = criarElemento('div', { class: 'ef-progress__fill' });
        preenchimento.style.width = (percentual * 100) + '%';
        barra = criarElemento('div', { class: 'ef-progress__track' }, preenchimento);
        barra.style.height = altura + 'px';
    }

    var raiz = criarElemento('div', {
        class: 'ef-progress' + (tom !== 'brand' ? ' ef-progress--' + tom : ''),
        role: 'progressbar',
        'aria-valuenow': Math.round(percentual * 100),
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-label': props.label || null,
        'aria-valuetext': props.valueLabel || null
    }, [
        props.label || props.valueLabel
            ? criarElemento('div', { class: 'ef-progress__head' }, [
                props.label ? criarElemento('span', { class: 'ef-progress__label' }, props.label) : null,
                props.valueLabel ? criarElemento('span', { class: 'ef-progress__value' }, props.valueLabel) : null
            ])
            : null,
        barra
    ]);

    return aplicarPropsBase(raiz, props);
}
