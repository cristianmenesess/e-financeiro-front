// @ts-check
/**
 * Showcase da biblioteca inteira — rota /design-system/.
 * Cada demo é renderizada duas vezes, lado a lado: painel claro e painel com
 * data-theme="dark". Estados que dependem de mouse/teclado (hover, press, foco)
 * são forçados pelas classes .is-hover/.is-active/.is-focus, que o CSS dos
 * componentes trata igual às pseudo-classes.
 */
import * as ds from '../components/index.js';
import { Icon, renderizarIcones, Grid, SectionTitle } from '../patterns/index.js';
import { onda } from '../templates/data.js';

/** @typedef {{ rotulo: string, render: () => Node | Node[], coluna?: boolean, grade?: boolean }} Demo */
/** @typedef {{ id: string, grupo: string, titulo: string, descricao: string, componentes?: string[], demos: Demo[] }} Secao */

var raiz = /** @type {HTMLElement} */ (document.getElementById('showcase'));
var indice = /** @type {HTMLElement} */ (document.getElementById('toc'));

/**
 * Envolve um elemento com o nome do estado exibido acima dele.
 *
 * @param {string} nome
 * @param {Node} elemento
 * @returns {HTMLDivElement}
 */
function estado(nome, elemento) {
    var bloco = document.createElement('div');
    bloco.className = 'sc-state';
    var rotulo = document.createElement('span');
    rotulo.className = 'sc-state__name';
    rotulo.textContent = nome;
    bloco.append(rotulo, elemento);
    return bloco;
}

/**
 * Força um estado visual adicionando a classe .is-* ao elemento (ou a um filho).
 *
 * @template {Element} E
 * @param {E} elemento
 * @param {string} classe
 * @param {string} [seletorFilho]
 * @returns {E}
 */
function forcar(elemento, classe, seletorFilho) {
    var alvo = seletorFilho ? elemento.querySelector(seletorFilho) : elemento;

    if (alvo) {
        alvo.classList.add(classe);
    }

    return elemento;
}

/**
 * @param {string} classe
 * @param {Node[]} filhos
 * @returns {HTMLDivElement}
 */
function caixa(classe, filhos) {
    var bloco = document.createElement('div');
    bloco.className = classe;
    bloco.append.apply(bloco, filhos);
    return bloco;
}

/**
 * @param {string} texto
 * @returns {HTMLSpanElement}
 */
function mono(texto) {
    var span = document.createElement('span');
    span.className = 'ef-mono-label';
    span.textContent = texto;
    return span;
}

var serie = onda(30, 820, 90, 9);
var serieCurta = onda(16, 20, 4, 0.8);
var alocacao = [
    { label: 'Receita recorrente', value: 44.8 }, { label: 'Serviços', value: 24.9 }, { label: 'Produtos', value: 15.3 },
    { label: 'Investimentos', value: 10.4 }, { label: 'Outros', value: 4.6 }
];
var TOKENS_ESCALA = ['teal', 'navy', 'neutral', 'green', 'red', 'amber', 'violet', 'blue'];
var DEGRAUS = { teal: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], navy: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], neutral: [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900], green: [50, 100, 400, 500, 600, 700], red: [50, 100, 400, 500, 600], amber: [50, 100, 400, 500, 600], violet: [50, 100, 400, 500, 600], blue: [50, 100, 400, 500, 600] };
var SEMANTICOS = ['--bg-canvas', '--surface-card', '--surface-sunken', '--surface-muted', '--surface-inverse', '--surface-brand', '--surface-brand-soft', '--text-primary', '--text-secondary', '--text-muted', '--text-faint', '--text-brand', '--text-positive', '--text-negative', '--text-warning', '--border-subtle', '--border-default', '--border-strong', '--border-brand', '--action-primary', '--action-dark', '--action-success', '--action-danger', '--series-1', '--series-2', '--series-3', '--series-4', '--series-5', '--series-6'];

/**
 * @param {string} token nome da variável CSS
 * @returns {HTMLDivElement}
 */
function amostra(token) {
    var chip = document.createElement('div');
    chip.className = 'sc-swatch__chip';
    chip.style.background = 'var(' + token + ')';
    var nome = document.createElement('div');
    nome.className = 'sc-swatch__name';
    nome.textContent = token.replace('--', '');
    return caixa('sc-swatch', [chip, nome]);
}

/** @type {Secao[]} */
var SECOES = [
    // ── Fundamentos ───────────────────────────────────────────────
    {
        id: 'cores', grupo: 'Fundamentos', titulo: 'Cores', descricao: 'Escalas de marca (teal, navy), neutros frios e status. Os semânticos mudam entre os temas; as escalas, não.',
        demos: [
            { rotulo: 'Semânticos (o que os componentes usam)', coluna: true, render: function () { return caixa('sc-swatches', SEMANTICOS.map(amostra)); } },
            { rotulo: 'Escalas', render: function () { return caixa('ef-stack', TOKENS_ESCALA.map(function (nome) { return caixa('sc-swatches', DEGRAUS[/** @type {keyof typeof DEGRAUS} */ (nome)].map(function (d) { return amostra('--' + nome + '-' + d); })); })); }, coluna: true },
            { rotulo: 'Aurora (no máximo um lugar por tela)', render: function () { return ds.Card({ aurora: true, children: [ds.CardHeader({ label: 'Card de saldo', title: 'Gradiente aurora atrás do conteúdo' })] }); }, coluna: true }
        ]
    },
    {
        id: 'tipografia', grupo: 'Fundamentos', titulo: 'Tipografia', descricao: 'Manrope para linguagem, JetBrains Mono para todo dado (dinheiro, %, data, código) com tabular-nums.',
        demos: [{
            rotulo: 'Papéis compostos', coluna: true, render: function () {
                return ['display', 'h1', 'h2', 'h3', 'h4', 'body', 'body-sm', 'caption', 'numeric-xl', 'numeric-lg', 'numeric', 'mono-label'].map(function (papel) {
                    var exemplo = document.createElement('span');
                    exemplo.style.font = 'var(--type-' + papel + ')';
                    exemplo.textContent = papel.indexOf('numeric') === 0 ? 'R$ 1.284.309,40' : papel === 'mono-label' ? 'SALDO CONSOLIDADO' : 'Saldo consolidado';
                    if (papel === 'mono-label') { exemplo.style.letterSpacing = 'var(--tracking-mono-label)'; }
                    var token = document.createElement('span');
                    token.className = 'sc-type-row__token';
                    token.textContent = '--type-' + papel;
                    return caixa('sc-type-row', [token, exemplo]);
                });
            }
        }]
    },
    {
        id: 'espacamento', grupo: 'Fundamentos', titulo: 'Espaçamento, raio, sombra e movimento', descricao: 'Escala em múltiplos de 4 (com os degraus intermediários que os componentes usam), raios 6→36 + pílula, cinco sombras navy e durações 140/220/360ms.',
        demos: [
            { rotulo: 'Espaçamento', coluna: true, render: function () { return ['0-5', '1', '1-5', '2', '2-5', '3', '3-5', '4', '5', '6', '8', '10', '12', '16'].map(function (s) { var barra = document.createElement('span'); barra.className = 'sc-scale__bar'; barra.style.width = 'var(--space-' + s + ')'; return caixa('sc-scale', [mono('--space-' + s), barra]); }); } },
            { rotulo: 'Raio', render: function () { return ['xs', 'sm', 'control', 'icon-tile', 'lg', 'card', 'sheet', '2xl', 'pill'].map(function (r) { var bloco = document.createElement('div'); bloco.className = 'sc-radius'; bloco.style.borderRadius = 'var(--radius-' + r + ')'; return estado('radius-' + r, bloco); }); } },
            { rotulo: 'Elevação', render: function () { return ['xs', 'sm', 'md', 'lg', 'xl'].map(function (s) { var bloco = document.createElement('div'); bloco.className = 'sc-shadow'; bloco.style.boxShadow = 'var(--shadow-' + s + ')'; return estado('shadow-' + s, bloco); }); } }
        ]
    },
    // ── Ações ─────────────────────────────────────────────────────
    {
        id: 'button', grupo: 'Ações', titulo: 'Button', componentes: ['Button'], descricao: '6 variantes, 3 tamanhos, ícones, largura total, loading.',
        demos: [
            { rotulo: 'Variantes', render: function () { return ['primary', 'dark', 'success', 'secondary', 'ghost', 'danger'].map(function (v) { return ds.Button({ variant: /** @type {any} */ (v), children: v === 'danger' ? 'Excluir' : v === 'success' ? 'Confirmar' : v === 'secondary' ? 'Exportar' : v === 'ghost' ? 'Cancelar' : v === 'dark' ? 'Começar agora' : 'Nova transação' }); }); } },
            { rotulo: 'Tamanhos e ícones', render: function () { return [ds.Button({ size: 'sm', iconLeft: Icon('plus', 15), children: 'Pequeno' }), ds.Button({ iconRight: Icon('arrow-up-right', 16), children: 'Médio' }), ds.Button({ size: 'lg', children: 'Grande' })]; } },
            { rotulo: 'Estados (primary)', render: function () { return [estado('default', ds.Button({ children: 'Salvar' })), estado('hover', forcar(ds.Button({ children: 'Salvar' }), 'is-hover')), estado('active', forcar(ds.Button({ children: 'Salvar' }), 'is-active')), estado('focus', forcar(ds.Button({ children: 'Salvar' }), 'is-focus')), estado('disabled', ds.Button({ disabled: true, children: 'Salvar' })), estado('loading', ds.Button({ loading: true, children: 'Salvando' }))]; } },
            { rotulo: 'Estados (secondary)', render: function () { return [estado('default', ds.Button({ variant: 'secondary', children: 'Exportar' })), estado('hover', forcar(ds.Button({ variant: 'secondary', children: 'Exportar' }), 'is-hover')), estado('focus', forcar(ds.Button({ variant: 'secondary', children: 'Exportar' }), 'is-focus')), estado('disabled', ds.Button({ variant: 'secondary', disabled: true, children: 'Exportar' })), estado('loading', ds.Button({ variant: 'secondary', loading: true, children: 'Gerando' }))]; } },
            { rotulo: 'Largura total (mobile)', coluna: true, render: function () { return ds.Button({ size: 'lg', fullWidth: true, children: 'Gerar arquivo' }); } }
        ]
    },
    {
        id: 'iconbutton', grupo: 'Ações', titulo: 'IconButton', componentes: ['IconButton'], descricao: 'Ação só com ícone; 4 tons, 3 tamanhos, estado ativo (selecionado).',
        demos: [
            { rotulo: 'Tons', render: function () { return /** @type {Node[]} */ (['neutral', 'surface', 'brand'].map(function (t) { return ds.IconButton({ tone: /** @type {any} */ (t), label: t, children: Icon('bell') }); })).concat([caixa('sc-surface ef-card--inverse', [ds.IconButton({ tone: 'inverse', label: 'inverse', children: Icon('bell') })])]); } },
            { rotulo: 'Tamanhos', render: function () { return ['sm', 'md', 'lg'].map(function (t) { return ds.IconButton({ tone: 'surface', size: /** @type {any} */ (t), label: t, children: Icon('sliders-horizontal', 16) }); }); } },
            { rotulo: 'Estados', render: function () { return [estado('default', ds.IconButton({ tone: 'surface', label: 'Filtrar', children: Icon('filter', 16) })), estado('hover', forcar(ds.IconButton({ tone: 'surface', label: 'Filtrar', children: Icon('filter', 16) }), 'is-hover')), estado('active', forcar(ds.IconButton({ tone: 'surface', label: 'Filtrar', children: Icon('filter', 16) }), 'is-active')), estado('focus', forcar(ds.IconButton({ tone: 'surface', label: 'Filtrar', children: Icon('filter', 16) }), 'is-focus')), estado('selecionado', ds.IconButton({ label: 'Filtrar', active: true, children: Icon('filter', 16) })), estado('disabled', ds.IconButton({ tone: 'surface', label: 'Filtrar', disabled: true, children: Icon('filter', 16) }))]; } }
        ]
    },
    {
        id: 'segmentedcontrol', grupo: 'Ações', titulo: 'SegmentedControl', componentes: ['SegmentedControl'], descricao: 'Seletor de período em pílula, rótulos mono. Clique ou use ← →.',
        demos: [
            { rotulo: 'md / sm', render: function () { return [ds.SegmentedControl({ options: ['1D', '1S', '1M', '3M', '1A', 'TUDO'], value: '1M' }), ds.SegmentedControl({ size: 'sm', options: ['1M', '3M', '1A', 'TUDO'], value: '3M' })]; } },
            { rotulo: 'Estados', render: function () { var s = ds.SegmentedControl({ options: [{ value: 'a', label: 'SELECIONADO' }, { value: 'b', label: 'HOVER' }, { value: 'c', label: 'FOCUS' }, { value: 'd', label: 'DESATIVADO', disabled: true }], value: 'a' }); var itens = s.querySelectorAll('.ef-segmented__item'); itens[1].classList.add('is-hover'); itens[2].classList.add('is-focus'); return s; } },
            { rotulo: 'Largura total', coluna: true, render: function () { return ds.SegmentedControl({ fullWidth: true, size: 'sm', options: ['1D', '1S', '1M', '1A', 'TUDO'], value: 'TUDO' }); } }
        ]
    },
    // ── Formulários ───────────────────────────────────────────────
    {
        id: 'field', grupo: 'Formulários', titulo: 'Field', componentes: ['Field'], descricao: 'Rótulo micro-mono + dica ou erro. Erro substitui a dica e marca o controle como inválido.',
        demos: [{ rotulo: 'Dica · obrigatório · erro', grade: true, render: function () { return [ds.Field({ label: 'Nova senha', hint: 'Mínimo de 12 caracteres', children: ds.Input({ type: 'password' }) }), ds.Field({ label: 'Descrição', required: true, children: ds.Input({ placeholder: 'Ex.: Aluguel' }) }), ds.Field({ label: 'Data', error: 'Data anterior ao período selecionado', children: ds.Input({ mono: true, value: '31/12/2025' }) })]; } }]
    },
    {
        id: 'input', grupo: 'Formulários', titulo: 'Input', componentes: ['Input'], descricao: 'Texto e número; prefixo/sufixo, ícone, modo mono para dinheiro.',
        demos: [
            { rotulo: 'Tamanhos e adornos', grade: true, render: function () { return [ds.Input({ size: 'sm', placeholder: 'Pequeno' }), ds.Input({ mono: true, prefix: 'R$', value: '1.284,30' }), ds.Input({ size: 'lg', suffix: '%', mono: true, value: '1,49' }), ds.Input({ iconLeft: Icon('mail', 16), placeholder: 'E-mail' })]; } },
            { rotulo: 'Estados', grade: true, render: function () { return [estado('vazio', ds.Input({ placeholder: 'Descrição' })), estado('default', ds.Input({ value: 'Aluguel sede' })), estado('hover', forcar(ds.Input({ value: 'Aluguel sede' }), 'is-hover')), estado('focus', forcar(ds.Input({ value: 'Aluguel sede' }), 'is-focus')), estado('erro', ds.Input({ value: 'abc', invalid: true })), estado('disabled', ds.Input({ value: 'Somente leitura', disabled: true }))]; } }
        ]
    },
    {
        id: 'searchfield', grupo: 'Formulários', titulo: 'SearchField', componentes: ['SearchField'], descricao: 'Busca em pílula com atalho de teclado ("/" foca a busca).',
        demos: [{ rotulo: 'Estados', grade: true, render: function () { return [estado('default', ds.SearchField({ placeholder: 'Buscar lançamentos…', shortcut: null })), estado('hover', forcar(ds.SearchField({ placeholder: 'Buscar…', shortcut: null }), 'is-hover')), estado('focus', forcar(ds.SearchField({ placeholder: 'Buscar…', shortcut: null }), 'is-focus')), estado('com valor', ds.SearchField({ value: 'Orbit Labs', shortcut: null }))]; } }]
    },
    {
        id: 'select', grupo: 'Formulários', titulo: 'Select', componentes: ['Select'], descricao: 'Select nativo com chevron próprio.',
        demos: [{ rotulo: 'Estados', grade: true, render: function () { var opcoes = ['Este mês', 'Últimos 90 dias', 'Este ano']; return [estado('vazio', ds.Select({ options: opcoes, placeholder: 'Selecione o período' })), estado('default', ds.Select({ options: opcoes })), estado('hover', forcar(ds.Select({ options: opcoes }), 'is-hover')), estado('focus', forcar(ds.Select({ options: opcoes }), 'is-focus')), estado('erro', ds.Select({ options: opcoes, invalid: true })), estado('disabled', ds.Select({ options: opcoes, disabled: true })), estado('sm', ds.Select({ size: 'sm', options: opcoes })), estado('lg', ds.Select({ size: 'lg', options: opcoes }))]; } }]
    },
    {
        id: 'switch', grupo: 'Formulários', titulo: 'Switch', componentes: ['Switch'], descricao: 'Alternância de aplicação imediata.',
        demos: [{ rotulo: 'Estados', render: function () { return [estado('desligado', ds.Switch({ label: 'Resumo semanal' })), estado('ligado', ds.Switch({ checked: true, label: 'Resumo semanal' })), estado('hover', forcar(ds.Switch({ label: 'Hover' }), 'is-hover')), estado('focus', forcar(ds.Switch({ checked: true, label: 'Foco' }), 'is-focus')), estado('disabled', ds.Switch({ checked: true, disabled: true, label: 'Bloqueado' })), estado('com descrição', ds.Switch({ checked: true, label: 'Alertas de saldo', description: 'Avisar quando o caixa ficar abaixo de R$ 50.000.' }))]; } }]
    },
    {
        id: 'checkbox', grupo: 'Formulários', titulo: 'Checkbox', componentes: ['Checkbox'], descricao: 'Seleção múltipla, com estado indeterminado.',
        demos: [{ rotulo: 'Estados', render: function () { return [estado('vazio', ds.Checkbox({ label: 'WhatsApp' })), estado('marcado', ds.Checkbox({ checked: true, label: 'E-mail' })), estado('indeterminado', ds.Checkbox({ indeterminate: true, label: 'Todos' })), estado('hover', forcar(ds.Checkbox({ label: 'Hover' }), 'is-hover')), estado('focus', forcar(ds.Checkbox({ checked: true, label: 'Foco' }), 'is-focus')), estado('disabled', ds.Checkbox({ checked: true, disabled: true, label: 'Bloqueado' }))]; } }]
    },
    // ── Exibição de dados ────────────────────────────────────────
    {
        id: 'card', grupo: 'Exibição de dados', titulo: 'Card + CardHeader', componentes: ['Card', 'CardHeader'], descricao: 'A superfície de todo bloco; paddings, elevações, interativo, aurora, inverse, selecionado.',
        demos: [
            { rotulo: 'Variantes', grade: true, render: function () { return [ds.Card({ children: ds.CardHeader({ label: 'Padrão', title: 'Card', action: ds.IconButton({ label: 'Mais', children: Icon('more-horizontal', 16) }) }) }), ds.Card({ aurora: true, children: ds.CardHeader({ label: 'Aurora', title: 'Card de saldo' }) }), ds.Card({ inverse: true, children: ds.CardHeader({ label: 'Inverse', title: 'Recomendação' }) }), ds.Card({ padding: 'compact', elevation: 'flat', children: ds.CardHeader({ label: 'Compacto · flat', title: 'Mobile' }) }), ds.Card({ padding: 'roomy', elevation: 'raised', children: ds.CardHeader({ label: 'Roomy · raised', title: 'Destaque' }) }), ds.Card({ elevation: 'none', children: ds.CardHeader({ label: 'Sem sombra', title: 'Aninhado' }) })]; } },
            { rotulo: 'Estados (interativo)', grade: true, render: function () { return [estado('default', ds.Card({ interactive: true, onClick: function () {}, children: ds.CardHeader({ title: 'DRE gerencial' }) })), estado('hover', forcar(ds.Card({ interactive: true, children: ds.CardHeader({ title: 'DRE gerencial' }) }), 'is-hover')), estado('active', forcar(ds.Card({ interactive: true, children: ds.CardHeader({ title: 'DRE gerencial' }) }), 'is-active')), estado('focus', forcar(ds.Card({ interactive: true, children: ds.CardHeader({ title: 'DRE gerencial' }) }), 'is-focus')), estado('selecionado', ds.Card({ selected: true, children: ds.CardHeader({ title: 'DRE gerencial' }) }))]; } }
        ]
    },
    {
        id: 'statcard', grupo: 'Exibição de dados', titulo: 'StatCard', componentes: ['StatCard'], descricao: 'KPI: micro-rótulo, número mono, delta assinado, micro-gráfico.',
        demos: [{ rotulo: 'Variantes', grade: true, render: function () { return [ds.StatCard({ label: 'Saldo consolidado', value: 'R$ 1.284.309', delta: '18,4%', caption: 'vs. mês anterior', icon: Icon('wallet', 16), series: serie }), ds.StatCard({ label: 'Saídas do mês', value: 'R$ 312.877', delta: '6,2%', tone: 'negative', caption: '118 lançamentos', series: serie.slice().reverse(), seriesType: 'bars' }), ds.StatCard({ compact: true, label: 'Entradas', value: 'R$ 486k', delta: '9,1%', series: serieCurta }), estado('vazio (sem série)', ds.StatCard({ compact: true, label: 'Runway', value: '—', caption: 'Sem dados no período' }))]; } }]
    },
    {
        id: 'badge', grupo: 'Exibição de dados', titulo: 'Badge', componentes: ['Badge'], descricao: 'Status curto; 8 tons, ponto, mono, 2 tamanhos.',
        demos: [
            { rotulo: 'Tons', render: function () { return ['neutral', 'brand', 'positive', 'negative', 'warning', 'info', 'ai', 'solid'].map(function (t) { return ds.Badge({ tone: /** @type {any} */ (t), dot: true, children: t }); }); } },
            { rotulo: 'Mono e tamanhos', render: function () { return [ds.Badge({ tone: 'ai', mono: true, children: '96% CONFIANÇA' }), ds.Badge({ size: 'sm', children: '12' }), ds.Badge({ tone: 'positive', size: 'sm', dot: true, children: 'Conciliado' })]; } }
        ]
    },
    {
        id: 'tag', grupo: 'Exibição de dados', titulo: 'Tag', componentes: ['Tag'], descricao: 'Chip de filtro, removível. Clique alterna o selecionado.',
        demos: [{ rotulo: 'Estados', render: function () { var clique = function () {}; return [estado('estático', ds.Tag({ children: 'Setembro' })), estado('default', ds.Tag({ onClick: clique, children: 'Impostos' })), estado('hover', forcar(ds.Tag({ onClick: clique, children: 'Impostos' }), 'is-hover')), estado('active', forcar(ds.Tag({ onClick: clique, children: 'Impostos' }), 'is-active')), estado('focus', forcar(ds.Tag({ onClick: clique, children: 'Impostos' }), 'is-focus')), estado('selecionado', ds.Tag({ onClick: clique, active: true, children: 'Impostos' })), estado('removível', ds.Tag({ active: true, onRemove: function () {}, children: 'Nubank' })), estado('disabled', ds.Tag({ onClick: clique, disabled: true, children: 'Impostos' }))]; } }]
    },
    {
        id: 'avatar', grupo: 'Exibição de dados', titulo: 'Avatar + UserChip', componentes: ['Avatar', 'UserChip'], descricao: 'Usuário (iniciais ou foto) e o controle de conta do rail.',
        demos: [
            { rotulo: 'Tamanhos · anel · imagem', render: function () { return [ds.Avatar({ name: 'Ana Ribeiro', size: 'xs' }), ds.Avatar({ name: 'Ana Ribeiro', size: 'sm' }), ds.Avatar({ name: 'Ana Ribeiro' }), ds.Avatar({ name: 'Ana Ribeiro', size: 'lg', ring: true }), estado('imagem', ds.Avatar({ name: 'E-Financeiro', src: 'assets/logo-mark.png' })), estado('imagem quebrada → iniciais', ds.Avatar({ name: 'Bruno Costa', src: 'data:image/png;base64,invalida' }))]; } },
            { rotulo: 'UserChip', grade: true, render: function () { return [estado('estático', ds.UserChip({ name: 'Ana Ribeiro', meta: 'Plano Premium' })), estado('clicável', ds.UserChip({ name: 'Ana Ribeiro', meta: 'Plano Premium', trailing: Icon('chevron-down', 16), onClick: function () {} })), estado('hover', forcar(ds.UserChip({ name: 'Ana Ribeiro', meta: 'Plano Premium', onClick: function () {} }), 'is-hover')), estado('focus', forcar(ds.UserChip({ name: 'Ana Ribeiro', meta: 'Plano Premium', onClick: function () {} }), 'is-focus'))]; } }
        ]
    },
    {
        id: 'insightcard', grupo: 'Exibição de dados', titulo: 'InsightCard', componentes: ['InsightCard'], descricao: 'Saída de IA com confiança e link-out.',
        demos: [{ rotulo: 'Tons e estados do link', grade: true, render: function () { return [ds.InsightCard({ body: 'Assinaturas de software cresceram 22% em três meses. Consolidar licenças pode devolver R$ 3.180 por mês ao caixa.', confidence: '94%', onAction: function () {} }), ds.InsightCard({ label: 'Alerta IA', tone: 'warning', title: 'DARF vencido', body: 'O DARF de setembro venceu há 7 dias. A multa projetada chega a R$ 1.484.', confidence: '99%', actionLabel: 'Pagar agora', onAction: function () {} }), forcar(ds.InsightCard({ label: 'Meta', tone: 'positive', body: 'Reserva de emergência chegou a 90% do objetivo.', actionLabel: 'Ver meta (hover)', onAction: function () {} }), 'is-hover', '.ef-insight__action'), forcar(ds.InsightCard({ body: 'Sem ação: apenas informativo.', actionLabel: 'Foco', onAction: function () {} }), 'is-focus', '.ef-insight__action')]; } }]
    },
    {
        id: 'datatable', grupo: 'Exibição de dados', titulo: 'DataTable', componentes: ['DataTable'], descricao: 'Tabela sem bordas, cabeçalho mono, hover afundado; vira ListRow no mobile.',
        demos: [
            { rotulo: 'Clicável · estados de linha', coluna: true, render: function () { var tabela = ds.DataTable({ selectedIndex: 3, onRowClick: function () {}, columns: [{ key: 'desc', header: 'Lançamento' }, { key: 'estado', header: 'Estado da linha' }, { key: 'data', header: 'Data', mono: true }, { key: 'valor', header: 'Valor', mono: true, align: 'right' }], rows: [{ desc: 'Mensalidade — Vega', estado: 'default', data: '22/09/2026', valor: '+ R$ 48.000,00' }, { desc: 'Folha de pagamento', estado: 'hover', data: '20/09/2026', valor: '− R$ 186.400,00' }, { desc: 'AWS — infraestrutura', estado: 'focus', data: '19/09/2026', valor: '− R$ 22.318,44' }, { desc: 'Consultoria Orbit Labs', estado: 'selecionado', data: '18/09/2026', valor: '+ R$ 96.500,00' }] }); var linhas = tabela.querySelectorAll('.ef-table__row'); linhas[1].classList.add('is-hover'); linhas[2].classList.add('is-focus'); return ds.Card({ padding: 'none', children: tabela }); } },
            { rotulo: 'Denso', coluna: true, render: function () { return ds.Card({ padding: 'none', children: ds.DataTable({ dense: true, columns: [{ key: 'linha', header: 'Linha' }, { key: 'set', header: 'Setembro', mono: true, align: 'right' }], rows: [{ linha: 'Receita bruta', set: 'R$ 486.220' }, { linha: 'Receita líquida', set: 'R$ 412.010' }] }) }); } },
            { rotulo: 'Vazio', coluna: true, render: function () { return ds.Card({ padding: 'none', children: ds.DataTable({ columns: [{ key: 'desc', header: 'Lançamento' }, { key: 'valor', header: 'Valor', align: 'right' }], rows: [], emptyTitle: 'Nenhum lançamento neste período', emptyDescription: 'Ajuste o filtro de datas ou importe um extrato OFX.' }) }); } }
        ]
    },
    {
        id: 'listrow', grupo: 'Exibição de dados', titulo: 'ListRow + IconTile', componentes: ['ListRow', 'IconTile'], descricao: 'A linha de lista (todo o mobile) e o tile de ícone tonal.',
        demos: [
            { rotulo: 'Estados', coluna: true, render: function () { var tile = function () { return ds.IconTile({ tone: 'brand', children: Icon('building-2', 16) }); }; var clique = function () {}; return ds.Card({ padding: 'none', children: [ds.ListRow({ leading: tile(), title: 'Estático · Conta corrente', subtitle: 'AG 0234 · CC 18402-1', value: 'R$ 412.880,10', delta: '+2,4%' }), ds.ListRow({ leading: tile(), title: 'Clicável · default', subtitle: 'CC 99213-4', value: 'R$ 208.114,55', delta: '+0,9%', trailing: ds.Sparkline({ data: serieCurta, width: 80, height: 26 }), onClick: clique }), forcar(ds.ListRow({ leading: tile(), title: 'Hover', subtitle: 'LIQUIDEZ D+1', value: 'R$ 540.000,00', onClick: clique }), 'is-hover'), forcar(ds.ListRow({ leading: tile(), title: 'Active', subtitle: 'PRESS', value: 'R$ 1,00', onClick: clique }), 'is-active'), forcar(ds.ListRow({ leading: tile(), title: 'Focus', subtitle: 'TECLADO', value: 'R$ 1,00', onClick: clique }), 'is-focus'), ds.ListRow({ leading: tile(), title: 'Selecionado', subtitle: 'MESTRE-DETALHE', value: 'R$ 1,00', selected: true, onClick: clique }), ds.ListRow({ leading: ds.IconTile({ tone: 'negative', children: Icon('credit-card', 16) }), title: 'Negativo', subtitle: 'FINAL 4821', value: '− R$ 46.412,90', delta: '−8,2%', tone: 'negative', trailing: ds.Badge({ size: 'sm', tone: 'warning', dot: true, children: 'Pendente' }), onClick: clique }), ds.ListRow({ leading: tile(), title: 'Desativado', subtitle: 'SEM ACESSO', disabled: true, divider: false, onClick: clique })] }); } },
            { rotulo: 'IconTile · tons', render: function () { return ['neutral', 'brand', 'positive', 'negative', 'warning', 'ai'].map(function (t) { return estado(t, ds.IconTile({ tone: /** @type {any} */ (t), children: Icon('wallet', 16) })); }).concat([estado('size 42', ds.IconTile({ tone: 'brand', size: 42, children: Icon('landmark', 19) }))]); } }
        ]
    },
    // ── Gráficos ──────────────────────────────────────────────────
    {
        id: 'sparkline', grupo: 'Gráficos', titulo: 'Sparkline', componentes: ['Sparkline'], descricao: 'Tendência em escala de linha/card.',
        demos: [{ rotulo: 'Tons · sem preenchimento · ponto · vazio', render: function () { return ['positive', 'negative', 'brand', 'violet'].map(function (t) { return estado(t, ds.Sparkline({ data: serieCurta, tone: /** @type {any} */ (t), dot: true })); }).concat([estado('fill=false', ds.Sparkline({ data: serieCurta, fill: false })), estado('vazio', ds.Sparkline({ data: [] }))]); } }]
    },
    {
        id: 'areachart', grupo: 'Gráficos', titulo: 'AreaChart', componentes: ['AreaChart'], descricao: 'Gráfico principal de desempenho, uma série; redesenha na largura do contêiner.',
        demos: [
            { rotulo: 'positive', coluna: true, render: function () { return ds.AreaChart({ data: serie, height: 200, xLabels: ['1 SET', '8 SET', '15 SET', '22 SET', '29 SET'], formatY: function (v) { return (v / 1000).toFixed(1) + 'M'; } }); } },
            { rotulo: 'violet · sem grade', coluna: true, render: function () { return ds.AreaChart({ data: serie.slice(0, 20), tone: 'violet', grid: false, height: 140, xLabels: ['OUT', 'DEZ', 'FEV'] }); } },
            { rotulo: 'vazio', coluna: true, render: function () { return ds.AreaChart({ data: [1], height: 120 }); } }
        ]
    },
    {
        id: 'donutchart', grupo: 'Gráficos', titulo: 'DonutChart + DonutLegend', componentes: ['DonutChart', 'DonutLegend'], descricao: 'Anel de alocação com aurora e legenda.',
        demos: [{ rotulo: 'Com aurora · sem aurora · vazio', render: function () { return [caixa('ef-row', [ds.DonutChart({ data: alocacao, size: 168, thickness: 13, centerLabel: 'Total', centerValue: 'R$ 4,22M' }), ds.DonutLegend({ data: alocacao.map(function (a) { return Object.assign({}, a, { precise: true }); }) })]), estado('aurora=false', ds.DonutChart({ data: alocacao, size: 120, thickness: 10, aurora: false, centerValue: '4,22M' })), estado('vazio', ds.DonutChart({ data: [], size: 120, thickness: 10 }))]; } }]
    },
    {
        id: 'scoregauge', grupo: 'Gráficos', titulo: 'ScoreGauge', componentes: ['ScoreGauge'], descricao: 'Arco de 270° para um score composto.',
        demos: [{ rotulo: 'Tons', render: function () { return [ds.ScoreGauge({ value: 78, label: '/100', caption: 'boa', tone: 'positive' }), ds.ScoreGauge({ value: 64, label: '/100', caption: 'marca', size: 140 }), ds.ScoreGauge({ value: 41, label: '/100', caption: 'atenção', tone: 'warning', size: 140 }), ds.ScoreGauge({ value: 12, label: '/100', caption: 'crítico', tone: 'negative', size: 140 })]; } }]
    },
    {
        id: 'barticks', grupo: 'Gráficos', titulo: 'BarTicks', componentes: ['BarTicks'], descricao: 'Faixa de micro-barras na base de cards de KPI.',
        demos: [{ rotulo: 'Tons', grade: true, render: function () { return ['positive', 'brand', 'violet', 'blue', 'negative'].map(function (t) { return estado(t, caixa('sc-surface', [ds.BarTicks({ data: serie, tone: /** @type {any} */ (t) })])); }); } }]
    },
    // ── Navegação ─────────────────────────────────────────────────
    {
        id: 'sidebarnav', grupo: 'Navegação', titulo: 'SidebarNav + NavItem', componentes: ['SidebarNav', 'NavItem'], descricao: 'Rail primário do desktop: expandido e recolhido; item ativo com barra teal.',
        demos: [
            { rotulo: 'Expandido · recolhido', render: function () { var itens = function () { return [{ id: 'a', label: 'Visão geral', icon: Icon('layout-dashboard') }, { id: 'b', label: 'Transações', icon: Icon('arrow-left-right'), badge: ds.Badge({ size: 'sm', children: '12' }) }, { id: 'c', label: 'Contas', icon: Icon('wallet') }, { id: 'd', label: 'Relatórios', icon: Icon('file-text'), disabled: true }]; }; var logo = document.createElement('img'); logo.src = 'assets/logo-lockup.png'; logo.alt = 'E-Financeiro'; logo.className = 'ef-shell__logo'; var marca = document.createElement('img'); marca.src = 'assets/logo-mark.png'; marca.alt = 'E-Financeiro'; marca.className = 'ef-shell__mark'; return [caixa('sc-fixed-h', [ds.SidebarNav({ logo: logo, items: itens(), active: 'a', footer: ds.UserChip({ name: 'Ana Ribeiro', meta: 'Plano Premium', onClick: function () {} }) })]), caixa('sc-fixed-h', [ds.SidebarNav({ collapsed: true, logo: marca, items: itens(), active: 'b' })])]; } },
            { rotulo: 'NavItem · estados', coluna: true, render: function () { return caixa('sc-surface ef-stack ef-stack--flush', [estado('default', ds.NavItem({ id: '1', label: 'Contas', icon: Icon('wallet') })), estado('hover', forcar(ds.NavItem({ id: '2', label: 'Contas', icon: Icon('wallet') }), 'is-hover')), estado('active', forcar(ds.NavItem({ id: '3', label: 'Contas', icon: Icon('wallet') }), 'is-active')), estado('focus', forcar(ds.NavItem({ id: '4', label: 'Contas', icon: Icon('wallet') }), 'is-focus')), estado('selecionado', ds.NavItem({ id: '5', label: 'Contas', icon: Icon('wallet'), active: true })), estado('disabled', ds.NavItem({ id: '6', label: 'Contas', icon: Icon('wallet'), disabled: true }))]); } }
        ]
    },
    {
        id: 'topbar', grupo: 'Navegação', titulo: 'TopBar', componentes: ['TopBar'], descricao: 'Cabeçalho fixo de vidro; compact = app bar mobile.',
        demos: [{ rotulo: 'Desktop · compacto', coluna: true, render: function () { return [ds.TopBar({ sticky: false, breadcrumb: 'Visão geral', title: 'Painel financeiro', search: ds.SearchField({ width: 240 }), actions: [ds.Button({ size: 'sm', iconLeft: Icon('plus', 15), children: 'Novo lançamento' }), ds.IconButton({ tone: 'surface', label: 'Alertas', children: Icon('bell') })] }), ds.TopBar({ sticky: false, compact: true, breadcrumb: 'Ribeiro & Co.', title: 'Início', subtitle: 'Atualizado agora', actions: ds.IconButton({ tone: 'surface', size: 'lg', label: 'Buscar', children: Icon('search') }) })]; } }]
    },
    {
        id: 'tabs', grupo: 'Navegação', titulo: 'Tabs', componentes: ['Tabs'], descricao: 'Abas sublinhadas; ← → movem a seleção.',
        demos: [{ rotulo: 'Selecionado · contagem · hover · foco · disabled', coluna: true, render: function () { var abas = ds.Tabs({ value: 'todas', items: [{ value: 'todas', label: 'Todas', count: 8 }, { value: 'entradas', label: 'Hover', count: 3 }, { value: 'saidas', label: 'Foco', count: 5 }, { value: 'x', label: 'Desativada', disabled: true }] }); var itens = abas.querySelectorAll('.ef-tabs__item'); itens[1].classList.add('is-hover'); itens[2].classList.add('is-focus'); return abas; } }]
    },
    {
        id: 'tabbar', grupo: 'Navegação', titulo: 'TabBar', componentes: ['TabBar'], descricao: 'Navegação inferior do mobile (até 5 itens).',
        demos: [{ rotulo: 'Selecionado · hover · foco', coluna: true, render: function () { var barra = ds.TabBar({ active: 'home', items: [{ id: 'home', label: 'Início', icon: Icon('home') }, { id: 'extrato', label: 'Hover', icon: Icon('arrow-left-right') }, { id: 'insights', label: 'Foco', icon: Icon('sparkles') }, { id: 'metas', label: 'Metas', icon: Icon('target') }, { id: 'mais', label: 'Mais', icon: Icon('more-horizontal') }] }); var itens = barra.querySelectorAll('.ef-tabbar__item'); itens[1].classList.add('is-hover'); itens[2].classList.add('is-focus'); return caixa('sc-surface', [barra]); } }]
    },
    // ── Feedback ──────────────────────────────────────────────────
    {
        id: 'progressbar', grupo: 'Feedback', titulo: 'ProgressBar', componentes: ['ProgressBar'], descricao: 'Orçamento, meta, confiança (pontilhado).',
        demos: [{ rotulo: 'Tons · pontilhado · vazio · estourado', coluna: true, render: function () { return [ds.ProgressBar({ label: 'Pessoal', valueLabel: 'R$ 186.400 / R$ 210.000', value: 89, tone: 'warning' }), ds.ProgressBar({ label: 'Ferramentas', valueLabel: '41%', value: 41 }), ds.ProgressBar({ label: 'Reserva', valueLabel: '100%', value: 100, tone: 'positive' }), ds.ProgressBar({ label: 'Marketing (estourado)', valueLabel: '129%', value: 129, tone: 'negative' }), ds.ProgressBar({ label: 'Confiança do modelo', valueLabel: '91%', value: 91, tone: 'ai', dotted: true }), ds.ProgressBar({ label: 'Vazio', valueLabel: '0%', value: 0 })]; } }]
    },
    {
        id: 'dialog', grupo: 'Feedback', titulo: 'Dialog', componentes: ['Dialog'], descricao: 'Modal centralizado sobre scrim desfocado; posicionamento sheet (mobile) herdado do UI kit.',
        demos: [
            { rotulo: 'Centro (inline para documentação)', coluna: true, render: function () { return ds.Dialog({ open: true, inline: true, title: 'Excluir conta', description: 'Isso exclui a conta e todas as transações vinculadas a ela, permanentemente.', children: ds.Field({ label: 'Sua senha', children: ds.Input({ type: 'password' }) }), footer: [ds.Button({ variant: 'secondary', children: 'Cancelar' }), ds.Button({ variant: 'danger', children: 'Excluir conta' })] }); } },
            { rotulo: 'Sheet (inline)', coluna: true, render: function () { return ds.Dialog({ open: true, inline: true, placement: 'sheet', title: 'Consultoria Orbit Labs', description: 'Serviços · Nubank', footer: [ds.Button({ variant: 'secondary', size: 'lg', fullWidth: true, children: 'Fechar' }), ds.Button({ size: 'lg', fullWidth: true, children: 'Conciliar' })] }); } },
            { rotulo: 'Abrir de verdade (Esc, X ou scrim fecham)', render: function () { return ['center', 'auto', 'sheet'].map(function (p) { var janela = ds.Dialog({ open: false, placement: /** @type {any} */ (p), title: 'Exportar relatório', description: 'Placement "' + p + '".', children: ds.Field({ label: 'Formato', children: ds.Select({ options: ['PDF', 'XLSX', 'CSV'] }) }), footer: [ds.Button({ variant: 'secondary', children: 'Cancelar', onClick: function () { janela.fechar(); } }), ds.Button({ children: 'Gerar arquivo', onClick: function () { janela.fechar(); } })] }); document.body.append(janela); return ds.Button({ variant: 'secondary', size: 'sm', children: 'placement: ' + p, onClick: function () { janela.abrir(); } }); }); } }
        ]
    },
    {
        id: 'toast', grupo: 'Feedback', titulo: 'Toast', componentes: ['Toast'], descricao: 'Notificação navy transitória.',
        demos: [
            { rotulo: 'Tons', coluna: true, render: function () { return ['neutral', 'positive', 'negative', 'warning', 'ai'].map(function (t) { return ds.Toast({ tone: /** @type {any} */ (t), title: 'Tom ' + t, message: 'Mensagem de apoio curta.', onClose: function () {} }); }); } },
            { rotulo: 'Com ação · disparar', render: function () { var desfazer = document.createElement('button'); desfazer.type = 'button'; desfazer.className = 'ef-toast__action'; desfazer.textContent = 'Desfazer'; return [ds.Toast({ title: 'Lançamento excluído', action: desfazer, onClose: function () {} }), ds.Button({ variant: 'secondary', size: 'sm', children: 'Exibir toast', onClick: function () { ds.exibirToast({ tone: 'positive', title: 'Preferências salvas', message: 'As alterações já valem para toda a equipe.' }); } })]; } }
        ]
    },
    {
        id: 'emptystate', grupo: 'Feedback', titulo: 'EmptyState', componentes: ['EmptyState'], descricao: 'Placeholder de lista vazia: explica e oferece uma saída.',
        demos: [{ rotulo: 'Padrão · compacto', grade: true, render: function () { return [ds.Card({ padding: 'none', children: ds.EmptyState({ icon: Icon('receipt', 20), title: 'Nenhum lançamento neste período', description: 'Ajuste o filtro de datas ou importe um extrato OFX.', action: ds.Button({ size: 'sm', variant: 'secondary', children: 'Limpar filtros' }) }) }), ds.Card({ padding: 'none', children: ds.EmptyState({ compact: true, icon: Icon('credit-card', 20), title: 'Nenhum cartão cadastrado', description: 'Cadastre um cartão para acompanhar o gasto do mês.' }) })]; } }]
    },
    // ── Padrões ───────────────────────────────────────────────────
    {
        id: 'padroes', grupo: 'Padrões', titulo: 'Grid e SectionTitle', descricao: 'Padrões de composição do Shell do UI kit. O AppShell completo está nos templates.',
        demos: [{ rotulo: 'Grid auto-fit + SectionTitle', coluna: true, render: function () { return [SectionTitle({ children: 'Contas e carteiras', action: ds.Button({ variant: 'ghost', size: 'sm', iconRight: Icon('chevron-right', 14), children: 'Ver contas' }) }), Grid({ min: 160, children: [1, 2, 3].map(function (n) { return ds.StatCard({ compact: true, label: 'KPI ' + n, value: 'R$ ' + n + '00k', delta: n + ',0%' }); }) })]; } }]
    }
];

/**
 * Renderiza uma demo dentro de um painel.
 *
 * @param {Demo} demo
 * @returns {HTMLDivElement}
 */
function montarDemo(demo) {
    var rotulo = document.createElement('span');
    rotulo.className = 'sc-demo__label';
    rotulo.textContent = demo.rotulo;
    var corpo = document.createElement('div');
    corpo.className = 'sc-demo__body' + (demo.coluna ? ' sc-demo__body--col' : '') + (demo.grade ? ' sc-demo__body--grid' : '');
    var conteudo = demo.render();
    corpo.append.apply(corpo, Array.isArray(conteudo) ? conteudo : [conteudo]);
    return caixa('sc-demo', [rotulo, corpo]);
}

/**
 * @param {'claro' | 'escuro'} tema
 * @param {Demo[]} demos
 * @returns {HTMLDivElement}
 */
function montarPainel(tema, demos) {
    var painel = caixa('sc-panel', [mono(tema === 'escuro' ? 'Tema escuro' : 'Tema claro')]);

    if (tema === 'escuro') {
        painel.setAttribute('data-theme', 'dark');
    } else {
        painel.setAttribute('data-theme', 'light');
    }

    demos.forEach(function (demo) { painel.append(montarDemo(demo)); });
    return painel;
}

var grupoAtual = '';
var totalComponentes = 0;

SECOES.forEach(function (secao) {
    if (secao.grupo !== grupoAtual) {
        grupoAtual = secao.grupo;
        var cabecalhoGrupo = document.createElement('div');
        cabecalhoGrupo.className = 'sc-toc__group';
        cabecalhoGrupo.textContent = secao.grupo;
        indice.append(cabecalhoGrupo);
    }

    var link = document.createElement('a');
    link.href = '#' + secao.id;
    link.textContent = secao.titulo;
    indice.append(link);

    var cabecalho = document.createElement('header');
    cabecalho.className = 'sc-section__head';
    cabecalho.innerHTML = '<span class="sc-section__kicker"></span><h2 class="sc-section__title"></h2><p class="sc-section__desc"></p>';
    /** @type {HTMLElement} */ (cabecalho.children[0]).textContent = secao.grupo;
    /** @type {HTMLElement} */ (cabecalho.children[1]).textContent = secao.titulo;
    /** @type {HTMLElement} */ (cabecalho.children[2]).textContent = secao.descricao;

    if (secao.componentes) {
        totalComponentes += secao.componentes.length;
        var meta = document.createElement('span');
        meta.className = 'sc-section__meta';
        meta.textContent = 'import { ' + secao.componentes.join(', ') + " } from 'design-system/components/index.js'";
        cabecalho.append(meta);
    }

    var bloco = document.createElement('section');
    bloco.className = 'sc-section';
    bloco.id = secao.id;
    bloco.append(cabecalho, caixa('sc-themes', [montarPainel('claro', secao.demos), montarPainel('escuro', secao.demos)]));
    raiz.append(bloco);
});

var contador = document.getElementById('contador');

if (contador) {
    contador.textContent = totalComponentes + ' componentes · ' + SECOES.length + ' seções · claro e escuro lado a lado';
}

document.documentElement.setAttribute('data-showcase-pronto', String(totalComponentes));
renderizarIcones();
