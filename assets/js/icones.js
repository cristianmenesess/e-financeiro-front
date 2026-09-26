var icones = new Icones();

/**
 * Ícones do app: Lucide (DESIGN.md → Iconografia), traço 1,9 e cor do texto.
 * Na marcação estática, use <i data-lucide="nome" class="ef-icon ef-icon--sm">,
 * trocado pelo SVG quando este script roda (fim do body). Em elementos criados
 * pelo JS, use icones.criar(), que devolve o SVG pronto.
 *
 * Deve ser incluído no fim do body, depois do lucide.min.js e antes do script
 * da tela.
 */
function Icones() {
    var self = this;

    self.TRACO = 1.9;

    /**
     * Converte o nome Lucide pro nome da chave no pacote UMD (trash-2 → Trash2).
     *
     * @param {string} nome nome Lucide em kebab-case
     * @returns {string} nome em PascalCase
     */
    self.nomeParaChave = function (nome) {
        return nome.replace(/(^|-)([a-z0-9])/g, function (trecho, hifen, letra) {
            return letra.toUpperCase();
        });
    };

    /**
     * Cria o SVG de um ícone. Se o Lucide não carregou (CDN fora do ar,
     * offline), devolve um espaço vazio do mesmo tamanho pra não quebrar o layout.
     *
     * @param {string} nome nome Lucide (ex.: "trash-2")
     * @param {string} tamanho xs (14) · sm (16) · md (18, padrão) · lg (20)
     * @returns {Element} elemento pronto pra inserir
     */
    self.criar = function (nome, tamanho) {
        var classe = 'ef-icon ef-icon--' + (tamanho || 'md');
        var no = window.lucide && window.lucide.icons[self.nomeParaChave(nome)];
        var elemento;

        if (no) {
            elemento = window.lucide.createElement(no);
            elemento.setAttribute('class', classe + ' lucide lucide-' + nome);
            elemento.setAttribute('stroke-width', String(self.TRACO));
        } else {
            elemento = document.createElement('span');
            elemento.className = classe;
        }

        elemento.setAttribute('aria-hidden', 'true');
        return elemento;
    };

    /**
     * Troca os <i data-lucide> da página pelo SVG.
     *
     * @returns
     */
    self.renderizarEstaticos = function () {
        if (window.lucide) {
            window.lucide.createIcons({ attrs: { 'stroke-width': self.TRACO, 'aria-hidden': 'true' } });
        }
    };

    self.renderizarEstaticos();
}
