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
    };

    self.mostrarCarregando = function () {
        $('#loadingOverlay').addClass('active');
    };

    self.esconderCarregando = function () {
        $('#loadingOverlay').removeClass('active');
    };

    /**
     * Exibe uma mensagem de erro apropriada a partir da resposta de uma chamada AJAX,
     * cobrindo os formatos de erro que a API pode devolver (validação, erro genérico, falha de conexão).
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

    self.abrirModalEsqueciSenha = function () {
        $('#inputEmailReset').val('');
        $('#formEsqueciSenha').show();
        $('#successEsqueciSenha').hide();
        $('#modalEsqueciSenha').addClass('open');
    };

    self.fecharModalEsqueciSenha = function () {
        $('#modalEsqueciSenha').removeClass('open');
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
                    self.exibirErroAjax(jqXHR);
                },
                complete: function () {
                    self.esconderCarregando();
                }
            });
        } else {
            alert('Informe seu e-mail.');
        }
    };

    /**
     * Autentica o usuário via API e, em caso de sucesso, guarda a sessão e
     * redireciona pro dashboard.
     *
     * @returns
     */
    self.efetuarLogin = function () {
        var email = $.trim($('#inputEmail').val());
        var senha = $('#inputSenha').val();

        if (email && senha) {
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
                    self.exibirErroAjax(jqXHR);
                },
                complete: function () {
                    self.esconderCarregando();
                }
            });
        } else {
            alert('Preencha e-mail e senha.');
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
