// Funções puras da biblioteca do CineFlow — sem React, fáceis de testar.
import type { Item, Preferences, Tipo } from '../types';

export const normTag = (s: unknown): string => String(s ?? '').trim();

// Item possui TODAS as tags selecionadas? (interseção / AND, case-insensitive)
export function itemHasAllTags(item: Pick<Item, 'tags'>, selected: string[]): boolean {
  if (!selected || selected.length === 0) return true;
  const itemTags = (item.tags || []).map((t) => String(t).toLowerCase());
  return selected.every((sel) => itemTags.includes(String(sel).toLowerCase()));
}

// Embaralhamento Fisher-Yates (distribuição uniforme). Devolve um NOVO array.
export function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Aprende preferências a partir do que a pessoa gostou (nota >= 3).
// Quanto maior a nota, mais peso o gênero/tag recebe.
export function computePreferences(items: Item[]): Preferences {
  const genreWeight: Record<string, number> = {};
  const tagWeight: Record<string, number> = {};
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
export function scoreItem(item: Pick<Item, 'generos' | 'tags'>, prefs: Preferences): number {
  const { genreWeight = {}, tagWeight = {} } = prefs || ({} as Preferences);
  let score = 0;
  (item.generos || []).forEach((g) => { score += genreWeight[String(g).toLowerCase()] || 0; });
  (item.tags || []).forEach((t) => { score += (tagWeight[String(t).toLowerCase()] || 0) * 1.5; });
  return score;
}

export interface PickOptions {
  count?: number;
  smart?: boolean;
  prefs?: Preferences | null;
  exclude?: string[];
  // Garante representação por nível de prioridade (alta→média→baixa), de forma
  // inteligente e conforme a quantidade pedida.
  priorityAware?: boolean;
}

// Ordena um conjunto: por pontuação de preferências (com desempate aleatório)
// quando smart+prefs; caso contrário, embaralhamento uniforme.
function orderCandidates(arr: Item[], smart: boolean, prefs: Preferences | null): Item[] {
  if (smart && prefs) {
    return arr
      .map((i) => ({ i, s: scoreItem(i, prefs) + Math.random() * 1.5 }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.i);
  }
  return fisherYates(arr);
}

// Seleciona `count` itens do pool. Se smart, ordena por pontuação (com desempate
// aleatório); senão, sorteio uniforme. `exclude` = ids a evitar (histórico).
// Se priorityAware, garante ao menos 1 título de cada nível de prioridade
// presente (do mais alto ao mais baixo) antes de preencher as vagas restantes.
export function pickMatches(pool: Item[], options: PickOptions = {}): Item[] {
  const { count = 3, smart = true, prefs = null, exclude = [], priorityAware = false } = options;
  const excludeSet = new Set(exclude);
  let candidates = pool.filter((i) => !excludeSet.has(i.id));
  if (candidates.length === 0) candidates = [...pool]; // histórico esgotado: recomeça

  if (!priorityAware) {
    return orderCandidates(candidates, smart, prefs).slice(0, Math.min(count, candidates.length));
  }

  // Modo consciente de prioridade: reserva 1 vaga para cada nível presente,
  // começando pelo mais alto (3=alta, 2=média, 1=baixa), respeitando `count`.
  const chosen: Item[] = [];
  const chosenIds = new Set<string>();
  for (const tier of [3, 2, 1]) {
    if (chosen.length >= count) break;
    const tierItems = orderCandidates(
      candidates.filter((i) => (i.prioridade || 0) === tier && !chosenIds.has(i.id)),
      smart,
      prefs
    );
    if (tierItems.length > 0) {
      chosen.push(tierItems[0]);
      chosenIds.add(tierItems[0].id);
    }
  }
  // Preenche as vagas restantes com o melhor do restante (inclui sem prioridade).
  if (chosen.length < count) {
    const rest = orderCandidates(
      candidates.filter((i) => !chosenIds.has(i.id)),
      smart,
      prefs
    );
    for (const it of rest) {
      if (chosen.length >= count) break;
      chosen.push(it);
      chosenIds.add(it.id);
    }
  }
  // Exibe do mais prioritário para o menos prioritário.
  return chosen
    .sort((a, b) => (b.prioridade || 0) - (a.prioridade || 0))
    .slice(0, Math.min(count, chosen.length));
}

// Tempo total assistido (minutos): filmes/docs assistidos usam runtime;
// seriados assistidos estimam runtime * nº de episódios.
export function totalWatchMinutes(items: Item[], isSerialFn: (t: Tipo) => boolean): number {
  return (items || []).reduce((acc, i) => {
    if (i.status_assistido !== 'assistido') return acc;
    const rt = Number(i.runtime) || 0;
    if (!rt) return acc;
    if (isSerialFn(i.tipo)) return acc + rt * (Number(i.num_episodios) || 0);
    return acc + rt;
  }, 0);
}

// Normaliza um título para comparação (minúsculas, sem acento/pontuação).
export function normTitle(s: string): string {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Similaridade simples entre dois títulos (sobreposição de palavras, 0..1).
export function titleSimilarity(a: string, b: string): number {
  const ta = new Set(normTitle(a).split(' ').filter(Boolean));
  const tb = new Set(normTitle(b).split(' ').filter(Boolean));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  ta.forEach((w) => { if (tb.has(w)) inter++; });
  return inter / Math.max(ta.size, tb.size);
}

// Escolhe o melhor resultado do TMDB para um título da biblioteca.
// Considera similaridade do nome e proximidade do ano. Devolve null se nada plausível.
export function bestTmdbMatch<T extends { titulo: string; ano: number | null }>(
  target: { titulo: string; ano?: number | null },
  results: T[]
): T | null {
  let best: T | null = null;
  let bestScore = 0;
  for (const r of results) {
    const sim = titleSimilarity(target.titulo, r.titulo);
    let score = sim;
    if (target.ano && r.ano) {
      if (target.ano === r.ano) score += 0.3;
      else if (Math.abs(target.ano - r.ano) <= 1) score += 0.1;
    }
    if (score > bestScore) { bestScore = score; best = r; }
  }
  // Exige alguma relação real de nome (evita casar títulos aleatórios).
  const finalSim = best ? titleSimilarity(target.titulo, best.titulo) : 0;
  const yearExact = !!(best && target.ano && best.ano === target.ano);
  return best && (finalSim >= 0.5 || (finalSim > 0 && yearExact)) ? best : null;
}

// Conta quantos episódios foram marcados como vistos.
export function countWatchedEpisodes(map?: Record<string, number[]>): number {
  if (!map) return 0;
  return Object.values(map).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
}

export function formatMinutes(min: number): string {
  const m = Math.max(0, Math.round(min || 0));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}min`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}
