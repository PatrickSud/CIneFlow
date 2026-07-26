// Funções puras da biblioteca do CineFlow — sem React, fáceis de testar.

export const normTag = (s) => String(s ?? '').trim();

// Item possui TODAS as tags selecionadas? (interseção / AND, case-insensitive)
export function itemHasAllTags(item, selected) {
  if (!selected || selected.length === 0) return true;
  const itemTags = (item.tags || []).map((t) => String(t).toLowerCase());
  return selected.every((sel) => itemTags.includes(String(sel).toLowerCase()));
}

// Embaralhamento Fisher-Yates (distribuição uniforme). Devolve um NOVO array.
export function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Aprende preferências a partir do que a pessoa gostou (nota >= 3).
// Quanto maior a nota, mais peso o gênero/tag recebe.
export function computePreferences(items) {
  const genreWeight = {};
  const tagWeight = {};
  (items || []).forEach((i) => {
    const n = Number(i.nota) || 0;
    if (n < 3) return;
    const w = n - 2; // 3->1, 4->2, 5->3
    (i.generos || []).forEach((g) => {
      const k = String(g).toLowerCase();
      genreWeight[k] = (genreWeight[k] || 0) + w;
    });
    (i.tags || []).forEach((t) => {
      const k = String(t).toLowerCase();
      tagWeight[k] = (tagWeight[k] || 0) + w;
    });
  });
  return { genreWeight, tagWeight };
}

// Pontua um candidato de acordo com as preferências (tags pesam um pouco mais).
export function scoreItem(item, prefs) {
  const { genreWeight = {}, tagWeight = {} } = prefs || {};
  let score = 0;
  (item.generos || []).forEach((g) => { score += genreWeight[String(g).toLowerCase()] || 0; });
  (item.tags || []).forEach((t) => { score += (tagWeight[String(t).toLowerCase()] || 0) * 1.5; });
  return score;
}

// Seleciona `count` itens do pool. Se smart, ordena por pontuação (com desempate
// aleatório); senão, sorteio uniforme. `exclude` = ids a evitar (histórico).
export function pickMatches(pool, { count = 3, smart = true, prefs = null, exclude = [] } = {}) {
  const excludeSet = new Set(exclude);
  let candidates = pool.filter((i) => !excludeSet.has(i.id));
  if (candidates.length === 0) candidates = [...pool]; // histórico esgotado: recomeça

  if (smart && prefs) {
    const jittered = candidates
      .map((i) => ({ i, s: scoreItem(i, prefs) + Math.random() * 1.5 }))
      .sort((a, b) => b.s - a.s);
    return jittered.slice(0, Math.min(count, jittered.length)).map((x) => x.i);
  }
  return fisherYates(candidates).slice(0, Math.min(count, candidates.length));
}

// Tempo total assistido (minutos): filmes/docs assistidos usam runtime;
// seriados assistidos estimam runtime * nº de episódios.
export function totalWatchMinutes(items, isSerialFn) {
  return (items || []).reduce((acc, i) => {
    if (i.status_assistido !== 'assistido') return acc;
    const rt = Number(i.runtime) || 0;
    if (!rt) return acc;
    if (isSerialFn(i.tipo)) return acc + rt * (Number(i.num_episodios) || 0);
    return acc + rt;
  }, 0);
}

export function formatMinutes(min) {
  const m = Math.max(0, Math.round(min || 0));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}min`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}
