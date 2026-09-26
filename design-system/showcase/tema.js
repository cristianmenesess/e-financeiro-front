// @ts-check
/**
 * Tema das páginas do design system (showcase e templates). Usa a mesma chave
 * do app (localStorage "tema" = "claro" | "escuro", ver assets/js/theme.js) e o
 * mesmo atributo (data-theme="dark" no <html>), para o tema escolhido valer em
 * todo o projeto. `?tema=escuro` na URL força o tema (útil em iframes).
 */

var CHAVE_TEMA = 'tema';

/**
 * @returns {'claro' | 'escuro'}
 */
export function obterTema() {
    var daUrl = new URLSearchParams(window.location.search).get('tema');

    if (daUrl === 'claro' || daUrl === 'escuro') {
        return daUrl;
    }

    try {
        return window.localStorage.getItem(CHAVE_TEMA) === 'escuro' ? 'escuro' : 'claro';
    } catch (erro) {
        return 'claro';
    }
}

/**
 * @param {'claro' | 'escuro'} tema
 * @returns {void}
 */
export function aplicarTema(tema) {
    if (tema === 'escuro') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

/**
 * Alterna, salva e aplica. Devolve o novo tema.
 *
 * @returns {'claro' | 'escuro'}
 */
export function alternarTema() {
    /** @type {'claro' | 'escuro'} */
    var novo = document.documentElement.getAttribute('data-theme') === 'dark' ? 'claro' : 'escuro';

    try {
        window.localStorage.setItem(CHAVE_TEMA, novo);
    } catch (erro) {
        // Armazenamento bloqueado (aba privada): o tema vale só para esta página.
    }

    aplicarTema(novo);
    return novo;
}

aplicarTema(obterTema());
