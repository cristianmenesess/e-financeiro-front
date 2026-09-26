// @ts-check
import { criarElemento, aplicarPropsBase, classes, glifo, idUnico } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   open: boolean,
 *   onClose?: () => void,
 *   title?: string,
 *   description?: string,
 *   children?: import('../_internal/dom.js').Conteudo,
 *   footer?: import('../_internal/dom.js').Conteudo,
 *   width?: number,
 *   placement?: 'center' | 'sheet' | 'auto',
 *   inline?: boolean
 * }} DialogProps
 *
 * @typedef {HTMLDivElement & { abrir: () => void, fechar: () => void }} DialogElement
 */

/**
 * Modal centralizado sobre scrim navy desfocado; sobe 12px na entrada.
 * `placement`: "center" (padrão do dump), "sheet" (bottom sheet do UI kit
 * mobile: raio só no topo + alça) ou "auto" (sheet abaixo de 1024px, centro
 * acima — o comportamento que o app já tinha). Fecha no X, no clique do scrim e
 * no Esc; devolve o foco a quem abriu. O elemento retornado tem abrir()/fechar().
 * `inline` renderiza no fluxo da página (só para documentação/showcase).
 *
 * @param {DialogProps} props
 * @returns {DialogElement}
 */
export function Dialog(props) {
    var idTitulo = idUnico('dialog-title');
    var posicao = props.placement || 'center';
    /** @type {Element | null} */
    var focoAnterior = null;

    var fechar = criarElemento('button', { type: 'button', class: 'ef-dialog__close', 'aria-label': 'Fechar' }, glifo('close', 18));

    var painel = criarElemento('div', { class: 'ef-dialog__panel', tabindex: '-1' }, [
        criarElemento('span', { class: 'ef-dialog__handle', 'aria-hidden': 'true' }),
        criarElemento('div', { class: 'ef-dialog__head' }, [
            criarElemento('div', { class: 'ef-dialog__text' }, [
                props.title ? criarElemento('h3', { class: 'ef-dialog__title', id: idTitulo }, props.title) : null,
                props.description ? criarElemento('p', { class: 'ef-dialog__description' }, props.description) : null
            ]),
            fechar
        ]),
        props.children,
        props.footer ? criarElemento('div', { class: 'ef-dialog__footer' }, props.footer) : null
    ]);

    if (props.width) {
        painel.style.maxWidth = props.width + 'px';
    }

    var scrim = /** @type {DialogElement} */ (criarElemento('div', {
        class: classes('ef-dialog', posicao !== 'center' && 'ef-dialog--' + posicao, props.inline && 'ef-dialog--inline'),
        role: 'dialog',
        'aria-modal': props.inline ? null : 'true',
        'aria-labelledby': props.title ? idTitulo : null,
        hidden: !props.open
    }, painel));

    function solicitarFechamento() {
        if (props.onClose) {
            props.onClose();
        } else {
            scrim.fechar();
        }
    }

    scrim.abrir = function () {
        focoAnterior = document.activeElement;
        scrim.hidden = false;
        painel.focus();
    };

    scrim.fechar = function () {
        scrim.hidden = true;

        if (focoAnterior instanceof HTMLElement) {
            focoAnterior.focus();
        }
    };

    fechar.addEventListener('click', solicitarFechamento);

    scrim.addEventListener('click', function (evento) {
        if (evento.target === scrim && !props.inline) {
            solicitarFechamento();
        }
    });

    scrim.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape' && !props.inline) {
            solicitarFechamento();
        }
    });

    return aplicarPropsBase(scrim, props);
}
