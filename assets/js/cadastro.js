var telaCadastro = new TelaCadastro();

/**
 * Controla a tela de cadastro: valida o formulário, cria o usuário via API e
 * já efetua o login automático com o token retornado.
 */
function TelaCadastro() {
    var self = this;

    self.apiBaseUrl = 'http://localhost:8080';

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
     * cobrindo os formatos de erro que a API pode devolver (validação, erro genérico,
     * falha de conexão).
     *
     * @param {object} jqXHR objeto de erro retornado pelo jQuery
     * @returns
     */
    self.exibirErroAjax = function (jqXHR) {
        if (!jqXHR.responseJSON) {
            alert('Não foi possível conectar ao servidor. Tente novamente.');
        } else if (jqXHR.status === 400) {
            var campos = Object.keys(jqXHR.responseJSON);

            if (campos.length > 0) {
                alert(jqXHR.responseJSON[campos[0]]);
            } else {
                alert('Erro de validação. Tente novamente.');
            }
        } else {
            alert(jqXHR.responseJSON.mensagem || 'Ocorreu um erro. Tente novamente.');
        }
    };

    self.validarFormulario = function (nome, email, senha) {
        var valido = true;

        if (!nome || !email || !senha) {
            alert('Preencha todos os campos.');
            valido = false;
        } else if (senha.length < 8) {
            alert('A senha deve ter no mínimo 8 caracteres.');
            valido = false;
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
                    self.exibirErroAjax(jqXHR);
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
