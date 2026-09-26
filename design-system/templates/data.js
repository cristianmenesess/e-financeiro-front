// @ts-check
/**
 * Dados fictícios (mas plausíveis) em pt-BR para os templates. Porte de
 * ui_kits/admin-dashboard/data.js do dump — desktop e mobile compartilham a
 * mesma fonte, de propósito. Sem rede, sem estado real.
 */

/**
 * Série ondulada determinística para gráficos de exemplo.
 *
 * @param {number} quantidade
 * @param {number} base
 * @param {number} amplitude
 * @param {number} deriva
 * @returns {number[]}
 */
export function onda(quantidade, base, amplitude, deriva) {
    return Array.from({ length: quantidade }, function (_, i) {
        return base + Math.sin(i / 2.6) * amplitude + Math.sin(i / 7.1) * amplitude * 0.7 + i * deriva;
    });
}

/**
 * Formata em reais: 1234.5 → "R$ 1.234,50".
 *
 * @param {number} valor
 * @returns {string}
 */
export function brl(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * @typedef {'positive' | 'negative' | 'warning' | 'neutral' | 'brand'} Tom
 * @typedef {{ id: number, desc: string, cat: string, conta: string, data: string, valor: string, pos: boolean, status: string, st: 'positive' | 'warning' | 'negative', icon: string }} Lancamento
 * @typedef {{ id: string, name: string, sub: string, value: string, delta: string, icon: string, tone: 'brand' | 'positive' | 'negative', neg?: boolean, series: number[] }} Conta
 */

export var dados = {
    user: { name: 'Ana Ribeiro', meta: 'Plano Premium' },
    kpis: [
        { label: 'Saldo consolidado', value: 'R$ 1.284.309', delta: '18,4%', caption: 'vs. mês anterior', icon: 'wallet', tone: /** @type {'positive' | 'negative'} */ ('positive'), series: onda(34, 60, 10, 1.4) },
        { label: 'Entradas do mês', value: 'R$ 486.220', delta: '9,1%', caption: '42 lançamentos', icon: 'arrow-down-left', tone: /** @type {'positive' | 'negative'} */ ('positive'), series: onda(34, 40, 8, 1.1) },
        { label: 'Saídas do mês', value: 'R$ 312.877', delta: '6,2%', caption: '118 lançamentos', icon: 'arrow-up-right', tone: /** @type {'positive' | 'negative'} */ ('negative'), series: onda(34, 50, 9, 0.4) },
        { label: 'Runway', value: '14,2 meses', delta: '1,8 mês', caption: 'no ritmo atual', icon: 'gauge', tone: /** @type {'positive' | 'negative'} */ ('positive'), series: onda(34, 30, 6, 0.9) }
    ],
    /** @type {Record<string, number[]>} */
    cashflow: {
        '1M': onda(30, 820, 90, 9),
        '3M': onda(60, 700, 120, 7),
        '1A': onda(52, 420, 160, 14),
        'TUDO': onda(80, 260, 180, 11)
    },
    /** @type {Record<string, string[]>} */
    cashflowLabels: {
        '1M': ['1 SET', '8 SET', '15 SET', '22 SET', '29 SET'],
        '3M': ['JUL', 'AGO', 'SET'],
        '1A': ['OUT', 'JAN', 'ABR', 'JUL', 'SET'],
        'TUDO': ['2023', '2024', '2025', '2026']
    },
    allocation: [
        { label: 'Receita recorrente', value: 44.8 },
        { label: 'Serviços', value: 24.9 },
        { label: 'Produtos', value: 15.3 },
        { label: 'Investimentos', value: 10.4 },
        { label: 'Outros', value: 4.6 }
    ],
    /** @type {Conta[]} */
    accounts: [
        { id: 'a1', name: 'Conta corrente · Itaú', sub: 'AG 0234 · CC 18402-1', value: 'R$ 412.880,10', delta: '+2,4%', icon: 'building-2', tone: 'brand', series: onda(16, 20, 4, 0.8) },
        { id: 'a2', name: 'Conta PJ · Nubank', sub: 'CC 99213-4', value: 'R$ 208.114,55', delta: '+0,9%', icon: 'credit-card', tone: 'brand', series: onda(16, 18, 3, 0.5) },
        { id: 'a3', name: 'Reserva CDB', sub: 'LIQUIDEZ D+1', value: 'R$ 540.000,00', delta: '+1,1%', icon: 'landmark', tone: 'positive', series: onda(16, 22, 2, 0.9) },
        { id: 'a4', name: 'Cartão corporativo', sub: 'FINAL 4821', value: '− R$ 46.412,90', delta: '−8,2%', icon: 'credit-card', tone: 'negative', neg: true, series: onda(16, 14, 5, -0.4) }
    ],
    /** @type {Lancamento[]} */
    transactions: [
        { id: 1, desc: 'Mensalidade — Contrato Vega', cat: 'Receita recorrente', conta: 'Itaú', data: '22/09/2026', valor: '+ R$ 48.000,00', pos: true, status: 'Conciliado', st: 'positive', icon: 'arrow-down-left' },
        { id: 2, desc: 'Folha de pagamento — setembro', cat: 'Pessoal', conta: 'Itaú', data: '20/09/2026', valor: '− R$ 186.400,00', pos: false, status: 'Conciliado', st: 'positive', icon: 'users' },
        { id: 3, desc: 'AWS — infraestrutura', cat: 'Infraestrutura', conta: 'Cartão 4821', data: '19/09/2026', valor: '− R$ 22.318,44', pos: false, status: 'Pendente', st: 'warning', icon: 'server' },
        { id: 4, desc: 'Consultoria Orbit Labs', cat: 'Serviços', conta: 'Nubank', data: '18/09/2026', valor: '+ R$ 96.500,00', pos: true, status: 'Conciliado', st: 'positive', icon: 'arrow-down-left' },
        { id: 5, desc: 'DARF — IRPJ trimestral', cat: 'Impostos', conta: 'Itaú', data: '15/09/2026', valor: '− R$ 74.210,00', pos: false, status: 'Atrasado', st: 'negative', icon: 'landmark' },
        { id: 6, desc: 'Aluguel — sede Pinheiros', cat: 'Fixo', conta: 'Itaú', data: '05/09/2026', valor: '− R$ 31.200,00', pos: false, status: 'Conciliado', st: 'positive', icon: 'building-2' },
        { id: 7, desc: 'Licenças Figma + Linear', cat: 'Ferramentas', conta: 'Cartão 4821', data: '03/09/2026', valor: '− R$ 4.882,10', pos: false, status: 'Conciliado', st: 'positive', icon: 'credit-card' },
        { id: 8, desc: 'Resgate CDB', cat: 'Investimentos', conta: 'Reserva CDB', data: '02/09/2026', valor: '+ R$ 120.000,00', pos: true, status: 'Conciliado', st: 'positive', icon: 'piggy-bank' }
    ],
    budgets: [
        { label: 'Pessoal', used: 186400, cap: 210000 },
        { label: 'Infraestrutura', used: 22318, cap: 24000 },
        { label: 'Marketing', used: 41200, cap: 32000 },
        { label: 'Ferramentas', used: 4882, cap: 12000 }
    ],
    insights: [
        { body: 'Assinaturas de software cresceram 22% em três meses. Consolidar licenças pode devolver R$ 3.180 por mês ao caixa.', confidence: '94%' },
        { body: 'O DARF de setembro venceu há 7 dias. A multa projetada chega a R$ 1.484 até o fim do mês.', confidence: '99%' }
    ],
    reports: [
        { name: 'DRE gerencial', period: 'Setembro 2026', updated: 'há 2 horas', icon: 'file-bar-chart' },
        { name: 'Fluxo de caixa projetado', period: 'Out 2026 – Mar 2027', updated: 'há 1 dia', icon: 'trending-up' },
        { name: 'Conciliação bancária', period: 'Setembro 2026', updated: 'há 3 horas', icon: 'check-check' },
        { name: 'Impostos e obrigações', period: '3º trimestre', updated: 'há 5 dias', icon: 'landmark' }
    ],
    dre: [
        { linha: 'Receita bruta', set: 'R$ 486.220', ago: 'R$ 445.180', var: '+9,2%', pos: true, strong: true },
        { linha: '(−) Deduções e impostos', set: 'R$ 74.210', ago: 'R$ 68.920', var: '+7,7%', pos: false },
        { linha: 'Receita líquida', set: 'R$ 412.010', ago: 'R$ 376.260', var: '+9,5%', pos: true, strong: true },
        { linha: '(−) Custos diretos', set: 'R$ 118.640', ago: 'R$ 121.300', var: '−2,2%', pos: true },
        { linha: '(−) Despesas operacionais', set: 'R$ 194.237', ago: 'R$ 188.410', var: '+3,1%', pos: false },
        { linha: 'Resultado operacional', set: 'R$ 99.133', ago: 'R$ 66.550', var: '+49,0%', pos: true, strong: true }
    ],
    goals: [
        { n: 'Reserva de emergência', cur: 540000, cap: 600000, ic: 'piggy-bank' },
        { n: 'Expansão da sede', cur: 182000, cap: 450000, ic: 'building-2' },
        { n: 'Antecipação de impostos', cur: 74210, cap: 74210, ic: 'landmark' }
    ]
};
