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

        // Série exibida no gráfico de tendência: resultado, entradas ou saidas
        serieTendencia: 'resultado',

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

    /**
     * Tom do IconTile, cor de série (donut) e ícone de cada categoria. Os ícones
     * são nomes Lucide. Categoria nula ou desconhecida (ex.: lançamentos
     * antigos, sem categoria) cai em OUTRO, então toda linha tem ícone.
     *
     * @param {string} categoria categoria da API (RENDA, DESPESA...)
     * @returns {object} { classe, cor, icone }
     */
    self.resolveIconeCategoria = function (categoria) {
        var mapa = {
            RENDA: { classe: 'ef-icon-tile--positive', cor: 'var(--tone-positive-accent)', icone: 'banknote' },
            DESPESA: { classe: 'ef-icon-tile--negative', cor: 'var(--tone-negative-accent)', icone: 'receipt' },
            ALIMENTACAO: { classe: 'ef-icon-tile--warning', cor: 'var(--tone-warning-accent)', icone: 'shopping-bag' },
            MORADIA: { classe: 'ef-icon-tile--brand', cor: 'var(--tone-brand-accent)', icone: 'house' },
            OUTRO: { classe: '', cor: 'var(--tone-neutral-accent)', icone: 'ellipsis' }
        };

        return mapa[categoria] || mapa.OUTRO;
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
     * @param {string} categoria categoria da API
     * @returns {jQuery} tile pronto
     */
    self.criarTileCategoria = function (categoria) {
        var icone = self.resolveIconeCategoria(categoria);

        return $('<span>', { class: 'ef-icon-tile ' + icone.classe, 'aria-hidden': 'true' }).append(icones.criar(icone.icone, 'sm'));
    };

    /**
     * Badge "3/10" das movimentações geradas por uma recorrência. A API só manda
     * numeroParcela/totalParcelas nas parcelas; lançamento avulso não tem badge.
     *
     * @param {object} tx transação retornada pela API
     * @returns {jQuery|null} badge, ou null quando não é parcela
     */
    self.criarBadgeParcela = function (tx) {
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
        var metaText = self.formatarData(tx.dataTransacao) + ' · ' + tx.nomeConta + metaCard;

        var $icon;

        if (card) {
            // Cor do cartão escolhida pelo usuário (paleta --swatch-*), aplicada em linha
            $icon = $('<span>', { class: 'ef-icon-tile', 'aria-hidden': 'true' }).append(icones.criar('credit-card', 'sm'));
            $icon.css({ background: card.corFundo, color: card.corTexto });
        } else {
            $icon = self.criarTileCategoria(tx.categoria);
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
     * Agrupa as saídas do mês selecionado por categoria, pro donut de
     * "Gastos por categoria" (RENDA fica de fora — é sempre entrada). As fatias
     * saem da maior pra menor, com a mesma cor do IconTile da categoria.
     *
     * @returns {Array} fatias no formato do DonutChart ({ label, value, color })
     */
    self.montarDadosCategorias = function () {
        var totais = {};

        self.obterTransacoesDoMes(self.state.periodo.mes, self.state.periodo.ano).forEach(function (tx) {
            if (tx.tipo === 'SAIDA') {
                var categoria = tx.categoria && tx.categoria !== 'RENDA' ? tx.categoria : 'OUTRO';
                totais[categoria] = (totais[categoria] || 0) + tx.valor;
            }
        });

        return self.categoriasDisponiveis
            .filter(function (categoria) { return totais[categoria.valor]; })
            .map(function (categoria) {
                return { label: categoria.nome, value: totais[categoria.valor], color: self.resolveIconeCategoria(categoria.valor).cor };
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

        self.categoriasDisponiveis.forEach(function (categoria) {
            var icone = self.resolveIconeCategoria(categoria.valor);
            var $chip = $('<button>', { type: 'button', class: 'ef-tag filter-chip' })
                .attr({ 'data-categoria': categoria.valor, 'aria-pressed': String(self.state.categoriasFiltradas.indexOf(categoria.valor) !== -1) })
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
     * a cor escolhida vira o fundo, com chip decorativo e o gasto do mês
     * (já calculado pela API) na base.
     *
     * @param {object} card cartão retornado pela API
     * @returns {jQuery} elemento pronto pra inserir na grade de cartões
     */
    self.buildCardItem = function (card) {
        var $delete = self.criarBotaoIcone('trash-2', 'Excluir', true).on('click', function () {
                self.excluirCartao(card);
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
                feedback.exibirSucesso('Conta excluída', 'As movimentações e recorrências dela também foram apagadas.');
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
        var $icon = self.criarTileCategoria(recorrencia.categoria);

        var decorridas = recorrencia.totalParcelas - recorrencia.parcelasRestantes;
        var metaCartao = recorrencia.nomeCartao ? ' · ' + recorrencia.nomeCartao : '';
        var metaText = decorridas + ' de ' + recorrencia.totalParcelas + ' · ' + recorrencia.nomeConta + metaCartao;

        var amountClass = recorrencia.tipo === 'ENTRADA' ? 'tx-amount--in' : 'tx-amount--out';
        var prefix = recorrencia.tipo === 'ENTRADA' ? '+' : '−';

        var $editar = self.criarBotaoIcone('pencil', 'Editar valor', false)
            .on('click', function () {
                self.abrirModalEditarValorRecorrencia(recorrencia);
            });

        var $cancelar = self.criarBotaoIcone('trash-2', 'Cancelar parcelas futuras', true)
            .on('click', function () {
                self.cancelarRecorrenciaFuturas(recorrencia);
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
            $('<span>', { class: 'card-item-actions' }).append($editar, $cancelar)
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

        $('#categoriaRowRecorrencia .categoria-chip').attr('aria-pressed', 'false');
        self.state.currentCategoriaRecorrencia = isIn ? 'RENDA' : null;
        feedback.limparErro('#categoriaRowRecorrencia');
        $('#campoCategoriaRecorrencia').css('display', isIn ? 'none' : 'flex');
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
                feedback.exibirSucesso('Recorrência criada', totalParcelas + (totalParcelas === 1 ? ' parcela de ' : ' parcelas de ') + self.formatCurrency(value) + '.');
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
        $('#inputRecorrenciaNewValue').val(self.valorParaCampo(recorrencia.valor));
        self.openModal('#modalEditRecorrenciaValue');
    };

    self.atualizarValorRecorrencia = function () {
        var novoValor = self.lerValor($('#inputRecorrenciaNewValue').val());

        if (isNaN(novoValor) || novoValor <= 0) {
            feedback.marcarErro('#inputRecorrenciaNewValue', 'Informe um valor maior que zero');
            feedback.focarPrimeiroErro('#modalEditRecorrenciaValue');
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
                feedback.exibirSucesso('Valor atualizado', 'As próximas parcelas passam a ' + self.formatCurrency(novoValor) + '.');
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
     * Pede confirmação (Dialog) e cancela as parcelas futuras de uma recorrência.
     *
     * @param {object} recorrencia recorrência retornada pela API
     * @returns
     */
    self.cancelarRecorrenciaFuturas = function (recorrencia) {
        feedback.confirmar({
            titulo: 'Cancelar parcelas futuras',
            descricao: 'As próximas parcelas de "' + recorrencia.descricao + '" serão apagadas. As que já passaram continuam no histórico.',
            rotuloConfirmar: 'Cancelar parcelas',
            aoConfirmar: function () {
                self.executarCancelamentoRecorrencia(recorrencia.id);
            }
        });
    };

    /**
     * Cancela as parcelas futuras de uma recorrência via API.
     *
     * @param {number} id id da recorrência
     * @returns
     */
    self.executarCancelamentoRecorrencia = function (id) {
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
                feedback.exibirSucesso('Parcelas futuras canceladas');
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
                feedback.exibirSucesso('Cartão salvo', name);
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

    self.applyTypeStyle = function (type) {
        var isIn = type === 'in';

        $('#btnTypeIn').toggleClass('active-in', isIn).removeClass('active-out');
        $('#btnTypeOut').toggleClass('active-out', !isIn).removeClass('active-in');
        $('#cardRow').toggleClass('visible', !isIn);

        // Categorias só fazem sentido pra saída: na entrada os chips somem e a
        // categoria vai como RENDA automaticamente; na saída o chip "Renda"
        // fica de fora
        $('#categoriaRow .categoria-chip').attr('aria-pressed', 'false');
        self.state.currentCategoria = isIn ? 'RENDA' : null;
        feedback.limparErro('#categoriaRow');
        $('#campoCategoria').css('display', isIn ? 'none' : 'flex');
        $('#categoriaRow .categoria-chip[data-categoria="RENDA"]').css('display', isIn ? '' : 'none');
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
        var parcela = tx.numeroParcela ? ' Só a parcela ' + tx.numeroParcela + '/' + tx.totalParcelas + ' sai; as outras continuam.' : '';

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
                var value = self.lerValor($('#inputValue').val());
                var contaId = parseInt($('#inputAccount').val());
                var cardId = parseInt($('#inputCard').val()) || null;

                if (self.validateTransaction(description, value, contaId)) {
                    self.criarTransacao(description, value, contaId, cardId);
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
                    feedback.marcarErro('#inputCardName', 'Informe o nome do cartão');
                    feedback.focarPrimeiroErro('#modalCard');
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

            $('#btnConfirmRecorrencia').on('click', function () {
                var description = $.trim($('#inputRecorrenciaDescription').val());
                var value = self.lerValor($('#inputRecorrenciaValue').val());
                var contaId = parseInt($('#inputRecorrenciaAccount').val());
                var cardId = parseInt($('#inputRecorrenciaCard').val()) || null;
                var totalParcelas = parseInt($('#inputRecorrenciaParcelas').val());
                var dataInicio = $('#inputRecorrenciaDataInicio').val();

                if (self.validateRecorrencia(description, value, contaId, totalParcelas)) {
                    self.criarRecorrencia(description, value, contaId, cardId, totalParcelas, dataInicio);
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
            self.carregarDesignSystem();
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
