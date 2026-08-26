var dashboard = new Dashboard();

/**
 * Controla a tela principal do app: sessão do usuário logado, cartões e
 * transações, sempre sincronizados com a API.
 */
function Dashboard() {
    var self = this;

    self.apiBaseUrl = 'https://e-financeiro.onrender.com';

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

    self.categoriasDisponiveis = [
        { valor: 'RENDA', nome: 'Renda' },
        { valor: 'DESPESA', nome: 'Despesa' },
        { valor: 'ALIMENTACAO', nome: 'Alimentação' },
        { valor: 'MORADIA', nome: 'Moradia' },
        { valor: 'OUTRO', nome: 'Outro' }
    ];

    self.state = {
        currentPage: 'dashboard',
        currentView: 'all',
        currentType: 'in',
        currentCategoria: null,
        selectedColor: self.cardColors[0],
        selectedContaColor: self.cardColors[0],
        editingContaId: null,
        excludingContaId: null,
        currentTypeRecorrencia: 'in',
        currentCategoriaRecorrencia: null,
        editingValorRecorrenciaId: null,

        // Filtros do dashboard: mês/ano exibido e categorias marcadas
        // (lista vazia = todas as categorias)
        periodo: { mes: new Date().getMonth(), ano: new Date().getFullYear() },
        categoriasFiltradas: [],

        cards: [],
        contas: [],
        transactions: [],
        recorrencias: []
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

        $('#sidebarUserName').text(nome).attr('title', nome);
        $('#sidebarUserEmail').text(self.obterEmail() || '').attr('title', self.obterEmail() || '');
        $('#sidebarAvatar').text(iniciais);
        $('#mobileAvatar').text(iniciais);
    };

    /**
     * Exibe a saudação do dashboard conforme a hora do dia (bom dia até 12h,
     * boa tarde até 18h, boa noite no restante), com o primeiro nome do usuário.
     *
     * @returns
     */
    self.exibirSaudacao = function () {
        var hora = new Date().getHours();
        var saudacao;

        if (hora >= 5 && hora < 12) {
            saudacao = 'Bom dia';
        } else if (hora >= 12 && hora < 18) {
            saudacao = 'Boa tarde';
        } else {
            saudacao = 'Boa noite';
        }

        var primeiroNome = (self.obterNome() || '').split(' ')[0];

        $('#dashboardGreeting').text(primeiroNome ? saudacao + ', ' + primeiroNome : saudacao);
    };

    /**
     * Exibe o mês e ano selecionados no seletor de período do dashboard.
     *
     * @returns
     */
    self.renderizarPeriodo = function () {
        var meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        $('#balancePeriod').text(meses[self.state.periodo.mes] + ' ' + self.state.periodo.ano);
    };

    /**
     * Avança ou retrocede o mês exibido e reaplica os filtros.
     *
     * @param {number} delta -1 pro mês anterior, +1 pro próximo
     * @returns
     */
    self.mudarPeriodo = function (delta) {
        var novaData = new Date(self.state.periodo.ano, self.state.periodo.mes + delta, 1);

        self.state.periodo = { mes: novaData.getMonth(), ano: novaData.getFullYear() };
        self.renderizarPeriodo();
        self.aplicarFiltros();
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

    /**
     * Trata o erro de qualquer chamada autenticada: se o token expirou (401), limpa
     * a sessão e redireciona pro login; senão, delega pra exibirErroAjax.
     *
     * @param {object} jqXHR objeto de erro retornado pelo jQuery
     * @returns
     */
    self.tratarErroRequisicao = function (jqXHR) {
        if (jqXHR.status === 401 && !(jqXHR.responseJSON && jqXHR.responseJSON.mensagem)) {
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
        if (view === 'all') {
            $('#accountLabel').text('Todas as contas');
            $('#accountDot').css('background', '');
        } else {
            var conta = self.getContaById(view);
            $('#accountLabel').text(conta ? conta.nome : '');
            $('#accountDot').css('background', conta ? conta.corTexto : '');
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
        var metaText = self.formatarData(tx.dataTransacao) + ' · ' + tx.nomeConta + metaCard;

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

    /**
     * O resumo da API cobre o histórico todo; aqui só o saldo interessa —
     * entradas/saídas na tela respeitam o período/categorias filtrados e são
     * recalculadas em atualizarFluxoLocal.
     *
     * @param {object} resumo resposta de /api/transacoes/resumo
     * @returns
     */
    self.updateSummary = function (resumo) {
        self.updateBalanceDisplay(resumo.saldo);
    };

    /**
     * Recalcula entradas, saídas e as barras de proporção a partir das
     * transações filtradas (período + categorias).
     *
     * @param {Array} transacoes transações já filtradas
     * @returns
     */
    self.atualizarFluxoLocal = function (transacoes) {
        var entradas = 0;
        var saidas = 0;

        transacoes.forEach(function (tx) {
            if (tx.tipo === 'ENTRADA') {
                entradas += tx.valor;
            } else {
                saidas += tx.valor;
            }
        });

        $('#totalIncome').text(self.formatCurrency(entradas));
        $('#totalExpense').text(self.formatCurrency(saidas));

        var totalMovimentado = entradas + saidas;
        var percentualEntradas = totalMovimentado > 0 ? (entradas / totalMovimentado) * 100 : 0;
        var percentualSaidas = totalMovimentado > 0 ? 100 - percentualEntradas : 0;

        $('#barIncome').css('width', percentualEntradas + '%');
        $('#barExpense').css('width', percentualSaidas + '%');
    };

    /**
     * Aplica os filtros de período e categoria sobre as transações carregadas.
     * Quando a API passar a aceitar ?de=&ate=&categorias=, esse filtro migra
     * pro servidor.
     *
     * @returns {Array} transações do mês/ano e categorias selecionados
     */
    self.obterTransacoesFiltradas = function () {
        return self.state.transactions.filter(function (tx) {
            var partes = tx.dataTransacao.split('-');
            var noPeriodo = parseInt(partes[0], 10) === self.state.periodo.ano &&
                parseInt(partes[1], 10) - 1 === self.state.periodo.mes;
            var naCategoria = self.state.categoriasFiltradas.length === 0 ||
                self.state.categoriasFiltradas.indexOf(tx.categoria) !== -1;

            return noPeriodo && naCategoria;
        });
    };

    /**
     * Reaplica os filtros atuais: renderiza a lista filtrada e recalcula
     * entradas/saídas do que está visível.
     *
     * @returns
     */
    self.aplicarFiltros = function () {
        var filtradas = self.obterTransacoesFiltradas();

        self.renderTransactions(filtradas);
        self.atualizarFluxoLocal(filtradas);
    };

    /**
     * Monta a fileira de chips de filtro por categoria. Os chips são
     * combináveis (várias categorias ao mesmo tempo); "Todas" limpa a seleção.
     *
     * @returns
     */
    self.buildFilterRow = function () {
        var $row = $('#filterRow').empty();

        var $todas = $('<button>', { class: 'filter-chip', text: 'Todas' }).attr('data-categoria', '');

        if (self.state.categoriasFiltradas.length === 0) {
            $todas.addClass('active');
        }

        $row.append($todas);

        self.categoriasDisponiveis.forEach(function (categoria) {
            var icone = self.resolveIconeCategoria(categoria.valor);
            var $chip = $('<button>', { class: 'filter-chip' })
                .attr('data-categoria', categoria.valor)
                .append($('<i>', { class: 'fa-solid ' + icone.icone }), ' ' + categoria.nome);

            if (self.state.categoriasFiltradas.indexOf(categoria.valor) !== -1) {
                $chip.addClass('active');
            }

            $row.append($chip);
        });
    };

    self.renderTransactions = function (transacoes) {
        var $list = $('#transactionsList').empty();

        if (transacoes.length === 0) {
            $list.append(
                $('<li>', { class: 'tx-empty', text: 'Nenhuma movimentação nesse período.' })
            );
        } else {
            transacoes.forEach(function (tx) {
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
        var sufixo = self.state.currentView === 'all' ? '' : '?contaId=' + self.state.currentView;

        $.ajax({
            url: self.apiBaseUrl + '/api/transacoes' + sufixo,
            headers: self.cabecalhoAuth(),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (respostaLista) {
                self.state.transactions = respostaLista;
                self.aplicarFiltros();

                // Busca o resumo só depois da lista, pra manter o padrão success/error/complete
                $.ajax({
                    url: self.apiBaseUrl + '/api/transacoes/resumo' + sufixo,
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

    self.getContaById = function (id) {
        var found = null;

        self.state.contas.forEach(function (c) {
            if (c.id === id) {
                found = c;
            }
        });

        return found;
    };

    /**
     * Monta as abas de conta (desktop e mobile): "Tudo" fixo + uma por conta do usuário.
     *
     * @returns
     */
    self.buildAccountTabs = function () {
        var $todas = $('<button>', { class: 'acc-tab', text: 'Tudo' }).attr('data-view', 'all');

        if (self.state.currentView === 'all') {
            $todas.addClass('active');
        }

        var $wrapper = $('<div>').append($todas);

        self.state.contas.forEach(function (conta) {
            var $tab = $('<button>', { class: 'acc-tab', text: conta.nome }).attr('data-view', conta.id);

            if (self.state.currentView === conta.id) {
                $tab.addClass('active');
            }

            $wrapper.append($tab);
        });

        $('#tabsDesktop').html($wrapper.html());
        $('#tabsMobile').html($wrapper.html());
    };

    self.populateAccountSelect = function () {
        var $select = $('#inputAccount').empty();

        self.state.contas.forEach(function (conta) {
            $select.append($('<option>', { value: conta.id, text: conta.nome }));
        });
    };

    /**
     * Monta o elemento de um cartão na grade com aparência de cartão físico:
     * a cor escolhida vira o fundo, com chip decorativo e o gasto do mês
     * (já calculado pela API) na base.
     *
     * @param {object} card cartão retornado pela API
     * @returns {jQuery} elemento pronto pra inserir na grade de cartões
     */
    self.buildCardItem = function (card) {
        var $delete = $('<button>', { class: 'item-delete-btn', title: 'Excluir' }).append($('<i>', { class: 'fa-solid fa-trash' })).on('click', function () {
                self.excluirCartao(card.id);
            });

        return $('<div>', { class: 'card-item' }).css({ background: card.corFundo, color: card.corTexto }).append(
            $('<div>', { class: 'card-item-top' }).append(
                $('<div>', { class: 'card-chip' }),
                $delete
            ),
            $('<div>').append(
                $('<p>', { class: 'card-item-name', text: card.nome }),
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
     * Busca as contas do usuário e atualiza a tela: grade de contas, abas do
     * seletor e select do modal de nova movimentação.
     *
     * @returns
     */
    self.carregarContas = function () {
        $.ajax({
            url: self.apiBaseUrl + '/api/contas',
            headers: self.cabecalhoAuth(),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (resposta) {
                self.state.contas = resposta;
                self.renderContas();
                self.buildAccountTabs();
                self.populateAccountSelect();
            },
            error: function (jqXHR) {
                self.tratarErroRequisicao(jqXHR);
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
    };

    self.buildContaItem = function (conta) {
        var $editar = $('<button>', { class: 'item-edit-btn', title: 'Editar' })
            .append($('<i>', { class: 'fa-solid fa-pen' }))
            .on('click', function () {
                self.abrirEdicaoConta(conta);
            });

        var $excluir = $('<button>', { class: 'item-delete-btn', title: 'Excluir' })
            .append($('<i>', { class: 'fa-solid fa-trash' }))
            .on('click', function () {
                self.abrirModalExclusaoConta(conta.id);
            });

        return $('<div>', { class: 'card-item' }).css({ background: conta.corFundo, color: conta.corTexto }).append(
            $('<div>', { class: 'card-item-top' }).append(
                $('<div>', { class: 'card-chip' }),
                $('<div>', { class: 'card-item-actions' }).append($editar, $excluir)
            ),
            $('<p>', { class: 'card-item-name', text: conta.nome })
        );
    };

    self.renderContas = function () {
        var $grid = $('#contasGrid').empty();

        if (self.state.contas.length === 0) {
            $grid.append(
                $('<div>', { class: 'card-empty' }).append(
                    $('<i>', { class: 'fa-solid fa-wallet' }),
                    $('<p>', { text: 'Nenhuma conta cadastrada ainda.' })
                )
            );
        } else {
            self.state.contas.forEach(function (conta) {
                $grid.append(self.buildContaItem(conta));
            });
        }
    };

    self.buildContaColorPicker = function () {
        var $picker = $('#colorPickerConta').empty();

        self.cardColors.forEach(function (colorObj, index) {
            var $swatch = $('<div>', { class: 'color-swatch' })
                .css('background', colorObj.color)
                .data('index', index);

            if (colorObj === self.state.selectedContaColor) {
                $swatch.addClass('selected');
            }

            $picker.append($swatch);
        });
    };

    self.abrirModalConta = function () {
        self.state.editingContaId = null;
        $('#inputContaName').val('');
        self.state.selectedContaColor = self.cardColors[0];
        $('#modalConta .modal-title').text('Nova conta');
        self.buildContaColorPicker();
        self.openModal('#modalConta');
    };

    self.abrirEdicaoConta = function (conta) {
        var corAtual = self.cardColors.filter(function (c) { return c.color === conta.corTexto; })[0];

        self.state.editingContaId = conta.id;
        $('#inputContaName').val(conta.nome);
        self.state.selectedContaColor = corAtual || { bg: conta.corFundo, color: conta.corTexto };
        $('#modalConta .modal-title').text('Editar conta');
        self.buildContaColorPicker();
        self.openModal('#modalConta');
    };

    /**
     * Cria uma nova conta via API e atualiza a lista.
     *
     * @param {string} nome nome da conta
     * @param {object} colorObj cor escolhida ({ bg, color })
     * @returns
     */
    self.criarConta = function (nome, colorObj) {
        $.ajax({
            url: self.apiBaseUrl + '/api/contas',
            method: 'POST',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify({ nome: nome, corFundo: colorObj.bg, corTexto: colorObj.color }),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                self.closeModal('#modalConta');
                self.carregarContas();
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
     * Atualiza nome e cor de uma conta existente via API.
     *
     * @param {number} id id da conta
     * @param {string} nome novo nome
     * @param {object} colorObj nova cor ({ bg, color })
     * @returns
     */
    self.atualizarConta = function (id, nome, colorObj) {
        $.ajax({
            url: self.apiBaseUrl + '/api/contas/' + id,
            method: 'PUT',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify({ nome: nome, corFundo: colorObj.bg, corTexto: colorObj.color }),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                self.closeModal('#modalConta');
                self.carregarContas();
            },
            error: function (jqXHR) {
                self.tratarErroRequisicao(jqXHR);
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
    };

    self.abrirModalExclusaoConta = function (contaId) {
        self.state.excludingContaId = contaId;
        $('#inputSenhaExclusaoConta').val('');
        self.openModal('#modalDeleteConta');
    };

    /**
     * Exclui a conta selecionada (self.state.excludingContaId) mediante senha.
     * Se a conta excluída era a que estava filtrando o dashboard, volta o filtro
     * pra "Tudo".
     *
     * @returns
     */
    self.excluirConta = function () {
        var senha = $('#inputSenhaExclusaoConta').val();

        if (!senha) {
            alert('Informe sua senha pra confirmar.');
            return;
        }

        $.ajax({
            url: self.apiBaseUrl + '/api/contas/' + self.state.excludingContaId,
            method: 'DELETE',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify({ senha: senha }),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                $('#inputSenhaExclusaoConta').val('');
                self.closeModal('#modalDeleteConta');

                if (self.state.currentView === self.state.excludingContaId) {
                    self.state.currentView = 'all';
                    self.updateAccountSelector('all');
                }

                self.carregarContas();
                self.carregarTransacoes();
            },
            error: function (jqXHR) {
                $('#inputSenhaExclusaoConta').val('');
                self.tratarErroRequisicao(jqXHR);
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
    };

    /**
     * Busca as recorrências do usuário e atualiza a lista da página Recorrências.
     *
     * @returns
     */
    self.carregarRecorrencias = function () {
        $.ajax({
            url: self.apiBaseUrl + '/api/recorrencias',
            headers: self.cabecalhoAuth(),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (resposta) {
                self.state.recorrencias = resposta;
                self.renderRecorrencias();
            },
            error: function (jqXHR) {
                self.tratarErroRequisicao(jqXHR);
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
    };

    self.buildRecorrenciaItem = function (recorrencia) {
        var icone = self.resolveIconeCategoria(recorrencia.categoria);
        var $icon = $('<div>', { class: 'tx-icon ' + icone.classe }).append($('<i>', { class: 'fa-solid ' + icone.icone }));

        var decorridas = recorrencia.totalParcelas - recorrencia.parcelasRestantes;
        var metaCartao = recorrencia.nomeCartao ? ' · ' + recorrencia.nomeCartao : '';
        var metaText = decorridas + ' de ' + recorrencia.totalParcelas + ' · ' + recorrencia.nomeConta + metaCartao;

        var amountClass = recorrencia.tipo === 'ENTRADA' ? 'tx-amount--in' : 'tx-amount--out';
        var prefix = recorrencia.tipo === 'ENTRADA' ? '+' : '-';

        var $editar = $('<button>', { class: 'item-edit-btn', title: 'Editar valor' })
            .append($('<i>', { class: 'fa-solid fa-pen' }))
            .on('click', function () {
                self.abrirModalEditarValorRecorrencia(recorrencia);
            });

        var $cancelar = $('<button>', { class: 'item-delete-btn', title: 'Cancelar parcelas futuras' })
            .append($('<i>', { class: 'fa-solid fa-trash' }))
            .on('click', function () {
                self.cancelarRecorrenciaFuturas(recorrencia.id);
            });

        return $('<li>', { class: 'tx-item' }).append(
            $icon,
            $('<div>', { class: 'tx-info' }).append(
                $('<p>', { class: 'tx-name', text: recorrencia.descricao }),
                $('<p>', { class: 'tx-meta', text: metaText })
            ),
            $('<span>', { class: 'tx-amount ' + amountClass, text: prefix + self.formatCurrency(recorrencia.valor) }),
            $('<div>', { class: 'card-item-actions' }).append($editar, $cancelar)
        );
    };

    self.renderRecorrencias = function () {
        var $lista = $('#recorrenciasLista').empty();

        if (self.state.recorrencias.length === 0) {
            $lista.append(
                $('<li>', { class: 'tx-empty', text: 'Nenhuma recorrência cadastrada ainda.' })
            );
        } else {
            self.state.recorrencias.forEach(function (recorrencia) {
                $lista.append(self.buildRecorrenciaItem(recorrencia));
            });
        }
    };

    self.populateRecorrenciaAccountSelect = function () {
        var $select = $('#inputRecorrenciaAccount').empty();

        self.state.contas.forEach(function (conta) {
            $select.append($('<option>', { value: conta.id, text: conta.nome }));
        });
    };

    self.populateRecorrenciaCardSelect = function () {
        var $select = $('#inputRecorrenciaCard').empty();
        $select.append($('<option>', { value: '', text: 'Sem cartão (débito / dinheiro)' }));

        self.state.cards.forEach(function (card) {
            $select.append($('<option>', { value: card.id, text: card.nome }));
        });
    };

    self.applyRecorrenciaTypeStyle = function (type) {
        var isIn = type === 'in';

        $('#btnRecorrenciaTypeIn').toggleClass('active-in', isIn).removeClass('active-out');
        $('#btnRecorrenciaTypeOut').toggleClass('active-out', !isIn).removeClass('active-in');
        $('#cardRowRecorrencia').toggleClass('visible', !isIn);

        $('#categoriaRowRecorrencia .categoria-chip').removeClass('active');
        self.state.currentCategoriaRecorrencia = isIn ? 'RENDA' : null;
        $('#categoriaRowRecorrencia').css('display', isIn ? 'none' : 'flex');
        $('#categoriaRowRecorrencia .categoria-chip[data-categoria="RENDA"]').css('display', isIn ? '' : 'none');
    };

    self.resetRecorrenciaModal = function () {
        self.state.currentTypeRecorrencia = 'in';
        $('#inputRecorrenciaDescription').val('');
        $('#inputRecorrenciaValue').val('');
        $('#inputRecorrenciaParcelas').val('');
        $('#inputRecorrenciaDataInicio').val('');
        $('#inputRecorrenciaCard').val('');
        self.populateRecorrenciaAccountSelect();
        self.populateRecorrenciaCardSelect();

        var contaPadrao = self.state.currentView !== 'all' ? self.state.currentView : (self.state.contas[0] ? self.state.contas[0].id : '');
        $('#inputRecorrenciaAccount').val(contaPadrao);

        self.applyRecorrenciaTypeStyle('in');
    };

    self.validateRecorrencia = function (description, value, totalParcelas) {
        var valido = true;

        if (!description) {
            alert('Informe uma descrição.');
            valido = false;
        } else if (isNaN(value) || value <= 0) {
            alert('Informe um valor válido.');
            valido = false;
        } else if (isNaN(totalParcelas) || totalParcelas < 1) {
            alert('Informe uma quantidade de parcelas válida.');
            valido = false;
        }

        return valido;
    };

    /**
     * Cria uma nova recorrência via API (o backend já gera todas as parcelas) e atualiza
     * recorrências, cartões (o gasto do mês pode mudar) e transações.
     *
     * @param {string} description descrição
     * @param {number} value valor por parcela
     * @param {number} contaId id da conta
     * @param {number} cardId id do cartão, ou null
     * @param {number} totalParcelas quantidade de parcelas
     * @param {string} dataInicio data de início no formato YYYY-MM-DD, ou string vazia (omite, backend usa hoje)
     * @returns
     */
    self.criarRecorrencia = function (description, value, contaId, cardId, totalParcelas, dataInicio) {
        var corpo = {
            descricao: description,
            valor: value,
            tipo: self.state.currentTypeRecorrencia === 'in' ? 'ENTRADA' : 'SAIDA',
            categoria: self.state.currentCategoriaRecorrencia,
            contaId: contaId,
            cartaoId: cardId,
            totalParcelas: totalParcelas
        };

        if (dataInicio) {
            corpo.dataInicio = dataInicio;
        }

        $.ajax({
            url: self.apiBaseUrl + '/api/recorrencias',
            method: 'POST',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify(corpo),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                self.closeModal('#modalRecorrencia');
                self.carregarRecorrencias();
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
    };

    self.abrirModalEditarValorRecorrencia = function (recorrencia) {
        self.state.editingValorRecorrenciaId = recorrencia.id;
        $('#inputRecorrenciaNewValue').val(recorrencia.valor);
        self.openModal('#modalEditRecorrenciaValue');
    };

    self.atualizarValorRecorrencia = function () {
        var novoValor = parseFloat($('#inputRecorrenciaNewValue').val().replace(',', '.'));

        if (isNaN(novoValor) || novoValor <= 0) {
            alert('Informe um valor válido.');
            return;
        }

        $.ajax({
            url: self.apiBaseUrl + '/api/recorrencias/' + self.state.editingValorRecorrenciaId + '/valor',
            method: 'PUT',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify({ valor: novoValor }),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                self.closeModal('#modalEditRecorrenciaValue');
                self.carregarRecorrencias();
                self.carregarTransacoes();
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
     * Cancela as parcelas futuras de uma recorrência, após confirmação do usuário.
     *
     * @param {number} id id da recorrência
     * @returns
     */
    self.cancelarRecorrenciaFuturas = function (id) {
        if (confirm('Cancelar as parcelas futuras dessa recorrência? As parcelas passadas continuam no histórico.')) {
            $.ajax({
                url: self.apiBaseUrl + '/api/recorrencias/' + id,
                method: 'DELETE',
                headers: self.cabecalhoAuth(),
                beforeSend: function () {
                    self.mostrarCarregando();
                },
                success: function () {
                    self.carregarRecorrencias();
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
                    self.aplicarFiltros();
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
        $('#inputDescription').val('');
        $('#inputValue').val('');
        $('#inputCard').val('');
        self.populateCardSelect();
        self.populateAccountSelect();

        var contaPadrao = self.state.currentView !== 'all' ? self.state.currentView : (self.state.contas[0] ? self.state.contas[0].id : '');
        $('#inputAccount').val(contaPadrao);

        self.applyTypeStyle('in');
    };

    self.applyTypeStyle = function (type) {
        var isIn = type === 'in';

        $('#btnTypeIn').toggleClass('active-in', isIn).removeClass('active-out');
        $('#btnTypeOut').toggleClass('active-out', !isIn).removeClass('active-in');
        $('#cardRow').toggleClass('visible', !isIn);

        // Categorias só fazem sentido pra saída: na entrada os chips somem e a
        // categoria vai como RENDA automaticamente; na saída o chip "Renda"
        // fica de fora
        $('#categoriaRow .categoria-chip').removeClass('active');
        self.state.currentCategoria = isIn ? 'RENDA' : null;
        $('#categoriaRow').css('display', isIn ? 'none' : 'flex');
        $('#categoriaRow .categoria-chip[data-categoria="RENDA"]').css('display', isIn ? '' : 'none');
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
     * @param {number} contaId id da conta
     * @param {number} cardId id do cartão vinculado, ou null
     * @returns
     */
    self.criarTransacao = function (description, value, contaId, cardId) {
        $.ajax({
            url: self.apiBaseUrl + '/api/transacoes',
            method: 'POST',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify({
                descricao: description,
                valor: value,
                tipo: self.state.currentType === 'in' ? 'ENTRADA' : 'SAIDA',
                contaId: contaId,
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

            $(document).on('click', '.nav-item, .bottom-nav-item, .topbar-icon-btn[data-page]', function () {
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

            $(document).on('click', '#categoriaRow .categoria-chip', function () {
                self.state.currentCategoria = $(this).data('categoria');
                $('#categoriaRow .categoria-chip').removeClass('active');
                $(this).addClass('active');
            });

            $(document).on('click', '#categoriaRowRecorrencia .categoria-chip', function () {
                self.state.currentCategoriaRecorrencia = $(this).data('categoria');
                $('#categoriaRowRecorrencia .categoria-chip').removeClass('active');
                $(this).addClass('active');
            });

            $('#btnPrevMonth').on('click', function () {
                self.mudarPeriodo(-1);
            });

            $('#btnNextMonth').on('click', function () {
                self.mudarPeriodo(1);
            });

            $(document).on('click', '.filter-chip', function () {
                var categoria = $(this).attr('data-categoria');

                if (!categoria) {
                    self.state.categoriasFiltradas = [];
                } else {
                    var indice = self.state.categoriasFiltradas.indexOf(categoria);

                    if (indice === -1) {
                        self.state.categoriasFiltradas.push(categoria);
                    } else {
                        self.state.categoriasFiltradas.splice(indice, 1);
                    }
                }

                self.buildFilterRow();
                self.aplicarFiltros();
            });

            $('#btnTypeIn, #btnTypeOut').on('click', function () {
                self.state.currentType = $(this).data('type');
                self.applyTypeStyle(self.state.currentType);
            });

            $('#btnConfirmTransaction').on('click', function () {
                var description = $.trim($('#inputDescription').val());
                var rawValue = $('#inputValue').val().replace(',', '.');
                var value = parseFloat(rawValue);
                var contaId = parseInt($('#inputAccount').val());
                var cardId = parseInt($('#inputCard').val()) || null;

                if (!contaId) {
                    alert('Crie uma conta antes de lançar uma movimentação.');
                } else if (self.validateTransaction(description, value)) {
                    if (self.state.currentCategoria) {
                        self.criarTransacao(description, value, contaId, cardId);
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

            $(document).on('click', '#colorPicker .color-swatch', function () {
                var index = $(this).data('index');
                self.state.selectedColor = self.cardColors[index];

                $('#colorPicker .color-swatch').removeClass('selected');
                $(this).addClass('selected');
            });

            $(document).on('click', '#colorPickerConta .color-swatch', function () {
                var index = $(this).data('index');
                self.state.selectedContaColor = self.cardColors[index];

                $('#colorPickerConta .color-swatch').removeClass('selected');
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

            $('#btnNewConta').on('click', function () {
                self.abrirModalConta();
            });

            $('#modalConta').on('click', function (e) {
                if ($(e.target).is('#modalConta')) {
                    self.closeModal('#modalConta');
                }
            });

            $('#btnConfirmConta').on('click', function () {
                var nome = $.trim($('#inputContaName').val());

                if (nome) {
                    if (self.state.editingContaId) {
                        self.atualizarConta(self.state.editingContaId, nome, self.state.selectedContaColor);
                    } else {
                        self.criarConta(nome, self.state.selectedContaColor);
                    }
                } else {
                    alert('Informe o nome da conta.');
                }
            });

            $('#modalDeleteConta').on('click', function (e) {
                if ($(e.target).is('#modalDeleteConta')) {
                    self.closeModal('#modalDeleteConta');
                }
            });

            $('#btnConfirmDeleteConta').on('click', self.excluirConta);

            $('#btnNewRecorrencia').on('click', function () {
                self.openModal('#modalRecorrencia');
                self.resetRecorrenciaModal();
            });

            $('#modalRecorrencia').on('click', function (e) {
                if ($(e.target).is('#modalRecorrencia')) {
                    self.closeModal('#modalRecorrencia');
                }
            });

            $('#btnRecorrenciaTypeIn, #btnRecorrenciaTypeOut').on('click', function () {
                self.state.currentTypeRecorrencia = $(this).data('type');
                self.applyRecorrenciaTypeStyle(self.state.currentTypeRecorrencia);
            });

            $('#btnConfirmRecorrencia').on('click', function () {
                var description = $.trim($('#inputRecorrenciaDescription').val());
                var rawValue = $('#inputRecorrenciaValue').val().replace(',', '.');
                var value = parseFloat(rawValue);
                var contaId = parseInt($('#inputRecorrenciaAccount').val());
                var cardId = parseInt($('#inputRecorrenciaCard').val()) || null;
                var totalParcelas = parseInt($('#inputRecorrenciaParcelas').val());
                var dataInicio = $('#inputRecorrenciaDataInicio').val();

                if (!contaId) {
                    alert('Crie uma conta antes de lançar uma recorrência.');
                } else if (self.validateRecorrencia(description, value, totalParcelas)) {
                    if (self.state.currentCategoriaRecorrencia) {
                        self.criarRecorrencia(description, value, contaId, cardId, totalParcelas, dataInicio);
                    } else {
                        alert('Escolha uma categoria.');
                    }
                }
            });

            $('#modalEditRecorrenciaValue').on('click', function (e) {
                if ($(e.target).is('#modalEditRecorrenciaValue')) {
                    self.closeModal('#modalEditRecorrenciaValue');
                }
            });

            $('#btnConfirmEditRecorrenciaValue').on('click', self.atualizarValorRecorrencia);

            self.exibirDadosUsuario();
            self.exibirSaudacao();
            self.renderizarPeriodo();
            self.buildFilterRow();
            self.buildColorPicker();
            self.updateAccountSelector('all');
            self.carregarContas();
            self.carregarCartoes();
            self.carregarTransacoes();
            self.carregarRecorrencias();
        } else {
            window.location.href = 'login.html';
        }
    };
}

dashboard.iniciar();
