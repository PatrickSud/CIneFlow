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
│   └── data/
│       └── initialDatabase.js   # base inicial de 147 títulos
├── _legacy/
│   └── cineflow.original.tsx    # arquivo monolítico original (referência)
├── REVISAO.md              # relatório de revisão e roadmap
└── README.md
```

---

## (Opcional) Preencher metadados automaticamente com a API do TMDB

Hoje, ao adicionar um título, você digita tudo à mão. Para buscar título, ano, gêneros e pôster automaticamente:

1. Crie uma conta gratuita em https://www.themoviedb.org.
2. Vá em **Configurações → API** e solicite uma **API Key** (uso pessoal, gratuito).
3. Guarde a chave em um arquivo `.env` na raiz (o `.gitignore` já ignora `*.local`; use `VITE_TMDB_KEY=sua_chave`).
4. No código, use `fetch` para `https://api.themoviedb.org/3/search/multi?query=...&api_key=...` e preencha o formulário com o primeiro resultado. O pôster vem em `https://image.tmdb.org/t/p/w300/<poster_path>`.

Posso implementar essa integração — é o próximo passo de maior valor. Veja o `REVISAO.md` para o roadmap completo.

---

## Dados e backup

Os títulos ficam no `localStorage` do navegador (chave `cineflow_extended_db_v3`). **Limpar os dados de navegação apaga a biblioteca.** Use o botão **Backup** no cabeçalho para exportar um `.json` de tempos em tempos — dá para reimportá-lo depois pelo modal **Novo Título → Importar JSON**.
