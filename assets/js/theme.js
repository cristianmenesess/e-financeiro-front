var controleTema = new ControleTema();

/**
 * Controla o tema claro/escuro do app: aplica o tema salvo assim que o script
 * carrega (antes da primeira pintura, pra tela não piscar) e liga os botões
 * de alternância (.theme-toggle) presentes na página.
 *
 * Este script deve ser incluído no <head>, antes do CSS ser aplicado ao body.
 */
function ControleTema() {
    var self = this;

    self.CHAVE_TEMA = 'tema';

    self.obterTemaSalvo = function () {
        return localStorage.getItem(self.CHAVE_TEMA) || 'claro';
    };

    /**
     * Aplica o tema no documento via atributo data-theme e sincroniza os ícones.
     *
     * @param {string} tema "claro" ou "escuro"
     * @returns
     */
    self.aplicarTema = function (tema) {
        if (tema === 'escuro') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        self.atualizarIcones(tema);
    };

    /**
     * Troca o ícone de todos os botões de tema: lua no tema claro (convite pro
     * escuro), sol no tema escuro (convite pro claro). Mantém o tamanho do
     * ícone atual de cada botão (ef-icon--sm no rail, --md nas telas de login).
     * Depende de icones.js; antes dele carregar (no <head>) não faz nada.
     *
     * @param {string} tema "claro" ou "escuro"
     * @returns
     */
    self.atualizarIcones = function (tema) {
        if (typeof icones === 'undefined') {
            return;
        }

        var botoes = document.querySelectorAll('.theme-toggle');
        var nome = tema === 'escuro' ? 'sun' : 'moon';

        for (var i = 0; i < botoes.length; i++) {
            var atual = botoes[i].querySelector('.ef-icon');
            var tamanho = atual ? (atual.getAttribute('class').match(/ef-icon--(\w+)/) || [])[1] : null;

            botoes[i].replaceChildren(icones.criar(nome, tamanho || 'sm'));
        }
    };

    self.alternarTema = function () {
        var novoTema = self.obterTemaSalvo() === 'escuro' ? 'claro' : 'escuro';

        localStorage.setItem(self.CHAVE_TEMA, novoTema);
        self.aplicarTema(novoTema);
    };

    /**
     * Aplica o tema salvo e liga os eventos. Usa delegação no documento porque
     * este script roda no <head>, antes dos botões existirem no DOM.
     *
     * @returns
     */
    self.iniciar = function () {
        self.aplicarTema(self.obterTemaSalvo());

        document.addEventListener('click', function (e) {
            if (e.target.closest('.theme-toggle')) {
                self.alternarTema();
            }
        });

        // Quando o DOM terminar de montar, sincroniza os ícones dos botões
        // (na primeira chamada de aplicarTema eles ainda não existiam).
        document.addEventListener('DOMContentLoaded', function () {
            self.atualizarIcones(self.obterTemaSalvo());
        });
    };
}

controleTema.iniciar();
