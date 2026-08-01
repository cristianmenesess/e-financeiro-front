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
     * Exibe uma mensagem de erro apropriada a partir da resposta de uma chamada AJAX,
     * cobrindo os formatos de erro que a API pode devolver (validação, erro genérico,
     * falha de conexão).
     *
     * @param {object} jqXHR objeto de erro retornado pelo jQuery
     * @returns
     */
    self.exibirErroAjax = function (jqXHR) {
        if (!jqXHR.responseJSON) {
            alert('Não foi possível conectar ao servidor. Tente novamente.');
        } else if (jqXHR.responseJSON.mensagem) {
            alert(jqXHR.responseJSON.mensagem);
        } else if (jqXHR.status === 400) {
            var campos = Object.keys(jqXHR.responseJSON);

            if (campos.length > 0) {
                alert(jqXHR.responseJSON[campos[0]]);
            } else {
                alert('Erro de validação. Tente novamente.');
            }
        } else {
            alert('Ocorreu um erro. Tente novamente.');
        }
    };

    self.validarFormulario = function (novaSenha, confirmarSenha) {
        var valido = true;

        if (!novaSenha || !confirmarSenha) {
            alert('Preencha os dois campos de senha.');
            valido = false;
        } else if (novaSenha.length < 8) {
            alert('A senha deve ter no mínimo 8 caracteres.');
            valido = false;
        } else if (novaSenha !== confirmarSenha) {
            alert('As senhas não coincidem.');
            valido = false;
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
                    alert('Senha redefinida com sucesso! Faça login.');
                    window.location.href = 'login.html';
                },
                error: function (jqXHR) {
                    self.exibirErroAjax(jqXHR);
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
