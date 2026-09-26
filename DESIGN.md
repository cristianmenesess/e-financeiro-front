---
version: alpha
name: E-Financeiro
description: >-
  Contrato visual do E-Financeiro — Controle Financeiro. Painel financeiro em
  pt-BR, claro e denso, com paridade total entre desktop e mobile. Este arquivo é
  a fonte da verdade dos tokens; a implementação em CSS fica em
  design-system/tokens/*.css e deve espelhar exatamente os valores daqui.
colors:
  # Papéis principais
  primary: "#309084"
  secondary: "#304860"
  tertiary: "#8B7BF0"
  neutral: "#F1F6F5"
  surface: "#FFFFFF"
  on-surface: "#16222D"
  on-surface-variant: "#5A6A68"
  error: "#E24A4A"
  success: "#24C060"
  warning: "#F2A03D"
  # Marca · teal (do símbolo)
  teal-50: "#EAF6F4"
  teal-100: "#D2ECE8"
  teal-200: "#A6D9D1"
  teal-300: "#6FC2B6"
  teal-400: "#44A99A"
  teal-500: "#309084"
  teal-600: "#27776D"
  teal-700: "#1E5D55"
  teal-800: "#16443E"
  teal-900: "#0F2E2A"
  # Marca · navy (do wordmark)
  navy-50: "#EDF1F5"
  navy-100: "#D6DEE7"
  navy-200: "#AEBDCD"
  navy-300: "#7E93AC"
  navy-400: "#546C89"
  navy-500: "#304860"
  navy-600: "#273B4E"
  navy-700: "#1E2E3D"
  navy-800: "#16222D"
  navy-900: "#0E171F"
  # Neutros frios, levemente esverdeados (nunca cinza puro)
  neutral-0: "#FFFFFF"
  neutral-25: "#FAFCFC"
  neutral-50: "#F4F8F7"
  neutral-100: "#EAF0EF"
  neutral-200: "#DCE5E4"
  neutral-300: "#C2CFCD"
  neutral-400: "#9AACAA"
  neutral-500: "#748582"
  neutral-600: "#5A6A68"
  neutral-700: "#43514F"
  neutral-800: "#2C3736"
  neutral-900: "#1A2221"
  # Status e dados
  green-50: "#E4FBEE"
  green-100: "#C2F3D8"
  green-400: "#4BD183"
  green-500: "#24C060"
  green-600: "#17A24C"
  green-700: "#0F7D39"
  red-50: "#FDECEC"
  red-100: "#FBD6D6"
  red-400: "#F27272"
  red-500: "#E24A4A"
  red-600: "#C43333"
  amber-50: "#FEF4E6"
  amber-100: "#FCE6C4"
  amber-400: "#F5B45F"
  amber-500: "#F2A03D"
  amber-600: "#D07F1C"
  violet-50: "#F0EDFE"
  violet-100: "#E0DAFD"
  violet-400: "#A797F5"
  violet-500: "#8B7BF0"
  violet-600: "#6E5CD9"
  blue-50: "#EAF3FE"
  blue-100: "#D3E6FC"
  blue-400: "#75B4F8"
  blue-500: "#4B9BF5"
  blue-600: "#2C7DD6"
  # Semânticos · tema claro
  bg-canvas: "#F1F6F5"
  bg-canvas-alt: "#EDF3F7"
  surface-card: "{colors.neutral-0}"
  surface-sunken: "#F7FAF9"
  surface-muted: "{colors.neutral-100}"
  surface-inverse: "{colors.navy-800}"
  surface-brand: "{colors.teal-500}"
  surface-brand-soft: "{colors.teal-50}"
  surface-overlay: "rgba(14,23,31,0.48)"
  surface-glass: "rgba(255,255,255,0.72)"
  text-primary: "{colors.navy-800}"
  text-secondary: "{colors.neutral-600}"
  text-muted: "{colors.neutral-500}"
  text-faint: "{colors.neutral-400}"
  text-inverse: "{colors.neutral-0}"
  text-inverse-muted: "{colors.navy-200}"
  text-brand: "{colors.teal-600}"
  text-positive: "{colors.green-600}"
  text-negative: "{colors.red-600}"
  text-warning: "{colors.amber-600}"
  text-link: "{colors.teal-600}"
  border-subtle: "#E8EEED"
  border-default: "{colors.neutral-200}"
  border-strong: "{colors.neutral-300}"
  border-brand: "{colors.teal-300}"
  action-primary: "{colors.teal-500}"
  action-primary-hover: "{colors.teal-600}"
  action-primary-active: "{colors.teal-700}"
  action-dark: "{colors.navy-700}"
  action-dark-hover: "{colors.navy-800}"
  action-success: "{colors.green-500}"
  action-danger: "{colors.red-500}"
  focus-ring: "rgba(48,144,132,0.32)"
  chart-grid: "#EDF2F1"
  series-1: "{colors.green-500}"
  series-2: "{colors.blue-500}"
  series-3: "{colors.violet-500}"
  series-4: "{colors.amber-500}"
  series-5: "{colors.teal-500}"
  series-6: "{colors.neutral-400}"
  # Semânticos · tema escuro ([data-theme="dark"])
  dark-bg-canvas: "#0A1117"
  dark-surface-card: "#111B24"
  dark-surface-sunken: "#0D161D"
  dark-surface-muted: "#1A2731"
  dark-surface-inverse: "{colors.navy-700}"
  dark-text-primary: "{colors.neutral-100}"
  dark-text-secondary: "{colors.neutral-300}"
  dark-text-muted: "{colors.neutral-400}"
  dark-text-brand: "{colors.teal-300}"
  dark-text-positive: "{colors.green-400}"
  dark-text-negative: "{colors.red-400}"
  dark-action-primary-hover: "{colors.teal-400}"
  # Paleta do usuário (cor de cartões e contas; valores gravados no backend — não reformatar)
  swatch-1-bg: "#E1F5EE"
  swatch-1-fg: "#0F6E56"
  swatch-2-bg: "#FCEBEB"
  swatch-2-fg: "#A32D2D"
  swatch-3-bg: "#E6F1FB"
  swatch-3-fg: "#185FA5"
  swatch-4-bg: "#EEEDFE"
  swatch-4-fg: "#534AB7"
  swatch-5-bg: "#FAEEDA"
  swatch-5-fg: "#854F0B"
  swatch-6-bg: "#FBE9F0"
  swatch-6-fg: "#993356"
  swatch-7-bg: "#EAF3DE"
  swatch-7-fg: "#3B6D11"
  swatch-8-bg: "#F1EFE8"
  swatch-8-fg: "#5F5E5A"
  swatch-9-bg: "#E8F4FD"
  swatch-9-fg: "#1565A8"
  swatch-10-bg: "#FFF3CD"
  swatch-10-fg: "#856404"
typography:
  display:
    fontFamily: Manrope
    fontSize: 72px
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: -0.035em
  h1:
    fontFamily: Manrope
    fontSize: 44px
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: -0.035em
  h2:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.02em
  h3:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.02em
  h4:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.25
  numeric-xl:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.08
    fontFeature: '"tnum" 1'
  numeric-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.08
    fontFeature: '"tnum" 1'
  numeric:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.25
    fontFeature: '"tnum" 1'
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0.12em
rounded:
  none: 0px
  xs: 6px
  sm: 10px
  md: 14px
  lg: 20px
  xl: 28px
  2xl: 36px
  full: 999px
  control: 12px
  icon-tile: 12px
  card: 24px
  card-lg: 28px
  sheet: 28px
spacing:
  px: 1px
  0-5: 2px
  "1": 4px
  1-5: 6px
  "2": 8px
  2-5: 10px
  "3": 12px
  3-5: 14px
  "4": 16px
  "5": 20px
  "6": 24px
  "7": 28px
  "8": 32px
  "10": 40px
  "12": 48px
  "14": 56px
  "16": 64px
  "20": 80px
  "24": 96px
  "32": 128px
  pad-control-y: 10px
  pad-control-x: 16px
  pad-card: 24px
  pad-card-compact: 16px
  pad-card-roomy: 32px
  pad-page: 32px
  pad-page-mobile: 16px
  gap-tight: 8px
  gap-default: 16px
  gap-loose: 24px
  gap-section: 48px
  sidebar-width: 256px
  sidebar-width-collapsed: 76px
  topbar-height: 68px
  tabbar-height: 76px
  content-max: 1560px
  grid-gutter: 24px
  touch-target: 44px
  breakpoint-desktop: 1024px
components:
  button-primary:
    backgroundColor: "{colors.action-primary}"
    textColor: "{colors.text-inverse}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    height: 42px
    padding: 18px
  button-primary-hover:
    backgroundColor: "{colors.action-primary-hover}"
  button-primary-active:
    backgroundColor: "{colors.action-primary-active}"
  button-dark:
    backgroundColor: "{colors.action-dark}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.control}"
  button-dark-hover:
    backgroundColor: "{colors.action-dark-hover}"
  button-success:
    backgroundColor: "{colors.action-success}"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.control}"
  button-secondary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
  button-secondary-hover:
    backgroundColor: "{colors.neutral-50}"
  button-ghost-hover:
    backgroundColor: "{colors.neutral-100}"
    textColor: "{colors.text-secondary}"
  button-danger:
    backgroundColor: "{colors.action-danger}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.control}"
  button-sm:
    height: 34px
    padding: 14px
    rounded: "{rounded.sm}"
  button-lg:
    height: 52px
    padding: 26px
  icon-button:
    size: 38px
    rounded: "{rounded.icon-tile}"
    textColor: "{colors.text-secondary}"
  icon-button-selected:
    backgroundColor: "{colors.surface-brand-soft}"
    textColor: "{colors.text-brand}"
  segmented-control:
    backgroundColor: "{colors.surface-sunken}"
    rounded: "{rounded.full}"
    typography: "{typography.mono-label}"
    height: 36px
  segmented-control-selected:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-primary}"
  input:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    height: 44px
    padding: 14px
  input-focus:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-primary}"
  input-disabled:
    backgroundColor: "{colors.surface-sunken}"
  field-label:
    typography: "{typography.mono-label}"
    textColor: "{colors.text-muted}"
  field-error:
    typography: "{typography.caption}"
    textColor: "{colors.text-negative}"
  search-field:
    backgroundColor: "{colors.surface-sunken}"
    rounded: "{rounded.full}"
    height: 40px
  switch-on:
    backgroundColor: "{colors.action-primary}"
    width: 44px
    height: 26px
  checkbox-checked:
    backgroundColor: "{colors.action-primary}"
    textColor: "{colors.text-inverse}"
    size: 18px
    rounded: "{rounded.xs}"
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    padding: 24px
  card-inverse:
    backgroundColor: "{colors.navy-700}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.card}"
  stat-card-value:
    typography: "{typography.numeric-xl}"
    textColor: "{colors.text-primary}"
  badge-positive:
    backgroundColor: "{colors.green-50}"
    textColor: "{colors.green-700}"
    rounded: "{rounded.full}"
    height: 24px
  badge-negative:
    backgroundColor: "{colors.red-50}"
    textColor: "{colors.red-600}"
    rounded: "{rounded.full}"
  badge-warning:
    backgroundColor: "{colors.amber-50}"
    textColor: "{colors.amber-600}"
    rounded: "{rounded.full}"
  badge-ai:
    backgroundColor: "{colors.violet-50}"
    textColor: "{colors.violet-600}"
    rounded: "{rounded.full}"
  tag:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.full}"
    height: 28px
  tag-selected:
    backgroundColor: "{colors.surface-brand-soft}"
    textColor: "{colors.text-brand}"
  avatar:
    backgroundColor: "{colors.teal-100}"
    textColor: "{colors.teal-700}"
    rounded: "{rounded.full}"
    size: 40px
  list-row:
    typography: "{typography.body-sm}"
    padding: 14px
    height: 44px
  list-row-selected:
    backgroundColor: "{colors.surface-brand-soft}"
  icon-tile:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.icon-tile}"
    size: 36px
  data-table-header:
    typography: "{typography.mono-label}"
    textColor: "{colors.text-muted}"
  nav-item-selected:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    height: 44px
  tab-bar:
    backgroundColor: "{colors.surface-glass}"
    height: 76px
  top-bar:
    backgroundColor: "{colors.surface-glass}"
    height: 68px
  dialog:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.sheet}"
    padding: 32px
    width: 480px
  toast:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.md}"
  progress-bar-track:
    backgroundColor: "{colors.neutral-100}"
    rounded: "{rounded.full}"
    height: 8px
---

# E-Financeiro · DESIGN.md

> **Contrato visual do projeto e fonte da verdade dos tokens.** O YAML acima é
> normativo. A implementação vive em `design-system/tokens/*.css` e os
> componentes em `design-system/components/`. Mudou um token? Mude aqui e no CSS
> no mesmo commit, e rode `npm run lint:design`. Showcase de tudo: `/design-system/`.

## Overview

Sistema de design do **E-Financeiro — Controle Financeiro**, um produto brasileiro
de gestão financeira cujo núcleo é um **painel administrativo** com paridade total
no mobile: nada de importante desaparece no celular, e nada de essencial fica
escondido no desktop.

O tom visual é **analista sênior, não coach**: limpo, denso na medida, com os
números em primeiro plano. Fundo chapado e frio, cards brancos flutuando sobre
sombras largas e fracas, marca verde-petróleo para ação e azul-marinho para texto.
A única "atmosfera" é a aurora — um borrão radial multicolorido atrás de no
máximo um bloco por tela.

Idioma **pt-BR**. Valores em **BRL**, datas em `DD/MM/AAAA`, decimal com vírgula.

**Origem.** Identidade (símbolo, wordmark, paleta) tirada pixel a pixel do logotipo
oficial. Gramática de layout, régua
tipográfica e densidade vieram de um estudo de caso de terceiro fornecido como
referência de qualidade de UI — dele foram extraídos só fundamentos genéricos;
nenhum elemento gráfico foi copiado.

### Conteúdo e voz

- **Pessoa.** Segunda pessoa implícita ("Seu saldo", "Revise suas assinaturas").
  Nunca "nós" nem "a E-Financeiro".
- **Caixa.** *Sentence case* em títulos, botões e badges ("Novo lançamento",
  "Conciliado"). **CAIXA ALTA só no micro-rótulo monoespaçado** (rótulo de card,
  cabeçalho de coluna, legenda de eixo: "SALDO CONSOLIDADO", "FINAL 4821").
- **Sem pontuação em rótulo.** Rótulos e botões sem ponto final; frases de insight
  e descrição com ponto.
- **Números primeiro.** "Assinaturas subiram 22% em três meses. Consolidar
  licenças devolve R$ 3.180 por mês ao caixa." Nunca "suas despesas aumentaram
  consideravelmente".
- **Botões no imperativo, com objeto:** "Gerar arquivo", "Conciliar". Nunca "OK",
  "Enviar", "Continuar".
- **Insight = observação + consequência**, até três frases. Se a IA inferiu, mostre
  a confiança ("96%"); se foi medido, não.
- **Erro descreve o fato, não culpa:** "Data anterior ao período selecionado".
- **Estado vazio explica e oferece saída:** "Nenhum lançamento neste período.
  Ajuste o filtro de datas ou importe um extrato OFX."
- **Sem emoji** em nenhuma superfície. **Sem jargão de marketing**; "IA" só onde há
  modelo de fato.
- **Abreviação de milhar** só em espaço apertado (`R$ 486k`, `R$ 4,22M`); em tabela
  e detalhe, valor completo (`R$ 486.220,00`).

| Use | Não use |
|---|---|
| Lançamento | Movimentação, registro |
| Conciliado / Pendente / Atrasado | Ok, Aprovado, Falhou |
| Saldo consolidado | Balanço geral |
| Entradas / Saídas | Créditos / Débitos, Receitas / Gastos |
| Runway | Fôlego de caixa |
| Insight IA | Sugestão inteligente |
| Conta corrente, Reserva, Cartão | Carteira |

## Colors

Duas cores de marca e uma família de status independente da marca.

- **Primary — verde-petróleo `#309084` (teal-500):** ação, marca, seleção. Hover
  desce um degrau (600), press mais um (700).
- **Secondary — azul-marinho `#304860` (navy-500):** texto (navy-800), superfícies
  escuras e o CTA de maior intenção (`dark`, navy-700).
- **Neutros:** cinzas frios com viés levemente esverdeado — **nunca cinza puro**.
- **Status:** menta `#24C060` entra, vermelho `#E24A4A` sai, âmbar `#F2A03D` avisa.
  **Violeta `#8B7BF0` é exclusivo de saída de máquina** (previsão, confiança,
  recomendação).
- **Séries de gráfico** em ordem fixa: `series-1` verde → `series-2` azul →
  `series-3` violeta → `series-4` âmbar → `series-5` teal → `series-6` neutro.
- **No máximo duas cores de fundo por tela:** o canvas `#F1F6F5` e o branco dos cards.
- **Tema escuro** (`[data-theme="dark"]`, mesmo atributo de `assets/js/theme.js`):
  redefine só os semânticos (tokens `dark-*` acima) — canvas `#0A1117` mais escuro
  que o card `#111B24`, texto em neutral-100, marca e status um degrau mais claros.
  As escalas nunca mudam entre temas. O tema escuro foi autorado na integração ao
  projeto (o sistema de origem só definia o claro).
- **Paleta do usuário** (`swatch-1…10`, fundo + texto): cores que a pessoa escolhe para
  cada cartão e conta. São dados, não tema: o app grava o hex exato na API
  (`corFundo`/`corTexto`) e compara de volta ao editar — nunca reformate um valor
  existente; para mudar a paleta, acrescente pares. Iguais nos dois temas.
- **Pendência de acessibilidade (herdada do sistema de origem).** `npm run lint:design`
  aponta contraste abaixo de WCAG AA (4,5:1) em: texto branco sobre `primary`
  (3,85:1 — Button primary, Checkbox marcado), branco sobre `action-danger` (3,95:1),
  Badge `warning` (2,87:1) e Badge `ai` (4,35:1). Os valores foram mantidos como
  vieram; escurecer esses pares (ex.: usar teal-600 no fundo do botão) é uma decisão
  de marca ainda em aberto.
- **Transparência** só em três lugares: top bar e tab bar (`surface-glass` +
  `blur(20px)`) e scrim de modal (`surface-overlay` + `blur(8px)`). Texto nunca é
  semitransparente — use um token de texto mais claro.

## Typography

**Manrope** para tudo que é linguagem; **JetBrains Mono** para tudo que é dado. A
regra é dura: **todo valor monetário, percentual, data, ticker, CNPJ e código é
monoespaçado**, com `font-variant-numeric: tabular-nums` (classe `.ef-numeric`).

- Display e títulos em Bold 700 com tracking `-0.035em` (display/h1) e `-0.02em`
  (h2/h3).
- Micro-rótulo: mono 12px, caixa alta, tracking `0.12em` (`.ef-mono-label`).
- Régua: 10 · 11 · 12 · 14 · 16 · 18 · 20 · 24 · 32 · 44 · 56 · 72 · 88. Nunca
  abaixo de 12px em texto de leitura; medida máxima de 68 caracteres.
- Fontes carregadas do Google Fonts por `design-system/tokens/fonts.css`.

## Layout

- Rail lateral fixo de **256px** (76px recolhido), top bar de **68px**, tab bar mobile
  de **76px**.
- Conteúdo com largura máxima de **1560px**, padding de 32px (16px no mobile).
- Grade de cards `repeat(auto-fit, minmax(min(220px,100%),1fr))`, gap 20–24px
  (padrão `Grid` em `design-system/patterns`).
- **Corte desktop/mobile: 1024px.** Abaixo dele o rail sai e a tab bar entra, tabelas
  viram listas de `ListRow`, KPIs vão a 2-up compactos — **sem remover nenhum dado**.
- Escala de espaçamento em múltiplos de 4px, com os degraus intermediários 2, 6, 10 e
  14px que os componentes usam. Padding de card: 24px (16 compacto, 32 espaçoso).
- Alvo de toque mínimo de 44px.

## Elevation & Depth

Cinco níveis, todos com deslocamento vertical e desfoque largo, opacidade ≤ 0,22,
matiz navy (`rgba(22,34,45,…)`) — nunca preto puro no tema claro:

| Token | Uso |
|---|---|
| `--shadow-xs` | inputs, botão secondary |
| `--shadow-sm` | elementos flutuantes pequenos, hub do donut |
| `--shadow-md` (`--shadow-card`) | cards |
| `--shadow-lg` | popover, card interativo em hover, toast |
| `--shadow-xl` | modal |

A sombra é o que separa o card do canvas; a borda de 1px (`border-subtle`) é só
definição de aresta. **Nunca combine borda forte com sombra alta.** Card interativo
sobe 2px no hover. No tema escuro as sombras usam preto com opacidade maior.

### Movimento

Rápido e sem elástico: **140ms** para estados de controle (`cubic-bezier(.4,0,.2,1)`),
**220ms** para superfícies (`cubic-bezier(.22,1,.36,1)`), **360ms** para barras e arcos.
Entrada de modal: sobe 12px + escala 0,98 → 1 em 220ms. Sem bounce, overshoot ou
parallax. `prefers-reduced-motion` zera as durações via token.

### Estados

- **Hover** — escurece um degrau (500 → 600); superfícies neutras vão para
  `surface-sunken`; card interativo sobe 2px.
- **Press** — `scale(0.985)` e mais um degrau (700). Sem ripple.
- **Foco** — halo de 3px `focus-ring`, sempre visível, nunca removido.
- **Selecionado** — pílula/tile em `surface-brand-soft` com texto `text-brand`; no rail,
  barra teal de 3px na aresta esquerda.
- **Desativado** — `opacity: 0.45` + `cursor: not-allowed`. Sem cinza chapado.
- **Erro** — borda `red-400` e mensagem em `text-negative` abaixo do campo.
- **Loading** — spinner no lugar do ícone esquerdo, interação bloqueada.
- **Vazio** — `EmptyState` (lista/tabela), trilho vazio (gráficos) ou placeholder.

## Shapes

Formas macias e consistentes: **12px nos controles**, **24px nos cards**, **28px em
sheets e modais**, **12px nos tiles de ícone** (36px), **pílula** em chips, segmented
control, badges e item ativo da tab bar. Escala completa: 6 · 10 · 12 · 14 · 20 · 24 ·
28 · 36 · pílula. Não misture cantos vivos com arredondados na mesma tela.

## Components

A biblioteca vive em `design-system/components/` (35 componentes em 6 famílias,
fábricas DOM tipadas em JSDoc + CSS por família). Importe sempre pelo índice
público `design-system/components/index.js`. Cada componente tem um `.md` ao lado
com a diretriz de uso e o contrato de props.

- **Ações:** Button (primary, dark, success, secondary, ghost, danger · sm/md/lg ·
  loading), IconButton (neutral, surface, brand, inverse · ativo), SegmentedControl.
- **Formulários:** Field, Input (prefixo/sufixo, mono para dinheiro), SearchField,
  Select, Switch, Checkbox (indeterminado).
- **Exibição de dados:** Card + CardHeader (aurora, inverse, interativo), StatCard,
  Badge (8 tons), Tag, Avatar + UserChip, InsightCard, DataTable, ListRow + IconTile.
- **Gráficos:** Sparkline, AreaChart, DonutChart + DonutLegend, ScoreGauge, BarTicks.
- **Navegação:** SidebarNav + NavItem, TopBar, Tabs, TabBar.
- **Feedback:** ProgressBar (pontilhado para confiança), Dialog (center, sheet, auto),
  Toast, EmptyState.

Padrões de composição (`design-system/patterns/`): AppShell, Grid, SectionTitle, Icon.
Templates de tela (`design-system/templates/`): Visão geral, Transações, Contas,
Relatórios, Insights IA, Metas, Configurações e Mais.

### Iconografia

- **Lucide 0.454.0** via CDN (`https://unpkg.com/lucide@0.454.0/dist/umd/lucide.js`),
  traço 1,75–2px, sempre `currentColor`. Tamanhos: 15–16px em linhas e botões
  pequenos, **18px** padrão, 20px em destaque. Ícone de linha vive num `IconTile`.
- Sem emoji e sem caractere Unicode como ícone, com duas exceções tipográficas: a seta
  `↑`/`↓` colada ao delta e o sinal `−` (U+2212) em valores negativos.
- Os únicos SVGs desenhados à mão são os 6 glifos utilitários das primitivas
  (chevron, check, X, lupa, seta diagonal, traço), para não dependerem de CDN.
- As telas atuais do app ainda usam Font Awesome; migrar para Lucide está pendente.

### Marca

`logo-lockup.png` (símbolo + wordmark) para o rail e cabeçalhos; `logo-mark.png` (só o
símbolo) para mobile e favicon — ambos em `design-system/assets/`. Respiro mínimo =
metade da altura do símbolo. Em superfície escura o lockup vai dentro de uma cápsula
branca (não há versão monocromática aprovada). Nunca recolorir, distorcer ou recompor.

## Do's and Don'ts

- Do use tokens (`var(--…)`) para toda cor, fonte, tamanho de fonte, espaçamento e raio
  — o lint (`npm run lint`) bloqueia valores soltos.
- Do monte tela nova com os componentes de `design-system/components/index.js`.
- Do use mono + `tabular-nums` para todo número financeiro.
- Do mantenha o foco visível em todo elemento interativo.
- Don't use mais de um bloco com aurora nem mais de um card `inverse` por tela.
- Don't use violeta para nada que não seja saída de máquina.
- Don't combine borda forte com sombra alta.
- Don't use cinza puro, preto puro em sombra (tema claro) ou texto semitransparente.
- Don't use fotografia dentro da interface; logos de terceiros entram como ícone de 1
  cor dentro de um `IconTile`.
- Don't use bounce, overshoot ou parallax.
