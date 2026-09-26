# Design System — E-Financeiro
- **Showcase** (biblioteca inteira, todos os estados, claro e escuro lado a lado):
  `npm run dev` → <http://localhost:5501/design-system/>
- **Templates** (telas completas no AppShell): <http://localhost:5501/design-system/templates/>

---

## Mapa

| Caminho | O que tem |
|---|---|
| `ds.css` | Ponto de entrada único: tokens + base + CSS de todos os componentes e padrões. É o que as páginas carregam. |
| `tokens/` | Variáveis CSS. `colors.css` (escalas, semânticos, tons, paleta do usuário e **tema escuro** em `[data-theme="dark"]`), `typography.css`, `spacing.css`, `radius.css`, `elevation.css`, `motion.css`, `layout.css`, `fonts.css` (Manrope + JetBrains Mono), `components.css` (medidas de anatomia: alturas de controle, tamanhos de avatar…), `base.css` (reset leve + papéis tipográficos), `index.css` (só os tokens, sem base). |
| `components/<família>/` | Um `<Nome>.js` por componente (fábrica tipada), um `<Nome>.md` (quando usar + contrato de props) e um `<família>.css` por família. Famílias: `actions`, `forms`, `data-display`, `charts`, `navigation`, `feedback`. |
| `components/index.js` | **API pública.** Todo import de fora da biblioteca passa por aqui (o lint bloqueia import de arquivo interno). |
| `components/_internal/dom.js` | Helpers internos (criar elemento/SVG, props comuns, os 6 glifos utilitários). Não importe de fora. |
| `patterns/` | Padrões de composição: `AppShell` (rail + top bar + tab bar responsiva), `Grid`, `SectionTitle`, `Icon` (Lucide) e utilitários de layout em `patterns.css`. |
| `templates/` | Telas completas montadas só com a API pública: Visão geral, Transações, Contas, Relatórios, Insights IA, Metas, Configurações, Mais (+ `data.js` fictício). `index.html` + `app.js` = rota `/design-system/templates/`. |
| `showcase/` | Código da rota `/design-system/` (`showcase.js`, `showcase.css`) e `tema.js` (alternância claro/escuro compatível com `assets/js/theme.js`). |
| `assets/` | Marca: `logo-lockup.png` (símbolo + wordmark), `logo-mark.png` (símbolo), `logo-original.jpg` (arquivo-fonte). |
### Componentes (35)

| Família | Componentes |
|---|---|
| Ações | Button, IconButton, SegmentedControl |
| Formulários | Field, Input, SearchField, Select, Switch, Checkbox |
| Exibição de dados | Card, CardHeader, StatCard, Badge, Tag, Avatar, UserChip, InsightCard, DataTable, ListRow, IconTile |
| Gráficos | Sparkline, AreaChart, DonutChart, DonutLegend, ScoreGauge, BarTicks |
| Navegação | SidebarNav, NavItem, TopBar, Tabs, TabBar |
| Feedback | ProgressBar, Dialog, Toast (+ `exibirToast`), EmptyState |

Estados cobertos: default, hover, active (press), focus, disabled, loading, erro, vazio e
selecionado. Cada estado de mouse/teclado também tem uma classe `is-hover`, `is-active`,
`is-focus` equivalente — é assim que o showcase mostra o estado parado.

---

## Como usar

**Em página nova (ES module):**

```html
<link rel="stylesheet" href="design-system/ds.css">
<script type="module">
  import { Card, CardHeader, Button } from './design-system/components/index.js';

  document.querySelector('#app').append(Card({
    children: [
      CardHeader({ label: 'Saldo consolidado', title: 'Setembro' }),
      Button({ variant: 'primary', children: 'Novo lançamento', onClick: abrir })
    ]
  }));
</script>
```

ES modules precisam de servidor (`npm run dev`); abrindo por `file://` o navegador bloqueia.

**Nas telas atuais (jQuery, sem módulos):** use a marcação com as classes do sistema —
é o que `index.html` e `assets/js/script.js` fazem (`ef-btn ef-btn--primary`,
`ef-tag` com `aria-pressed`, `ef-list-row`, `ef-dialog ef-dialog--auto` com `hidden`…).
A anatomia de cada componente está no seu `.js` (é o HTML que a fábrica gera).
Três scripts compartilhados ligam as telas ao sistema:

- `assets/js/icones.js` — ícones Lucide (`<i data-lucide>` estático e `icones.criar()`);
- `assets/js/feedback.js` — importa a API pública (`feedback.componentes`) e oferece
  `exibirToast`/`exibirSucesso`/`exibirErroAjax` (Toast), `confirmar` (Dialog de ação
  destrutiva) e `marcarErro`/`limparErro` (erro de campo no padrão do Field). Não use
  `alert()`/`confirm()`: validação vai abaixo do campo, erro da API e sucesso em Toast;
- `assets/js/theme.js` — tema claro/escuro.

---

## Como criar um componente novo

1. **Confira se já não existe** em `components/index.js` ou se não é composição de
   componentes existentes (aí o lugar é `patterns/` ou a própria tela).
2. Crie `components/<família>/<Nome>.js` seguindo os vizinhos: `// @ts-check`, props
   tipadas num `@typedef` que estende `PropsBase`, fábrica `export function Nome(props)`
   que monta o DOM com `criarElemento` e termina com `aplicarPropsBase`. Nomes internos e
   comentários em português.
3. Estilo no `<família>.css`, com prefixo `ef-` e modificadores `--variante`. **Só
   tokens** — medida de anatomia que não existe vira token em `tokens/components.css`;
   cor nova vira token em `tokens/colors.css` (com valor para o tema escuro) **e** no
   `DESIGN.md`.
4. Cubra os estados que se aplicam (hover, active, focus, disabled, loading, erro, vazio,
   selecionado), cada um com a classe `is-*` equivalente quando depende de interação.
5. Exporte em `components/index.js`, registre as props em `COMPONENTES` no
   `eslint.config.js` e escreva o `<Nome>.md` (quando usar + exemplo + props).
6. Adicione a seção no `showcase/showcase.js` (claro e escuro saem automaticamente).
7. Rode `npm run check` (typecheck + ESLint + Stylelint + lint do `DESIGN.md`).

---
## Pendências

1. **Contraste AA** de alguns pares herdados (ver `DESIGN.md` → Colors).
2. **Fontes self-hosted**: Manrope e JetBrains Mono vêm do Google Fonts; se a licença
   exigir, troque `tokens/fonts.css` por `@font-face` locais.
3. **Logotipo vetorial**: só há PNG/JPG; um SVG permitiria versão monocromática para
   fundo escuro (hoje é a cápsula branca).
