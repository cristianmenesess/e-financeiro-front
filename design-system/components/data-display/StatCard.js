// @ts-check
import { criarElemento, aplicarPropsBase, classes } from '../_internal/dom.js';
import { Sparkline } from '../charts/Sparkline.js';
import { BarTicks } from '../charts/BarTicks.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   label: string,
 *   value: import('../_internal/dom.js').Conteudo,
 *   delta?: string,
 *   deltaLabel?: string,
 *   caption?: string,
 *   icon?: Node,
 *   series?: number[],
 *   seriesType?: 'spark' | 'bars',
 *   tone?: 'positive' | 'negative',
 *   compact?: boolean
 * }} StatCardProps
 */

/**
 * KPI: micro-rótulo mono · número mono grande · delta assinado · legenda ·
 * micro-gráfico opcional. Formate o valor antes de passar. A seta ↑/↓ do delta é
 * adicionada pelo componente conforme `tone`. `compact` é para 4-up e mobile.
 *
 * @param {StatCardProps} props
 * @returns {HTMLElement}
 */
export function StatCard(props) {
    var positivo = props.tone !== 'negative';
    var serie = props.series || [];
    var legenda = props.caption || props.deltaLabel;
    var grafico = null;

    if (serie.length > 1) {
        grafico = props.seriesType === 'bars'
            ? BarTicks({ data: serie, tone: positivo ? 'positive' : 'negative', height: props.compact ? 24 : 32 })
            : Sparkline({ data: serie, tone: positivo ? 'positive' : 'negative', width: 280, height: props.compact ? 28 : 40, dot: true, className: 'ef-stat__chart' });
    }

    var card = criarElemento('section', {
        class: classes('ef-stat', props.compact && 'ef-stat--compact', !positivo && 'ef-stat--negative')
    }, [
        criarElemento('div', { class: 'ef-stat__top' }, [
            criarElemento('span', { class: 'ef-stat__label' }, props.label),
            props.icon ? criarElemento('span', { class: 'ef-stat__icon', 'aria-hidden': 'true' }, props.icon) : null
        ]),
        criarElemento('div', { class: 'ef-stat__row' }, [
            criarElemento('span', { class: 'ef-stat__value' }, props.value),
            props.delta != null
                ? criarElemento('span', { class: 'ef-stat__delta' }, (positivo ? '↑ ' : '↓ ') + props.delta)
                : null
        ]),
        legenda ? criarElemento('span', { class: 'ef-stat__caption' }, legenda) : null,
        grafico
    ]);

    return aplicarPropsBase(card, props);
}
