var telaRedefinirSenha = new TelaRedefinirSenha();

/**
 * Controla a tela de redefinição de senha, acessada pelo link enviado por e-mail
 * (?token=...). Valida a nova senha e confirma a troca via API.
 */
function TelaRedefinirSenha() {
    var self = this;

    self.apiBaseUrl = 'https://e-financeiro.onrender.com';
    self.token = null;

    self.mostrarCarregando = function () {
        $('#loadingOverlay').addClass('active');
    };

    self.esconderCarregando = function () {
        $('#loadingOverlay').removeClass('active');
    };

    /**
     * Valida a nova senha e a confirmação, marcando o erro abaixo do campo.
     *
     * @param {string} novaSenha nova senha
     * @param {string} confirmarSenha confirmação
     * @returns {boolean} true se pode enviar
     */
    self.validarFormulario = function (novaSenha, confirmarSenha) {
        var valido = true;

        if (!novaSenha || novaSenha.length < 8) {
            feedback.marcarErro('#inputNovaSenha', 'A senha precisa de pelo menos 8 caracteres');
            valido = false;
        } else if (novaSenha !== confirmarSenha) {
            feedback.marcarErro('#inputConfirmarSenha', 'As senhas não são iguais');
            valido = false;
        }

        if (!valido) {
            feedback.focarPrimeiroErro('#formRedefinirSenha');
        }

        return valido;
    };

    /**
     * Redefine a senha via API usando o token da URL. Como esse endpoint não
     * retorna token de acesso, não há login automático: em caso de sucesso, o
     * usuário é redirecionado para a tela de login.
     *
     * @returns
     */
    self.efetuarRedefinicao = function () {
        var novaSenha = $('#inputNovaSenha').val();
        var confirmarSenha = $('#inputConfirmarSenha').val();

        if (self.validarFormulario(novaSenha, confirmarSenha)) {
            $.ajax({
                url: self.apiBaseUrl + '/api/autenticacao/redefinir-senha',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ token: self.token, novaSenha: novaSenha }),
                beforeSend: function () {
                    self.mostrarCarregando();
                },
                success: function () {
                    // O Toast não sobrevive ao redirecionamento: a tela de login mostra o aviso
                    sessionStorage.setItem('avisoLogin', 'senha-redefinida');
                    window.location.href = 'login.html';
                },
                error: function (jqXHR) {
                    feedback.exibirErroAjax(jqXHR);
                },
                complete: function () {
                    self.esconderCarregando();
                }
            });
        }
    };

    /**
     * Lê o token da URL e liga os eventos do formulário. Se não houver token,
     * mostra o estado de erro em vez do formulário. Ponto de entrada da tela,
     * chamado uma vez quando a página carrega.
     *
     * @returns
     */
    self.iniciar = function () {
        self.token = new URLSearchParams(window.location.search).get('token');

        if (!self.token) {
            $('#formRedefinirSenha').hide();
            $('#erroToken').show();
            return;
        }

        $('#btnRedefinir').on('click', self.efetuarRedefinicao);

        $('#inputNovaSenha, #inputConfirmarSenha').on('keydown', function (e) {
            if (e.key === 'Enter') {
                self.efetuarRedefinicao();
            }
        });
    };
}

telaRedefinirSenha.iniciar();
