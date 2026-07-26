import { describe, it, expect } from 'vitest';
import {
  itemHasAllTags,
  computePreferences,
  scoreItem,
  pickMatches,
  totalWatchMinutes,
  formatMinutes,
  titleSimilarity,
  bestTmdbMatch,
  countWatchedEpisodes,
} from './library';
import type { Tipo } from '../types';

const isSerial = (t: Tipo) => t === 'series' || t === 'anime' || t === 'miniseries' || t === 'tvshow';

describe('itemHasAllTags', () => {
  it('retorna true quando não há tags selecionadas', () => {
    expect(itemHasAllTags({ tags: ['A'] }, [])).toBe(true);
    expect(itemHasAllTags({ tags: [] }, [])).toBe(true);
  });
  it('exige TODAS as tags (interseção, case-insensitive)', () => {
    const item = { tags: ['Família', 'Oliver', 'Domingo'] };
    expect(itemHasAllTags(item, ['oliver', 'domingo'])).toBe(true);
    expect(itemHasAllTags(item, ['Oliver', 'Sábado'])).toBe(false);
  });
  it('lida com item sem tags', () => {
    expect(itemHasAllTags({ tags: [] }, ['x'])).toBe(false);
  });
});

describe('computePreferences / scoreItem', () => {
  const items = [
    { nota: 5, generos: ['Ação'], tags: ['Fav'] },
    { nota: 4, generos: ['Ação', 'Drama'], tags: [] },
    { nota: 2, generos: ['Comédia'], tags: [] }, // ignorado (nota < 3)
  ] as any;
  it('acumula peso só para nota >= 3', () => {
    const p = computePreferences(items);
    expect(p.genreWeight['ação']).toBe(5); // (5-2)=3 + (4-2)=2
    expect(p.genreWeight['drama']).toBe(2);
    expect(p.genreWeight['comédia']).toBeUndefined();
    expect(p.tagWeight['fav']).toBe(3);
  });
  it('pontua candidato por gênero e tag (tag pesa mais)', () => {
    const p = computePreferences(items);
    const s = scoreItem({ generos: ['Ação'], tags: ['Fav'] }, p);
    expect(s).toBeCloseTo(5 + 3 * 1.5); // 5 (gênero) + 4.5 (tag)
  });
});

describe('pickMatches', () => {
  const pool = [
    { id: '1', generos: ['Ação'], tags: [] },
    { id: '2', generos: ['Comédia'], tags: [] },
    { id: '3', generos: ['Ação'], tags: [] },
  ] as any;
  it('respeita a quantidade e exclui o histórico', () => {
    const res = pickMatches(pool, { count: 2, smart: false, exclude: ['1'] });
    expect(res).toHaveLength(2);
    expect(res.map((x) => x.id)).not.toContain('1');
  });
  it('recomeça quando o histórico esgota o pool', () => {
    const res = pickMatches(pool, { count: 2, smart: false, exclude: ['1', '2', '3'] });
    expect(res.length).toBe(2);
  });
  it('modo inteligente prioriza maior pontuação', () => {
    const prefs = { genreWeight: { 'ação': 10 }, tagWeight: {} };
    const res = pickMatches(pool, { count: 1, smart: true, prefs });
    expect(['1', '3']).toContain(res[0].id);
  });
});

describe('totalWatchMinutes / formatMinutes', () => {
  const items = [
    { status_assistido: 'assistido', tipo: 'movie', runtime: 120 },
    { status_assistido: 'assistido', tipo: 'series', runtime: 40, num_episodios: 10 },
    { status_assistido: 'nao_assistido', tipo: 'movie', runtime: 90 }, // ignorado
  ] as any;
  it('soma filmes (runtime) e séries (runtime * episódios) assistidos', () => {
    expect(totalWatchMinutes(items, isSerial)).toBe(120 + 40 * 10);
  });
  it('formata minutos em h/min e dias', () => {
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(90)).toBe('1h 30min');
    expect(formatMinutes(60 * 25)).toBe('1d 1h');
  });
});

describe('titleSimilarity / bestTmdbMatch', () => {
  it('ignora acentos e maiúsculas', () => {
    expect(titleSimilarity('Coração Valente', 'coracao valente')).toBeCloseTo(1);
    expect(titleSimilarity('Matrix', 'The Matrix')).toBeCloseTo(0.5);
  });
  it('escolhe o melhor por nome + ano', () => {
    const results = [
      { titulo: 'Matrix Reloaded', ano: 2003, tmdb_id: 604, media_type: 'movie' as const },
      { titulo: 'Matrix', ano: 1999, tmdb_id: 603, media_type: 'movie' as const },
    ];
    const m = bestTmdbMatch({ titulo: 'Matrix', ano: 1999 }, results);
    expect(m?.tmdb_id).toBe(603);
  });
  it('devolve null quando nada é plausível', () => {
    const results = [{ titulo: 'Totalmente Diferente', ano: 2010, tmdb_id: 1, media_type: 'movie' as const }];
    expect(bestTmdbMatch({ titulo: 'Interestelar', ano: 2014 }, results)).toBeNull();
  });
});

describe('countWatchedEpisodes', () => {
  it('soma episódios vistos de todas as temporadas', () => {
    expect(countWatchedEpisodes({ '1': [1, 2, 3], '2': [1, 2] })).toBe(5);
  });
  it('lida com vazio/undefined', () => {
    expect(countWatchedEpisodes(undefined)).toBe(0);
    expect(countWatchedEpisodes({})).toBe(0);
  });
});
