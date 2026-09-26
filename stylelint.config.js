// Aderência ao design system no CSS (complemento das regras de valor cru do
// eslint.config.js, que vieram do _adherence.oxlintrc.json do dump).
// Fora de design-system/tokens/, cor, fonte, tamanho de fonte, espaçamento e raio
// só entram por var(--token). Os tokens em si são a única fonte de valores crus.

/** Propriedades que precisam vir de token. */
var PROPRIEDADES_COM_TOKEN = [
    'color',
    'background-color',
    'border-color',
    '/^border-(top|right|bottom|left)-color$/',
    'outline-color',
    'fill',
    'stroke',
    'stop-color',
    'font-family',
    'font-size',
    'border-radius',
    '/^padding/',
    '/^margin/',
    'gap',
    'row-gap',
    'column-gap'
];

/** Valores neutros que não precisam de token. */
var VALORES_LIVRES = [
    '0',
    'auto',
    'inherit',
    'initial',
    'unset',
    'none',
    'transparent',
    'currentcolor',
    'currentColor',
    '/^-?\\d+(\\.\\d+)?%$/',
    '/^0 auto$/'
];

export default {
    plugins: ['stylelint-declaration-strict-value'],
    ignoreFiles: ['node_modules/**'],
    rules: {
        'color-no-hex': [true, { message: 'Cor hex crua — use um token de cor do design system via var().' }],
        'color-named': ['never', { message: 'Cor nomeada — use um token de cor do design system via var().' }],
        'function-disallowed-list': [['rgb', 'rgba', 'hsl', 'hsla'], { message: 'Cor funcional crua — use um token de cor do design system via var().' }],
        'scale-unlimited/declaration-strict-value': [PROPRIEDADES_COM_TOKEN, {
            ignoreValues: VALORES_LIVRES,
            ignoreFunctions: true,
            expandShorthand: false,
            message: 'Use um token do design system via var() em "${property}" (valor atual: "${value}").'
        }]
    },
    overrides: [
        {
            // Os tokens são onde os valores crus moram.
            files: ['design-system/tokens/**/*.css'],
            rules: {
                'color-no-hex': null,
                'color-named': null,
                'function-disallowed-list': null,
                'scale-unlimited/declaration-strict-value': null
            }
        }
    ]
};
