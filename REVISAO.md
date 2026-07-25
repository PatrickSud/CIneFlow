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
- **PWA / instalável e offline:** manifest + service worker para usar como app no celular.
- **Migração para TypeScript de verdade:** o arquivo era `.tsx` mas não tinha nenhum tipo. Definir uma interface `Item` evitaria muitos erros silenciosos.

**Baixo valor / polimento**

- Virtualização da lista (só relevante acima de ~500 itens).
- Debounce na busca.
- Tema claro/escuro (hoje é só escuro).
- Testes automatizados (Vitest + Testing Library).

## 6. Observações de arquitetura

- Um único componente `App` concentra toda a lógica e a UI. Conforme crescer, vale extrair `ItemCard`, `Modal`, `CineMatch`, `Dashboard` e `Toast` em arquivos próprios, e mover a lógica de dados para um hook `useLibrary()`. A integração TMDB já foi isolada em `src/lib/tmdb.js` como exemplo desse padrão.
- As classes `slate-850`, `w-5.5` e `h-5.5` não existem no Tailwind padrão — foram adicionadas no `tailwind.config.js`. Sem isso, elas seriam ignoradas e o visual quebraria sutilmente.
- O arquivo original foi preservado em `_legacy/cineflow.original.tsx` para referência.
