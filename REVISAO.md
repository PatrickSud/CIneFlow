# CineFlow — Revisão Técnica e Roadmap

Data da revisão: 24/07/2026

## 1. O que o projeto é

Aplicação React de página única: uma biblioteca pessoal de filmes e séries com três áreas — **Lista** (busca, filtros, ordenação, cards com nota/estado/edição), **CineMatch** (sorteador de sugestões da própria coleção) e **Dashboard** (estatísticas). Os dados ficam no `localStorage` do navegador e podem ser importados por JSON.

## 2. Estado que recebi

O projeto era **um único arquivo** `cineflow.tsx` de 3.052 linhas, sendo ~1.955 linhas só de base de dados embutida (147 títulos). **Não existia nenhuma estrutura de projeto**: sem `package.json`, sem build, sem `index.html`, sem configuração de Tailwind. Ou seja, o arquivo não rodava nem podia ser publicado como estava — faltava tudo em volta do componente.

## 3. Bugs encontrados e corrigidos

O mais grave: **as notificações (toast) nunca apareciam**. A função `showToast` era chamada em ~15 lugares (adicionar, editar, excluir, avaliar, importar), o estado `toast` existia, mas **o componente visual do toast não estava no JSX**. O usuário nunca recebia confirmação de nenhuma ação. Corrigido — o toast agora é renderizado com variações de cor para sucesso/erro/info.

Outros corrigidos:

- **Busca não pesquisava por gênero**, apesar do placeholder dizer "por título, notas ou género". Agora pesquisa em título, notas e gêneros.
- **Barra de progresso só aparecia para filmes.** Séries marcadas como "em curso" não mostravam progresso. Agora a barra aparece para qualquer item em andamento com progresso.
- **Sorteador CineMatch tinha embaralhamento enviesado** (`sort(() => 0.5 - Math.random())` não distribui de forma uniforme). Trocado por Fisher-Yates.
- **O seletor de "quantidade" de sugestões não existia na tela** — o estado `matchCount` estava fixo em 3 sem controle. Adicionado seletor (1/3/5).
- **IDs podiam colidir** em criações/importações rápidas (`custom-${Date.now()}`). Agora usa `crypto.randomUUID()` com fallback.
- **Importar o mesmo arquivo duas vezes não funcionava** (o input não era resetado). Corrigido.
- **Leitura do `localStorage` não validava** se o conteúdo era um array. Adicionada validação e proteção contra falha de escrita.

## 4. Melhorias implementadas

- **Exportar biblioteca (backup em JSON)** — botão novo no cabeçalho. Antes só dava para importar; não havia como salvar os dados fora do navegador, o que era um risco real de perda (limpar o cache apagava tudo).
- **Acessibilidade** — `aria-label` nos botões de ícone (estrelas, assistido, editar, remover, exportar).
- **Reorganização em projeto real** — a base de dados foi separada para `src/data/initialDatabase.js` e o componente para `src/App.jsx`. Criado o scaffold completo Vite + React + Tailwind para rodar e publicar (veja o README).

## 5. O que ainda falta / poderia ser implementado

Em ordem de valor:

**Alto valor**

- **~~Integração com API de metadados (TMDB)~~ ✅ IMPLEMENTADO:** aba "Buscar" ao adicionar um título — digite o nome e escolha um resultado; título, ano, gêneros e pôster são preenchidos automaticamente. Precisa de uma chave gratuita do TMDB (passo a passo no README). Arquivo `src/lib/tmdb.js`.
- **Rastreamento por episódio para séries:** hoje só há "temporadas assistidas". Faltam episódios (Sx Ex) e progresso real de série.
- **Confirmação de exclusão estilizada:** hoje usa o `confirm()` nativo do navegador, que destoa do visual.

**Médio valor**

- **Dashboard mais rico:** distribuição por gênero, por década, nota média (o valor `avgRating` já é calculado mas não é exibido), tempo estimado assistido. Um gráfico (ex.: Chart.js) ajudaria.
- **~~PWA / instalável e offline~~ ✅ IMPLEMENTADO:** manifest, service worker, ícones, banner automático e botão de instalar no celular (com instruções para iOS). Arquivos em `public/`.
- **~~Tags~~ ✅ IMPLEMENTADO:** tags livres por título, usadas em filtro (interseção), Match e busca.
- **~~Tipos de conteúdo~~ ✅ IMPLEMENTADO:** além de Filme e Série, agora há Anime, Documentário, Minissérie, Programa de TV e Stand-up/Especial. Seriados (série/anime/minissérie/programa) têm temporada+episódio; os demais usam progresso %. Filtro e Match viraram dropdowns; dashboard mostra "Por tipo"; o TMDB detecta documentário e anime automaticamente.
- **Migração para TypeScript (em andamento, incremental):** já convertidos `src/lib/library.ts` e `src/lib/tmdb.ts` com tipos, e criado `src/types.ts` com a interface `Item` e as uniões `Tipo`/`Status`. `tsconfig.json` usa `allowJs`, então o `App.jsx` continua funcionando enquanto a migração avança. Verificação com `npm run typecheck` (passa em modo strict). Passo 2: extraídos `src/lib/contentTypes.ts` (tipos de conteúdo) e os primeiros componentes tipados `src/components/StarRating.tsx` e `Toast.tsx`, já usados pelo `App.jsx`. Próximos passos: extrair `ItemCard`/`Modal`/`Dashboard` e, por fim, converter o `App` para `.tsx`.

**Baixo valor / polimento**

- Virtualização da lista (só relevante acima de ~500 itens).
- Debounce na busca.
- Tema claro/escuro (hoje é só escuro).
- Testes automatizados (Vitest + Testing Library).

## 5b. Implementado depois (rodada de melhorias)

- **Detalhes ricos via TMDB:** ao adicionar (busca ou web), o app puxa sinopse, duração, nº de temporadas/episódios, elenco e imagem de fundo. `src/lib/tmdb.js` (`fetchTmdbDetails`, `fetchWatchProviders`).
- **Tela de detalhes:** clique no pôster/título abre um modal com backdrop, sinopse, elenco (fotos) e **onde assistir** (streaming/aluguel/compra por região, ao vivo).
- **CineMatch inteligente:** recomenda por afinidade (gêneros/tags que você bem avaliou), com opção de sorteio puro e "não repetir" na sessão.
- **Adicionar direto:** resultados da web têm botão de 1 toque (além de "Detalhes…").
- **Gerenciador de tags:** renomear/apagar tags em toda a biblioteca de uma vez.
- **Exclusão estilizada:** modal de confirmação no lugar do `confirm()` nativo.
- **Tema claro/escuro:** alternância no cabeçalho, persistida.
- **Tempo total assistido** nas estatísticas (usa a duração vinda do TMDB).
- **Qualidade:** lógica pura extraída para `src/lib/library.js` com **testes** (`npm test`, Vitest).

## 6. Observações de arquitetura

- Um único componente `App` concentra toda a lógica e a UI. Conforme crescer, vale extrair `ItemCard`, `Modal`, `CineMatch`, `Dashboard` e `Toast` em arquivos próprios, e mover a lógica de dados para um hook `useLibrary()`. A integração TMDB já foi isolada em `src/lib/tmdb.js` como exemplo desse padrão.
- As classes `slate-850`, `w-5.5` e `h-5.5` não existem no Tailwind padrão — foram adicionadas no `tailwind.config.js`. Sem isso, elas seriam ignoradas e o visual quebraria sutilmente.
- O arquivo original foi preservado em `_legacy/cineflow.original.tsx` para referência.
