var dashboard = new Dashboard();

/**
 * Controla a tela principal do app: sessão do usuário logado, cartões e
 * transações, sempre sincronizados com a API.
 */
function Dashboard() {
    var self = this;

    self.apiBaseUrl = 'http://localhost:8080';

    self.cardColors = [
        { bg: '#E1F5EE', color: '#0F6E56' },
        { bg: '#FCEBEB', color: '#A32D2D' },
        { bg: '#E6F1FB', color: '#185FA5' },
        { bg: '#EEEDFE', color: '#534AB7' },
        { bg: '#FAEEDA', color: '#854F0B' },
        { bg: '#FBE9F0', color: '#993356' },
        { bg: '#EAF3DE', color: '#3B6D11' },
        { bg: '#F1EFE8', color: '#5F5E5A' },
        { bg: '#E8F4FD', color: '#1565A8' },
        { bg: '#FFF3CD', color: '#856404' }
    ];

    self.state = {
        currentPage: 'dashboard',
        currentView: 'all',
        currentType: 'in',
        currentCategoria: null,
        selectedColor: self.cardColors[0],

        cards: [],
        transactions: []
    };

    self.obterToken = function () {
        return localStorage.getItem('token');
    };

    self.obterNome = function () {
        return localStorage.getItem('nome');
    };

    self.obterEmail = function () {
        return localStorage.getItem('email');
    };

    self.limparSessao = function () {
        localStorage.removeItem('token');
        localStorage.removeItem('nome');
        localStorage.removeItem('email');
    };

    self.cabecalhoAuth = function () {
        return { Authorization: 'Bearer ' + self.obterToken() };
    };

    /**
     * Exibe nome, e-mail e iniciais do usuário logado na sidebar e na topbar mobile.
     *
     * @returns
     */
    self.exibirDadosUsuario = function () {
        var nome = self.obterNome() || '';
        var iniciais = nome.split(' ').map(function (parte) { return parte.charAt(0); }).slice(0, 2).join('').toUpperCase();

        $('#sidebarUserName').text(nome);
        $('#sidebarUserEmail').text(self.obterEmail() || '');
        $('#sidebarAvatar').text(iniciais);
        $('#mobileAvatar').text(iniciais);
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

    /**
     * Trata o erro de qualquer chamada autenticada: se o token expirou (401), limpa
     * a sessão e redireciona pro login; senão, delega pra exibirErroAjax.
     *
     * @param {object} jqXHR objeto de erro retornado pelo jQuery
     * @returns
     */
    self.tratarErroRequisicao = function (jqXHR) {
        if (jqXHR.status === 401) {
            self.limparSessao();
            window.location.href = 'login.html';
        } else {
            self.exibirErroAjax(jqXHR);
        }
    };

    /**
     * Troca a página visível (Dashboard/Cartões) e atualiza a navegação ativa.
     *
     * @param {string} page identificador da página ("dashboard" ou "cards")
     * @returns
     */
    self.navigateTo = function (page) {
        self.state.currentPage = page;

        $('.page').removeClass('active');
        $('#page' + self.capitalize(page)).addClass('active');

        $('.nav-item').removeClass('active');
        $('.nav-item[data-page="' + page + '"]').addClass('active');

        $('.bottom-nav-item').removeClass('active');
        $('.bottom-nav-item[data-page="' + page + '"]').addClass('active');

        self.toggleFabMobile(page === 'dashboard');
    };

    self.capitalize = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    self.toggleFabMobile = function (visible) {
        if (visible) {
            $('#btnFabMobile').removeClass('hidden');
        } else {
            $('#btnFabMobile').addClass('hidden');
        }
    };

    self.updateAccountSelector = function (view) {
        var labels = { all: 'Todas as contas', cpf: 'Pessoal (CPF)', pj: 'Empresa (PJ)' };
        $('#accountLabel').text(labels[view]);

        if (view === 'pj') {
            $('#accountDot').addClass('pj');
        } else {
            $('#accountDot').removeClass('pj');
        }
    };

    self.formatCurrency = function (value) {
        return 'R$ ' + value.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    self.updateBalanceDisplay = function (balance) {
        var sign = balance < 0 ? '-' : '';
        var absValue = Math.abs(balance);
        var integerPart = Math.floor(absValue).toLocaleString('pt-BR');
        var centsPart = absValue.toFixed(2).split('.')[1];

        $('#balanceInteger').text(sign + integerPart);
        $('#balanceCents').text(',' + centsPart);
    };

    self.formatarData = function (dataIso) {
        var meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        var partes = dataIso.split('-');
        var dia = partes[2];
        var mes = meses[parseInt(partes[1], 10) - 1];

        return dia + ' ' + mes;
    };

    self.resolveIconeCategoria = function (categoria) {
        var mapa = {
            RENDA: { classe: 'tx-icon--income', icone: 'fa-arrow-down-left' },
            DESPESA: { classe: 'tx-icon--expense', icone: 'fa-arrow-up-right' },
            ALIMENTACAO: { classe: 'tx-icon--food', icone: 'fa-bag-shopping' },
            MORADIA: { classe: 'tx-icon--home', icone: 'fa-house' },
            OUTRO: { classe: 'tx-icon--outro', icone: 'fa-ellipsis' }
        };

        return mapa[categoria] || mapa.OUTRO;
    };

    /**
     * Monta o elemento de uma movimentação na lista. Se a transação está vinculada
     * a um cartão, usa o ícone/cor do cartão; senão, usa o ícone da categoria.
     *
     * @param {object} tx transação retornada pela API
     * @returns {jQuery} elemento &lt;li&gt; pronto pra inserir na lista
     */
    self.buildTransactionItem = function (tx) {
        var card = self.getCardById(tx.cartaoId);
        var amountClass = tx.tipo === 'ENTRADA' ? 'tx-amount--in' : 'tx-amount--out';
        var prefix = tx.tipo === 'ENTRADA' ? '+' : '-';
        var metaCard = card ? ' · ' + card.nome : '';
        var metaText = self.formatarData(tx.dataTransacao) + ' · ' + tx.conta + metaCard;

        var $icon;

        if (card) {
            $icon = $('<div>', { class: 'tx-icon' }).append($('<i>', { class: 'fa-solid fa-credit-card' }));
            $icon.css({ background: card.corFundo, color: card.corTexto });
        } else {
            var icone = self.resolveIconeCategoria(tx.categoria);
            $icon = $('<div>', { class: 'tx-icon ' + icone.classe }).append($('<i>', { class: 'fa-solid ' + icone.icone }));
        }

        var $delete = $('<button>', { class: 'item-delete-btn', title: 'Excluir' })
            .append($('<i>', { class: 'fa-solid fa-trash' }))
            .on('click', function () {
                self.excluirTransacao(tx.id);
            });

        return $('<li>', { class: 'tx-item' }).append(
            $icon,
            $('<div>', { class: 'tx-info' }).append(
                $('<p>', { class: 'tx-name', text: tx.descricao }),
                $('<p>', { class: 'tx-meta', text: metaText })
            ),
            $('<span>', { class: 'tx-amount ' + amountClass, text: prefix + self.formatCurrency(tx.valor) }),
            $delete
        );
    };

    self.updateSummary = function (resumo) {
        self.updateBalanceDisplay(resumo.saldo);
        $('#totalIncome').text(self.formatCurrency(resumo.totalEntradas));
        $('#totalExpense').text(self.formatCurrency(resumo.totalSaidas));
    };

    self.renderTransactions = function () {
        var $list = $('#transactionsList').empty();

        if (self.state.transactions.length === 0) {
            $list.append(
                $('<li>', { class: 'tx-empty', text: 'Nenhuma movimentação ainda.' })
            );
        } else {
            self.state.transactions.forEach(function (tx) {
                $list.append(self.buildTransactionItem(tx));
            });
        }
    };

    /**
     * Busca a lista de transações da conta atual e, em seguida, o resumo financeiro
     * (uma chamada depois da outra), atualizando a tela ao final.
     *
     * @returns
     */
    self.carregarTransacoes = function () {
        var conta = self.state.currentView === 'all' ? 'todas' : self.state.currentView;

        $.ajax({
            url: self.apiBaseUrl + '/api/transacoes?conta=' + conta,
            headers: self.cabecalhoAuth(),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (respostaLista) {
                self.state.transactions = respostaLista;
                self.renderTransactions();

                // Busca o resumo só depois da lista, pra manter o padrão success/error/complete
                $.ajax({
                    url: self.apiBaseUrl + '/api/transacoes/resumo?conta=' + conta,
                    headers: self.cabecalhoAuth(),
                    success: function (respostaResumo) {
                        self.updateSummary(respostaResumo);
                    },
                    error: function (jqXHR) {
                        self.tratarErroRequisicao(jqXHR);
                    },
                    complete: function () {
                        self.esconderCarregando();
                    }
                });
            },
            error: function (jqXHR) {
                self.tratarErroRequisicao(jqXHR);
                self.esconderCarregando();
            }
        });
    };

    self.getCardById = function (id) {
        var found = null;

        if (id) {
            self.state.cards.forEach(function (c) {
                if (c.id === id) {
                    found = c;
                }
            });
        }

        return found;
    };

    /**
     * Monta o elemento de um cartão na grade, com o gasto do mês já calculado
     * pela API.
     *
     * @param {object} card cartão retornado pela API
     * @returns {jQuery} elemento pronto pra inserir na grade de cartões
     */
    self.buildCardItem = function (card) {
        var $icon = $('<div>', { class: 'card-item-icon' }).css({ background: card.corFundo, color: card.corTexto }).append($('<i>', { class: 'fa-solid fa-credit-card' }));

        var $delete = $('<button>', { class: 'item-delete-btn', title: 'Excluir' }).append($('<i>', { class: 'fa-solid fa-trash' })).on('click', function () {
                self.excluirCartao(card.id);
            });

        return $('<div>', { class: 'card-item' }).append(
            $('<div>', { class: 'card-item-header' }).append(
                $icon,
                $('<div>').append(
                    $('<p>', { class: 'card-item-name', text: card.nome }),
                    $('<p>', { class: 'card-item-meta', text: 'Cartão cadastrado' })
                ),
                $delete
            ),
            $('<div>').append(
                $('<p>', { class: 'card-item-total', text: 'Gasto no mês' }),
                $('<p>', { class: 'card-item-amount', text: self.formatCurrency(card.gastoNoMes) })
            )
        );
    };

    self.renderCards = function () {
        var $grid = $('#cardsGrid').empty();

        if (self.state.cards.length === 0) {
            $grid.append(
                $('<div>', { class: 'card-empty' }).append(
                    $('<i>', { class: 'fa-solid fa-credit-card' }),
                    $('<p>', { text: 'Nenhum cartão cadastrado ainda.' })
                )
            );
        } else {
            self.state.cards.forEach(function (card) {
                $grid.append(self.buildCardItem(card));
            });
        }
    };

    self.populateCardSelect = function () {
        var $select = $('#inputCard').empty();
        $select.append($('<option>', { value: '', text: 'Sem cartão (débito / dinheiro)' }));

        self.state.cards.forEach(function (card) {
            $select.append($('<option>', { value: card.id, text: card.nome }));
        });
    };

    /**
     * Busca os cartões do usuário e atualiza a tela. Se as transações já tiverem
     * sido carregadas, renderiza elas de novo também — cobre o caso de essa chamada
     * terminar depois de carregarTransacoes(), quando os ícones de cartão ainda não
     * tinham dado pra resolver.
     *
     * @returns
     */
    self.carregarCartoes = function () {
        $.ajax({
            url: self.apiBaseUrl + '/api/cartoes',
            headers: self.cabecalhoAuth(),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (resposta) {
                self.state.cards = resposta;
                self.renderCards();
                self.populateCardSelect();

                if (self.state.transactions.length > 0) {
                    self.renderTransactions();
                }
            },
            error: function (jqXHR) {
                self.tratarErroRequisicao(jqXHR);
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
    };

    /**
     * Cria um novo cartão via API e atualiza a lista.
     *
     * @param {string} name nome do cartão
     * @param {object} colorObj cor escolhida ({ bg, color })
     * @returns
     */
    self.criarCartao = function (name, colorObj) {
        $.ajax({
            url: self.apiBaseUrl + '/api/cartoes',
            method: 'POST',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify({
                nome: name,
                corFundo: colorObj.bg,
                corTexto: colorObj.color
            }),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                self.closeModal('#modalCard');
                self.carregarCartoes();
            },
            error: function (jqXHR) {
                self.tratarErroRequisicao(jqXHR);
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
    };

    /**
     * Exclui um cartão via API, após confirmação do usuário. As transações
     * vinculadas ficam sem cartão (a API cuida disso), por isso recarrega
     * cartões e transações juntos.
     *
     * @param {number} id id do cartão
     * @returns
     */
    self.excluirCartao = function (id) {
        if (confirm('Excluir este cartão? As transações vinculadas a ele ficarão sem cartão.')) {
            $.ajax({
                url: self.apiBaseUrl + '/api/cartoes/' + id,
                method: 'DELETE',
                headers: self.cabecalhoAuth(),
                beforeSend: function () {
                    self.mostrarCarregando();
                },
                success: function () {
                    self.carregarCartoes();
                    self.carregarTransacoes();
                },
                error: function (jqXHR) {
                    self.tratarErroRequisicao(jqXHR);
                },
                complete: function () {
                    self.esconderCarregando();
                }
            });
        }
    };

    self.resetTransactionModal = function () {
        self.state.currentType = 'in';
        self.state.currentCategoria = null;
        $('#inputDescription').val('');
        $('#inputValue').val('');
        $('#inputCard').val('');
        $('#inputAccount').val('cpf');
        $('#btnTypeIn').addClass('active-in').removeClass('active-out');
        $('#btnTypeOut').removeClass('active-in active-out');
        $('#cardRow').removeClass('visible');
        $('.categoria-chip').removeClass('active');
        self.populateCardSelect();
    };

    self.applyTypeStyle = function (type) {
        var isIn = type === 'in';

        $('#btnTypeIn').toggleClass('active-in', isIn).removeClass('active-out');
        $('#btnTypeOut').toggleClass('active-out', !isIn).removeClass('active-in');
        $('#cardRow').toggleClass('visible', !isIn);
    };

    self.validateTransaction = function (description, value) {
        var valido = true;

        if (!description) {
            alert('Informe uma descrição.');
            valido = false;
        } else if (isNaN(value) || value <= 0) {
            alert('Informe um valor válido.');
            valido = false;
        }

        return valido;
    };

    /**
     * Cria uma nova transação via API e atualiza transações e cartões (o cartão
     * vinculado pode ter o gasto do mês alterado).
     *
     * @param {string} description descrição da transação
     * @param {number} value valor (já convertido pra número)
     * @param {string} account conta ("cpf" ou "pj")
     * @param {number} cardId id do cartão vinculado, ou null
     * @returns
     */
    self.criarTransacao = function (description, value, account, cardId) {
        $.ajax({
            url: self.apiBaseUrl + '/api/transacoes',
            method: 'POST',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify({
                descricao: description,
                valor: value,
                tipo: self.state.currentType === 'in' ? 'ENTRADA' : 'SAIDA',
                conta: account.toUpperCase(),
                categoria: self.state.currentCategoria,
                cartaoId: cardId
            }),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                self.closeModal('#modalTransaction');
                self.carregarTransacoes();
                self.carregarCartoes();
            },
            error: function (jqXHR) {
                self.tratarErroRequisicao(jqXHR);
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
    };

    /**
     * Exclui uma transação via API, após confirmação do usuário.
     *
     * @param {number} id id da transação
     * @returns
     */
    self.excluirTransacao = function (id) {
        if (confirm('Excluir esta movimentação?')) {
            $.ajax({
                url: self.apiBaseUrl + '/api/transacoes/' + id,
                method: 'DELETE',
                headers: self.cabecalhoAuth(),
                beforeSend: function () {
                    self.mostrarCarregando();
                },
                success: function () {
                    self.carregarTransacoes();
                    self.carregarCartoes();
                },
                error: function (jqXHR) {
                    self.tratarErroRequisicao(jqXHR);
                },
                complete: function () {
                    self.esconderCarregando();
                }
            });
        }
    };

    self.resetCardModal = function () {
        $('#inputCardName').val('');
        self.state.selectedColor = self.cardColors[0];
        self.buildColorPicker();
    };

    self.buildColorPicker = function () {
        var $picker = $('#colorPicker').empty();

        self.cardColors.forEach(function (colorObj, index) {
            var $swatch = $('<div>', { class: 'color-swatch' })
                .css('background', colorObj.color)
                .data('index', index);

            if (index === 0) {
                $swatch.addClass('selected');
            }

            $picker.append($swatch);
        });
    };

    self.openModal = function (selector) {
        $(selector).addClass('open');
    };

    self.closeModal = function (selector) {
        $(selector).removeClass('open');
    };

    /**
     * Confere a sessão, liga todos os eventos da tela e carrega os dados iniciais.
     * Ponto de entrada do Dashboard, chamado uma vez quando a página carrega.
     *
     * @returns
     */
    self.iniciar = function () {
        if (self.obterToken()) {
            $('#btnLogoutDesktop, #btnLogoutMobile').on('click', function () {
                self.limparSessao();
                window.location.href = 'login.html';
            });

            $(document).on('click', '.nav-item, .bottom-nav-item, .topbar-icon-btn', function () {
                self.navigateTo($(this).data('page'));
            });

            $(document).on('click', '.acc-tab', function () {
                var view = $(this).data('view');
                self.state.currentView = view;

                $('.acc-tab').removeClass('active');
                $('[data-view="' + view + '"]').addClass('active');

                self.updateAccountSelector(view);
                self.carregarTransacoes();
            });

            $('#btnNewTransaction, #btnFabMobile').on('click', function () {
                self.openModal('#modalTransaction');
                self.resetTransactionModal();
            });

            $('#modalTransaction').on('click', function (e) {
                if ($(e.target).is('#modalTransaction')) {
                    self.closeModal('#modalTransaction');
                }
            });

            $(document).on('click', '.categoria-chip', function () {
                self.state.currentCategoria = $(this).data('categoria');
                $('.categoria-chip').removeClass('active');
                $(this).addClass('active');
            });

            $('#btnTypeIn, #btnTypeOut').on('click', function () {
                self.state.currentType = $(this).data('type');
                self.applyTypeStyle(self.state.currentType);
            });

            $('#btnConfirmTransaction').on('click', function () {
                var description = $.trim($('#inputDescription').val());
                var rawValue = $('#inputValue').val().replace(',', '.');
                var value = parseFloat(rawValue);
                var account = $('#inputAccount').val();
                var cardId = parseInt($('#inputCard').val()) || null;

                if (self.validateTransaction(description, value)) {
                    if (self.state.currentCategoria) {
                        self.criarTransacao(description, value, account, cardId);
                    } else {
                        alert('Escolha uma categoria.');
                    }
                }
            });

            $('#btnNewCard').on('click', function () {
                self.openModal('#modalCard');
                self.resetCardModal();
            });

            $('#modalCard').on('click', function (e) {
                if ($(e.target).is('#modalCard')) {
                    self.closeModal('#modalCard');
                }
            });

            $(document).on('click', '.color-swatch', function () {
                var index = $(this).data('index');
                self.state.selectedColor = self.cardColors[index];

                $('.color-swatch').removeClass('selected');
                $(this).addClass('selected');
            });

            $('#btnConfirmCard').on('click', function () {
                var name = $.trim($('#inputCardName').val());

                if (name) {
                    self.criarCartao(name, self.state.selectedColor);
                } else {
                    alert('Informe o nome do cartão.');
                }
            });

            self.exibirDadosUsuario();
            self.buildColorPicker();
            self.carregarCartoes();
            self.carregarTransacoes();
        } else {
            window.location.href = 'login.html';
        }
    };
}

dashboard.iniciar();
