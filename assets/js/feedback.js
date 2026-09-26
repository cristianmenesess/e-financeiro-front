var feedback = new Feedback();

/**
 * Feedback ao usuário com os componentes do design system, no lugar de
 * alert()/confirm():
 * - Toast: confirmação do que já aconteceu e erro vindo da API;
 * - Dialog: confirmação de ação destrutiva;
 * - erro de campo (padrão Field): validação de formulário, abaixo do campo.
 *
 * Deve ser incluído no fim do body, depois do jQuery e antes do script da tela.
 */
function Feedback() {
    var self = this;

    /**
     * API pública do design system (ES module), importada uma vez só. Scripts
     * clássicos podem usar import() dinâmico; o caminho é resolvido pela URL
     * da página, não pela deste arquivo.
     */
    self.componentes = import(new URL('design-system/components/index.js', document.baseURI).href);

    /**
     * Mostra um Toast (canto inferior direito no desktop, acima da tab bar no
     * mobile). Erro fica mais tempo na tela.
     *
     * @param {string} tom positive, negative, warning ou neutral
     * @param {string} titulo frase principal
     * @param {string} mensagem detalhe opcional
     * @returns
     */
    self.exibirToast = function (tom, titulo, mensagem) {
        self.componentes
            .then(function (ds) {
                ds.exibirToast({ tone: tom, title: titulo, message: mensagem }, tom === 'negative' ? 6000 : 4000);
            })
            .catch(function () {
                // Sem o design system não há onde mostrar o aviso; não deixa o erro sumir
                window.alert(mensagem ? titulo + '\n' + mensagem : titulo);
            });
    };

    self.exibirSucesso = function (titulo, mensagem) {
        self.exibirToast('positive', titulo, mensagem);
    };

    /**
     * Mensagem que a API mandou num erro de regra de negócio (ex.: "Senha
     * incorreta"), pra quem quer mostrá-la no campo em vez do Toast.
     *
     * @param {object} jqXHR objeto de erro retornado pelo jQuery
     * @param {number} status status HTTP esperado (401, 409...)
     * @returns {string|null} a mensagem, ou null se o erro for outro
     */
    self.mensagemDaApi = function (jqXHR, status) {
        return jqXHR.status === status && jqXHR.responseJSON && jqXHR.responseJSON.mensagem ? jqXHR.responseJSON.mensagem : null;
    };

    /**
     * Mostra em Toast o erro de uma chamada AJAX, cobrindo os formatos que a API
     * devolve (mensagem, validação por campo, falha de conexão).
     *
     * @param {object} jqXHR objeto de erro retornado pelo jQuery
     * @returns
     */
    self.exibirErroAjax = function (jqXHR) {
        var resposta = jqXHR.responseJSON;

        if (!resposta) {
            self.exibirToast('negative', 'Sem conexão com o servidor', 'Confira sua internet e tente de novo.');
        } else if (resposta.mensagem) {
            self.exibirToast('negative', resposta.mensagem);
        } else if (jqXHR.status === 400 && Object.keys(resposta).length > 0) {
            self.exibirToast('negative', resposta[Object.keys(resposta)[0]]);
        } else {
            self.exibirToast('negative', 'Não foi possível concluir', 'Tente de novo em instantes.');
        }
    };

    /**
     * Pede confirmação de uma ação destrutiva num Dialog (sheet no mobile).
     * O foco começa no painel, não no botão de confirmar, pra um Enter
     * distraído não apagar nada.
     *
     * @param {object} opcoes { titulo, descricao, rotuloConfirmar, aoConfirmar }
     * @returns
     */
    self.confirmar = function (opcoes) {
        self.componentes.then(function (ds) {
            var dialogo;

            var fechar = function () {
                dialogo.fechar();
                dialogo.remove();
            };

            var voltar = ds.Button({ variant: 'secondary', children: 'Voltar', onClick: fechar });

            var confirmar = ds.Button({
                variant: 'danger',
                children: opcoes.rotuloConfirmar,
                onClick: function () {
                    fechar();
                    opcoes.aoConfirmar();
                }
            });

            dialogo = ds.Dialog({
                open: false,
                placement: 'auto',
                title: opcoes.titulo,
                description: opcoes.descricao,
                footer: [voltar, confirmar],
                onClose: fechar
            });

            document.body.append(dialogo);
            dialogo.abrir();
        });
    };

    /**
     * Marca um campo como inválido no padrão do Field do design system: borda
     * de erro, mensagem vermelha abaixo e aria-invalid/aria-describedby no
     * controle. O campo precisa estar dentro de um .ef-field.
     *
     * @param {string} seletor controle (input, select) ou grupo (fileira de chips)
     * @param {string} mensagem o que está errado, sem culpar ("Informe o valor")
     * @returns
     */
    self.marcarErro = function (seletor, mensagem) {
        var $controle = $(seletor);
        var idMensagem = $controle.attr('id') + 'Erro';

        self.limparErro(seletor);

        // Como no Field: a mensagem de erro substitui a dica do campo
        $controle.closest('.ef-field').find('.ef-field__message').prop('hidden', true);
        $controle.closest('.ef-field').append(
            $('<span>', { id: idMensagem, class: 'ef-field__message ef-field__message--error', role: 'alert', text: mensagem })
        );
        $controle.attr({ 'aria-invalid': 'true', 'aria-describedby': idMensagem });
        $controle.closest('.ef-input, .ef-select').addClass('is-invalid');
    };

    self.limparErro = function (seletor) {
        var $controle = $(seletor);

        $controle.closest('.ef-field').find('.ef-field__message--error').remove();
        $controle.closest('.ef-field').find('.ef-field__message').prop('hidden', false);
        $controle.removeAttr('aria-invalid aria-describedby');
        $controle.closest('.ef-input, .ef-select').removeClass('is-invalid');
    };

    /**
     * Limpa todos os erros de campo dentro de um contêiner (ao abrir um modal).
     *
     * @param {string} seletor contêiner (modal, formulário)
     * @returns
     */
    self.limparErros = function (seletor) {
        $(seletor).find('[aria-invalid="true"]').each(function () {
            self.limparErro(this);
        });
    };

    /**
     * Leva o foco pro primeiro campo com erro dentro do contêiner.
     *
     * @param {string} seletor contêiner (modal, formulário)
     * @returns
     */
    self.focarPrimeiroErro = function (seletor) {
        $(seletor).find('[aria-invalid="true"]').filter('input, select').first().trigger('focus');
    };

    // O erro some assim que a pessoa mexe no campo
    $(document).on('input change', '.ef-field input, .ef-field select', function () {
        if (this.getAttribute('aria-invalid') === 'true') {
            self.limparErro(this);
        }
    });
}
