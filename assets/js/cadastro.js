var telaCadastro = new TelaCadastro();

/**
 * Controla a tela de cadastro: valida o formulário, cria o usuário via API e
 * já efetua o login automático com o token retornado.
 */
function TelaCadastro() {
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
     * Valida o formulário, marcando o erro abaixo de cada campo com problema e
     * focando o primeiro.
     *
     * @param {string} nome nome completo
     * @param {string} email e-mail
     * @param {string} senha senha
     * @returns {boolean} true se pode enviar
     */
    self.validarFormulario = function (nome, email, senha) {
        var valido = true;

        if (!nome) {
            feedback.marcarErro('#inputNome', 'Informe seu nome');
            valido = false;
        }

        if (!email) {
            feedback.marcarErro('#inputEmail', 'Informe seu e-mail');
            valido = false;
        }

        if (!senha || senha.length < 8) {
            feedback.marcarErro('#inputSenha', 'A senha precisa de pelo menos 8 caracteres');
            valido = false;
        }

        if (!valido) {
            feedback.focarPrimeiroErro('.auth-card');
        }

        return valido;
    };

    /**
     * Cadastra o usuário via API e, em caso de sucesso, guarda a sessão (login
     * automático) e redireciona pro dashboard.
     *
     * @returns
     */
    self.efetuarCadastro = function () {
        var nome = $.trim($('#inputNome').val());
        var email = $.trim($('#inputEmail').val());
        var senha = $('#inputSenha').val();

        if (self.validarFormulario(nome, email, senha)) {
            $.ajax({
                url: self.apiBaseUrl + '/api/autenticacao/cadastro',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ nome: nome, email: email, senha: senha }),
                beforeSend: function () {
                    self.mostrarCarregando();
                },
                success: function (resposta) {
                    self.salvarSessao(resposta);
                    window.location.href = 'index.html';
                },
                error: function (jqXHR) {
                    // E-mail já cadastrado volta 409: o erro vai no próprio campo
                    var emailEmUso = feedback.mensagemDaApi(jqXHR, 409);

                    if (emailEmUso) {
                        feedback.marcarErro('#inputEmail', emailEmUso);
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
     * Confere se já existe sessão ativa e liga os eventos do formulário.
     * Ponto de entrada da tela, chamado uma vez quando a página carrega.
     *
     * @returns
     */
    self.iniciar = function () {
        if (self.obterToken()) {
            window.location.href = 'index.html';
        } else {
            $('#btnCadastrar').on('click', self.efetuarCadastro);

            $('#inputNome, #inputEmail, #inputSenha').on('keydown', function (e) {
                if (e.key === 'Enter') {
                    self.efetuarCadastro();
                }
            });
        }
    };
}

telaCadastro.iniciar();
