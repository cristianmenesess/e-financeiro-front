# E-Financeiro Front-End

**Acesse o site:** https://e-financeiro.vercel.app/ <br>
*(Nota: Hospedado no Render no plano gratuito. A primeira requisição pode levar até 60 segundos para "acordar" o servidor).*

Front-end web de um sistema de controle financeiro pessoal (entradas, saídas e cartões, com contas separadas por CPF/PJ). Consome a API REST do [e-financeiro](https://github.com/cristianmenesess/e-financeiro) (Spring Boot + JWT + PostgreSQL).

Projeto de portfólio — HTML, CSS e jQuery puros, **sem build step, sem framework, sem bundler**. Escolha deliberada: manter o front simples e legível de ponta a ponta.

## Telas

- **Login** (`login.html`) e **Cadastro** (`cadastro.html`) — autenticação via JWT, com login automático após o cadastro.
- **Dashboard** (`index.html`) — saldo, entradas/saídas do período, lista de movimentações com filtro por conta (Tudo / CPF / PJ).
- **Cartões** (dentro de `index.html`) — cartões cadastrados, com o gasto do mês calculado pelo backend.

## Tecnologias

- HTML5 + CSS3 (variáveis CSS, sem pré-processador)
- jQuery 3.7 (`$.ajax` para todas as chamadas à API)
- Design system próprio em `design-system/` (tokens CSS + componentes em JS puro) — fontes Manrope / JetBrains Mono via Google Fonts
- Font Awesome (ícones das telas)
- Nenhuma dependência de build — abre direto no navegador ou serve com qualquer servidor estático (o `package.json` só traz ferramentas de desenvolvimento: lint, typecheck e servidor local)

## Arquitetura

Cada tela HTML tem seu **próprio script isolado** (`login.js`, `cadastro.js`, `script.js`) — decisão deliberada de não compartilhar módulos entre páginas, priorizando simplicidade sobre reuso de código.

- **Autenticação:** token JWT salvo no `localStorage` após login/cadastro. Toda página protegida (`index.html`) verifica o token ao carregar e redireciona para `login.html` se não houver sessão válida. Uma resposta `401` em qualquer chamada limpa a sessão e redireciona automaticamente.
- **Dados:** cartões e transações são carregados via API a cada troca de aba/ação (sem cache local complexo) — o backend é sempre a fonte da verdade.
- **UX de rede:** um overlay de carregamento cobre a tela durante as chamadas AJAX, sem timeout definido — dá tempo do backend "acordar" caso esteja hospedado em um free tier com cold start.

## Design system

Todo o visual sai do design system do projeto:

- **`DESIGN.md`** (raiz) é o contrato visual e a fonte da verdade dos tokens — cores, tipografia, espaçamento, raios, sombras, tema claro/escuro e regras de uso.
- **`design-system/`** tem a implementação: tokens em CSS, 35 componentes (fábricas DOM tipadas), padrões de layout, templates de tela e logotipos.
- Tela ou componente novo sai da biblioteca, e nenhum valor de cor, fonte, espaçamento ou raio vai hardcoded — `npm run lint` bloqueia.
- Showcase de todos os componentes, estados e temas: `/design-system/` (com `npm run dev`).

Para desenvolver com as checagens (opcional para só rodar o app):

```bash
npm install
npm run dev     # servidor local em http://localhost:5501
npm run check   # typecheck + ESLint + Stylelint + lint do DESIGN.md
```

## Rodando localmente

Este front depende do [backend e-financeiro](https://github.com/cristianmenesess/e-financeiro) rodando (local em `http://localhost:8080` por padrão — a URL está hardcoded no topo de cada arquivo `.js` em `assets/js/`, ajuste ali se for apontar para outro ambiente).

1. Suba o backend primeiro (veja o README dele).
2. Sirva esta pasta com qualquer servidor estático, por exemplo:
   ```bash
   npx serve -l 5501 .
   ```
3. Acesse `http://localhost:5501/login.html`, cadastre um usuário e explore o dashboard.

Não é obrigatório usar um servidor — os arquivos também abrem direto no navegador (duplo clique), mas um servidor local evita eventuais restrições de CORS/`file://` em alguns navegadores.

## Estrutura

```
index.html              # Dashboard + Cartões (protegido, exige login)
login.html              # Tela de login
cadastro.html           # Tela de cadastro (login automático após sucesso)
redefinir-senha.html    # Tela de redefinição de senha (link com ?token=)
manifest.json           # Manifesto do PWA (instalação no celular)
sw.js                   # Service worker (cache do app shell)
assets/
  css/style.css         # Layout das telas (tokens e componentes vêm de design-system/)
  imagens/icons/        # Ícones do PWA e favicon
  js/
    script.js           # Lógica do dashboard/cartões (index.html)
    login.js            # Lógica da tela de login
    cadastro.js         # Lógica da tela de cadastro
    redefinir-senha.js  # Lógica da tela de redefinição de senha
    theme.js            # Aplica o tema claro/escuro
    pwa.js              # Registro do service worker
design-system/
  ds.css                # Ponto de entrada CSS (tokens + componentes + padrões)
  tokens/               # Variáveis CSS (tema claro e escuro)
  components/           # Componentes: CSS, fábricas JS e documentação
  patterns/             # Utilitários de layout
  showcase/, templates/ # Página /design-system/ e telas de exemplo
  assets/               # Logotipos
DESIGN.md               # Contrato visual e fonte da verdade dos tokens
package.json            # Só ferramentas de desenvolvimento (lint, typecheck, servidor)
eslint.config.js        # Regras de JS (bloqueia valores hardcoded)
stylelint.config.js     # Regras de CSS (bloqueia valores hardcoded)
tsconfig.json           # Typecheck do design system
```
