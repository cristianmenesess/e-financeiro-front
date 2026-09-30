// @ts-check
import { criarElemento, aplicarPropsBase, glifo } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   title?: string,
 *   message?: string,
 *   tone?: 'neutral' | 'positive' | 'negative' | 'warning' | 'ai',
 *   action?: Node,
 *   onClose?: () => void
 * }} ToastProps
 */

/**
 * Notificação navy transitória. Canto inferior direito no desktop, centro
 * inferior no mobile (use exibirToast, que cuida da região e do tempo).
 *
 * @param {ToastProps} props
 * @returns {HTMLDivElement}
 */
export function Toast(props) {
    var tom = props.tone || 'neutral';
    var fechar = null;

    if (props.onClose) {
        fechar = criarElemento('button', { type: 'button', class: 'ef-toast__close', 'aria-label': 'Fechar' }, glifo('close', 14, 2.2));
        fechar.addEventListener('click', props.onClose);
    }

    var toast = criarElemento('div', {
        class: 'ef-toast' + (tom !== 'neutral' ? ' ef-toast--' + tom : ''),
        role: tom === 'negative' ? 'alert' : 'status'
    }, [
        criarElemento('span', { class: 'ef-toast__dot', 'aria-hidden': 'true' }),
        criarElemento('div', { class: 'ef-toast__text' }, [
            props.title ? criarElemento('span', { class: 'ef-toast__title' }, props.title) : null,
            props.message ? criarElemento('span', { class: 'ef-toast__message' }, props.message) : null
        ]),
        props.action || null,
        fechar
    ]);

    return aplicarPropsBase(toast, props);
}

/**
 * Mostra um Toast na região fixa da página e o remove após `duracaoMs`.
 *
 * @param {Omit<ToastProps, 'onClose'>} props
 * @param {number} [duracaoMs] padrão 4000
 * @returns {HTMLDivElement} o toast exibido
 */
export function exibirToast(props, duracaoMs) {
    var regiao = document.querySelector('.ef-toast-region');

    if (!regiao) {
        regiao = criarElemento('div', { class: 'ef-toast-region', 'aria-live': 'polite' });
        document.body.append(regiao);
    }

    var toast = Toast(Object.assign({}, props, { onClose: function () { toast.remove(); } }));

    // O tempo de vida é uma animação CSS (ef-toast-out, com atraso de `duracaoMs`): o toast sai
    // quando ela termina, e o CSS pode pausá-la enquanto o ponteiro ou o foco estiver nele
    toast.classList.add('ef-toast--auto');
    toast.style.setProperty('--ef-toast-duration', (duracaoMs || 4000) + 'ms');
    toast.addEventListener('animationend', function (evento) {
        if (evento.target === toast && evento.animationName === 'ef-toast-out') {
            toast.remove();
        }
    });

    regiao.append(toast);
    return toast;
}
