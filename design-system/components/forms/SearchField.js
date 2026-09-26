// @ts-check
import { criarElemento, aplicarPropsBase, glifo } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   placeholder?: string,
 *   value?: string,
 *   onChange?: (evento: Event) => void,
 *   width?: number | string,
 *   shortcut?: string | null
 * }} SearchFieldProps
 */

/**
 * Busca em pílula para a top bar e cabeçalhos de lista. O atalho (padrão "/")
 * aparece à direita enquanto o campo não tem foco e, quando pressionado fora de
 * outro campo, foca a busca. `shortcut: null` esconde o atalho.
 *
 * @param {SearchFieldProps} props
 * @returns {HTMLDivElement}
 */
export function SearchField(props) {
    var atalho = props.shortcut === undefined ? '/' : props.shortcut;

    var controle = criarElemento('input', {
        type: 'search',
        class: 'ef-search__control',
        placeholder: props.placeholder || 'Buscar...',
        'aria-label': props.placeholder || 'Buscar'
    });

    if (props.value !== undefined) {
        controle.value = props.value;
    }

    if (props.onChange) {
        controle.addEventListener('input', props.onChange);
    }

    var raiz = criarElemento('div', { class: 'ef-search', role: 'search' }, [
        criarElemento('span', { class: 'ef-search__icon' }, glifo('search', 16)),
        controle,
        atalho ? criarElemento('kbd', { class: 'ef-search__kbd' }, atalho) : null
    ]);

    if (props.width !== undefined) {
        raiz.style.width = typeof props.width === 'number' ? props.width + 'px' : props.width;
    }

    if (atalho) {
        document.addEventListener('keydown', function (evento) {
            var alvo = /** @type {HTMLElement | null} */ (evento.target);
            var digitando = alvo && (alvo.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName));

            if (evento.key === atalho && !digitando && raiz.isConnected) {
                evento.preventDefault();
                controle.focus();
            }
        });
    }

    return aplicarPropsBase(raiz, props);
}
