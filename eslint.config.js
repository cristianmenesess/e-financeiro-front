// Configuração de lint do projeto (ESLint flat config).
//
// A parte "aderência ao design system" é a tradução do _adherence.oxlintrc.json
// que veio no dump do Claude Design (oxlint não implementa no-restricted-syntax,
// então a regra foi trazida para o ESLint). As regras são as mesmas; só mudou o
// alvo: em vez de elementos JSX (<Button variant=…>), valida as chamadas das
// fábricas do design system (Button({ variant: … })).
import js from '@eslint/js';
import globals from 'globals';

/**
 * Props aceitas por componente (contrato do dump + props de DOM desta stack) e
 * valores permitidos por prop enumerada. Mantenha em sincronia com os JSDoc de
 * design-system/components/** — o typecheck cobre o próprio design system; este
 * mapa cobre quem consome.
 */
var COMPONENTES = {
    AreaChart: { props: 'data|width|height|tone|xLabels|yTicks|formatY|grid', enums: { tone: 'positive|negative|brand|violet' } },
    Avatar: { props: 'src|name|size|ring', enums: { size: 'xs|sm|md|lg' } },
    UserChip: { props: 'src|name|meta|trailing|onClick' },
    Badge: { props: 'children|tone|dot|mono|size', enums: { tone: 'neutral|brand|positive|negative|warning|info|ai|solid', size: 'sm|md' } },
    BarTicks: { props: 'data|height|gap|tone', enums: { tone: 'positive|brand|violet|blue|negative' } },
    Button: { props: 'children|variant|size|iconLeft|iconRight|fullWidth|disabled|loading|type|onClick', enums: { variant: 'primary|dark|success|secondary|ghost|danger', size: 'sm|md|lg' } },
    Card: { props: 'children|padding|elevation|interactive|aurora|inverse|selected|onClick', enums: { padding: 'none|compact|default|roomy', elevation: 'none|flat|card|raised' } },
    CardHeader: { props: 'label|title|action' },
    Checkbox: { props: 'checked|indeterminate|onChange|label|disabled|name|value' },
    DataTable: { props: 'columns|rows|onRowClick|dense|selectedIndex|emptyTitle|emptyDescription' },
    Dialog: { props: 'open|onClose|title|description|children|footer|width|placement|inline', enums: { placement: 'center|sheet|auto' } },
    DonutChart: { props: 'data|size|thickness|centerLabel|centerValue|aurora' },
    DonutLegend: { props: 'data' },
    EmptyState: { props: 'icon|title|description|action|compact' },
    Field: { props: 'label|hint|error|required|htmlFor|children' },
    IconButton: { props: 'children|label|tone|size|active|disabled|onClick', enums: { tone: 'neutral|surface|brand|inverse', size: 'sm|md|lg' } },
    IconTile: { props: 'children|tone|size', enums: { tone: 'neutral|brand|positive|negative|warning|ai' } },
    Input: { props: 'prefix|suffix|iconLeft|invalid|mono|size|disabled|id|name|type|value|placeholder|inputMode|autocomplete|required|readOnly|min|max|step|onInput|onChange', enums: { size: 'sm|md|lg' } },
    InsightCard: { props: 'label|title|body|confidence|actionLabel|onAction|tone', enums: { tone: 'ai|warning|positive' } },
    ListRow: { props: 'leading|title|subtitle|value|delta|tone|trailing|onClick|divider|selected|disabled', enums: { tone: 'positive|negative' } },
    NavItem: { props: 'id|label|icon|badge|href|disabled|active|collapsed|onClick' },
    ProgressBar: { props: 'value|max|tone|label|valueLabel|dotted|height', enums: { tone: 'brand|positive|warning|negative|ai' } },
    ScoreGauge: { props: 'value|max|size|label|caption|tone', enums: { tone: 'brand|positive|warning|negative' } },
    SearchField: { props: 'placeholder|value|onChange|width|shortcut' },
    SegmentedControl: { props: 'options|value|onChange|size|fullWidth', enums: { size: 'sm|md' } },
    Select: { props: 'options|value|onChange|size|invalid|disabled|id|name|placeholder', enums: { size: 'sm|md|lg' } },
    SidebarNav: { props: 'logo|items|active|onSelect|footer|collapsed' },
    Sparkline: { props: 'data|width|height|tone|fill|dot|strokeWidth', enums: { tone: 'positive|negative|brand|violet' } },
    StatCard: { props: 'label|value|delta|deltaLabel|caption|icon|series|seriesType|tone|compact', enums: { seriesType: 'spark|bars', tone: 'positive|negative' } },
    Switch: { props: 'checked|onChange|label|description|disabled' },
    TabBar: { props: 'items|active|onSelect' },
    Tabs: { props: 'items|value|onChange' },
    Tag: { props: 'children|onRemove|active|onClick|disabled' },
    Toast: { props: 'title|message|tone|action|onClose', enums: { tone: 'neutral|positive|negative|warning|ai' } },
    TopBar: { props: 'title|subtitle|breadcrumb|actions|search|sticky|compact' }
};

/** Props comuns a todo componente (o dump permitia key|ref|className|style|children). */
var COMUNS = 'className|style|attrs|children';

/** Gera os seletores de no-restricted-syntax para chamadas diretas e via namespace (ds.Button). */
function regrasDeComponente() {
    var regras = [];

    Object.keys(COMPONENTES).forEach(function (nome) {
        var definicao = COMPONENTES[nome];
        var chamadas = ["CallExpression[callee.name='" + nome + "']", "CallExpression[callee.property.name='" + nome + "']"];

        chamadas.forEach(function (chamada) {
            regras.push({
                selector: chamada + ' > ObjectExpression > Property[key.name!=/^(?:' + definicao.props + '|' + COMUNS + ')$/]',
                message: nome + '() não aceita essa prop. Props declaradas: ' + definicao.props.split('|').join(', ') + '.'
            });

            Object.keys(definicao.enums || {}).forEach(function (prop) {
                regras.push({
                    selector: chamada + " > ObjectExpression > Property[key.name='" + prop + "'] > Literal[value!=/^(?:" + definicao.enums[prop] + ')$/]',
                    message: nome + '() ' + prop + " deve ser um de: '" + definicao.enums[prop].split('|').join("' | '") + "'."
                });
            });
        });
    });

    return regras;
}

/** Regras de valor cru do dump (hex, px, fonte fora do sistema). */
var REGRAS_DE_VALOR = [
    { selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]', message: 'Cor hex crua — use um token de cor do design system via var().' },
    { selector: 'Literal[value=/\\b\\d+px\\b/]', message: 'Valor em px cru — use um token de espaçamento/tamanho do design system via var().' },
    { selector: "Literal[value=/font-family\\s*:\\s*(?!['\\\"]?(?:Manrope|JetBrains Mono))/i]", message: 'Fonte fora do design system. Disponíveis: Manrope, JetBrains Mono.' }
];

var FAMILIAS = ['actions', 'charts', 'data-display', 'feedback', 'forms', 'navigation'];

export default [
    {
        ignores: [
            'node_modules/**'
        ]
    },
    js.configs.recommended,
    {
        // Scripts clássicos das telas do app (jQuery, sem módulos).
        files: ['assets/js/**/*.js'],
        languageOptions: {
            sourceType: 'script',
            globals: Object.assign({}, globals.browser, globals.jquery, { Chart: 'readonly' })
        },
        rules: {
            // As telas criam a instância no topo do arquivo e só a usam dentro dela.
            'no-unused-vars': ['error', { vars: 'local', args: 'none', caughtErrors: 'none' }]
        }
    },
    {
        files: ['sw.js'],
        languageOptions: { sourceType: 'script', globals: globals.serviceworker }
    },
    {
        files: ['design-system/**/*.js'],
        languageOptions: { sourceType: 'module', globals: globals.browser },
        rules: { 'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }] }
    },
    {
        files: ['*.config.js'],
        languageOptions: { sourceType: 'module', globals: globals.node }
    },
    {
        // Aderência ao design system — vale para todo JS de tela e do próprio sistema.
        files: ['assets/js/**/*.js', 'design-system/**/*.js'],
        rules: {
            'no-restricted-syntax': ['error'].concat(REGRAS_DE_VALOR, regrasDeComponente()),
            'no-restricted-imports': ['error', {
                patterns: [{
                    group: FAMILIAS.map(function (f) { return '**/components/' + f + '/**'; }),
                    message: "Importe componentes do design system por 'design-system/components/index.js', não pelos arquivos internos."
                }]
            }]
        }
    },
    {
        // Dentro da biblioteca, componentes podem se importar diretamente (o dump desligava a regra no index.js).
        files: ['design-system/components/**/*.js'],
        rules: { 'no-restricted-imports': 'off' }
    }
];
