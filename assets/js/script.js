var dashboard = new Dashboard();

/**
 * Controla a tela principal do app: sessão do usuário logado, cartões e
 * transações, sempre sincronizados com a API.
 */
function Dashboard() {
    var self = this;

    self.apiBaseUrl = 'https://e-financeiro.onrender.com';

    /**
     * Paleta de cores que o usuário escolhe para cartões e contas. Vem dos tokens
     * --swatch-N-bg/--swatch-N-fg do design system (design-system/tokens/colors.css).
     * O texto hex lido é exatamente o que vai (e já foi) gravado na API em
     * corFundo/corTexto — por isso os valores dos tokens nunca podem ser reformatados.
     *
     * @returns {Array} lista de { bg, color }
     */
    self.lerPaletaDeCores = function () {
        var estilos = getComputedStyle(document.documentElement);
        var total = parseInt(estilos.getPropertyValue('--swatch-count'), 10) || 0;
        var paleta = [];

        for (var i = 1; i <= total; i++) {
            paleta.push({
                bg: estilos.getPropertyValue('--swatch-' + i + '-bg').trim(),
                color: estilos.getPropertyValue('--swatch-' + i + '-fg').trim()
            });
        }

        return paleta;
    };

    self.cardColors = self.lerPaletaDeCores();

    self.state = {
        currentPage: 'dashboard',
        currentView: 'all',
        currentType: 'in',
        currentCategoria: null,
        selectedColor: self.cardColors[0],
        selectedContaColor: self.cardColors[0],
        editingContaId: null,
        editingCardId: null,
        excludingContaId: null,
        currentTypeRecorrencia: 'in',
        currentCategoriaRecorrencia: null,
        editingRecorrenciaId: null,
        editingAssinaturaId: null,
        currentCategoriaAssinatura: null,

        // Filtros do dashboard: mês/ano exibido e categorias marcadas
        // (lista vazia = todas as categorias)
        periodo: { mes: new Date().getMonth(), ano: new Date().getFullYear() },
        categoriasFiltradas: [],

        // Série exibida no gráfico de tendência: resultado, entradas ou saidas
        serieTendencia: 'resultado',

        cards: [],
        contas: [],
        transactions: [],
        recorrencias: [],
        assinaturas: [],
        categorias: [],
        opcoesCategoria: { icones: [], tons: [] },
        editingCategoriaId: null,
        categoriaIconeSelecionado: null,
        categoriaTomSelecionado: null,
        previaImportacao: null
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

    self.obterFotoUrl = function () {
        return localStorage.getItem('fotoUrl');
    };

    /**
     * Grava na sessão os dados que vêm da API de perfil. O token só é trocado quando a API manda
     * um novo (troca de e-mail ou de senha).
     *
     * @param {object} perfil resposta de /api/perfil ({ nome, email, fotoUrl, token })
     * @returns
     */
    self.salvarPerfilNaSessao = function (perfil) {
        localStorage.setItem('nome', perfil.nome);
        localStorage.setItem('email', perfil.email);

        if (perfil.fotoUrl) {
            localStorage.setItem('fotoUrl', perfil.fotoUrl);
        } else {
            localStorage.removeItem('fotoUrl');
        }

        if (perfil.token) {
            localStorage.setItem('token', perfil.token);
        }
    };

    self.limparSessao = function () {
        localStorage.removeItem('token');
        localStorage.removeItem('nome');
        localStorage.removeItem('email');
        localStorage.removeItem('fotoUrl');
    };

    self.cabecalhoAuth = function () {
        return { Authorization: 'Bearer ' + self.obterToken() };
    };

    /**
     * Mostra a foto do usuário num avatar, ou as iniciais do nome quando não houver foto
     * (ou quando a foto não carregar).
     *
     * @param {jQuery} $avatar elemento .ef-avatar
     * @param {string} nome nome do usuário
     * @param {string|null} fotoUrl URL da foto, ou null
     * @returns
     */
    self.renderizarAvatar = function ($avatar, nome, fotoUrl) {
        var iniciais = (nome || '').split(' ').map(function (parte) { return parte.charAt(0); }).slice(0, 2).join('').toUpperCase();

        if (!fotoUrl) {
            $avatar.empty().text(iniciais || '--');
            return;
        }

        var $foto = $('<img>', { class: 'ef-avatar__img', src: fotoUrl, alt: '' })
            .on('error', function () {
                $avatar.empty().text(iniciais || '--');
            });

        $avatar.empty().append($foto);
    };

    /**
     * Exibe nome, e-mail e avatar (foto ou iniciais) do usuário logado na sidebar e na topbar mobile.
     *
     * @returns
     */
    self.exibirDadosUsuario = function () {
        var nome = self.obterNome() || '';

        $('#sidebarUserName').text(nome).attr('title', nome);
        $('#sidebarUserEmail').text(self.obterEmail() || '').attr('title', self.obterEmail() || '');
        self.renderizarAvatar($('#sidebarAvatar'), nome, self.obterFotoUrl());
        self.renderizarAvatar($('#mobileAvatar'), nome, self.obterFotoUrl());
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
     * Trata o erro de qualquer chamada autenticada: se o token expirou (401), limpa
     * a sessão e redireciona pro login; senão, mostra o erro em Toast.
     *
     * @param {object} jqXHR objeto de erro retornado pelo jQuery
     * @returns
     */
    self.tratarErroRequisicao = function (jqXHR) {
        if (jqXHR.status === 401 && !(jqXHR.responseJSON && jqXHR.responseJSON.mensagem)) {
            self.limparSessao();
            window.location.href = 'login.html';
        } else {
            feedback.exibirErroAjax(jqXHR);
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

        $('.nav-item, .bottom-nav-item').removeAttr('aria-current');
        $('.nav-item[data-page="' + page + '"], .bottom-nav-item[data-page="' + page + '"]').attr('aria-current', 'page');

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

    /**
     * Converte o texto de um campo de valor em número. Aceita o formato
     * brasileiro (1.234,56) e o com ponto decimal (1234.56).
     *
     * @param {string} texto valor digitado
     * @returns {number} valor, ou NaN se não for número
     */
    self.lerValor = function (texto) {
        var limpo = $.trim(texto || '');

        if (limpo.indexOf(',') !== -1) {
            limpo = limpo.replace(/\./g, '').replace(',', '.');
        }

        return parseFloat(limpo);
    };

    /**
     * Valor numérico no formato do campo (374,75), pra preencher um input.
     *
     * @param {number} valor valor em reais
     * @returns {string} texto com vírgula decimal
     */
    self.valorParaCampo = function (valor) {
        return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

    self.getCategoriaById = function (id) {
        return self.state.categorias.find(function (categoria) { return categoria.id === id; }) || null;
    };

    /**
     * Tom do IconTile, cor de série (donut) e ícone de uma categoria, a partir da lista carregada da
     * API. Categoria desconhecida (ex.: excluída em outro aparelho) usa o visual de "Outro".
     *
     * @param {number} categoriaId id da categoria
     * @returns {object} { classe, cor, icone }
     */
    self.resolveIconeCategoria = function (categoriaId) {
        var categoria = self.getCategoriaById(categoriaId);

        if (!categoria) {
            return { classe: '', cor: 'var(--tone-neutral-accent)', icone: 'ellipsis' };
        }

        return {
            classe: categoria.tom === 'neutral' ? '' : 'ef-icon-tile--' + categoria.tom,
            cor: 'var(--tone-' + categoria.tom + '-accent)',
            icone: categoria.icone
        };
    };

    /**
     * Monta um IconButton pequeno do design system com um ícone Lucide.
     *
     * @param {string} icone nome Lucide (ex: "trash-2")
     * @param {string} rotulo nome acessível e tooltip
     * @param {boolean} destrutivo true pinta o hover de vermelho (sair, excluir)
     * @returns {jQuery} botão pronto
     */
    self.criarBotaoIcone = function (icone, rotulo, destrutivo) {
        return $('<button>', {
            type: 'button',
            class: 'ef-icon-btn ef-icon-btn--sm' + (destrutivo ? ' icon-btn--destructive' : ''),
            title: rotulo,
            'aria-label': rotulo
        }).append(icones.criar(icone, 'sm'));
    };

    /**
     * Monta o EmptyState do design system (ícone opcional + título).
     *
     * @param {string} tag elemento raiz ("li" dentro de listas, "div" em grades)
     * @param {string} titulo texto do estado vazio
     * @param {string} icone nome Lucide opcional (ex: "wallet")
     * @returns {jQuery} elemento pronto
     */
    self.criarEstadoVazio = function (tag, titulo, icone) {
        var $vazio = $('<' + tag + '>', { class: 'ef-empty ef-empty--compact' });

        if (icone) {
            $vazio.append($('<span>', { class: 'ef-empty__icon', 'aria-hidden': 'true' }).append(icones.criar(icone, 'lg')));
        }

        return $vazio.append($('<p>', { class: 'ef-empty__title', text: titulo }));
    };

    /**
     * Monta o IconTile de uma categoria (tom + ícone).
     *
     * @param {number} categoriaId id da categoria
     * @returns {jQuery} tile pronto
     */
    self.criarTileCategoria = function (categoriaId) {
        var icone = self.resolveIconeCategoria(categoriaId);

        return $('<span>', { class: 'ef-icon-tile ' + icone.classe, 'aria-hidden': 'true' }).append(icones.criar(icone.icone, 'sm'));
    };

    /**
     * Badge "3/10" das movimentações geradas por uma recorrência, ou o ícone de assinatura nas
     * cobranças de assinatura. Lançamento avulso não tem badge.
     *
     * @param {object} tx transação retornada pela API
     * @returns {jQuery|null} badge, ou null quando não é parcela nem cobrança de assinatura
     */
    self.criarBadgeParcela = function (tx) {
        if (tx.assinaturaId) {
            return $('<span>', { class: 'ef-badge ef-badge--sm ef-badge--mono parcela-badge', title: 'Cobrança de assinatura', 'aria-label': 'Cobrança de assinatura' })
                .append(icones.criar('calendar-clock', 'xs'));
        }

        if (!tx.numeroParcela || !tx.totalParcelas) {
            return null;
        }

        var descricao = 'Parcela ' + tx.numeroParcela + ' de ' + tx.totalParcelas;

        return $('<span>', { class: 'ef-badge ef-badge--sm ef-badge--mono parcela-badge', title: descricao, 'aria-label': descricao })
            .append(icones.criar('repeat', 'xs'), $('<span>', { 'aria-hidden': 'true', text: tx.numeroParcela + '/' + tx.totalParcelas }));
    };

    /**
     * Monta o elemento de uma movimentação na lista. Se a transação está vinculada
     * a um cartão, usa o ícone/cor do cartão; senão, usa o ícone da categoria.
     * Parcela de recorrência ganha o badge "3/10" entre o texto e o valor.
     *
     * @param {object} tx transação retornada pela API
     * @returns {jQuery} elemento &lt;li&gt; pronto pra inserir na lista
     */
    self.buildTransactionItem = function (tx) {
        var card = self.getCardById(tx.cartaoId);
        var amountClass = tx.tipo === 'ENTRADA' ? 'tx-amount--in' : 'tx-amount--out';
        var prefix = tx.tipo === 'ENTRADA' ? '+' : '−';
        var metaCard = card ? ' · ' + card.nome : '';
        // No cartão, a data da lista é o vencimento da fatura; a da compra vai junto
        var metaCompra = tx.dataCompra ? ' · compra em ' + self.formatarData(tx.dataCompra) : '';
        var metaText = self.formatarData(tx.dataTransacao) + ' · ' + tx.nomeConta + metaCard + metaCompra;

        var $icon;

        if (card) {
            // Cor do cartão escolhida pelo usuário (paleta --swatch-*), aplicada em linha
            $icon = $('<span>', { class: 'ef-icon-tile', 'aria-hidden': 'true' }).append(icones.criar('credit-card', 'sm'));
            $icon.css({ background: card.corFundo, color: card.corTexto });
        } else {
            $icon = self.criarTileCategoria(tx.categoriaId);
        }

        var $delete = self.criarBotaoIcone('trash-2', 'Excluir', true)
            .on('click', function () {
                self.excluirTransacao(tx);
            });

        return $('<li>', { class: 'ef-list-row' }).append(
            $('<span>', { class: 'ef-list-row__leading' }).append($icon),
            $('<span>', { class: 'ef-list-row__text' }).append(
                $('<span>', { class: 'ef-list-row__title', text: tx.descricao }),
                $('<span>', { class: 'ef-list-row__subtitle', text: metaText })
            ),
            self.criarBadgeParcela(tx),
            $('<span>', { class: 'ef-list-row__end' }).append(
                $('<span>', { class: 'ef-list-row__value ' + amountClass, text: prefix + self.formatCurrency(tx.valor) })
            ),
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
                self.state.categoriasFiltradas.indexOf(tx.categoriaId) !== -1;

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
        self.atualizarGraficos();
    };

    /**
     * Componentes do design system (ES modules), carregados em
     * carregarDesignSystem. Fica null até o import terminar — os gráficos só
     * são desenhados depois disso.
     */
    self.ds = null;

    self.mesesNome = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    /**
     * Espera a API pública do design system (importada uma vez em feedback.js)
     * e desenha os gráficos.
     *
     * @returns
     */
    self.carregarDesignSystem = function () {
        feedback.componentes
            .then(function (componentes) {
                self.ds = componentes;
                self.montarSeletorTendencia();
                self.atualizarGraficos();
            })
            .catch(function () {
                $('#chartCategorias, #chartTendencia').append($('<div>', { class: 'ef-chart-empty', text: 'Gráfico indisponível' }));
            });
    };

    /**
     * Total no centro do donut, que tem espaço pra ~9 caracteres: valor completo
     * até R$ 999,99, inteiro até R$ 99.999 e abreviado daí pra cima.
     *
     * @param {number} valor total em reais
     * @returns {string} valor formatado
     */
    self.formatarTotalDonut = function (valor) {
        if (valor < 1000) {
            return self.formatCurrency(valor);
        }

        if (valor < 100000) {
            return 'R$ ' + Math.round(valor).toLocaleString('pt-BR');
        }

        return self.formatarValorCompacto(valor, true);
    };

    /**
     * Formata um valor em forma curta pra espaço apertado (eixo, centro do
     * donut): 950 · 1,2k · 4,22M. Negativo usa o sinal − (U+2212), como no
     * restante do app.
     *
     * @param {number} valor valor em reais
     * @param {boolean} comMoeda true prefixa "R$ "
     * @returns {string} valor abreviado
     */
    self.formatarValorCompacto = function (valor, comMoeda) {
        var absoluto = Math.abs(valor);
        var texto;

        if (absoluto >= 1000000) {
            texto = (absoluto / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + 'M';
        } else if (absoluto >= 1000) {
            texto = (absoluto / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k';
        } else {
            texto = Math.round(absoluto).toLocaleString('pt-BR');
        }

        return (valor < 0 ? '−' : '') + (comMoeda ? 'R$ ' : '') + texto;
    };

    self.obterTransacoesDoMes = function (mes, ano) {
        return self.state.transactions.filter(function (tx) {
            var partes = tx.dataTransacao.split('-');
            return parseInt(partes[0], 10) === ano && parseInt(partes[1], 10) - 1 === mes;
        });
    };

    /**
     * Agrupa as saídas do mês selecionado por categoria, pro donut de "Gastos por categoria". As
     * fatias saem da maior pra menor, com a mesma cor do IconTile da categoria.
     *
     * @returns {Array} fatias no formato do DonutChart ({ label, value, color })
     */
    /**
     * Id da categoria fixa "Outro" (SAIDA), usada quando uma transação aponta pra uma categoria que
     * não existe mais (ex.: excluída em outro aparelho). Sem essa fixa carregada ainda, cai no id
     * bruto da transação (função só chamada quando ele já é desconhecido de qualquer forma).
     *
     * @returns {number|null} id da categoria "Outro", ou null se as fixas ainda não carregaram
     */
    self.idCategoriaOutro = function () {
        var outro = self.state.categorias.find(function (categoria) {
            return categoria.fixa && categoria.tipo === 'SAIDA' && categoria.nome === 'Outro';
        });

        return outro ? outro.id : null;
    };

    self.montarDadosCategorias = function () {
        var totais = {};

        self.obterTransacoesDoMes(self.state.periodo.mes, self.state.periodo.ano).forEach(function (tx) {
            if (tx.tipo === 'SAIDA') {
                var categoriaId = self.getCategoriaById(tx.categoriaId) ? tx.categoriaId : (self.idCategoriaOutro() || tx.categoriaId);
                totais[categoriaId] = (totais[categoriaId] || 0) + tx.valor;
            }
        });

        return Object.keys(totais)
            .map(function (chave) {
                var categoriaId = parseInt(chave, 10);
                var categoria = self.getCategoriaById(categoriaId);

                return { label: categoria ? categoria.nome : 'Outro', value: totais[chave], color: self.resolveIconeCategoria(categoriaId).cor };
            })
            .sort(function (a, b) { return b.value - a.value; });
    };

    /**
     * Monta entradas, saídas e resultado (entradas − saídas) dos últimos 6
     * meses, incluindo o mês selecionado no seletor de período.
     *
     * @returns {object} { labels, entradas, saidas, resultado }
     */
    self.montarDadosTendencia = function () {
        var mesesAbrev = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        var dados = { labels: [], entradas: [], saidas: [], resultado: [] };

        for (var i = 5; i >= 0; i--) {
            var data = new Date(self.state.periodo.ano, self.state.periodo.mes - i, 1);
            var totalEntradas = 0;
            var totalSaidas = 0;

            self.obterTransacoesDoMes(data.getMonth(), data.getFullYear()).forEach(function (tx) {
                if (tx.tipo === 'ENTRADA') {
                    totalEntradas += tx.valor;
                } else {
                    totalSaidas += tx.valor;
                }
            });

            dados.labels.push(mesesAbrev[data.getMonth()]);
            dados.entradas.push(totalEntradas);
            dados.saidas.push(totalSaidas);
            dados.resultado.push(totalEntradas - totalSaidas);
        }

        return dados;
    };

    /**
     * Donut de gastos por categoria (DonutChart + DonutLegend). Sem aurora: o
     * card de saldo já usa a única aurora permitida por tela. Sem saídas no mês,
     * o próprio DonutChart desenha o trilho vazio com "Sem dados".
     *
     * @returns
     */
    self.renderizarGraficoCategorias = function () {
        var fatias = self.montarDadosCategorias();
        var total = fatias.reduce(function (soma, fatia) { return soma + fatia.value; }, 0);
        var $grafico = $('#chartCategorias').empty();

        $grafico.append(self.ds.DonutChart({
            data: fatias,
            aurora: false,
            centerLabel: 'Total',
            centerValue: self.formatarTotalDonut(total)
        }));

        if (fatias.length > 0) {
            $grafico.append(self.ds.DonutLegend({ data: fatias }));
        }
    };

    /**
     * SegmentedControl que escolhe a série do gráfico de tendência. Montado uma
     * vez só: ele guarda a própria seleção.
     *
     * @returns
     */
    self.montarSeletorTendencia = function () {
        $('#chartTendenciaSerie').empty().append(self.ds.SegmentedControl({
            size: 'sm',
            value: self.state.serieTendencia,
            options: [
                { value: 'resultado', label: 'Resultado' },
                { value: 'entradas', label: 'Entradas' },
                { value: 'saidas', label: 'Saídas' }
            ],
            onChange: function (serie) {
                self.state.serieTendencia = serie;
                self.renderizarGraficoTendencia();
            }
        }));
    };

    /**
     * Gráfico de tendência (AreaChart, uma série por vez — regra do design
     * system) com o valor do mês selecionado e a variação sobre o mês anterior
     * em destaque. Em Saídas, subir é ruim: o delta fica negativo.
     *
     * @returns
     */
    self.renderizarGraficoTendencia = function () {
        var dados = self.montarDadosTendencia();
        var serie = self.state.serieTendencia;
        var valores = dados[serie];
        var tons = { resultado: 'brand', entradas: 'positive', saidas: 'negative' };
        var atual = valores[valores.length - 1];
        var anterior = valores[valores.length - 2];
        var mesAnterior = new Date(self.state.periodo.ano, self.state.periodo.mes - 1, 1).getMonth();
        var $resumo = $('#chartTendenciaResumo').empty();
        var $grafico = $('#chartTendencia').empty();

        $resumo.append($('<span>', { class: 'ef-figure__value', text: (atual < 0 ? '−' : '') + self.formatCurrency(Math.abs(atual)) }));

        if (anterior !== 0) {
            var variacao = ((atual - anterior) / Math.abs(anterior)) * 100;
            var melhorou = serie === 'saidas' ? variacao <= 0 : variacao >= 0;

            $resumo.append(
                $('<span>', {
                    class: 'ef-figure__delta' + (melhorou ? '' : ' ef-figure__delta--negative'),
                    text: (variacao >= 0 ? '↑ ' : '↓ ') + Math.abs(variacao).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'
                }),
                $('<span>', { class: 'ef-figure__caption', text: 'vs ' + self.mesesNome[mesAnterior] })
            );
        } else {
            $resumo.append($('<span>', { class: 'ef-figure__caption', text: 'em ' + self.mesesNome[self.state.periodo.mes] }));
        }

        var semMovimento = valores.every(function (valor) { return valor === 0; });

        if (semMovimento) {
            $grafico.append($('<div>', { class: 'ef-chart-empty', role: 'img', 'aria-label': 'Sem lançamentos no período', text: 'Sem lançamentos no período' }));
        } else {
            $grafico.append(self.ds.AreaChart({
                data: valores,
                tone: tons[serie],
                height: 168,
                yTicks: 4,
                xLabels: dados.labels,
                formatY: function (valor) {
                    return self.formatarValorCompacto(valor, false);
                }
            }));
        }
    };

    self.atualizarGraficos = function () {
        if (self.ds) {
            self.renderizarGraficoCategorias();
            self.renderizarGraficoTendencia();
        }
    };

    /**
     * Monta a fileira de chips de filtro por categoria. Os chips são
     * combináveis (várias categorias ao mesmo tempo); "Todas" limpa a seleção.
     *
     * @returns
     */
    self.buildFilterRow = function () {
        var $row = $('#filterRow').empty();

        var $todas = $('<button>', { type: 'button', class: 'ef-tag filter-chip', text: 'Todas' })
            .attr({ 'data-categoria': '', 'aria-pressed': String(self.state.categoriasFiltradas.length === 0) });

        $row.append($todas);

        self.state.categorias.forEach(function (categoria) {
            var icone = self.resolveIconeCategoria(categoria.id);
            var $chip = $('<button>', { type: 'button', class: 'ef-tag filter-chip' })
                .attr({ 'data-categoria': categoria.id, 'aria-pressed': String(self.state.categoriasFiltradas.indexOf(categoria.id) !== -1) })
                .append(icones.criar(icone.icone, 'xs'), ' ' + categoria.nome);

            $row.append($chip);
        });
    };

    self.renderTransactions = function (transacoes) {
        var $list = $('#transactionsList').empty();

        if (transacoes.length === 0) {
            $list.append(self.criarEstadoVazio('li', 'Nenhuma movimentação nesse período.', 'receipt'));
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
        var $todas = $('<button>', { type: 'button', class: 'ef-tag acc-tab', text: 'Tudo' })
            .attr({ 'data-view': 'all', 'aria-pressed': String(self.state.currentView === 'all') });

        var $wrapper = $('<div>').append($todas);

        self.state.contas.forEach(function (conta) {
            var $tab = $('<button>', { type: 'button', class: 'ef-tag acc-tab', text: conta.nome })
                .attr({ 'data-view': conta.id, 'aria-pressed': String(self.state.currentView === conta.id) });

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
     * a cor escolhida vira o fundo, com chip decorativo e a fatura atual
     * (já calculada pela API) na base, junto do ciclo do cartão.
     *
     * @param {object} card cartão retornado pela API
     * @returns {jQuery} elemento pronto pra inserir na grade de cartões
     */
    self.buildCardItem = function (card) {
        var $editar = self.criarBotaoIcone('pencil', 'Editar', false).on('click', function () {
                self.abrirModalCartao(card);
            });

        var $delete = self.criarBotaoIcone('trash-2', 'Excluir', true).on('click', function () {
                self.excluirCartao(card);
            });

        var ciclo = 'Fecha dia ' + card.diaFechamento + ' · vence ' + self.formatarData(card.vencimentoFaturaAtual);

        return $('<div>', { class: 'card-item' }).css({ background: card.corFundo, color: card.corTexto }).append(
            $('<div>', { class: 'card-item-top' }).append(
                $('<div>', { class: 'card-chip' }),
                $('<span>', { class: 'card-item-actions' }).append($editar, $delete)
            ),
            $('<div>').append(
                $('<p>', { class: 'card-item-name', text: card.nome }),
                $('<p>', { class: 'card-item-total', text: 'Fatura atual' }),
                $('<p>', { class: 'card-item-amount', text: self.formatCurrency(card.faturaAtual) }),
                $('<p>', { class: 'card-item-cycle', text: ciclo })
            )
        );
    };

    self.renderCards = function () {
        var $grid = $('#cardsGrid').empty();

        if (self.state.cards.length === 0) {
            $grid.append(self.criarEstadoVazio('div', 'Nenhum cartão cadastrado ainda.', 'credit-card'));
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

    /**
     * Busca as categorias (fixas + do usuário) e atualiza tudo que depende delas: página
     * Categorias, chips de filtro, lista de recorrências e, se já carregadas, as movimentações e
     * gráficos.
     *
     * @returns
     */
    self.carregarCategorias = function () {
        $.ajax({
            url: self.apiBaseUrl + '/api/categorias',
            headers: self.cabecalhoAuth(),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (resposta) {
                self.state.categorias = resposta;
                self.renderCategorias();
                self.buildFilterRow();

                if (self.state.recorrencias.length > 0) {
                    self.renderRecorrencias();
                }

                if (self.state.transactions.length > 0) {
                    self.aplicarFiltros();
                }

                // Modal aberto antes das categorias chegarem ficou sem chips
                if (!$('#modalTransaction').prop('hidden')) {
                    self.applyTypeStyle(self.state.currentType);
                }

                if (!$('#modalRecorrencia').prop('hidden')) {
                    self.applyRecorrenciaTypeStyle(self.state.currentTypeRecorrencia);
                }

                if (!$('#modalAssinatura').prop('hidden')) {
                    self.montarChipsCategoria('#categoriaRowAssinatura', 'SAIDA', self.state.currentCategoriaAssinatura);
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
     * Busca os ícones e tons permitidos pra uma categoria (usados no modal de categoria).
     *
     * @returns
     */
    self.carregarOpcoesCategoria = function () {
        $.ajax({
            url: self.apiBaseUrl + '/api/categorias/opcoes',
            headers: self.cabecalhoAuth(),
            success: function (resposta) {
                self.state.opcoesCategoria = resposta;
            },
            error: function (jqXHR) {
                self.tratarErroRequisicao(jqXHR);
            }
        });
    };

    /**
     * Monta a linha de uma categoria: tile colorido + nome; fixas com cadeado, personalizadas com
     * editar/excluir.
     *
     * @param {object} categoria categoria da API
     * @returns {jQuery} elemento &lt;li&gt;
     */
    self.buildCategoriaItem = function (categoria) {
        var $fim;

        if (categoria.fixa) {
            $fim = $('<span>', { class: 'categoria-fixa', title: 'Categoria do sistema', 'aria-label': 'Categoria do sistema' })
                .append(icones.criar('lock', 'sm'));
        } else {
            var $editar = self.criarBotaoIcone('pencil', 'Editar', false)
                .on('click', function () {
                    self.abrirEdicaoCategoria(categoria);
                });

            var $excluir = self.criarBotaoIcone('trash-2', 'Excluir', true)
                .on('click', function () {
                    self.excluirCategoria(categoria);
                });

            $fim = $('<span>', { class: 'card-item-actions' }).append($editar, $excluir);
        }

        return $('<li>', { class: 'ef-list-row' }).append(
            $('<span>', { class: 'ef-list-row__leading' }).append(self.criarTileCategoria(categoria.id)),
            $('<span>', { class: 'ef-list-row__text' }).append(
                $('<span>', { class: 'ef-list-row__title', text: categoria.nome }),
                $('<span>', { class: 'ef-list-row__subtitle', text: categoria.fixa ? 'Do sistema' : 'Personalizada' })
            ),
            $fim
        );
    };

    self.renderCategorias = function () {
        var $entradas = $('#categoriasEntrada').empty();
        var $saidas = $('#categoriasSaida').empty();

        self.state.categorias.forEach(function (categoria) {
            (categoria.tipo === 'ENTRADA' ? $entradas : $saidas).append(self.buildCategoriaItem(categoria));
        });
    };

    /**
     * Monta a grade de ícones e os tons do modal, marcando os selecionados.
     *
     * @returns
     */
    // Nomes em pt-BR dos tons pra leitor de tela e tooltip do seletor de cor (--tone-<tom>-accent
    // no design-system/tokens/colors.css: brand=teal-500, positive=green-500, negative=red-500,
    // warning=amber-500, ai=violet-500, neutral=neutral-400).
    self.nomesTom = {
        brand: 'Verde-azulado',
        positive: 'Verde',
        negative: 'Vermelho',
        warning: 'Âmbar',
        ai: 'Roxo',
        neutral: 'Cinza'
    };

    self.montarSeletoresCategoria = function () {
        var $icones = $('#iconePickerCategoria').empty();
        var $tons = $('#tomPickerCategoria').empty();

        self.state.opcoesCategoria.icones.forEach(function (nomeIcone) {
            $icones.append($('<button>', { type: 'button', class: 'icone-opcao', 'aria-label': nomeIcone, title: nomeIcone })
                .attr({ 'data-icone': nomeIcone, 'aria-pressed': String(nomeIcone === self.state.categoriaIconeSelecionado) })
                .append(icones.criar(nomeIcone, 'sm')));
        });

        self.state.opcoesCategoria.tons.forEach(function (tom) {
            var nomeTom = self.nomesTom[tom] || tom;

            $tons.append($('<button>', { type: 'button', class: 'color-swatch' + (tom === self.state.categoriaTomSelecionado ? ' selected' : ''), 'aria-label': nomeTom, title: nomeTom })
                .attr({ 'data-tom': tom, 'aria-pressed': String(tom === self.state.categoriaTomSelecionado) })
                .css('background', 'var(--tone-' + tom + '-accent)'));
        });

        self.atualizarPreviaCategoria();
    };

    /**
     * Atualiza a prévia do tile (ícone + tom) e do nome enquanto o usuário edita o modal.
     *
     * @returns
     */
    self.atualizarPreviaCategoria = function () {
        var tom = self.state.categoriaTomSelecionado;

        $('#previaCategoriaTile')
            .attr('class', 'ef-icon-tile' + (tom && tom !== 'neutral' ? ' ef-icon-tile--' + tom : ''))
            .empty()
            .append(icones.criar(self.state.categoriaIconeSelecionado || 'ellipsis', 'sm'));
        $('#previaCategoriaNome').text($('#inputCategoriaNome').val().trim() || 'Nova categoria');
    };

    self.abrirModalNovaCategoria = function () {
        self.state.editingCategoriaId = null;
        self.state.categoriaIconeSelecionado = self.state.opcoesCategoria.icones[5] || 'ellipsis';
        self.state.categoriaTomSelecionado = 'brand';

        $('#modalCategoriaTitle').text('Nova categoria');
        $('#inputCategoriaNome').val('');
        $('#inputCategoriaTipo').val('SAIDA').prop('disabled', false);
        $('#dicaCategoriaTipo').prop('hidden', true);

        self.montarSeletoresCategoria();
        self.openModal('#modalCategoria');
    };

    self.abrirEdicaoCategoria = function (categoria) {
        self.state.editingCategoriaId = categoria.id;
        self.state.categoriaIconeSelecionado = categoria.icone;
        self.state.categoriaTomSelecionado = categoria.tom;

        $('#modalCategoriaTitle').text('Editar categoria');
        $('#inputCategoriaNome').val(categoria.nome);
        $('#inputCategoriaTipo').val(categoria.tipo).prop('disabled', true);
        $('#dicaCategoriaTipo').prop('hidden', false);

        self.montarSeletoresCategoria();
        self.openModal('#modalCategoria');
    };

    /**
     * Cria ou atualiza a categoria do modal. Depois recarrega categorias e movimentações (o nome
     * da categoria aparece na lista do dashboard).
     *
     * @returns
     */
    self.salvarCategoria = function () {
        feedback.limparErros('#modalCategoria');

        var nome = $('#inputCategoriaNome').val().trim();

        if (!nome) {
            feedback.marcarErro('#inputCategoriaNome', 'Informe o nome da categoria');
            feedback.focarPrimeiroErro('#modalCategoria');
            return;
        }

        var editando = self.state.editingCategoriaId !== null;
        var corpo = { nome: nome, icone: self.state.categoriaIconeSelecionado, tom: self.state.categoriaTomSelecionado };

        if (!editando) {
            corpo.tipo = $('#inputCategoriaTipo').val();
        }

        $.ajax({
            url: self.apiBaseUrl + '/api/categorias' + (editando ? '/' + self.state.editingCategoriaId : ''),
            method: editando ? 'PUT' : 'POST',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify(corpo),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                self.closeModal('#modalCategoria');
                self.carregarCategorias();
                self.carregarTransacoes();
                feedback.exibirSucesso(editando ? 'Categoria atualizada' : 'Categoria criada');
            },
            error: function (jqXHR) {
                var nomeRepetido = feedback.mensagemDaApi(jqXHR, 409);

                if (nomeRepetido) {
                    feedback.marcarErro('#inputCategoriaNome', nomeRepetido);
                    feedback.focarPrimeiroErro('#modalCategoria');
                } else {
                    self.tratarErroRequisicao(jqXHR);
                }
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
    };

    /**
     * Pede confirmação e exclui uma categoria personalizada. O aviso diz quantas movimentações e
     * recorrências vão pra "Outro"/"Renda" (contadas nos dados já carregados).
     *
     * @param {object} categoria categoria da API
     * @returns
     */
    self.excluirCategoria = function (categoria) {
        var destino = categoria.tipo === 'ENTRADA' ? 'Renda' : 'Outro';
        var emUso = self.state.transactions.filter(function (tx) { return tx.categoriaId === categoria.id; }).length
            + self.state.recorrencias.filter(function (recorrencia) { return recorrencia.categoriaId === categoria.id; }).length;
        var aviso = emUso > 0
            ? emUso + (emUso === 1 ? ' movimentação/recorrência vai' : ' movimentações/recorrências vão') + ' para "' + destino + '".'
            : 'Nenhuma movimentação usa essa categoria.';

        feedback.confirmar({
            titulo: 'Excluir categoria',
            descricao: '"' + categoria.nome + '" será excluída. ' + aviso,
            rotuloConfirmar: 'Excluir categoria',
            aoConfirmar: function () {
                self.executarExclusaoCategoria(categoria.id);
            }
        });
    };

    self.executarExclusaoCategoria = function (id) {
        $.ajax({
            url: self.apiBaseUrl + '/api/categorias/' + id,
            method: 'DELETE',
            headers: self.cabecalhoAuth(),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (resposta) {
                self.state.categoriasFiltradas = self.state.categoriasFiltradas.filter(function (filtrada) { return filtrada !== id; });
                self.carregarCategorias();
                self.carregarTransacoes();
                self.carregarRecorrencias();
                self.carregarAssinaturas();
                feedback.exibirSucesso('Categoria excluída', resposta.movidas > 0 ? resposta.movidas + ' lançamento(s) movido(s).' : '');
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
     * Monta a linha de uma conta (ListRow): IconTile na cor escolhida pelo
     * usuário (paleta --swatch-*, aplicada em linha como nos cartões), nome e
     * as ações de editar/excluir.
     *
     * @param {object} conta conta retornada pela API
     * @returns {jQuery} elemento &lt;li&gt; pronto pra inserir na lista
     */
    self.buildContaItem = function (conta) {
        var $icon = $('<span>', { class: 'ef-icon-tile', 'aria-hidden': 'true' })
            .css({ background: conta.corFundo, color: conta.corTexto })
            .append(icones.criar('wallet', 'sm'));

        var $editar = self.criarBotaoIcone('pencil', 'Editar', false)
            .on('click', function () {
                self.abrirEdicaoConta(conta);
            });

        var $excluir = self.criarBotaoIcone('trash-2', 'Excluir', true)
            .on('click', function () {
                self.abrirModalExclusaoConta(conta.id);
            });

        return $('<li>', { class: 'ef-list-row' }).append(
            $('<span>', { class: 'ef-list-row__leading' }).append($icon),
            $('<span>', { class: 'ef-list-row__text' }).append(
                $('<span>', { class: 'ef-list-row__title', text: conta.nome })
            ),
            $('<span>', { class: 'card-item-actions' }).append($editar, $excluir)
        );
    };

    self.renderContas = function () {
        var $lista = $('#contasLista').empty();

        if (self.state.contas.length === 0) {
            $lista.append(self.criarEstadoVazio('li', 'Nenhuma conta cadastrada ainda.', 'wallet'));
        } else {
            self.state.contas.forEach(function (conta) {
                $lista.append(self.buildContaItem(conta));
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
        $('#modalConta .ef-dialog__title').text('Nova conta');
        self.buildContaColorPicker();
        self.openModal('#modalConta');
    };

    self.abrirEdicaoConta = function (conta) {
        var corAtual = self.cardColors.filter(function (c) { return c.color === conta.corTexto; })[0];

        self.state.editingContaId = conta.id;
        $('#inputContaName').val(conta.nome);
        self.state.selectedContaColor = corAtual || { bg: conta.corFundo, color: conta.corTexto };
        $('#modalConta .ef-dialog__title').text('Editar conta');
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
                feedback.exibirSucesso('Conta criada', nome);
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
                feedback.exibirSucesso('Conta atualizada', nome);
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
            feedback.marcarErro('#inputSenhaExclusaoConta', 'Informe sua senha');
            feedback.focarPrimeiroErro('#modalDeleteConta');
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
                self.carregarRecorrencias();
                self.carregarAssinaturas();
                feedback.exibirSucesso('Conta excluída', 'As movimentações, recorrências e assinaturas dela também foram apagadas.');
            },
            error: function (jqXHR) {
                // Senha errada volta 401 com mensagem: o erro vai no próprio campo
                var senhaIncorreta = feedback.mensagemDaApi(jqXHR, 401);

                $('#inputSenhaExclusaoConta').val('');

                if (senhaIncorreta) {
                    feedback.marcarErro('#inputSenhaExclusaoConta', senhaIncorreta);
                    feedback.focarPrimeiroErro('#modalDeleteConta');
                } else {
                    self.tratarErroRequisicao(jqXHR);
                }
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
        var $icon = self.criarTileCategoria(recorrencia.categoriaId);

        var decorridas = recorrencia.totalParcelas - recorrencia.parcelasRestantes;
        var metaCartao = recorrencia.nomeCartao ? ' · ' + recorrencia.nomeCartao : '';
        var metaText = decorridas + ' de ' + recorrencia.totalParcelas + ' · ' + recorrencia.nomeConta + metaCartao;

        var amountClass = recorrencia.tipo === 'ENTRADA' ? 'tx-amount--in' : 'tx-amount--out';
        var prefix = recorrencia.tipo === 'ENTRADA' ? '+' : '−';

        var $editar = self.criarBotaoIcone('pencil', 'Editar recorrência', false)
            .on('click', function () {
                self.abrirEdicaoRecorrencia(recorrencia);
            });

        var $excluir = self.criarBotaoIcone('trash-2', 'Excluir recorrência', true)
            .on('click', function () {
                self.excluirRecorrencia(recorrencia);
            });

        return $('<li>', { class: 'ef-list-row' }).append(
            $('<span>', { class: 'ef-list-row__leading' }).append($icon),
            $('<span>', { class: 'ef-list-row__text' }).append(
                $('<span>', { class: 'ef-list-row__title', text: recorrencia.descricao }),
                $('<span>', { class: 'ef-list-row__subtitle', text: metaText })
            ),
            $('<span>', { class: 'ef-list-row__end' }).append(
                $('<span>', { class: 'ef-list-row__value ' + amountClass, text: prefix + self.formatCurrency(recorrencia.valor) })
            ),
            $('<span>', { class: 'card-item-actions' }).append($editar, $excluir)
        );
    };

    self.renderRecorrencias = function () {
        var $lista = $('#recorrenciasLista').empty();

        if (self.state.recorrencias.length === 0) {
            $lista.append(self.criarEstadoVazio('li', 'Nenhuma recorrência cadastrada ainda.', 'repeat'));
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

        var tipo = isIn ? 'ENTRADA' : 'SAIDA';

        self.state.currentCategoriaRecorrencia = self.categoriaPadraoDoTipo(tipo);
        feedback.limparErro('#categoriaRowRecorrencia');
        self.montarChipsCategoria('#categoriaRowRecorrencia', tipo, self.state.currentCategoriaRecorrencia);
        self.atualizarCampoDataRecorrencia();
    };

    /**
     * Com cartão (só na saída), a data informada é a da compra e as parcelas seguem as faturas;
     * sem cartão, é a data da primeira parcela.
     *
     * @returns
     */
    self.atualizarCampoDataRecorrencia = function () {
        var comCartao = self.state.currentTypeRecorrencia === 'out' && !!$('#inputRecorrenciaCard').val();

        $('#rotuloRecorrenciaDataInicio').text(comCartao ? 'Data da compra' : 'Primeira parcela');
        $('#dicaRecorrenciaCartao').prop('hidden', !comCartao);
    };

    self.resetRecorrenciaModal = function () {
        self.state.editingRecorrenciaId = null;
        $('#modalRecorrenciaTitle').text('Nova recorrência');
        self.selecionarAlcance('#campoAlcanceRecorrencia', 'FUTURAS');
        $('#campoAlcanceRecorrencia').prop('hidden', true);
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

    /**
     * Abre o modal de recorrência preenchido com os dados de uma recorrência existente, com a
     * escolha de aplicar a mudança só nas próximas parcelas ou em todas.
     *
     * @param {object} recorrencia recorrência retornada pela API
     * @returns
     */
    self.abrirEdicaoRecorrencia = function (recorrencia) {
        self.openModal('#modalRecorrencia');
        self.resetRecorrenciaModal();

        self.state.editingRecorrenciaId = recorrencia.id;
        $('#modalRecorrenciaTitle').text('Editar recorrência');
        $('#campoAlcanceRecorrencia').prop('hidden', false);

        self.state.currentTypeRecorrencia = recorrencia.tipo === 'ENTRADA' ? 'in' : 'out';
        $('#inputRecorrenciaCard').val(recorrencia.cartaoId ? String(recorrencia.cartaoId) : '');
        self.applyRecorrenciaTypeStyle(self.state.currentTypeRecorrencia);

        self.state.currentCategoriaRecorrencia = recorrencia.categoriaId;
        self.montarChipsCategoria('#categoriaRowRecorrencia', recorrencia.tipo, recorrencia.categoriaId);

        $('#inputRecorrenciaDescription').val(recorrencia.descricao);
        $('#inputRecorrenciaValue').val(self.valorParaCampo(recorrencia.valor));
        $('#inputRecorrenciaAccount').val(String(recorrencia.contaId));
        $('#inputRecorrenciaParcelas').val(recorrencia.totalParcelas);
        $('#inputRecorrenciaDataInicio').val(recorrencia.dataInicio);
    };

    /**
     * Marca uma das opções "só as próximas" / "todas" de um campo de alcance.
     *
     * @param {string} seletorCampo campo de alcance (#campoAlcanceRecorrencia ou #campoAlcanceAssinatura)
     * @param {string} alcance FUTURAS ou TODAS
     * @returns
     */
    self.selecionarAlcance = function (seletorCampo, alcance) {
        $(seletorCampo).find('.alcance-opcao').each(function () {
            $(this).attr('aria-pressed', String($(this).attr('data-alcance') === alcance));
        });
    };

    self.alcanceSelecionado = function (seletorCampo) {
        return $(seletorCampo).find('.alcance-opcao[aria-pressed="true"]').attr('data-alcance') || 'FUTURAS';
    };

    /**
     * Valida o modal de recorrência, marcando cada campo com problema (erro
     * abaixo do campo, padrão Field) e focando o primeiro.
     *
     * @param {string} description descrição
     * @param {number} value valor por parcela
     * @param {number} contaId id da conta escolhida
     * @param {number} totalParcelas quantidade de parcelas
     * @returns {boolean} true se pode enviar
     */
    self.validateRecorrencia = function (description, value, contaId, totalParcelas) {
        var valido = true;

        if (!description) {
            feedback.marcarErro('#inputRecorrenciaDescription', 'Informe uma descrição');
            valido = false;
        }

        if (isNaN(value) || value <= 0) {
            feedback.marcarErro('#inputRecorrenciaValue', 'Informe um valor maior que zero');
            valido = false;
        }

        if (!contaId) {
            feedback.marcarErro('#inputRecorrenciaAccount', 'Crie uma conta antes de lançar');
            valido = false;
        }

        if (!self.state.currentCategoriaRecorrencia) {
            feedback.marcarErro('#categoriaRowRecorrencia', 'Escolha uma categoria');
            valido = false;
        }

        if (isNaN(totalParcelas) || totalParcelas < 1) {
            feedback.marcarErro('#inputRecorrenciaParcelas', 'Informe ao menos 1 parcela');
            valido = false;
        }

        if (!valido) {
            feedback.focarPrimeiroErro('#modalRecorrencia');
        }

        return valido;
    };

    /**
     * Cria (ou, no modo de edição, atualiza) uma recorrência via API — o backend gera ou refaz as
     * parcelas — e atualiza recorrências, cartões (a fatura atual pode mudar) e transações.
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
            categoriaId: self.state.currentCategoriaRecorrencia,
            contaId: contaId,
            cartaoId: cardId,
            totalParcelas: totalParcelas
        };

        if (dataInicio) {
            corpo.dataInicio = dataInicio;
        }

        var editando = self.state.editingRecorrenciaId !== null;

        if (editando) {
            corpo.alcance = self.alcanceSelecionado('#campoAlcanceRecorrencia');
        }

        $.ajax({
            url: self.apiBaseUrl + '/api/recorrencias' + (editando ? '/' + self.state.editingRecorrenciaId : ''),
            method: editando ? 'PUT' : 'POST',
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

                if (editando) {
                    feedback.exibirSucesso('Recorrência atualizada', description);
                } else {
                    feedback.exibirSucesso('Recorrência criada', totalParcelas + (totalParcelas === 1 ? ' parcela de ' : ' parcelas de ') + self.formatCurrency(value) + '.');
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
     * Pede confirmação (Dialog) e exclui uma recorrência com todas as parcelas dela.
     *
     * @param {object} recorrencia recorrência retornada pela API
     * @returns
     */
    self.excluirRecorrencia = function (recorrencia) {
        feedback.confirmar({
            titulo: 'Excluir recorrência',
            descricao: '"' + recorrencia.descricao + '" e todas as parcelas dela serão apagadas permanentemente, inclusive as que já passaram. O saldo será recalculado.',
            rotuloConfirmar: 'Excluir recorrência',
            aoConfirmar: function () {
                self.executarExclusaoRecorrencia(recorrencia.id);
            }
        });
    };

    /**
     * Exclui uma recorrência via API e atualiza recorrências, cartões (a fatura atual pode
     * mudar) e transações.
     *
     * @param {number} id id da recorrência
     * @returns
     */
    self.executarExclusaoRecorrencia = function (id) {
        $.ajax({
            url: self.apiBaseUrl + '/api/recorrencias/' + id,
            method: 'DELETE',
            headers: self.cabecalhoAuth(),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                self.carregarRecorrencias();
                self.carregarCartoes();
                self.carregarTransacoes();
                feedback.exibirSucesso('Recorrência excluída');
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
     * Busca as assinaturas do usuário e atualiza a lista.
     *
     * @returns
     */
    self.carregarAssinaturas = function () {
        $.ajax({
            url: self.apiBaseUrl + '/api/assinaturas',
            headers: self.cabecalhoAuth(),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (resposta) {
                self.state.assinaturas = resposta;
                self.renderAssinaturas();
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
     * Monta a linha de uma assinatura: ativa tem editar, cancelar e excluir; cancelada só excluir.
     *
     * @param {object} assinatura assinatura retornada pela API
     * @returns {jQuery} elemento &lt;li&gt; pronto pra inserir na lista
     */
    self.buildAssinaturaItem = function (assinatura) {
        var cancelada = !!assinatura.canceladaEm;
        var anual = assinatura.periodicidade === 'ANUAL';

        var meta = cancelada
            ? [(anual ? 'Anual' : 'Mensal'), 'cancelada em ' + self.formatarData(assinatura.canceladaEm)]
            : [anual ? 'Anual' : 'Mensal', 'próxima ' + self.formatarData(assinatura.proximaCobranca)];

        meta.push(assinatura.nomeConta);

        if (assinatura.nomeCartao) {
            meta.push(assinatura.nomeCartao);
        }

        var $acoes = $('<span>', { class: 'card-item-actions' });

        if (!cancelada) {
            $acoes.append(
                self.criarBotaoIcone('pencil', 'Editar assinatura', false).on('click', function () {
                    self.abrirModalAssinatura(assinatura);
                }),
                self.criarBotaoIcone('ban', 'Cancelar assinatura', true).on('click', function () {
                    self.cancelarAssinatura(assinatura);
                })
            );
        }

        $acoes.append(self.criarBotaoIcone('trash-2', 'Excluir assinatura', true).on('click', function () {
            self.excluirAssinatura(assinatura);
        }));

        return $('<li>', { class: 'ef-list-row' + (cancelada ? ' assinatura--cancelada' : '') }).append(
            $('<span>', { class: 'ef-list-row__leading' }).append(self.criarTileCategoria(assinatura.categoriaId)),
            $('<span>', { class: 'ef-list-row__text' }).append(
                $('<span>', { class: 'ef-list-row__title', text: assinatura.descricao }),
                $('<span>', { class: 'ef-list-row__subtitle', text: meta.join(' · ') })
            ),
            $('<span>', { class: 'ef-list-row__end' }).append(
                $('<span>', { class: 'ef-list-row__value tx-amount--out', text: '−' + self.formatCurrency(assinatura.valor) })
            ),
            $acoes
        );
    };

    /**
     * Mostra a lista de assinaturas e, no subtítulo, quanto as ativas custam por mês (anual
     * entra dividida por 12).
     *
     * @returns
     */
    self.renderAssinaturas = function () {
        var $lista = $('#assinaturasLista').empty();
        var ativas = self.state.assinaturas.filter(function (assinatura) { return !assinatura.canceladaEm; });

        if (self.state.assinaturas.length === 0) {
            $lista.append(self.criarEstadoVazio('li', 'Nenhuma assinatura cadastrada ainda.', 'calendar-clock'));
        } else {
            self.state.assinaturas.forEach(function (assinatura) {
                $lista.append(self.buildAssinaturaItem(assinatura));
            });
        }

        var porMes = ativas.reduce(function (total, assinatura) {
            return total + (assinatura.periodicidade === 'ANUAL' ? assinatura.valor / 12 : assinatura.valor);
        }, 0);

        $('#assinaturasResumo').text(ativas.length === 0
            ? 'Cobranças mensais ou anuais, até você cancelar'
            : self.formatCurrency(porMes) + ' por mês em ' + ativas.length + (ativas.length === 1 ? ' assinatura ativa' : ' assinaturas ativas'));
    };

    /**
     * Abre o modal de assinatura: vazio pra criar, ou preenchido pra editar (com a escolha de
     * aplicar a mudança só nas próximas cobranças ou em todas).
     *
     * @param {object|null} assinatura assinatura retornada pela API, quando é edição
     * @returns
     */
    self.abrirModalAssinatura = function (assinatura) {
        var $conta = $('#inputAssinaturaAccount').empty();
        var $cartao = $('#inputAssinaturaCard').empty().append($('<option>', { value: '', text: 'Sem cartão (débito / dinheiro)' }));

        self.state.contas.forEach(function (conta) {
            $conta.append($('<option>', { value: conta.id, text: conta.nome }));
        });

        self.state.cards.forEach(function (card) {
            $cartao.append($('<option>', { value: card.id, text: card.nome }));
        });

        var contaPadrao = self.state.currentView !== 'all' ? self.state.currentView : (self.state.contas[0] ? self.state.contas[0].id : '');
        var periodicidade = assinatura ? assinatura.periodicidade : 'MENSAL';

        self.state.editingAssinaturaId = assinatura ? assinatura.id : null;
        self.state.currentCategoriaAssinatura = assinatura ? assinatura.categoriaId : null;

        $('#modalAssinaturaTitle').text(assinatura ? 'Editar assinatura' : 'Nova assinatura');
        $('#inputAssinaturaDescription').val(assinatura ? assinatura.descricao : '');
        $('#inputAssinaturaValue').val(assinatura ? self.valorParaCampo(assinatura.valor) : '');
        $conta.val(String(assinatura ? assinatura.contaId : contaPadrao));
        $cartao.val(assinatura && assinatura.cartaoId ? String(assinatura.cartaoId) : '');
        $('#inputAssinaturaDataInicio').val(assinatura ? assinatura.dataInicio : '');
        $('#periodicidadeAssinatura .periodicidade-opcao').each(function () {
            $(this).attr('aria-pressed', String($(this).attr('data-periodicidade') === periodicidade));
        });

        self.montarChipsCategoria('#categoriaRowAssinatura', 'SAIDA', self.state.currentCategoriaAssinatura);
        self.selecionarAlcance('#campoAlcanceAssinatura', 'FUTURAS');
        $('#campoAlcanceAssinatura').prop('hidden', !assinatura);

        self.openModal('#modalAssinatura');
    };

    /**
     * Valida o modal de assinatura e cria ou atualiza a assinatura via API. As cobranças viram
     * movimentações, por isso recarrega transações e cartões junto.
     *
     * @returns
     */
    self.salvarAssinatura = function () {
        feedback.limparErros('#modalAssinatura');

        var descricao = $.trim($('#inputAssinaturaDescription').val());
        var valor = self.lerValor($('#inputAssinaturaValue').val());
        var contaId = parseInt($('#inputAssinaturaAccount').val());
        var valido = true;

        if (!descricao) {
            feedback.marcarErro('#inputAssinaturaDescription', 'Informe uma descrição');
            valido = false;
        }

        if (isNaN(valor) || valor <= 0) {
            feedback.marcarErro('#inputAssinaturaValue', 'Informe um valor maior que zero');
            valido = false;
        }

        if (!contaId) {
            feedback.marcarErro('#inputAssinaturaAccount', 'Crie uma conta antes de lançar');
            valido = false;
        }

        if (!self.state.currentCategoriaAssinatura) {
            feedback.marcarErro('#categoriaRowAssinatura', 'Escolha uma categoria');
            valido = false;
        }

        if (!valido) {
            feedback.focarPrimeiroErro('#modalAssinatura');
            return;
        }

        var editando = self.state.editingAssinaturaId !== null;
        var corpo = {
            descricao: descricao,
            valor: valor,
            periodicidade: $('#periodicidadeAssinatura .periodicidade-opcao[aria-pressed="true"]').attr('data-periodicidade'),
            categoriaId: self.state.currentCategoriaAssinatura,
            contaId: contaId,
            cartaoId: parseInt($('#inputAssinaturaCard').val()) || null
        };

        if ($('#inputAssinaturaDataInicio').val()) {
            corpo.dataInicio = $('#inputAssinaturaDataInicio').val();
        }

        if (editando) {
            corpo.alcance = self.alcanceSelecionado('#campoAlcanceAssinatura');
        }

        $.ajax({
            url: self.apiBaseUrl + '/api/assinaturas' + (editando ? '/' + self.state.editingAssinaturaId : ''),
            method: editando ? 'PUT' : 'POST',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify(corpo),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                self.closeModal('#modalAssinatura');
                self.carregarAssinaturas();
                self.carregarTransacoes();
                self.carregarCartoes();
                feedback.exibirSucesso(editando ? 'Assinatura atualizada' : 'Assinatura criada', descricao);
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
     * Pede confirmação e cancela uma assinatura: as cobranças até hoje ficam, as próximas saem.
     *
     * @param {object} assinatura assinatura retornada pela API
     * @returns
     */
    self.cancelarAssinatura = function (assinatura) {
        feedback.confirmar({
            titulo: 'Cancelar assinatura',
            descricao: '"' + assinatura.descricao + '" deixa de ser cobrada. As cobranças até hoje continuam no histórico; as próximas são apagadas.',
            rotuloConfirmar: 'Cancelar assinatura',
            aoConfirmar: function () {
                self.alterarAssinatura('POST', '/' + assinatura.id + '/cancelar', 'Assinatura cancelada', assinatura.descricao);
            }
        });
    };

    /**
     * Pede confirmação e exclui uma assinatura com todas as cobranças, inclusive as passadas.
     *
     * @param {object} assinatura assinatura retornada pela API
     * @returns
     */
    self.excluirAssinatura = function (assinatura) {
        feedback.confirmar({
            titulo: 'Excluir assinatura',
            descricao: '"' + assinatura.descricao + '" e todas as cobranças dela, inclusive as passadas, serão apagadas permanentemente.',
            rotuloConfirmar: 'Excluir assinatura',
            aoConfirmar: function () {
                self.alterarAssinatura('DELETE', '/' + assinatura.id, 'Assinatura excluída', assinatura.descricao);
            }
        });
    };

    /**
     * Cancela ou exclui uma assinatura via API e recarrega o que depende das cobranças.
     *
     * @param {string} metodo POST (cancelar) ou DELETE (excluir)
     * @param {string} caminho trecho da rota depois de /api/assinaturas
     * @param {string} titulo título do aviso de sucesso
     * @param {string} descricao texto do aviso de sucesso
     * @returns
     */
    self.alterarAssinatura = function (metodo, caminho, titulo, descricao) {
        $.ajax({
            url: self.apiBaseUrl + '/api/assinaturas' + caminho,
            method: metodo,
            headers: self.cabecalhoAuth(),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                self.carregarAssinaturas();
                self.carregarTransacoes();
                self.carregarCartoes();
                feedback.exibirSucesso(titulo, descricao);
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
     * Abre o modal de cartão: vazio pra criar, ou preenchido pra editar o cartão informado.
     *
     * @param {object} [card] cartão retornado pela API, quando é edição
     * @returns
     */
    self.abrirModalCartao = function (card) {
        var corAtual = card ? self.cardColors.filter(function (c) { return c.color === card.corTexto; })[0] : null;

        self.state.editingCardId = card ? card.id : null;
        $('#inputCardName').val(card ? card.nome : '');
        $('#inputCardClosingDay').val(card ? card.diaFechamento : '');
        $('#inputCardDueDay').val(card ? card.diaVencimento : '');
        self.state.selectedColor = card ? (corAtual || { bg: card.corFundo, color: card.corTexto }) : self.cardColors[0];
        $('#modalCardTitle').text(card ? 'Editar cartão' : 'Novo cartão');
        self.buildColorPicker();
        self.openModal('#modalCard');
    };

    /**
     * Lê um dia do mês (1 a 31) de um campo do modal de cartão, marcando erro se for inválido.
     *
     * @param {string} seletor campo do dia
     * @param {string} mensagem erro exibido quando o dia é inválido
     * @returns {number|null} o dia, ou null se inválido
     */
    self.lerDiaDoMes = function (seletor, mensagem) {
        var texto = $.trim($(seletor).val());
        var dia = /^\d{1,2}$/.test(texto) ? parseInt(texto, 10) : NaN;

        if (isNaN(dia) || dia < 1 || dia > 31) {
            feedback.marcarErro(seletor, mensagem);
            return null;
        }

        return dia;
    };

    /**
     * Valida o modal de cartão e cria ou atualiza o cartão via API. Mudar o fechamento ou o
     * vencimento move as compras futuras para a nova fatura (a API cuida disso), por isso
     * recarrega cartões e transações juntos.
     *
     * @returns
     */
    self.salvarCartao = function () {
        feedback.limparErros('#modalCard');

        var nome = $.trim($('#inputCardName').val());
        var diaFechamento = self.lerDiaDoMes('#inputCardClosingDay', 'Informe um dia de 1 a 31');
        var diaVencimento = self.lerDiaDoMes('#inputCardDueDay', 'Informe um dia de 1 a 31');

        if (!nome) {
            feedback.marcarErro('#inputCardName', 'Informe o nome do cartão');
        }

        if (!nome || diaFechamento === null || diaVencimento === null) {
            feedback.focarPrimeiroErro('#modalCard');
            return;
        }

        var editando = self.state.editingCardId !== null;
        var colorObj = self.state.selectedColor;

        $.ajax({
            url: self.apiBaseUrl + '/api/cartoes' + (editando ? '/' + self.state.editingCardId : ''),
            method: editando ? 'PUT' : 'POST',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify({
                nome: nome,
                corFundo: colorObj.bg,
                corTexto: colorObj.color,
                diaFechamento: diaFechamento,
                diaVencimento: diaVencimento
            }),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                self.closeModal('#modalCard');
                self.carregarCartoes();

                if (editando) {
                    self.carregarTransacoes();
                }

                feedback.exibirSucesso(editando ? 'Cartão atualizado' : 'Cartão salvo', nome);
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
     * Pede confirmação (Dialog) e exclui um cartão.
     *
     * @param {object} card cartão retornado pela API
     * @returns
     */
    self.excluirCartao = function (card) {
        feedback.confirmar({
            titulo: 'Excluir cartão',
            descricao: 'O cartão "' + card.nome + '" será excluído. As movimentações dele continuam, sem cartão.',
            rotuloConfirmar: 'Excluir cartão',
            aoConfirmar: function () {
                self.executarExclusaoCartao(card.id);
            }
        });
    };

    /**
     * Exclui um cartão via API. As transações vinculadas ficam sem cartão (a
     * API cuida disso), por isso recarrega cartões e transações juntos.
     *
     * @param {number} id id do cartão
     * @returns
     */
    self.executarExclusaoCartao = function (id) {
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
                self.carregarAssinaturas();
                feedback.exibirSucesso('Cartão excluído');
            },
            error: function (jqXHR) {
                self.tratarErroRequisicao(jqXHR);
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
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

    /**
     * Monta os chips de categoria de um modal com as categorias do tipo informado.
     *
     * @param {string} seletorFileira fileira de chips (#categoriaRow ou #categoriaRowRecorrencia)
     * @param {string} tipo ENTRADA ou SAIDA
     * @param {number|null} categoriaSelecionadaId categoria que já vem marcada
     * @returns
     */
    self.montarChipsCategoria = function (seletorFileira, tipo, categoriaSelecionadaId) {
        var $fileira = $(seletorFileira).empty();

        self.state.categorias
            .filter(function (categoria) { return categoria.tipo === tipo; })
            .forEach(function (categoria) {
                var icone = self.resolveIconeCategoria(categoria.id);

                $fileira.append($('<button>', { type: 'button', class: 'ef-tag categoria-chip' })
                    .attr({ 'data-categoria': categoria.id, 'aria-pressed': String(categoria.id === categoriaSelecionadaId) })
                    .append(icones.criar(icone.icone, 'xs'), ' ' + categoria.nome));
            });
    };

    /**
     * Categoria que já vem marcada ao abrir o modal: na entrada, a fixa "Renda"; na saída, nenhuma
     * (a escolha é obrigatória).
     *
     * @param {string} tipo ENTRADA ou SAIDA
     * @returns {number|null} id da categoria, ou null
     */
    self.categoriaPadraoDoTipo = function (tipo) {
        if (tipo !== 'ENTRADA') {
            return null;
        }

        var renda = self.state.categorias.find(function (categoria) { return categoria.fixa && categoria.tipo === 'ENTRADA'; });
        return renda ? renda.id : null;
    };

    self.applyTypeStyle = function (type) {
        var isIn = type === 'in';

        $('#btnTypeIn').toggleClass('active-in', isIn).removeClass('active-out');
        $('#btnTypeOut').toggleClass('active-out', !isIn).removeClass('active-in');
        $('#cardRow').toggleClass('visible', !isIn);

        var tipo = isIn ? 'ENTRADA' : 'SAIDA';

        self.state.currentCategoria = self.categoriaPadraoDoTipo(tipo);
        feedback.limparErro('#categoriaRow');
        self.montarChipsCategoria('#categoriaRow', tipo, self.state.currentCategoria);
    };

    /**
     * Valida o modal de movimentação, marcando cada campo com problema (erro
     * abaixo do campo, padrão Field) e focando o primeiro.
     *
     * @param {string} description descrição
     * @param {number} value valor
     * @param {number} contaId id da conta escolhida
     * @returns {boolean} true se pode enviar
     */
    self.validateTransaction = function (description, value, contaId) {
        var valido = true;

        if (!description) {
            feedback.marcarErro('#inputDescription', 'Informe uma descrição');
            valido = false;
        }

        if (isNaN(value) || value <= 0) {
            feedback.marcarErro('#inputValue', 'Informe um valor maior que zero');
            valido = false;
        }

        if (!contaId) {
            feedback.marcarErro('#inputAccount', 'Crie uma conta antes de lançar');
            valido = false;
        }

        if (!self.state.currentCategoria) {
            feedback.marcarErro('#categoriaRow', 'Escolha uma categoria');
            valido = false;
        }

        if (!valido) {
            feedback.focarPrimeiroErro('#modalTransaction');
        }

        return valido;
    };

    /**
     * Cria uma nova transação via API e atualiza transações e cartões (o cartão
     * vinculado pode ter a fatura atual alterada).
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
                categoriaId: self.state.currentCategoria,
                cartaoId: cardId
            }),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                self.closeModal('#modalTransaction');
                self.carregarTransacoes();
                self.carregarCartoes();
                feedback.exibirSucesso('Movimentação adicionada', description + ' · ' + self.formatCurrency(value));
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
     * Pede confirmação (Dialog) e exclui uma movimentação. Parcela de
     * recorrência avisa que só aquela parcela sai.
     *
     * @param {object} tx transação retornada pela API
     * @returns
     */
    self.excluirTransacao = function (tx) {
        var parcela = tx.numeroParcela ? ' Só a parcela ' + tx.numeroParcela + '/' + tx.totalParcelas + ' sai; as outras continuam.'
            : tx.assinaturaId ? ' Só esta cobrança sai; a assinatura continua.' : '';

        feedback.confirmar({
            titulo: 'Excluir movimentação',
            descricao: '"' + tx.descricao + '" (' + self.formatCurrency(tx.valor) + ') será apagada permanentemente.' + parcela,
            rotuloConfirmar: 'Excluir movimentação',
            aoConfirmar: function () {
                self.executarExclusaoTransacao(tx.id);
            }
        });
    };

    /**
     * Exclui uma transação via API.
     *
     * @param {number} id id da transação
     * @returns
     */
    self.executarExclusaoTransacao = function (id) {
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
                feedback.exibirSucesso('Movimentação excluída');
            },
            error: function (jqXHR) {
                self.tratarErroRequisicao(jqXHR);
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
    };

    self.buildColorPicker = function () {
        var $picker = $('#colorPicker').empty();

        self.cardColors.forEach(function (colorObj, index) {
            var $swatch = $('<div>', { class: 'color-swatch' })
                .css('background', colorObj.color)
                .data('index', index);

            if (colorObj === self.state.selectedColor) {
                $swatch.addClass('selected');
            }

            $picker.append($swatch);
        });
    };

    /**
     * Busca o perfil na API e atualiza a sessão e a tela — nome, e-mail e foto podem ter mudado
     * em outro aparelho.
     *
     * @returns
     */
    self.carregarPerfil = function () {
        $.ajax({
            url: self.apiBaseUrl + '/api/perfil',
            headers: self.cabecalhoAuth(),
            success: function (perfil) {
                self.salvarPerfilNaSessao(perfil);
                self.exibirDadosUsuario();
                self.exibirSaudacao();
            },
            error: function (jqXHR) {
                self.tratarErroRequisicao(jqXHR);
            }
        });
    };

    /**
     * Abre o modal "Meu perfil" preenchido com os dados da sessão e com os blocos de senha e de
     * exclusão limpos.
     *
     * @returns
     */
    self.abrirModalPerfil = function () {
        $('#inputProfileName').val(self.obterNome() || '');
        $('#inputProfileEmail').val(self.obterEmail() || '');
        $('#inputProfileEmailPassword, #inputProfileCurrentPassword, #inputProfileNewPassword, #inputProfileConfirmPassword').val('');
        $('#fieldProfileEmailPassword').prop('hidden', true);

        self.esconderAlertaExclusao();
        self.renderizarFotoPerfil();
        self.openModal('#modalProfile');
    };

    /**
     * Mostra a foto (ou iniciais) no avatar do modal e o botão "Remover foto" só quando existe foto.
     *
     * @returns
     */
    self.renderizarFotoPerfil = function () {
        self.renderizarAvatar($('#profileAvatar'), self.obterNome(), self.obterFotoUrl());
        $('#btnRemovePhoto').prop('hidden', !self.obterFotoUrl());
    };

    /**
     * Mostra o campo "Senha atual" do bloco de dados só quando o e-mail digitado é diferente do atual.
     *
     * @returns
     */
    self.atualizarCampoSenhaEmail = function () {
        var emailDigitado = $('#inputProfileEmail').val().trim().toLowerCase();
        $('#fieldProfileEmailPassword').prop('hidden', emailDigitado === (self.obterEmail() || ''));
    };

    /**
     * Valida o bloco de dados do perfil (nome, e-mail e, se o e-mail mudou, a senha atual).
     *
     * @returns {boolean} true se pode enviar
     */
    self.validarDadosPerfil = function () {
        feedback.limparErros('#modalProfile');

        var nome = $('#inputProfileName').val().trim();
        var email = $('#inputProfileEmail').val().trim();
        var trocandoEmail = !$('#fieldProfileEmailPassword').prop('hidden');

        if (!nome) {
            feedback.marcarErro('#inputProfileName', 'Informe seu nome');
        }

        if (!email || email.indexOf('@') < 1) {
            feedback.marcarErro('#inputProfileEmail', 'Informe um e-mail válido');
        }

        if (trocandoEmail && !$('#inputProfileEmailPassword').val()) {
            feedback.marcarErro('#inputProfileEmailPassword', 'Informe sua senha para trocar o e-mail');
        }

        if ($('#modalProfile [aria-invalid="true"]').length > 0) {
            feedback.focarPrimeiroErro('#modalProfile');
            return false;
        }

        return true;
    };

    /**
     * Salva nome e e-mail. Se o e-mail mudou, a API devolve um token novo, que substitui o da sessão.
     *
     * @returns
     */
    self.salvarDadosPerfil = function () {
        if (!self.validarDadosPerfil()) {
            return;
        }

        var trocandoEmail = !$('#fieldProfileEmailPassword').prop('hidden');

        $.ajax({
            url: self.apiBaseUrl + '/api/perfil',
            method: 'PUT',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify({
                nome: $('#inputProfileName').val().trim(),
                email: $('#inputProfileEmail').val().trim(),
                senhaAtual: trocandoEmail ? $('#inputProfileEmailPassword').val() : null
            }),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (perfil) {
                self.salvarPerfilNaSessao(perfil);
                self.exibirDadosUsuario();
                self.exibirSaudacao();
                self.renderizarFotoPerfil();
                $('#inputProfileEmailPassword').val('');
                $('#fieldProfileEmailPassword').prop('hidden', true);
                feedback.exibirSucesso('Dados atualizados', trocandoEmail ? 'Os outros aparelhos foram desconectados.' : '');
            },
            error: function (jqXHR) {
                var senhaIncorreta = feedback.mensagemDaApi(jqXHR, 401);
                var emailEmUso = feedback.mensagemDaApi(jqXHR, 409);

                if (senhaIncorreta) {
                    $('#inputProfileEmailPassword').val('');
                    feedback.marcarErro('#inputProfileEmailPassword', senhaIncorreta);
                    feedback.focarPrimeiroErro('#modalProfile');
                } else if (emailEmUso) {
                    feedback.marcarErro('#inputProfileEmail', emailEmUso);
                    feedback.focarPrimeiroErro('#modalProfile');
                } else {
                    self.tratarErroRequisicao(jqXHR);
                }
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
    };

    /**
     * Troca a senha. A API devolve um token novo (os outros aparelhos são desconectados).
     *
     * @returns
     */
    self.alterarSenhaPerfil = function () {
        feedback.limparErros('#modalProfile');

        var senhaAtual = $('#inputProfileCurrentPassword').val();
        var novaSenha = $('#inputProfileNewPassword').val();

        if (!senhaAtual) {
            feedback.marcarErro('#inputProfileCurrentPassword', 'Informe sua senha atual');
        }

        if (novaSenha.length < 8) {
            feedback.marcarErro('#inputProfileNewPassword', 'A nova senha deve ter no mínimo 8 caracteres');
        } else if (novaSenha !== $('#inputProfileConfirmPassword').val()) {
            feedback.marcarErro('#inputProfileConfirmPassword', 'As senhas não conferem');
        }

        if ($('#modalProfile [aria-invalid="true"]').length > 0) {
            feedback.focarPrimeiroErro('#modalProfile');
            return;
        }

        $.ajax({
            url: self.apiBaseUrl + '/api/perfil/senha',
            method: 'PUT',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify({ senhaAtual: senhaAtual, novaSenha: novaSenha }),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (perfil) {
                self.salvarPerfilNaSessao(perfil);
                $('#inputProfileCurrentPassword, #inputProfileNewPassword, #inputProfileConfirmPassword').val('');
                feedback.exibirSucesso('Senha alterada', 'Os outros aparelhos foram desconectados.');
            },
            error: function (jqXHR) {
                var senhaIncorreta = feedback.mensagemDaApi(jqXHR, 401);

                $('#inputProfileCurrentPassword').val('');

                if (senhaIncorreta) {
                    feedback.marcarErro('#inputProfileCurrentPassword', senhaIncorreta);
                    feedback.focarPrimeiroErro('#modalProfile');
                } else {
                    self.tratarErroRequisicao(jqXHR);
                }
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
    };

    /**
     * Recorta a imagem num quadrado central de 512x512 e converte pra JPEG. Uma foto de 10 MB do
     * celular vira ~50 KB antes de ir pra API.
     *
     * @param {File} arquivo imagem escolhida pelo usuário
     * @returns {Promise<Blob>} imagem recortada
     */
    self.recortarFoto = function (arquivo) {
        return new Promise(function (resolve, reject) {
            var endereco = URL.createObjectURL(arquivo);
            var imagem = new Image();

            imagem.onload = function () {
                var lado = Math.min(imagem.naturalWidth, imagem.naturalHeight);
                var canvas = document.createElement('canvas');
                var contexto = canvas.getContext('2d');

                // A imagem já está decodificada em memória: o endereço temporário não é mais usado
                URL.revokeObjectURL(endereco);

                if (!contexto) {
                    reject(new Error('Canvas indisponível'));
                    return;
                }

                canvas.width = 512;
                canvas.height = 512;
                contexto.drawImage(imagem,
                    (imagem.naturalWidth - lado) / 2, (imagem.naturalHeight - lado) / 2, lado, lado,
                    0, 0, 512, 512);

                canvas.toBlob(function (recorte) {
                    if (recorte) {
                        resolve(recorte);
                    } else {
                        reject(new Error('Falha ao gerar a imagem'));
                    }
                }, 'image/jpeg', 0.85);
            };

            imagem.onerror = function () {
                URL.revokeObjectURL(endereco);
                reject(new Error('Arquivo não é uma imagem'));
            };

            imagem.src = endereco;
        });
    };

    /**
     * Valida a imagem escolhida, recorta no navegador, mostra a prévia e envia pra API. Se o envio
     * falhar, volta a mostrar a foto anterior.
     *
     * @returns
     */
    self.enviarFotoPerfil = function () {
        var arquivo = $('#inputProfilePhoto')[0].files[0];
        var enderecoPrevia = null;

        $('#inputProfilePhoto').val('');

        if (!arquivo) {
            return;
        }

        if (['image/jpeg', 'image/png', 'image/webp'].indexOf(arquivo.type) === -1) {
            feedback.exibirToast('negative', 'Formato não aceito', 'Escolha uma foto JPG, PNG ou WEBP.');
            return;
        }

        self.recortarFoto(arquivo)
            .then(function (recorte) {
                var dados = new FormData();
                dados.append('foto', recorte, 'foto.jpg');

                enderecoPrevia = URL.createObjectURL(recorte);
                self.renderizarAvatar($('#profileAvatar'), self.obterNome(), enderecoPrevia);
                self.mostrarCarregando();

                return $.ajax({
                    url: self.apiBaseUrl + '/api/perfil/foto',
                    method: 'PUT',
                    headers: self.cabecalhoAuth(),
                    data: dados,
                    processData: false,
                    contentType: false
                });
            })
            .then(function (perfil) {
                self.salvarPerfilNaSessao(perfil);
                self.exibirDadosUsuario();
                self.renderizarFotoPerfil();
                feedback.exibirSucesso('Foto atualizada');
            })
            .catch(function (erro) {
                self.renderizarFotoPerfil();

                if (erro && erro.status !== undefined) {
                    self.tratarErroRequisicao(erro);
                } else {
                    feedback.exibirToast('negative', 'Não foi possível usar essa imagem', 'Tente outra foto.');
                }
            })
            .finally(function () {
                self.esconderCarregando();

                if (enderecoPrevia) {
                    URL.revokeObjectURL(enderecoPrevia);
                }
            });
    };

    /**
     * Remove a foto de perfil (volta a exibir as iniciais).
     *
     * @returns
     */
    self.removerFotoPerfil = function () {
        $.ajax({
            url: self.apiBaseUrl + '/api/perfil/foto',
            method: 'DELETE',
            headers: self.cabecalhoAuth(),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (perfil) {
                self.salvarPerfilNaSessao(perfil);
                self.exibirDadosUsuario();
                self.renderizarFotoPerfil();
                feedback.exibirSucesso('Foto removida');
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
     * Mostra o alerta de exclusão do cadastro dentro do modal de perfil (não abre outro modal).
     *
     * @returns
     */
    self.mostrarAlertaExclusao = function () {
        $('#btnDeleteProfile').prop('hidden', true);
        $('#alertDeleteProfile').prop('hidden', false);
        $('#inputDeleteProfilePassword').val('').trigger('focus');
    };

    /**
     * Fecha o alerta de exclusão (botão Cancelar ou reabertura do modal) e limpa a senha digitada.
     *
     * @returns
     */
    self.esconderAlertaExclusao = function () {
        $('#inputDeleteProfilePassword').val('');
        $('#alertDeleteProfile').prop('hidden', true);
        $('#btnDeleteProfile').prop('hidden', false);
    };

    /**
     * Exclui o cadastro e todos os dados do usuário, depois da senha confirmada no alerta. Sucesso
     * limpa a sessão e volta pro login.
     *
     * @returns
     */
    self.excluirCadastro = function () {
        feedback.limparErros('#alertDeleteProfile');

        var senha = $('#inputDeleteProfilePassword').val();

        if (!senha) {
            feedback.marcarErro('#inputDeleteProfilePassword', 'Informe sua senha');
            feedback.focarPrimeiroErro('#alertDeleteProfile');
            return;
        }

        $.ajax({
            url: self.apiBaseUrl + '/api/perfil',
            method: 'DELETE',
            contentType: 'application/json',
            headers: self.cabecalhoAuth(),
            data: JSON.stringify({ senha: senha }),
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function () {
                self.limparSessao();

                // O Toast não sobrevive ao redirecionamento: a tela de login mostra o aviso.
                // Overlay de carregando fica em cima até sair da página, pra evitar um segundo
                // clique em "Confirmar" (mandaria Bearer null)
                sessionStorage.setItem('avisoLogin', 'cadastro-excluido');
                window.location.replace('login.html');
            },
            error: function (jqXHR) {
                self.esconderCarregando();

                // Senha errada volta 401 com mensagem: o erro vai no próprio campo, sem deslogar
                var senhaIncorreta = feedback.mensagemDaApi(jqXHR, 401);

                $('#inputDeleteProfilePassword').val('');

                if (senhaIncorreta) {
                    feedback.marcarErro('#inputDeleteProfilePassword', senhaIncorreta);
                    feedback.focarPrimeiroErro('#alertDeleteProfile');
                } else {
                    self.tratarErroRequisicao(jqXHR);
                }
            }
        });
    };

    /**
     * Baixa um arquivo de uma rota autenticada (o token vai no cabeçalho) usando o nome enviado pela API.
     *
     * @param {string} rota rota da API
     * @param {string} nomePadrao nome usado se a API não informar
     * @returns
     */
    self.baixarArquivo = function (rota, nomePadrao) {
        $.ajax({
            url: self.apiBaseUrl + rota,
            headers: self.cabecalhoAuth(),
            xhrFields: { responseType: 'blob' },
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (arquivo, status, jqXHR) {
                var disposicao = jqXHR.getResponseHeader('Content-Disposition') || '';
                var nome = /filename="([^"]+)"/.exec(disposicao);
                var endereco = URL.createObjectURL(arquivo);
                var link = document.createElement('a');

                link.href = endereco;
                link.download = nome ? nome[1] : nomePadrao;
                document.body.append(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(endereco);
            },
            error: function (jqXHR) {
                if (jqXHR.status > 0 && jqXHR.status !== 401) {
                    feedback.exibirToast('negative', 'Não foi possível baixar o arquivo', 'Tente de novo em instantes.');
                } else {
                    self.tratarErroRequisicao(jqXHR);
                }
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
    };

    self.abrirModalPlanilha = function () {
        var $conta = $('#inputImportAccount').empty();

        self.state.contas.forEach(function (conta) {
            $conta.append($('<option>', { value: conta.id, text: conta.nome }));
        });

        if (self.state.currentView !== 'all') {
            $conta.val(self.state.currentView);
        }

        $('#inputImportFile').val('');
        self.atualizarNomeArquivoImportacao();
        self.state.previaImportacao = null;
        $('#importPreview').prop('hidden', true);
        self.openModal('#modalSpreadsheet');
    };

    /**
     * Mostra no seletor de arquivo o nome do CSV escolhido (ou o texto padrão quando não há arquivo).
     *
     * @returns
     */
    self.atualizarNomeArquivoImportacao = function () {
        var arquivo = $('#inputImportFile')[0].files[0];

        $('#importFileName').text(arquivo ? arquivo.name : 'Escolher arquivo');
        $('#importFileHint').text(arquivo ? 'Clique para trocar o arquivo' : 'Clique para selecionar um .csv de até 2 MB');
        $('.file-picker').toggleClass('file-picker--selecionado', !!arquivo);
    };

    /**
     * Monta o FormData com o arquivo escolhido e a conta padrão.
     *
     * @returns {FormData|null} dados do envio, ou null se faltar arquivo
     */
    self.montarEnvioPlanilha = function () {
        if (!$('#inputImportAccount').val()) {
            feedback.marcarErro('#inputImportAccount', 'Crie uma conta antes de importar');
            feedback.focarPrimeiroErro('#modalSpreadsheet');
            return null;
        }

        var arquivo = $('#inputImportFile')[0].files[0];

        if (!arquivo) {
            feedback.marcarErro('#inputImportFile', 'Escolha um arquivo CSV');
            feedback.focarPrimeiroErro('#modalSpreadsheet');
            return null;
        }

        var dados = new FormData();
        dados.append('arquivo', arquivo);
        dados.append('contaPadraoId', $('#inputImportAccount').val());
        return dados;
    };

    self.analisarPlanilha = function () {
        feedback.limparErros('#modalSpreadsheet');
        var dados = self.montarEnvioPlanilha();

        if (!dados) {
            return;
        }

        $.ajax({
            url: self.apiBaseUrl + '/api/planilhas/previa',
            method: 'POST',
            headers: self.cabecalhoAuth(),
            data: dados,
            processData: false,
            contentType: false,
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (previa) {
                self.state.previaImportacao = previa;
                self.renderizarPrevia(previa.erros);
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
     * Mostra o resumo da prévia, os erros (linha · coluna: motivo) e os possíveis duplicados.
     *
     * @param {Array} erros erros da prévia ou da tentativa de importação
     * @returns
     */
    self.renderizarPrevia = function (erros) {
        var previa = self.state.previaImportacao;
        var partes = [];

        if (previa) {
            partes.push(previa.lancamentosAvulsos + ' lançamento(s) avulso(s)');
            partes.push(previa.recorrencias + ' compra(s) parcelada(s)/recorrência(s)');

            if (previa.novasCategorias.length) {
                partes.push('novas categorias: ' + previa.novasCategorias.join(', '));
            }

            if (previa.novasContas.length) {
                partes.push('novas contas: ' + previa.novasContas.join(', '));
            }

            if (previa.novosCartoes.length) {
                partes.push('novos cartões: ' + previa.novosCartoes.join(', '));
            }
        }

        $('#importSummary').text(partes.join(' · '));

        var $erros = $('#importErrors').empty();
        erros.forEach(function (erro) {
            var onde = erro.linha === 0 ? 'Arquivo' : 'Linha ' + erro.linha;
            $erros.append($('<li>', { text: onde + (erro.coluna ? ' · ' + erro.coluna : '') + ': ' + erro.mensagem }));
        });
        $('#importErrorsBox').prop('hidden', erros.length === 0);

        self.renderizarCartoesNovosDaPrevia(previa);

        var duplicadas = previa ? previa.linhas.filter(function (linha) { return linha.possivelDuplicado; }) : [];
        var $duplicadas = $('#importDuplicates').empty();

        duplicadas.forEach(function (linha) {
            var texto = 'Linha ' + linha.linha + ': ' + self.formatarData(linha.data) + ' · ' + linha.descricao + ' · ' + self.formatCurrency(linha.valor);
            $duplicadas.append($('<li>').append($('<label>').append(
                $('<input>', { type: 'checkbox', 'data-linha': linha.linha }),
                $('<span>', { text: texto })
            )));
        });
        $('#importDuplicatesBox').prop('hidden', duplicadas.length === 0 || erros.length > 0);

        $('#btnConfirmImport').prop('disabled', erros.length > 0);
        $('#importPreview').prop('hidden', false);
    };

    /**
     * Na prévia sem erros, mostra fechamento e vencimento a preencher pra cada cartão que a
     * importação vai criar. Os dias já digitados continuam quando a lista é montada de novo.
     *
     * @param {object|null} previa prévia da importação
     * @returns
     */
    self.renderizarCartoesNovosDaPrevia = function (previa) {
        var cartoes = previa && previa.erros.length === 0 ? previa.novosCartoes : [];
        var $lista = $('#importNewCards');
        var digitados = {};

        $lista.find('.spreadsheet-new-card').each(function () {
            digitados[$(this).attr('data-nome')] = {
                fechamento: $(this).find('[data-dia="fechamento"]').val(),
                vencimento: $(this).find('[data-dia="vencimento"]').val()
            };
        });

        $lista.empty();

        cartoes.forEach(function (nome, indice) {
            var anterior = digitados[nome] || { fechamento: '', vencimento: '' };

            var criarCampo = function (tipo, rotulo, valor) {
                var id = 'importCard' + indice + (tipo === 'fechamento' ? 'Closing' : 'Due');

                return $('<div>', { class: 'ef-field' }).append(
                    $('<label>', { class: 'ef-field__label', for: id, text: rotulo }),
                    $('<input>', { class: 'ef-input ef-input--mono', type: 'number', id: id, min: 1, max: 31, inputmode: 'numeric', 'data-dia': tipo }).val(valor)
                );
            };

            $lista.append($('<div>', { class: 'spreadsheet-new-card', 'data-nome': nome }).append(
                $('<span>', { class: 'spreadsheet-new-card__name' }).append(icones.criar('credit-card', 'sm'), $('<span>', { text: nome })),
                $('<div>', { class: 'field-grid' }).append(
                    criarCampo('fechamento', 'Fecha no dia', anterior.fechamento),
                    criarCampo('vencimento', 'Vence no dia', anterior.vencimento)
                )
            ));
        });

        $('#importNewCardsBox').prop('hidden', cartoes.length === 0);
    };

    /**
     * Lê fechamento e vencimento dos cartões novos da prévia, marcando os campos inválidos.
     *
     * @returns {Array|null} lista { nome, diaFechamento, diaVencimento }, ou null se algum dia for inválido
     */
    self.lerCartoesNovosDaPrevia = function () {
        var cartoes = [];
        var valido = true;

        $('#importNewCards .spreadsheet-new-card').each(function () {
            var diaFechamento = self.lerDiaDoMes('#' + $(this).find('[data-dia="fechamento"]').attr('id'), 'Informe um dia de 1 a 31');
            var diaVencimento = self.lerDiaDoMes('#' + $(this).find('[data-dia="vencimento"]').attr('id'), 'Informe um dia de 1 a 31');

            if (diaFechamento === null || diaVencimento === null) {
                valido = false;
            }

            cartoes.push({ nome: $(this).attr('data-nome'), diaFechamento: diaFechamento, diaVencimento: diaVencimento });
        });

        if (!valido) {
            feedback.focarPrimeiroErro('#importNewCards');
            return null;
        }

        return cartoes;
    };

    self.confirmarImportacao = function () {
        feedback.limparErros('#importNewCards');
        var cartoesNovos = self.lerCartoesNovosDaPrevia();
        var dados = cartoesNovos ? self.montarEnvioPlanilha() : null;

        if (!dados) {
            return;
        }

        // Parte JSON: o backend lê como lista de objetos
        dados.append('cartoesNovos', new Blob([JSON.stringify(cartoesNovos)], { type: 'application/json' }));

        $('#importDuplicates input:checked').each(function () {
            dados.append('linhasDuplicadasIncluidas', $(this).attr('data-linha'));
        });

        $.ajax({
            url: self.apiBaseUrl + '/api/planilhas/importar',
            method: 'POST',
            headers: self.cabecalhoAuth(),
            data: dados,
            processData: false,
            contentType: false,
            beforeSend: function () {
                self.mostrarCarregando();
            },
            success: function (resultado) {
                self.closeModal('#modalSpreadsheet');
                self.carregarContas();
                self.carregarCartoes();
                self.carregarCategorias();
                self.carregarTransacoes();
                self.carregarRecorrencias();

                var partes = [resultado.lancamentosAvulsos + ' lançamento(s)', resultado.recorrencias + ' recorrência(s)'];

                if (resultado.duplicadosPulados > 0) {
                    partes.push(resultado.duplicadosPulados + ' duplicado(s) pulado(s)');
                }

                feedback.exibirSucesso('Planilha importada', partes.join(' · ') + '.');
            },
            error: function (jqXHR) {
                if (jqXHR.status === 400 && jqXHR.responseJSON && jqXHR.responseJSON.erros) {
                    self.renderizarPrevia(jqXHR.responseJSON.erros);
                } else {
                    self.tratarErroRequisicao(jqXHR);
                }
            },
            complete: function () {
                self.esconderCarregando();
            }
        });
    };

    self.openModal = function (selector) {
        feedback.limparErros(selector);
        $(selector).prop('hidden', false);
    };

    self.closeModal = function (selector) {
        $(selector).prop('hidden', true);
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

            // Botão X e tecla Esc fecham qualquer Dialog aberto (o clique no fundo
            // continua tratado por modal, mais abaixo)
            $(document).on('click', '.ef-dialog__close', function () {
                self.closeModal('#' + $(this).closest('.ef-dialog').attr('id'));
            });

            // Esc com a lista de um select aberta só fecha a lista, não o modal
            $(document).on('keydown', function (e) {
                if (e.key === 'Escape' && !$(e.target).closest('select').length) {
                    $('.ef-dialog:not([hidden])').prop('hidden', true);
                }
            });

            $(document).on('click', '.nav-item, .bottom-nav-item, .topbar-icon-btn[data-page]', function () {
                self.navigateTo($(this).data('page'));
            });

            $(document).on('click', '.acc-tab', function () {
                var view = $(this).data('view');
                self.state.currentView = view;

                $('.acc-tab').attr('aria-pressed', 'false');
                $('.acc-tab[data-view="' + view + '"]').attr('aria-pressed', 'true');

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
                $('#categoriaRow .categoria-chip').attr('aria-pressed', 'false');
                $(this).attr('aria-pressed', 'true');
                feedback.limparErro('#categoriaRow');
            });

            $(document).on('click', '#categoriaRowRecorrencia .categoria-chip', function () {
                self.state.currentCategoriaRecorrencia = $(this).data('categoria');
                $('#categoriaRowRecorrencia .categoria-chip').attr('aria-pressed', 'false');
                $(this).attr('aria-pressed', 'true');
                feedback.limparErro('#categoriaRowRecorrencia');
            });

            $('#btnPrevMonth').on('click', function () {
                self.mudarPeriodo(-1);
            });

            $('#btnNextMonth').on('click', function () {
                self.mudarPeriodo(1);
            });

            $(document).on('click', '.filter-chip', function () {
                var atributo = $(this).attr('data-categoria');

                if (!atributo) {
                    self.state.categoriasFiltradas = [];
                } else {
                    var categoriaId = parseInt(atributo, 10);
                    var indice = self.state.categoriasFiltradas.indexOf(categoriaId);

                    if (indice === -1) {
                        self.state.categoriasFiltradas.push(categoriaId);
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
                var value = self.lerValor($('#inputValue').val());
                var contaId = parseInt($('#inputAccount').val());
                // O campo de cartão some na entrada, mas guarda a última escolha
                var cardId = self.state.currentType === 'out' ? parseInt($('#inputCard').val()) || null : null;

                if (self.validateTransaction(description, value, contaId)) {
                    self.criarTransacao(description, value, contaId, cardId);
                }
            });

            $('#btnNewCard').on('click', function () {
                self.abrirModalCartao(null);
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

            $('#btnConfirmCard').on('click', self.salvarCartao);

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
                    feedback.marcarErro('#inputContaName', 'Informe o nome da conta');
                    feedback.focarPrimeiroErro('#modalConta');
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

            $('#inputRecorrenciaCard').on('change', self.atualizarCampoDataRecorrencia);

            $('#btnConfirmRecorrencia').on('click', function () {
                var description = $.trim($('#inputRecorrenciaDescription').val());
                var value = self.lerValor($('#inputRecorrenciaValue').val());
                var contaId = parseInt($('#inputRecorrenciaAccount').val());
                var cardId = self.state.currentTypeRecorrencia === 'out' ? parseInt($('#inputRecorrenciaCard').val()) || null : null;
                var totalParcelas = parseInt($('#inputRecorrenciaParcelas').val());
                var dataInicio = $('#inputRecorrenciaDataInicio').val();

                if (self.validateRecorrencia(description, value, contaId, totalParcelas)) {
                    self.criarRecorrencia(description, value, contaId, cardId, totalParcelas, dataInicio);
                }
            });

            $(document).on('click', '.alcance-opcao', function () {
                self.selecionarAlcance($(this).closest('.alcance-field'), $(this).attr('data-alcance'));
            });

            $('#btnNewAssinatura').on('click', function () {
                self.abrirModalAssinatura(null);
            });

            $('#modalAssinatura').on('click', function (e) {
                if ($(e.target).is('#modalAssinatura')) {
                    self.closeModal('#modalAssinatura');
                }
            });

            $('#periodicidadeAssinatura .periodicidade-opcao').on('click', function () {
                $('#periodicidadeAssinatura .periodicidade-opcao').attr('aria-pressed', 'false');
                $(this).attr('aria-pressed', 'true');
            });

            $(document).on('click', '#categoriaRowAssinatura .categoria-chip', function () {
                self.state.currentCategoriaAssinatura = $(this).data('categoria');
                $('#categoriaRowAssinatura .categoria-chip').attr('aria-pressed', 'false');
                $(this).attr('aria-pressed', 'true');
                feedback.limparErro('#categoriaRowAssinatura');
            });

            $('#btnConfirmAssinatura').on('click', self.salvarAssinatura);

            $('#btnOpenSpreadsheet').on('click', self.abrirModalPlanilha);
            $('#btnExportSpreadsheet').on('click', function () {
                self.baixarArquivo('/api/planilhas/exportar', 'e-financeiro-movimentacoes.csv');
            });
            $('#btnDownloadTemplate').on('click', function () {
                self.baixarArquivo('/api/planilhas/modelo', 'modelo-importacao.csv');
            });
            $('#btnPreviewImport').on('click', self.analisarPlanilha);
            $('#btnConfirmImport').on('click', self.confirmarImportacao);
            $('#inputImportFile, #inputImportAccount').on('change', function () {
                self.state.previaImportacao = null;
                $('#importPreview').prop('hidden', true);
            });
            $('#inputImportFile').on('change', self.atualizarNomeArquivoImportacao);

            $('#modalSpreadsheet').on('click', function (e) {
                if ($(e.target).is('#modalSpreadsheet')) {
                    self.closeModal('#modalSpreadsheet');
                }
            });

            $('#btnOpenProfile, #btnOpenProfileMobile').on('click', self.abrirModalPerfil);

            $('#modalProfile').on('click', function (e) {
                if ($(e.target).is('#modalProfile')) {
                    self.closeModal('#modalProfile');
                }
            });

            $('#inputProfileEmail').on('input', self.atualizarCampoSenhaEmail);
            $('#btnConfirmProfileData').on('click', self.salvarDadosPerfil);
            $('#btnConfirmProfilePassword').on('click', self.alterarSenhaPerfil);

            $('#btnChangePhoto').on('click', function () {
                $('#inputProfilePhoto').trigger('click');
            });
            $('#inputProfilePhoto').on('change', self.enviarFotoPerfil);
            $('#btnRemovePhoto').on('click', self.removerFotoPerfil);

            $('#btnDeleteProfile').on('click', self.mostrarAlertaExclusao);
            $('#btnCancelDeleteProfile').on('click', self.esconderAlertaExclusao);
            $('#btnConfirmDeleteProfile').on('click', self.excluirCadastro);

            $('#btnNewCategoria').on('click', self.abrirModalNovaCategoria);
            $('#btnConfirmCategoria').on('click', self.salvarCategoria);
            $('#inputCategoriaNome').on('input', self.atualizarPreviaCategoria);

            $('#modalCategoria').on('click', function (e) {
                if ($(e.target).is('#modalCategoria')) {
                    self.closeModal('#modalCategoria');
                }
            });

            $(document).on('click', '#iconePickerCategoria .icone-opcao', function () {
                self.state.categoriaIconeSelecionado = $(this).attr('data-icone');
                $('#iconePickerCategoria .icone-opcao').attr('aria-pressed', 'false');
                $(this).attr('aria-pressed', 'true');
                self.atualizarPreviaCategoria();
            });

            $(document).on('click', '#tomPickerCategoria .color-swatch', function () {
                self.state.categoriaTomSelecionado = $(this).attr('data-tom');
                $('#tomPickerCategoria .color-swatch').removeClass('selected').attr('aria-pressed', 'false');
                $(this).addClass('selected').attr('aria-pressed', 'true');
                self.atualizarPreviaCategoria();
            });

            self.exibirDadosUsuario();
            self.exibirSaudacao();
            self.renderizarPeriodo();
            self.buildFilterRow();
            self.buildColorPicker();
            self.updateAccountSelector('all');
            self.carregarDesignSystem();
            self.carregarContas();
            self.carregarCategorias();
            self.carregarOpcoesCategoria();
            self.carregarCartoes();
            self.carregarTransacoes();
            self.carregarRecorrencias();
            self.carregarAssinaturas();
            self.carregarPerfil();
        } else {
            window.location.href = 'login.html';
        }
    };
}

dashboard.iniciar();
