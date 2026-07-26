# 🍿 CineFlow

A sua biblioteca pessoal de filmes e séries — busca e filtros, sorteador de sugestões (CineMatch), dashboard de progresso e backup/importação em JSON. Os dados ficam salvos localmente no navegador.

Feito com **React 18 + Vite + Tailwind CSS**.

---

## Rodar localmente

Pré-requisito: **Node.js 18+** instalado (https://nodejs.org).

Abra um terminal na pasta do projeto e rode:

```bash
npm install      # instala as dependências (só na primeira vez)
npm run dev      # inicia o servidor de desenvolvimento
```

O terminal vai mostrar um endereço, normalmente `http://localhost:5173`. Abra no navegador.

Para gerar a versão de produção:

```bash
npm run build    # gera a pasta dist/
npm run preview  # testa a versão de produção localmente
```

---

## Publicar como app web

O build gera arquivos estáticos (pasta `dist/`), então dá para hospedar em qualquer serviço de site estático. Três caminhos, do mais simples ao mais manual:

### Opção A — Vercel (recomendado, mais fácil)

1. Crie uma conta em https://vercel.com (pode entrar com GitHub).
2. Suba este projeto para um repositório no GitHub (veja a seção "Git" abaixo).
3. No Vercel: **Add New → Project → Import** o repositório.
4. O Vercel detecta Vite automaticamente. Confirme:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Clique em **Deploy**. Em ~1 minuto você recebe uma URL pública (ex.: `cineflow.vercel.app`).
6. A cada `git push`, o site atualiza sozinho.

### Opção B — Netlify

1. Conta em https://netlify.com.
2. **Add new site → Import an existing project** e conecte o repositório.
3. Build command: `npm run build` · Publish directory: `dist`.
4. **Deploy**.

### Opção C — GitHub Pages (sem serviço extra)

1. Suba o projeto para um repositório no GitHub.
2. Rode `npm run build`.
3. Publique a pasta `dist/` no branch `gh-pages` (ex.: com o pacote `gh-pages`, ou pela aba Settings → Pages apontando para a pasta).
   - Como o `vite.config.js` usa `base: './'`, o app funciona mesmo em subpasta.

### Subir para o GitHub (necessário para A, B e algumas de C)

```bash
git init
git add .
git commit -m "CineFlow v1"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/cineflow.git
git push -u origin main
```

---

## Estrutura do projeto

```
CineFlow/
├── index.html              # ponto de entrada HTML
├── package.json            # dependências e scripts
├── vite.config.js          # configuração do Vite
├── tailwind.config.js      # cores/espaçamentos personalizados do design
├── postcss.config.js
├── src/
│   ├── main.jsx            # inicializa o React
│   ├── App.jsx             # a aplicação (lista, CineMatch, dashboard, modal)
│   ├── index.css           # Tailwind + estilos base
│   ├── data/
│   │   └── initialDatabase.js   # base inicial de 147 títulos
│   └── lib/
│       └── tmdb.js         # integração com a API do TMDB
├── _legacy/
│   └── cineflow.original.tsx    # arquivo monolítico original (referência)
├── REVISAO.md              # relatório de revisão e roadmap
└── README.md
```

---

## Preencher metadados automaticamente com a API do TMDB

A busca por título, ano, gêneros e pôster **já está implementada** (aba **Buscar** ao adicionar um título). Ela precisa de uma chave gratuita do TMDB:

1. Crie uma conta gratuita em https://www.themoviedb.org.
2. Vá em **Configurações → API** e solicite uma **API Key** (v3, uso pessoal, gratuito).
3. Informe a chave de uma das duas formas:
   - **Na interface (mais simples):** abra "Novo Título → Buscar" e cole a chave quando pedido. Ela fica salva só no seu navegador.
   - **No build (recomendado se você publicar):** copie `.env.example` para `.env` e preencha `VITE_TMDB_KEY=sua_chave`. No Vercel/Netlify, adicione a mesma variável de ambiente nas configurações do projeto.

Depois é só digitar o nome do filme/série, escolher um resultado da lista, revisar os campos preenchidos e guardar. Dentro da aba **Buscar** há um botão **"Como criar a conta e obter a chave de API?"** com o passo a passo completo para quem nunca fez isso.

Com a chave configurada, a **barra de pesquisa da página inicial** passa a buscar na sua biblioteca **e** na web (TMDB) ao mesmo tempo. Os resultados da web aparecem separados, com um botão **Adicionar** que abre o formulário já preenchido.

> Observação: por ser um app 100% no navegador, a chave fica visível no código enviado ao cliente. Para uso pessoal com uma chave gratuita do TMDB isso é aceitável. Se um dia o app for público de verdade, o ideal é intermediar as chamadas por um pequeno backend/serverless.

---

## Tags

Cada título pode ter tags livres (ex.: "Família", "Oliver", "Domingo"). Crie-as no formulário (digite e Enter, ou clique numa tag já existente). Depois é só usá-las:

- **Na Lista:** os chips de tags filtram a biblioteca. Selecionar várias mostra só o que tem **todas** elas (interseção) — ex.: "Oliver" + "Domingo".
- **No Match:** as mesmas tags entram como critério do sorteio, junto com tipo, estado e nota.
- **Busca:** a barra de pesquisa também encontra por tag.
- Clicar num chip `#tag` dentro de um card já filtra a Lista por aquela tag.

## Instalar no celular (PWA)

O CineFlow é um Progressive Web App instalável. No celular (fora do modo já instalado) aparecem um banner automático e um botão flutuante **Instalar App**:

- **Android/Chrome:** o botão dispara o instalador nativo do navegador.
- **iPhone/iPad (Safari):** o botão abre as instruções (Partilhar → "Adicionar à Tela de Início"), já que o iOS não permite instalação automática.

Depois de instalado, abre em tela cheia e funciona offline (a biblioteca fica no próprio aparelho). Requisito: o site precisa estar em **HTTPS** — o Vercel/Netlify já fornecem isso automaticamente.

## Dados e backup

Os títulos ficam no `localStorage` do navegador (chave `cineflow_extended_db_v3`). **Limpar os dados de navegação apaga a biblioteca.** Use o botão **Backup** no cabeçalho para exportar um `.json` de tempos em tempos — dá para reimportá-lo depois pelo modal **Novo Título → Importar JSON**.
