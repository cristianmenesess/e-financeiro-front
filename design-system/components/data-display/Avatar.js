// @ts-check
import { criarElemento, aplicarPropsBase, classes } from '../_internal/dom.js';

/**
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   src?: string,
 *   name?: string,
 *   size?: 'xs' | 'sm' | 'md' | 'lg',
 *   ring?: boolean
 * }} AvatarProps
 *
 * @typedef {import('../_internal/dom.js').PropsBase & {
 *   src?: string,
 *   name: string,
 *   meta?: string,
 *   trailing?: Node,
 *   onClick?: (evento: MouseEvent) => void
 * }} UserChipProps
 */

/**
 * Iniciais (até 2) a partir do nome.
 *
 * @param {string} nome
 * @returns {string}
 */
export function iniciais(nome) {
    return nome.split(' ').filter(Boolean).slice(0, 2).map(function (palavra) { return palavra[0]; }).join('').toUpperCase();
}

/**
 * Imagem circular do usuário com fallback de iniciais em teal suave. `ring`
 * marca o usuário logado. Se a imagem falhar, volta para as iniciais.
 *
 * @param {AvatarProps} props
 * @returns {HTMLSpanElement}
 */
export function Avatar(props) {
    var nome = props.name || '';
    var tamanho = props.size || 'md';

    var avatar = criarElemento('span', {
        class: classes('ef-avatar', tamanho !== 'md' && 'ef-avatar--' + tamanho, props.ring && 'ef-avatar--ring'),
        role: 'img',
        'aria-label': nome || 'Usuário'
    });

    if (props.src) {
        var imagem = criarElemento('img', { class: 'ef-avatar__img', src: props.src, alt: '' });
        imagem.addEventListener('error', function () { avatar.replaceChildren(iniciais(nome)); });
        avatar.append(imagem);
    } else {
        avatar.append(iniciais(nome));
    }

    return aplicarPropsBase(avatar, props);
}

/**
 * Avatar + nome + linha de plano/função. Rodapé do rail lateral e controle de
 * conta da top bar. Com `onClick` vira <button>.
 *
 * @param {UserChipProps} props
 * @returns {HTMLElement}
 */
export function UserChip(props) {
    var filhos = [
        Avatar({ src: props.src, name: props.name, size: 'md' }),
        criarElemento('span', { class: 'ef-user-chip__text' }, [
            criarElemento('span', { class: 'ef-user-chip__name' }, props.name),
            props.meta ? criarElemento('span', { class: 'ef-user-chip__meta' }, props.meta) : null
        ]),
        props.trailing || null
    ];

    var chip = props.onClick
        ? criarElemento('button', { type: 'button', class: 'ef-user-chip' }, filhos)
        : criarElemento('div', { class: 'ef-user-chip' }, filhos);

    if (props.onClick) {
        chip.addEventListener('click', /** @type {EventListener} */ (props.onClick));
    }

    return aplicarPropsBase(chip, props);
}
