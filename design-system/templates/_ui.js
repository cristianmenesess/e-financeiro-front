// @ts-check
/**
 * Helpers de layout dos templates: montam os contêineres de composição de
 * patterns.css (colunas, pilhas, linhas) e textos com classes de token.
 */
import { Button } from '../components/index.js';
import { SectionTitle, Icon } from '../patterns/index.js';

/**
 * @param {string} titulo
 * @param {string} rotuloAcao
 * @returns {HTMLDivElement}
 */
export function cabecalhoSecao(titulo, rotuloAcao) {
    var bloco = document.createElement('div');
    bloco.className = 'ef-card-section-head';
    bloco.append(SectionTitle({
        children: titulo,
        action: Button({ variant: 'ghost', size: 'sm', iconRight: Icon('chevron-right', 14), children: rotuloAcao })
    }));
    return bloco;
}

/**
 * @param {string} modificador classe .ef-columns--*
 * @param {Node[]} filhos
 * @returns {HTMLDivElement}
 */
export function colunas(modificador, filhos) {
    var grade = document.createElement('div');
    grade.className = 'ef-columns ' + modificador;
    grade.append.apply(grade, filhos);
    return grade;
}

/**
 * @param {Node[]} filhos
 * @param {string} [modificador]
 * @returns {HTMLDivElement}
 */
export function pilha(filhos, modificador) {
    var bloco = document.createElement('div');
    bloco.className = 'ef-stack' + (modificador ? ' ' + modificador : '');
    bloco.append.apply(bloco, filhos);
    return bloco;
}

/**
 * @param {Node[]} filhos
 * @returns {HTMLDivElement}
 */
export function linhaFlex(filhos) {
    var bloco = document.createElement('div');
    bloco.className = 'ef-row';
    bloco.append.apply(bloco, filhos);
    return bloco;
}

/**
 * Elemento de texto com classe.
 *
 * @param {keyof HTMLElementTagNameMap} tag
 * @param {string} classe
 * @param {string} conteudo
 * @returns {HTMLElement}
 */
export function texto(tag, classe, conteudo) {
    var elemento = document.createElement(tag);
    elemento.className = classe;
    elemento.textContent = conteudo;
    return elemento;
}

/**
 * Agrupa nós num contêiner com classe.
 *
 * @param {string} classe
 * @param {Node[]} filhos
 * @returns {HTMLDivElement}
 */
export function caixa(classe, filhos) {
    var bloco = document.createElement('div');
    bloco.className = classe;
    bloco.append.apply(bloco, filhos);
    return bloco;
}
