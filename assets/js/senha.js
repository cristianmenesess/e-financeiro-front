var campoSenha = new CampoSenha();

/**
 * Botão de mostrar/ocultar em todo campo de senha da página: o input vira o
 * controle de um Input com ícone à direita (olho), que alterna entre senha e texto.
 *
 * Deve ser incluído no fim do body, depois do icones.js e antes do script da tela.
 */
function CampoSenha() {
    var self = this;

    /**
     * Mostra ou oculta o valor de um campo de senha e ajusta o ícone e o rótulo do botão.
     *
     * @param {jQuery} $campo input de senha
     * @param {jQuery} $botao botão do olho
     * @param {boolean} visivel true mostra o valor digitado
     * @returns
     */
    self.alternar = function ($campo, $botao, visivel) {
        var rotulo = visivel ? 'Ocultar senha' : 'Mostrar senha';

        $campo.attr('type', visivel ? 'text' : 'password');
        $botao.attr({ 'aria-label': rotulo, title: rotulo, 'aria-pressed': String(visivel) })
            .empty()
            .append(icones.criar(visivel ? 'eye-off' : 'eye', 'sm'));
    };

    /**
     * Envolve cada input de senha da página e adiciona o botão do olho.
     *
     * @returns
     */
    self.iniciar = function () {
        $('input.ef-input[type="password"]').each(function () {
            var $campo = $(this);
            var $envelope = $('<div>', { class: 'ef-input' });
            var $botao = $('<button>', { type: 'button', class: 'ef-input__toggle' });

            $campo.before($envelope).removeClass('ef-input').addClass('ef-input__control');
            $envelope.append($campo, $botao);
            self.alternar($campo, $botao, false);

            $botao.on('click', function () {
                self.alternar($campo, $botao, $campo.attr('type') === 'password');
            });
        });
    };

    self.iniciar();
}
