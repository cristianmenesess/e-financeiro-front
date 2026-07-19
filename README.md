# e-financeiro-front

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
- Font Awesome (ícones) + Google Fonts (DM Sans / DM Mono)
- Nenhuma dependência de build — abre direto no navegador ou serve com qualquer servidor estático

## Arquitetura

Cada tela HTML tem seu **próprio script isolado** (`login.js`, `cadastro.js`, `script.js`) — decisão deliberada de não compartilhar módulos entre páginas, priorizando simplicidade sobre reuso de código.

- **Autenticação:** token JWT salvo no `localStorage` após login/cadastro. Toda página protegida (`index.html`) verifica o token ao carregar e redireciona para `login.html` se não houver sessão válida. Uma resposta `401` em qualquer chamada limpa a sessão e redireciona automaticamente.
- **Dados:** cartões e transações são carregados via API a cada troca de aba/ação (sem cache local complexo) — o backend é sempre a fonte da verdade.
- **UX de rede:** um overlay de carregamento cobre a tela durante as chamadas AJAX, sem timeout definido — dá tempo do backend "acordar" caso esteja hospedado em um free tier com cold start.

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
index.html          # Dashboard + Cartões (protegido, exige login)
login.html           # Tela de login
cadastro.html         # Tela de cadastro (login automático após sucesso)
assets/
  css/style.css       # Todo o design system do app (variáveis, componentes)
  js/
    script.js         # Lógica do dashboard/cartões (index.html)
    login.js          # Lógica da tela de login
    cadastro.js        # Lógica da tela de cadastro
```
