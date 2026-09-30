var telaLogin = new TelaLogin();

/**
 * Controla a tela de login: valida o formulário, autentica via API e guarda
 * a sessão do usuário.
 */
function TelaLogin() {
    var self = this;

    self.apiBaseUrl = 'https://e-financeiro.onrender.com';

    self.obterToken = function () {
        return localStorage.getItem('token');
    };

    self.salvarSessao = function (dados) {
        localStorage.setItem('token', dados.token);
        localStorage.setItem('nome', dados.nome);
        localStorage.setItem('email', dados.email);

        if (dados.fotoUrl) {
            localStorage.setItem('fotoUrl', dados.fotoUrl);
        } else {
            localStorage.removeItem('fotoUrl');
        }
    };

    self.mostrarCarregando = function () {
        $('#loadingOverlay').addClass('active');
    };

    self.esconderCarregando = function () {
        $('#loadingOverlay').removeClass('active');
    };

    self.abrirModalEsqueciSenha = function () {
        $('#inputEmailReset').val('');
        feedback.limparErros('#modalEsqueciSenha');
        $('#formEsqueciSenha').show();
        $('#successEsqueciSenha').hide();
        $('#modalEsqueciSenha').prop('hidden', false);
    };

    self.fecharModalEsqueciSenha = function () {
        $('#modalEsqueciSenha').prop('hidden', true);
    };

    /**
     * Solicita o link de redefinição de senha via API. A API sempre responde 200
     * (nunca revela se o e-mail existe), então o sucesso troca o formulário por
     * uma mensagem fixa, sem fechar o modal.
     *
     * @returns
     */
    self.enviarEmailReset = function () {
        var email = $.trim($('#inputEmailReset').val());

        if (email) {
            $.ajax({
                url: self.apiBaseUrl + '/api/autenticacao/esqueci-senha',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ email: email }),
                beforeSend: function () {
                    self.mostrarCarregando();
                },
                success: function () {
                    $('#formEsqueciSenha').hide();
                    $('#successEsqueciSenha').show();
                },
                error: function (jqXHR) {
                    feedback.exibirErroAjax(jqXHR);
                },
                complete: function () {
                    self.esconderCarregando();
                }
            });
        } else {
            feedback.marcarErro('#inputEmailReset', 'Informe seu e-mail');
            feedback.focarPrimeiroErro('#modalEsqueciSenha');
        }
    };

    /**
     * Valida e-mail e senha, marcando o erro abaixo de cada campo vazio.
     *
     * @param {string} email e-mail digitado
     * @param {string} senha senha digitada
     * @returns {boolean} true se pode enviar
     */
    self.validarFormulario = function (email, senha) {
        var valido = true;

        if (!email) {
            feedback.marcarErro('#inputEmail', 'Informe seu e-mail');
            valido = false;
        }

        if (!senha) {
            feedback.marcarErro('#inputSenha', 'Informe sua senha');
            valido = false;
        }

        if (!valido) {
            feedback.focarPrimeiroErro('.auth-card');
        }

        return valido;
    };

    /**
     * Autentica o usuário via API e, em caso de sucesso, guarda a sessão e
     * redireciona pro dashboard. Credenciais erradas (401) aparecem abaixo do
     * campo de senha; os demais erros, em Toast.
     *
     * @returns
     */
    self.efetuarLogin = function () {
        var email = $.trim($('#inputEmail').val());
        var senha = $('#inputSenha').val();

        if (self.validarFormulario(email, senha)) {
            $.ajax({
                url: self.apiBaseUrl + '/api/autenticacao/login',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ email: email, senha: senha }),
                beforeSend: function () {
                    self.mostrarCarregando();
                },
                success: function (resposta) {
                    self.salvarSessao(resposta);
                    window.location.href = 'index.html';
                },
                error: function (jqXHR) {
                    var credenciaisInvalidas = feedback.mensagemDaApi(jqXHR, 401);

                    if (credenciaisInvalidas) {
                        $('#inputSenha').val('');
                        feedback.marcarErro('#inputSenha', credenciaisInvalidas);
                        feedback.focarPrimeiroErro('.auth-card');
                    } else {
                        feedback.exibirErroAjax(jqXHR);
                    }
                },
                complete: function () {
                    self.esconderCarregando();
                }
            });
        }
    };

    /**
     * Mostra o aviso deixado por outra tela antes de redirecionar pra cá (ex.:
     * senha redefinida), já que um Toast não sobrevive à troca de página.
     *
     * @returns
     */
    self.exibirAvisoPendente = function () {
        var aviso = sessionStorage.getItem('avisoLogin');

        sessionStorage.removeItem('avisoLogin');

        if (aviso === 'senha-redefinida') {
            feedback.exibirSucesso('Senha redefinida', 'Entre com a nova senha.');
        } else if (aviso === 'cadastro-excluido') {
            feedback.exibirSucesso('Cadastro excluído', 'Seus dados foram apagados.');
        }
    };

    /**
     * Confere se já existe sessão ativa e liga os eventos do formulário.
     * Ponto de entrada da tela, chamado uma vez quando a página carrega.
     *
     * @returns
     */
    self.iniciar = function () {
        if (self.obterToken()) {
            window.location.href = 'index.html';
        } else {
            self.exibirAvisoPendente();

            $('#btnLogin').on('click', self.efetuarLogin);

            $('#inputEmail, #inputSenha').on('keydown', function (e) {
                if (e.key === 'Enter') {
                    self.efetuarLogin();
                }
            });

            $('#linkEsqueciSenha').on('click', function (e) {
                e.preventDefault();
                self.abrirModalEsqueciSenha();
            });

            $('#modalEsqueciSenha').on('click', function (e) {
                if ($(e.target).is('#modalEsqueciSenha')) {
                    self.fecharModalEsqueciSenha();
                }
            });

            $('#btnFecharEsqueciSenha').on('click', self.fecharModalEsqueciSenha);

            $(document).on('keydown', function (e) {
                if (e.key === 'Escape') {
                    self.fecharModalEsqueciSenha();
                }
            });

            $('#btnEnviarReset').on('click', self.enviarEmailReset);

            $('#inputEmailReset').on('keydown', function (e) {
                if (e.key === 'Enter') {
                    self.enviarEmailReset();
                }
            });
        }
    };
}

telaLogin.iniciar();
