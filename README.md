# E-Financeiro Front-End

Front-end web de um sistema de controle financeiro pessoal: entradas e saídas, contas, cartões com fatura, compras parceladas, assinaturas e importação de planilha. Consome a API REST do [e-financeiro](https://github.com/cristianmenesess/e-financeiro) (Spring Boot + JWT + PostgreSQL).

Projeto de portfólio em HTML, CSS e jQuery puros, **sem build step, sem framework e sem bundler** — escolha deliberada para manter o front simples e legível de ponta a ponta. Todo o visual sai de um design system próprio, e o lint bloqueia cor, fonte ou espaçamento escritos à mão.

**Acesse o site:** https://e-financeiro.vercel.app/ <br>
*(Nota: o backend fica no Render, no plano gratuito. A primeira requisição pode levar até 60 segundos para "acordar" o servidor).*

---

## Tecnologias

- **Linguagem:** HTML5, CSS3 (variáveis CSS, sem pré-processador) e JavaScript
- **Bibliotecas:** jQuery 3.7 (`$.ajax` em todas as chamadas à API) e Lucide (ícones), via CDN
- **Design system:** próprio, em `design-system/` (tokens CSS + componentes em JS puro, incluindo os gráficos)
- **PWA:** `manifest.json` + service worker com cache do app shell (instalável no celular)
- **Hospedagem:** Vercel
- **Ferramentas de desenvolvimento:** ESLint, Stylelint, TypeScript (typecheck do JS do design system) e lint do `DESIGN.md` — o `package.json` só traz isso; o app não tem dependência de build

---

## Funcionalidades

- **Autenticação:** login e cadastro com JWT (login automático após o cadastro, confirmação de senha e botão de mostrar/ocultar senha) e redefinição de senha por e-mail.
- **Dashboard:** saldo, entradas e saídas do mês, gastos por categoria e gráfico de tendência por dia, mês ou ano.
- **Movimentações:** criar, editar e excluir, com data, busca por descrição e filtros por conta, categoria e cartão.
- **Contas:** contas criadas pelo usuário, com nome e cor.
- **Cartões:** dia de fechamento e de vencimento, total da fatura atual e modal com as compras de cada fatura.
- **Recorrências:** compras parceladas e gastos ou entradas fixas, com edição só das parcelas futuras ou de todas.
- **Assinaturas:** cobranças mensais ou anuais sem data de fim, com edição, cancelamento (mantém o histórico) e exclusão.
- **Categorias:** categorias fixas do sistema mais as personalizadas, com ícone e cor.
- **Importar / Exportar:** importação de movimentações por planilha CSV, com prévia dos erros por linha e coluna, e exportação no mesmo formato.
- **Perfil:** nome, e-mail, senha, foto e exclusão do cadastro.
- **Tema e PWA:** tema claro e escuro, e instalação como aplicativo no celular.

---

## Rodando Localmente

**Pré-requisitos:** o [backend e-financeiro](https://github.com/cristianmenesess/e-financeiro) rodando e Node.js (só para servir os arquivos e rodar as checagens).

1. Suba o backend (veja o README dele). Por padrão ele libera o CORS para `http://localhost:5501`.
2. Aponte o front para o backend local: a URL da API fica em `self.apiBaseUrl`, no topo de `script.js`, `login.js`, `cadastro.js` e `redefinir-senha.js` (em `assets/js/`). No repositório ela aponta para produção; troque para `http://localhost:8080`.
3. Sirva esta pasta na porta 5501:
   ```bash
   npx http-server -p 5501 .
   ```
4. Acesse `http://localhost:5501/login.html`, cadastre um usuário e explore.

Checagens (opcional):

```bash
npm install
npm run check   # typecheck + ESLint + Stylelint + lint do DESIGN.md
```

---

## Telas

| Tela | Arquivo | Descrição |
|---|---|---|
| Login | `login.html` | Entrada com e-mail e senha, e modal de "esqueci a senha" |
| Cadastro | `cadastro.html` | Criação de conta, com login automático |
| Redefinir senha | `redefinir-senha.html` | Aberta pelo link do e-mail (`?token=`) |
| Dashboard | `index.html` | Saldo, gráficos e movimentações do mês |
| Cartões | `index.html` | Cartões, fatura atual e compras de cada fatura |
| Contas | `index.html` | Contas do usuário |
| Recorrências | `index.html` | Parcelamentos e lançamentos fixos |
| Assinaturas | `index.html` | Cobranças mensais e anuais |
| Categorias | `index.html` | Categorias de entrada e de saída |

As telas de `index.html` são seções da mesma página, trocadas pela navegação; criação e edição acontecem em modais.

---

## Arquitetura

- **Um script por tela:** cada HTML tem o próprio script (`script.js`, `login.js`, `cadastro.js`, `redefinir-senha.js`), no mesmo formato — um objeto que guarda o estado e as funções da tela. Os scripts compartilhados são poucos e pequenos (tema, ícones, feedback, campo de senha, PWA).
- **Autenticação:** o token JWT fica no `localStorage`. `index.html` confere o token ao carregar e redireciona para o login se não houver sessão; uma resposta `401` limpa a sessão e redireciona.
- **Dados:** tudo é carregado da API a cada ação, sem cache local de dados — o backend é a fonte da verdade.
- **Rede:** um overlay de carregamento cobre a tela durante as chamadas, sem tempo limite, para dar tempo de o backend acordar.
- **PWA:** o service worker serve o app shell do cache; trocar a versão do cache em `sw.js` a cada mudança de CSS ou JS faz os aparelhos baixarem a versão nova.

---

## Design system

- **`DESIGN.md`** (raiz) é o contrato visual e a fonte da verdade dos tokens: cores, tipografia, espaçamento, raios, sombras, tema claro/escuro e regras de uso.
- **`design-system/`** tem a implementação: tokens em CSS, componentes (fábricas DOM tipadas), padrões de layout, templates de tela e logotipos.
- Tela ou componente novo sai da biblioteca, e nenhum valor de cor, fonte, espaçamento ou raio vai escrito à mão — `npm run lint` bloqueia.
- Showcase de todos os componentes, estados e temas: `/design-system/`, com o servidor local rodando.

---

## Estrutura

```
index.html              # Dashboard, cartões, contas, recorrências, assinaturas e categorias (exige login)
login.html              # Tela de login
cadastro.html           # Tela de cadastro
redefinir-senha.html    # Tela de redefinição de senha (link com ?token=)
manifest.json           # Manifesto do PWA
sw.js                   # Service worker (cache do app shell)
assets/
  css/style.css         # Layout das telas (tokens e componentes vêm de design-system/)
  imagens/icons/        # Ícones do PWA e favicon
  js/
    script.js           # Lógica de index.html
    login.js            # Lógica da tela de login
    cadastro.js         # Lógica da tela de cadastro
    redefinir-senha.js  # Lógica da tela de redefinição de senha
    feedback.js         # Avisos, confirmações e erros de campo (compartilhado)
    icones.js           # Ícones Lucide (compartilhado)
    senha.js            # Botão de mostrar/ocultar senha (compartilhado)
    theme.js            # Tema claro/escuro (compartilhado)
    pwa.js              # Registro do service worker (compartilhado)
design-system/
  ds.css                # Ponto de entrada CSS (tokens + componentes + padrões)
  tokens/               # Variáveis CSS (tema claro e escuro)
  components/           # Componentes: CSS, fábricas JS e documentação
  patterns/             # Utilitários de layout
  showcase/, templates/ # Página /design-system/ e telas de exemplo
  assets/               # Logotipos
DESIGN.md               # Contrato visual e fonte da verdade dos tokens
package.json            # Só ferramentas de desenvolvimento (lint e typecheck)
eslint.config.js        # Regras de JS (bloqueia valores escritos à mão)
stylelint.config.js     # Regras de CSS (bloqueia valores escritos à mão)
tsconfig.json           # Typecheck do design system
```
